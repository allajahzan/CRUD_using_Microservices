import { Request, Response, NextFunction } from "express"
import jwt, { JwtPayload } from 'jsonwebtoken'
import amqp from 'amqplib'
import { getUserFromAuthService, updateUserFromAuthService } from "../grpcConnection"

// rabit mq connection
let connection, channel
async function connect() {
    const amqpServer = 'amqp://localhost:5672';
    let retries = 5;
    while (retries) {
        try {
            connection = await amqp.connect(amqpServer);
            channel = await connection.createChannel();
            await channel.assertQueue('USERS');
            console.log("Connected to RabbitMQ");

            // here we will consume the message then
            channel.assertQueue('USER-DATA-TO-USER-SERVICE', { durable: true })
            channel.consume('USER-DATA-TO-USER-SERVICE', (data: any) => {
                let newUser = JSON.parse(data?.content)
                console.log(newUser)
                console.log("consumed")
            })

            break;
        } catch (err) {
            console.error("Failed to connect to RabbitMQ. Retrying in 5 seconds...", err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}
connect()

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
