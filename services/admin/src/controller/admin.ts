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

