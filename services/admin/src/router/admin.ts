import { Router } from "express";
import { server, verifyToken } from "../controller/admin";
const router = Router()

// get server
router.get('/', server)

// verify token
router.get('/verifyToken', verifyToken)

export default router