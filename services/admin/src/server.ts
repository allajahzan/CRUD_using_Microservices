import express from "express";
import route from './router/admin'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import { errorHandler } from "./middleware/error.handle";

// create app
const app = express()

// env config
dotenv.config()

// mongodb connection
mongoose.connect(process.env.MONGO_URL as string)
.then((res)=>console.log("successfully connected to admin service db"))
.catch((err)=>console.log("failed to connect to admin service db"))

// route middleware
app.use('/', route) 

// error logger
app.use(errorHandler)

// server listening
app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})