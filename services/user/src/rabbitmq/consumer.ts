import amqp from 'amqplib'
import User from '../schema/user';

// get new user created from auth service
export const getNewUserCreatedFromAuthService = (channel: amqp.Channel) => {
    try {
        const exchange = 'user.signup'
        const queue = 'USER_CREATED_USER_SERVICE'

        // assert exchange and queue
        channel.assertExchange(exchange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind the queue to exchange
        channel.bindQueue(queue, exchange, '');

        // consume message from queue
        channel.consume(queue, async (data: any) => {
            const user = JSON.parse(data.content)
            const newUser = new User({ userId: user._id, name: user.name, email: user.email, image: user.image, isAdmin : user.isAdmin })
            await newUser.save()

            // acknowledge the queue
            channel.ack(data)
            console.log("saved user data to db")
        })

    } catch (err) {
        console.log(err)
    }
}

