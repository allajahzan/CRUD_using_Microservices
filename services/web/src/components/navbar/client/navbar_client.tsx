import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/userContext';

function NavbarComponent() {

  const navigate = useNavigate()
  const userContext = useContext(UserContext)

  const handleEvent = (event:React.MouseEvent<HTMLParagraphElement, MouseEvent>)=>{
      navigate(`/${(event.target as HTMLElement).innerHTML.toLocaleLowerCase()}`)
  }

  const handleLogout = ()=>{
    userContext?.logout()
  }

  return (
    <div className="w-full fixed flex justify-center items-center top-0 lex p-5 px-0 sm:px-20">
      <div className='flex justify-between p-3 px-5 sm:px-8 w-[90%] sm:w-[70%] md:w-[50%] lg:w-[30%] rounded-full border-white border-2'>
        <p onClick={handleEvent} className='text-white text-base font-medium  cursor-pointer'>Home</p>
        <p onClick={handleEvent} className='text-white text-base font-medium  cursor-pointer' >Profile</p>
        <p onClick={handleLogout} className='text-white text-base font-medium  cursor-pointer'>Sign out</p>
      </div>
    </div>
  );
}

export default NavbarComponent