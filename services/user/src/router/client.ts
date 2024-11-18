import { Router } from 'express'
import { server, editUser, verifyToken, refreshToken, getUser } from '../controller/client'
import { authentication } from '../middleware/authentication'
import multer from 'multer'
const router = Router()
const upload = multer()


// get server
router.get('/', server)

// verify access token
router.get('/verifyToken', verifyToken)

// refresh access token
router.get('/refreshToken', refreshToken)

// get user
router.get('/getUser', authentication, getUser)

// user update
router.patch('/editUser', upload.any(), authentication, editUser)

export default router