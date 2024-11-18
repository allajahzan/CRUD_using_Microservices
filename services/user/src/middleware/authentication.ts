import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getUserFromAuthService } from "../grpcConnection";
import User from "../schema/user";

// verify access token
export const authentication = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        res.setHeader('Cache-Control', 'no-store');

        const accessToken = req.headers["authorization"]?.split(' ')[1]
        if (!accessToken) return res.status(403).json({ msg: 'Unauthorized access' })

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) return res.status(403).json({ msg: 'Unauthorized access' })
            else {
                //checking weather user is existing or not in user service db
                const isUser = await User.findOne({ email: (payload as JwtPayload).email })
                if (!isUser) return res.status(404).json({ msg: "User not found" })

                console.log("allowed to access")
                req.body.payload = payload
                next()
            }
        })
    } catch (err) {
        next(err)
    }
}