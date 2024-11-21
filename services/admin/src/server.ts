import express from "express";
import route from './router/admin'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import morgan from 'morgan'
import cookiesParser from 'cookie-parser'
import { connect } from "./controller/admin";
import { errorHandler } from "./middleware/error.handle";

// create app
const app = express()

// env config
dotenv.config()

// mongodb connection
mongoose.connect(process.env.MONGO_URL as string)
    .then((res) => console.log("successfully connected to admin service db"))
    .catch((err) => console.log("failed to connect to admin service db"))

// rabbitmq connection
connect()

// middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookiesParser())
app.use(morgan('dev'))

// route middleware
app.use('/', route)

// error logger
app.use(errorHandler)

// server listening
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`)
})