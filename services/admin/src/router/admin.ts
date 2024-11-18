import { Router } from "express";
import { refreshToken, server, verifyToken, getAdmin } from "../controller/admin";
import { authentication } from "../middleware/authentication";
const router = Router()

// get server
router.get('/', server)

// verify token
router.get('/verifyToken', verifyToken)

// refresh token 
router.get('/refreshToken', refreshToken)

// get admin
router.get('/getAdmin', authentication, getAdmin)



export default router