import React, { useContext, useEffect, useState } from 'react'
import NavbarComponent from '../../../components/navbar/admin/navbar_admin'
import Input from '../../../components/input/input'
import upload from '../../../assets/upload.svg'
import loading from '../../../assets/load.svg'
import { useDispatch, useSelector } from 'react-redux'
import { AdminAuth } from '../../../auth/adminAuth'
import { SetAdminToken } from '../../../redux/store'
import Cookies from 'js-cookie'
import { AdminContext } from '../../../context/adminContext'
import pic from '../../../assets/pic1.jpg'
import { useLocation } from 'react-router-dom'


function EditUser() {

    const accessToken = useSelector((state: any) => state.adminToken)
    const disaptchFun = useDispatch()
    const adminContext = useContext(AdminContext)

    const [nameInput, setName] = useState<string>('')
    const [emailInput, setEmail] = useState<string>('')
    const [image, setImgae] = useState<string | null>(null)
    const [isUpdate, setUpdate] = useState<boolean>(false)

    let handleImgeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const reader = new FileReader()
            reader.readAsDataURL(event.target.files[0])
            reader.onload = () => {
                setImgae(reader.result as string)
            }
            reader.onerror = (err) => {
                console.log(err)
            }
        }
    }

    const location = useLocation()

    useEffect(() => {
        setImgae(location.state.image)
        setName(location.state.name)
        setEmail(location.state.email)
    }, [])


    const handleSubmit = (userId: string) => {

        const formData = new FormData()
        formData.append('_id', userId)
        formData.append('name', nameInput)
        formData.append('email', emailInput)
        formData.append('image', image as string)

        setUpdate(true)
        const editUser = () => {
            AdminAuth(accessToken)
                .then((newAccessToken) => {
                    if (newAccessToken) {
                        disaptchFun(SetAdminToken(newAccessToken))
                        Cookies.set('adminAccessToken', newAccessToken)

                        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/admin/editUser`, {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${newAccessToken}`
                            },
                            body: formData
                        })
                            .then(async (res) => {
                                const data = await res.json()
                                if (res.ok) {
                                    setUpdate(false)
                                } else {
                                    if (res.status === 401) {
                                        editUser()
                                    } else if (res.status === 409) {
                                        setUpdate(false)
                                        alert(data.msg)
                                    }
                                    else {
                                        alert('We are experiencing server issues. Please try again shortly');
                                        setUpdate(false)
                                    }
                                }
                            })
                            .catch((_err) => {
                                alert('We are experiencing server issues. Please try again shortly');
                            })
                    } else {
                        adminContext?.logout()
                    }
                })
        }

        editUser()
    }

    return (
        <div style={{
            backgroundImage: `url(${pic})`,
            backgroundSize: 'cover'
        }} className="h-screen w-full bg-white relative flex items-center justify-center">
            <NavbarComponent />
            <div className='flex flex-col justify-center gap-5 p-10 w-full sm:w-[450px] md:w-[450px] h-full sm:h-[520px] bg-black bg-opacity-40'>
                {/* <p className='bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-300 text-xl text-center font-base p-2 pl-0'>User Profile</p> */}
                <form className='flex flex-col items-center gap-5' action="" onSubmit={(event) => { event?.preventDefault(); handleSubmit(location.state._id) }}>
                    {image ?
                        <div className='relative flex justify-center items-center bg-transparent border rounded-full h-36 w-36 mb-5 cursor-pointer overflow-hidden'>
                            <img className='w-full h-full object-cover cursor-pointer' src={image} alt="" />
                            <input accept='image/*' onChange={handleImgeUpload} type="file" className='absolute w-full h-full rounded-full opacity-0' />
                        </div>
                        :
                        <div className='relative p-5 flex justify-center items-center bg-transparent border rounded-full h-36 w-36 mb-5 cursor-pointer'>
                            <img className='w-20 relative top-2 ' src={upload} alt="" />
                            <input accept='image/*' onChange={handleImgeUpload} type="file" className='absolute w-full h-full rounded-full opacity-0' />
                        </div>
                    }
                    <Input color='white' input={nameInput} setInput={setName} id='name' type='text' label='Name' />
                    <Input color='white' input={emailInput} setInput={setEmail} id='email' type='text' label='Email' />
                    {!isUpdate && <button type='submit' className='w-full p-3 rounded-md bg-white text-black text-base font-medium'>Update</button>}
                    {isUpdate && <div className='w-full p-6 rounded-md bg-white flex justify-center items-center relative'>
                        <img className="w-6 absolute animate-spin" src={loading} alt="" />
                    </div>}
                </form>
            </div>

        </div>
    )
}

export default EditUser
