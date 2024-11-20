import { Router } from "express";
import { server, userSignup, userLogin, userLogout, adminLogin, adminLogout } from '../controller/auth'

const router = Router()

// get server 
router.get('/', server)

// user signup
router.post('/user/signup', userSignup)

// user login
router.post('/user/login', userLogin)

// user logout
router.get('/user/logout', userLogout)

// admin login
router.post('/admin/login', adminLogin)

// admin logout
router.get('/admin/logout', adminLogout)

export default router
