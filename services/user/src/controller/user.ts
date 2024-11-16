import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import { getUserFromAuthService, updateUserFromAuthService } from "../grpcConnection"

// server 
export const server = async (req: Request, res: Response) => {
    res.send("server is running on port 3001 - user service")
}

// verify access token
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        res.setHeader('Cache-Control', 'no-store');

        const accessToken = req.headers["authorization"]?.split(' ')[1]
        if (!accessToken) return res.status(403).json({ msg: 'Unauthorized access' })

        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) return res.status(403).json({ msg: 'Unauthorized access' })
            else {
                //checking weather user is existing or not - through gRPC                
                const response = await getUserFromAuthService((payload as JwtPayload).userId)
                if (response.status === 404) return res.status(response.status).json({ msg: response.msg })
                else if (response.status === 501) return next(response.msg)

                console.log("access token verified")
                return res.status(200).json({ msg: "Authorized" })
            }
        })
    } catch (err) {
        next(err)
    }
}

// refresh accesss token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        res.setHeader('Cache-Control', 'no-store');

        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(403).json({ msg: "Unauthorized access" })
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) {
                res.clearCookie('refreshToken')
                return res.status(403).json({ msg: "Unauthorized access" })
            } else {
                //checking weather user is existing or not - through gRPC                
                const response = await getUserFromAuthService((payload as JwtPayload).userId)
                if (response.status === 404) return res.status(response.status).json({ msg: response.msg })
                else if (response.status === 501) return next(response.msg)

                console.log("refresh token verified")
                const newAccessToken = jwt.sign({ userId: (payload as JwtPayload).userId }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' })
                return res.status(200).json({ newAccessToken })
            }
        })
    } catch (err) {
        next(err)
    }
}

// get user
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const userId = req.body.userId

        const response = await getUserFromAuthService(userId);
        if (response.status === 404) return res.status(response.status).json({ msg: response.msg })
        else if (response.status === 501) return next(response.msg)

        res.status(response.status).json({ msg: response.msg, userData: response.user });

    } catch (err) {
        next(err)
    }
}

// user update
export const editUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { userId, name, email, image } = req.body

        const response = await updateUserFromAuthService(userId, name, email, image)
        if (response.status === 404) return res.status(response.status).json({ msg: response.msg })
        else if (response.status === 409) return res.status(response.status).json({ msg: response.msg })
        else if (response.status === 501) return next(response.msg)

        res.status(response.status).json({ msg: response.msg })
        
    } catch (err: any) {
        next(err.message)
    }
}
