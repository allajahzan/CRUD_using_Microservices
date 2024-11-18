import { Router } from "express";
import { server } from "../controller/admin";
import { authentication } from "../middleware/authentication";
const router = Router()

// get server
router.get('/', server)


export default router