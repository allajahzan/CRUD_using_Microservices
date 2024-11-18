import { createContext, ReactNode, useLayoutEffect, useState } from "react";
import { UserAuth } from "../auth/userAuth";
import { useDispatch, useSelector } from "react-redux";
import { SetToken, UpdateUser } from "../redux/store";
import Cookies from "js-cookie";

export interface contextType {
    isAuth: boolean,
    setAuth: React.Dispatch<React.SetStateAction<boolean>>,
    logout: () => void
}

const UserContext = createContext<contextType | null>(null)


const UserContextProvider = ({ children }: { children: ReactNode }) => {

    const accessToken = useSelector((state: any) => state.userToken)
    const disaptchFun = useDispatch()

    const [isAuth, setAuth] = useState<boolean>(accessToken ? true : false)

    useLayoutEffect(() => {

        const checkUserAuth = async () => {
            const newAccesstoken = await UserAuth(accessToken)
            if (newAccesstoken) {
                disaptchFun(SetToken(newAccesstoken))
                Cookies.set('accessToken', newAccesstoken)
                fetch('http://localhost/user/getUser', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${newAccesstoken}`
                    }
                })
                    .then(async (res) => {
                        if (res.status === 403) {
                            checkUserAuth()
                        } else if (res.status === 404 || res.status === 501) {
                            logout()
                        }
                        else {
                            const data = await res.json()
                            disaptchFun(UpdateUser(data.userData))
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } else {
                logout()
            }
        }

        checkUserAuth()


    }, [isAuth])

    //logout
    const logout = () => {
        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/auth/user/logout`, { method: 'GET', credentials: "include" })
            .then((res) => {
                if (res.ok) {
                    disaptchFun(SetToken(null))
                    disaptchFun(UpdateUser(null))
                    Cookies.remove('accessToken')
                    setAuth(false)
                } 
            })
            .catch((err) => {
                console.log(err)
            })
    }

    return (
        <UserContext.Provider value={{ isAuth, setAuth, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export {
    UserContext,
    UserContextProvider
}