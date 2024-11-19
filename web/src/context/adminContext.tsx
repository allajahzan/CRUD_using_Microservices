import { createContext, ReactNode, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminAuth } from "../auth/adminAuth";
import Cookies from "js-cookie";
import { SetAdminToken, UpdateAdmin } from "../redux/store";

interface contextType {
    isAuth: boolean,
    setAuth: React.Dispatch<React.SetStateAction<boolean>>,
    logout: () => void
}

const AdminContext = createContext<contextType | null>(null)

const AdminContexetProvider = ({ children }: { children: ReactNode }) => {

    const accessToken = useSelector((state: any) => state.adminToken)
    const disaptchFun = useDispatch()

    const [isAuth, setAuth] = useState<boolean>(accessToken ? true : false)

    useLayoutEffect(() => {

        const checkAdminAuth = async () => {
            AdminAuth(accessToken)
                .then((newAccessToken) => {
                    if (newAccessToken) {
                        setAuth(true)
                        disaptchFun(SetAdminToken(newAccessToken))
                        Cookies.set('adminAccessToken', newAccessToken)

                        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/admin/getAdmin`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`
                            }
                        })
                            .then(async (res) => {
                                if (res.ok) {
                                    const data = await res.json()
                                    disaptchFun(UpdateAdmin(data.userData))
                                } else {
                                    if (res.status === 403) {
                                        checkAdminAuth()
                                    } else if (res.status === 404) {
                                        logout()
                                    }
                                }
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                    } else if (newAccessToken === undefined) {
                        alert('We are experiencing server issues. Please try again shortly');
                        logout()
                    }
                    else {
                        logout()
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }

        checkAdminAuth()

    }, [isAuth])

    // logout
    const logout = () => {
        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/auth/admin/logout`, { credentials: 'include' })
            .then((res) => {
                if (res.ok) {
                    disaptchFun(SetAdminToken(null))
                    disaptchFun(UpdateAdmin(null))
                    Cookies.remove('adminAccessToken')
                    setAuth(false)
                } else {
                    alert('We are experiencing server issues. Please try again shortly');
                }
            })
            .catch((err) => {
                console.log(err)
            })
    }

    return (
        <AdminContext.Provider value={{ isAuth, setAuth, logout }}>
            {children}
        </AdminContext.Provider>
    )
}

export {
    AdminContext,
    AdminContexetProvider
}



