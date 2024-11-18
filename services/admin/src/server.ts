import express from "express";
import route from './router/admin'
import dotenv from 'dotenv'
import mongoose from "mongoose";
import amqp from 'amqplib'
import { errorHandler } from "./middleware/error.handle";

// create app
const app = express()

// env config
dotenv.config()

// mongodb connection
mongoose.connect(process.env.MONGO_URL as string)
.then((res)=>console.log("successfully connected to admin service db"))
.catch((err)=>console.log("failed to connect to admin service db"))

// rabbitmq connection
let connection, channel;
async function connect() {
  const amqpServer = 'amqp://localhost:5672'
  let retries = 5
  while (retries) {
    try {
      connection = await amqp.connect(amqpServer)
      channel = await connection.createChannel()
      console.log("connected to rabbitMQ")


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

// route middleware
app.use('/', route) 

// error logger
app.use(errorHandler)

// server listening
app.listen(process.env.PORT,()=>{
    console.log(`server is running on port ${process.env.PORT}`)
})