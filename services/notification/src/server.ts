import express from 'express'
import dotenv from 'dotenv'
import { Request, Response, NextFunction } from 'express'
import nodemailer from 'nodemailer'

// create app
const app = express()

// env config
dotenv.config()

app.use('/', (req: Request, res: Response, next: NextFunction) => {
    res.send("server is running on port 3003 - notification service")
})

// server listening
app.listen(process.env.PORT, () => {
    console.log(`server is running on port ${process.env.PORT}`)
})