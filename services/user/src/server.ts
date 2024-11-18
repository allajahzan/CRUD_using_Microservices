import express from 'express'
import routes from './router/user'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
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