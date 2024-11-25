import pic from '../../../assets/pic4.jpg'
import { useContext, useEffect, useLayoutEffect, useState } from 'react'
import SigninForm from '../../../components/login/signinForm'
import SignupForm from '../../../components/login/signupForm'
import { UserContext } from '../../../context/userContext'
import Cookies from 'js-cookie'
import { useDispatch } from 'react-redux'
import { SetToken } from '../../../redux/store'

function Login() {

    const [emailInputSignIn, setEmailSignIn] = useState<string>('')
    const [passwordInputSignIn, setpasswordSignIn] = useState<string>('')
    const [nameInput, setName] = useState<string>('')
    const [emailInput, setEmail] = useState<string>('')
    const [passwordInput, setpassword] = useState<string>('')

    const [isMove, setMove] = useState<boolean>(false)

    const [styleImage, setStyleImage] = useState<React.CSSProperties>({
        transform: 'translateX(0%)',
        transition: 'transform 0.5s ease-in-out',
    })


    const [styleFormSignIn, setStyleFormSignIn] = useState<React.CSSProperties>({
        transform: 'translateX(0%)',
        transition: 'transform 0.5s ease-in-out',
    })

    const [styleFormSignUp, setFormSignUp] = useState<React.CSSProperties>({
        transform: 'translateX(100%)',
        transition: 'transform 0.5s ease-in-out',
        opacity: 1
    })

    const handleMove = () => {
        setMove(!isMove)
    }

    useLayoutEffect(() => {
        if (isMove) {
            setStyleImage({
                ...styleImage,
                transform: 'translateX(100%)',
            })
            setStyleFormSignIn({
                ...styleFormSignIn,
                transform: 'translateX(-100%)',
            })
            setFormSignUp({
                ...styleFormSignUp,
                transform: 'translateX(0%)',
            })
        } else {
            setStyleImage({
                ...styleImage,
                transform: 'translateX(0%)',
            })
            setStyleFormSignIn({
                ...styleFormSignIn,
                transform: 'translateX(0%)',
            })
            setFormSignUp({
                ...styleFormSignUp,
                transform: 'translateX(100%)',
            })
        }
    }, [isMove])


    // signup user

    const [isCreate, setCreate] = useState<boolean>(false)

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault()

        const obj = {
            name: nameInput,
            email: emailInput,
            password: passwordInput
        }

        setCreate(true)
        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/auth/user/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        })
            .then(async (res) => {
                const data = await res.json()
                if (res.ok) {
                    setName('')
                    setEmail('')
                    setpassword('')
                    setMove(false)
                    setCreate(false)
                } else {
                    if (res.status === 409) {
                        setEmail('')
                        setCreate(false)
                        alert(data.msg)
                    } else {
                        alert('We are experiencing server issues. Please try again shortly');
                        setCreate(false)
                    }
                }
            })
            .catch((_err) => {
                setCreate(false)
                alert('We are experiencing server issues. Please try again shortly');
            })
    }

    // signin user
    const [isLogin, setLogin] = useState<boolean>(false)
    const userContext = useContext(UserContext)

    const disaptchFun = useDispatch()

    const handleSignIn = (event: React.FormEvent) => {
        event.preventDefault()

        const obj = {
            email: emailInputSignIn,
            password: passwordInputSignIn
        }

        setLogin(true)
        fetch(`${import.meta.env.VITE_SERVICE_BASE_URL}/auth/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(obj)
        })
            .then(async (res) => {
                const data = await res.json()
                if (res.ok) {
                    setEmailSignIn('')
                    setpasswordSignIn('')
                    Cookies.set('accessToken', data.accessToken, { path: '/', sameSite: 'None', secure: true })
                    disaptchFun(SetToken(data.accessToken))
                    userContext?.setAuth(true)
                } else if (res.status === 401) {
                    setLogin(false)
                    alert(data.msg)
                } else {
                    alert('We are experiencing server issues. Please try again shortly');
                    setLogin(false)
                }
            })
            .catch((_err) => {
                setLogin(false)
                alert('We are experiencing server issues. Please try again shortly');
            })
    }

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    return (
        <>
            <div className='h-screen w-screen flex justify-center bg-white items-center'>
                <div style={{
                    backgroundColor: 'white',
                    boxShadow: '0.01rem 0.05rem 1rem 0.2rem lightgrey'
                }} className='grid sm:grid-cols-1 md:grid-cols-2 w-screen sm:w-screen md:w-[90%] lg:w-[70%] h-screen sm:h-full md:h-[550px] rounded-none md:rounded-3xl overflow-hidden'>

                    {/* div1 */}
                    <div className='relative'>
                        {!isSmallScreen && <img style={styleImage} className='w-full h-60 sm:h-60 md:h-full object-cover relative z-10' src={pic} alt="" />}

                        {/* signup form */}
                        <SignupForm isCreate={isCreate} nameInput={nameInput} setName={setName} emailInput={emailInput} setEmail={setEmail} passwordInput={passwordInput} setpassword={setpassword} handleMove={handleMove} styleFormSignUp={styleFormSignUp} handleSubmit={handleSignUp} />
                        {isSmallScreen && <SigninForm isLogin={isLogin} emailInput={emailInputSignIn} setEmail={setEmailSignIn} passwordInput={passwordInputSignIn} setpassword={setpasswordSignIn} handleSubmit={handleSignIn} handleMove={handleMove} styleFormSignIn={styleFormSignIn} />}
                    </div>

                    {/* div2 */}
                    {!isSmallScreen && <div className='relative overflow-hidden rounded-3xl bg-white'>
                        {/* signin form */}
                        <SigninForm isLogin={isLogin} emailInput={emailInputSignIn} setEmail={setEmailSignIn} passwordInput={passwordInputSignIn} setpassword={setpasswordSignIn} handleSubmit={handleSignIn} handleMove={handleMove} styleFormSignIn={styleFormSignIn} />
                    </div>}

                </div>
            </div>
        </>
    )
}

export default Login
