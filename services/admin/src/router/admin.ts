import { Router } from "express";
import multer from 'multer'
import { refreshToken, server, verifyToken, getAdmin, getUsers, deleteUser, addUser } from "../controller/admin";
import { authentication } from "../middleware/authentication";
const router = Router()
const upload = multer()

// get server
router.get('/', server)

// verify token
router.get('/verifyToken', verifyToken)

// refresh token 
router.get('/refreshToken', refreshToken)

// get admin
router.get('/getAdmin', authentication, getAdmin)

// get users
router.get('/getUsers', authentication, getUsers)

// delete user
router.delete('/deleteUser/:userId', deleteUser)

// add user
router.post('/addUser', upload.any(), authentication, addUser)

export default router