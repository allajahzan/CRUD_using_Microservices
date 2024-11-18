import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from 'jsonwebtoken'
import amqp from 'amqplib'
import { getNewUserCreatedFromAuthService, getUpdatedUserFromUserService } from "../rabbitmq/consumer";
import User from "../schema/user";

// rabbitmq connection
let connection: amqp.Connection, channel: amqp.Channel;
export const connect = async () => {
    const amqpServer = 'amqp://localhost:5672';
    let retries = 5
    while (retries) {
        try {
            // rabbitmq connection and channel
            connection = await amqp.connect(amqpServer)
            channel = await connection.createChannel()
            console.log("connected to RabbitMQ")

            // messages from auth service

            // user.signup
            getNewUserCreatedFromAuthService(channel)

            // user.udpate
            getUpdatedUserFromUserService(channel)

            break;
        } catch (err) {
            console.log("Failed to connect to RabbitMQ. Retrying in 5 seconds", err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}

// server
export const server = async (req: Request, res: Response) => {
    res.send("server is runnning on port 3002 - admin service")
}

// admin verify token
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
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
                const isAdmin = await User.findOne({ userId: (payload as jwt.JwtPayload).userId })
                if (!isAdmin) return res.status(404).json({ msg: 'Admin not found' })

                console.log("access token verified")
                return res.status(200).json({ msg: "Authorized access" })
            }
        })
    } catch (err) {
        next(err)
    }
}

// admin refresh token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // no storing in cache becuase of GET method
        res.setHeader('Cache-Control', 'no-store');

        const refreshToken = req.cookies.adminRefreshToken

        if (!refreshToken) {
            return res.status(403).json({ msg: "Unauthorized access" })
        }

        // jwt token verification
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) {
                res.clearCookie('refreshToken')
                return res.status(403).json({ msg: "Unauthorized access" })
            } else {
                //checking weather admin is existing or not in admin service db
                const isUser = await User.findOne({ userId: (payload as JwtPayload).userId })
                if (!isUser) return res.status(404).json({ msg: "User not found" })

                console.log("refresh token verified")
                const newAccessToken = jwt.sign({ userId: (payload as JwtPayload).userId }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' })
                return res.status(200).json({ newAccessToken })
            }
        })
    } catch (err) {
        next(err)
    }
}

// get Admin
export const getAdmin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { userId } = req.body.payload
        const user = await User.findOne({ userId })
        if (!user) return res.status(404).json({ msg: "User not found" })

        res.status(200).json({ userData: user })

    } catch (err) {
        next(err)
    }
}

// get users
export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const users = await User.find({ isAdmin: false })
        res.status(200).json({ users })
    } catch (err) {
        next(err)
    }
}

