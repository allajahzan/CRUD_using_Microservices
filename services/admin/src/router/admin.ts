import { Router } from "express";
import { refreshToken, server, verifyToken} from "../controller/admin";
import { authentication } from "../middleware/authentication";
const router = Router()

// get server
router.get('/', server)

// verify token
router.get('/verifyToken', verifyToken)

// refresh token 
router.get('/refreshToken', refreshToken)



export default router