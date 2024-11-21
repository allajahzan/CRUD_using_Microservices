import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import User from '../schema/user'

// authentication
export const authentication = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // no storing in cache becuase of GET method
        res.setHeader('Cache-Control', 'no-store');
        
        const accessToken = req.headers['authorization']?.split(' ')[1]
        if (!accessToken) return res.status(403).json({ msg: "Unauthorized access" })

        // jwt verification 
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) return res.status(403).json({ msg: "Unauthorized access" })
            else {
                // check weather admin is existing or not in admin service db
                const isUser = await User.findOne({ userId: (payload as JwtPayload).userId })
                if (!isUser) return res.status(404).json({ msg: "Admin not found" })

                console.log("allowed to access")
                req.body.payload = payload
                next()
            }
        })
    } catch (err) {
        console.log(err)
    }
}



