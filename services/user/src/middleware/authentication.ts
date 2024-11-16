import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getUserFromAuthService } from "../grpcConnection";

// verify access token
export const authentication = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        res.setHeader('Cache-Control', 'no-store');

        const accessToken = req.headers["authorization"]?.split(' ')[1]
        if (!accessToken) return res.status(403).json({ msg: 'Unauthorized access' })

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) return res.status(403).json({ msg: 'Unauthorized access' })
            else {

                //checking weather user is existing or not - through gRPC                
                const response = await getUserFromAuthService((payload as JwtPayload).userId)
                if (response.status === 404) {
                    console.log("Not allowed to access")
                    return res.status(404).json({ msg: response.msg })
                } else if (response.status === 501) {
                    console.log(response.msg)
                    return res.status(501).json({ msg: response.msg })
                }

                console.log("allowed to access")
                req.body.userId = (payload as JwtPayload).userId
                next()
            }
        })
    } catch (err) {
        next(err)
    }
}