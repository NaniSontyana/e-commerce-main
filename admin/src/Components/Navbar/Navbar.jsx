import React from 'react'
import './Navbar.css'
import logo from '../../Assets/logo.png'
import user from '../../Assets/user.png'
import dropdown_icon from '../../Assets/dropdown_icon.png'  

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={logo} alt="logo" className='navbar-image'/>
      <img src={user} alt="user" className='navbar-img' />
      
    </div>
  )
}

export default Navbar

