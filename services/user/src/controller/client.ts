import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import amqp from 'amqplib'
import { deleteUserFromAdminService, getNewUserCreatedFromAuthService } from "../rabbitmq/consumer"
import User from "../schema/user"

// rabit mq connection
let connection: amqp.Connection, channel: amqp.Channel;
export async function connect() {
    const amqpServer = 'amqp://localhost:5672';
    let retries = 5;
    while (retries) {
        try {
            // rabbitmq connection and channel
            connection = await amqp.connect(amqpServer);
            channel = await connection.createChannel();
            console.log("Connected to RabbitMQ");

            // message from auth service------------------------

            // user.signup
            getNewUserCreatedFromAuthService(channel)

            // message from admin service----------------------
            
            // user.delete.admin
            deleteUserFromAdminService(channel)

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
    res.send("server is running on port 3001 - user service")
}

// verify access token
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // no storing in cache becuase of GET method
        res.setHeader('Cache-Control', 'no-store');

        const accessToken = req.headers["authorization"]?.split(' ')[1]
        if (!accessToken) return res.status(403).json({ msg: 'Unauthorized access' })

        // jwt token verification  
        jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) return res.status(403).json({ msg: 'Unauthorized access' })
            else {
                //checking weather user is existing or not in user service db
                const isUser = await User.findOne({ userId: (payload as JwtPayload).userId })
                if (!isUser) return res.status(404).json({ msg: "User not found" })

                console.log("access token verified")
                return res.status(200).json({ msg: "Authorized access" })
            }
        })
    } catch (err) {
        next(err)
    }
}

// refresh accesss token
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // no storing in cache becuase of GET method
        res.setHeader('Cache-Control', 'no-store');

        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) {
            return res.status(403).json({ msg: "Unauthorized access" })
        }

        // jwt token verification
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err: jwt.VerifyErrors | null, payload: string | jwt.JwtPayload | undefined) => {
            if (err) {
                res.clearCookie('refreshToken')
                return res.status(403).json({ msg: "Unauthorized access" })
            } else {
                //checking weather user is existing or not in user service db
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

// get user
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { userId } = req.body.payload

        const user = await User.findOne({ userId: userId })
        if (!user) return res.status(404).json({ msg: "User not found" })

        res.status(200).json({ userData: user })

    } catch (err) {
        next(err)
    }
}

// user update
export const editUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { payload, name, email, image } = req.body

        const user = await User.findOne({ userId: payload.userId })
        if (!user) return res.status(404).json({ msg: "User not found" })

        user.name = name
        user.email = email
        user.image = image
        const updatedUser = await user.save()

        // send message to exhange in rabbitmq
        const exhange = 'user.update'
        channel.assertExchange(exhange, 'fanout', { durable: true })
        channel.publish(exhange, '', Buffer.from(JSON.stringify({ updatedUser, payload })))
        console.log("send message to exhange")

        res.status(200).json({ msg: "User data updated" })

    } catch (err: any) {
        next(err.message)
    }
}
