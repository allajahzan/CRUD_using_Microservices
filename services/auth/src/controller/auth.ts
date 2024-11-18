import { Request, Response, NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../schema/user'
import amqp from 'amqplib'
import { getUpdatedUserFromUserService } from '../rabbitmq/consumer'

// rabbitmq connection
let connection: amqp.Connection, channel: amqp.Channel;
export async function connect() {
    const amqpServer = 'amqp://localhost:5672'
    let retries = 5
    while (retries) {
        try {
            // rabbitmq connection and channel
            connection = await amqp.connect(amqpServer)
            channel = await connection.createChannel()
            console.log("connected to rabbitMQ")

            // messages from user service

            // user.update
            getUpdatedUserFromUserService(channel)

            break;
        } catch (err) {
            console.error("Failed to connect to RabbitMQ. Retrying in 5 seconds", err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}

// server
export const server = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    res.send("server is running on port 3000 - auth service")
}

// signup user
export const userSignup = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { name, email, password } = req.body

        const isUser = await User.findOne({ email, isAdmin: false })
        if (isUser) return res.status(409).json({ msg: 'This email already exist' })

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // save new user
        const newUser = new User({ name, email, password: hashedPassword })
        await newUser.save()

        // send message to exhange in rabbitmq
        const exchange = 'user.signup'
        channel.assertExchange(exchange, 'fanout', { durable: true })
        channel.publish(exchange, '', Buffer.from(JSON.stringify(newUser)))
        console.log("send message to exchange")

        res.status(200).json({ msg: "Successfully created an account" })

    } catch (err) {
        next(err)
    }
}

// login user
export const userLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, password } = req.body

        const isUser = await User.findOne({ email })
        if (!isUser) return res.status(401).json({ msg: "Incorrect email address" })

        // password validation
        const isPasswordValid = await bcrypt.compare(password, isUser.password)
        if (!isPasswordValid) return res.status(401).json({ msg: "Incorrect password" })

        // create access and refresh token 
        const payload = { userId: isUser._id }
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' })

        // send refresh token to cookie as http only
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });

        res.status(200).json({ msg: 'Successfully logged In', accessToken })

    } catch (err) {
        next(err)
    }
}

// user logout
export const userLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // no cache storing because of GET method
        res.setHeader('Cache-Control', 'no-store');

        // clear cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        });
        res.sendStatus(200)
    } catch (err) {
        next(err)
    }
}


// admin login
export const adminLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, password } = req.body

        const isUser = await User.findOne({ email, isAdmin: true })
        if (!isUser) return res.status(401).json({ msg: "Incorrect email address" })

        // password validation   
        const isPasswordValid = await bcrypt.compare(password, isUser.password)
        if (!isPasswordValid) return res.status(401).json({ msg: "Incorrect password" })

        // create access and refresh token  
        const payload = { userId: isUser._id }
        const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' })
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1m' })

        // send refresh token to cookie as http only
        res.cookie('adminRefreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });

        res.status(200).json({ msg: 'Successfully logged In', accessToken })

    } catch (err) {
        console.log(err)
    }
}

// admin logout 
export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // no cache storing because of GET method
        res.setHeader('Cache-Control', 'no-store');

        // clean cookies
        res.clearCookie('adminRefreshToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        })

        res.sendStatus(200)
    } catch (err) {
        console.log(err)
    }
}