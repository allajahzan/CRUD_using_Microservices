import express from 'express'
import routes from './router/user'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import amqp from 'amqplib'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/error.handle'

// create app
const app = express()

// env config
dotenv.config()

// mongodb connection
mongoose.connect(process.env.MONGO_URL as string)
    .then((res) => console.log("successfully connected to client service db"))
    .catch((err) => console.log("failed to connect to client service db"))

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
            break;
        } catch (err) {
            console.error("Failed to connect to RabbitMQ. Retrying in 5 seconds...", err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}
connect()

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'))
app.use(cookieParser())

// router middleware
app.use('/', routes)

// error logger
app.use(errorHandler)

// server listening
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`)
})