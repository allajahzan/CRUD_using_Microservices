import amqp from 'amqplib'
import User, { userType } from '../schema/user';

let connection: amqp.Connection, channel: amqp.Channel;
export async function connect() {
    const amqpServer = 'amqp://localhost:5672';
    let retries = 5
    while (retries) {
        try {
            connection = await amqp.connect(amqpServer)
            channel = await connection.createChannel()
            console.log("connected to RabbitMQ")

            // messages from auth service

            // user.signup
            getNewUserCreatedFromAuthService(channel, connection)

            break;
        } catch (err) {
            console.log("Failed to connect to RabbitMQ. Retrying in 5 seconds", err);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}


// get new user from auth service
function getNewUserCreatedFromAuthService(channel: amqp.Channel, connection: amqp.Connection) {
    try {
        const exchange = 'user.signup'
        const queue = 'USER_CREATED_ADMIN_SERVICE'

        channel.assertExchange(exchange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind queue to exhange
        channel.bindQueue(queue, exchange, '')

        channel.consume(queue, async (data: any) => {
            const user: userType = JSON.parse(data.content)
            const newUser = new User({ name: user.name, email: user.email, image: user.image })
            await newUser.save()

            // acknowledge the queue
            channel.ack(data)
            console.log("saved user data to db")
        })

    } catch (err) {
        console.log(err)
    }
} 