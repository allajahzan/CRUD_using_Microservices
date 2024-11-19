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
            const newUser = new User({ userId: user._id, name: user.name, email: user.email, image: user.image })
            await newUser.save()

            // acknowledge the queue
            channel.ack(data)
            console.log("saved user data to db")
        })

    } catch (err) {
        console.log(err)
    }
}

// get userId to delete user from admin service
export const deletedUserFromAdminService = (channel: amqp.Channel) => {
    try {
        const exchange = 'user.delete.admin'
        const queue = 'USER_DELETED_USER_SERVICE'

        // assert exchange and queue
        channel.assertExchange(exchange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind queue to exchange
        channel.bindQueue(queue, exchange, '')

        // consume message from queue
        channel.consume(queue, async (data: any) => {
            const message = JSON.parse(data.content)
            const userId = message.userId
            await User.deleteOne({ userId })

            // acknowledge the queue
            channel.ack(data)
            console.log("user data deleted from db")
        })
    } catch (err) {
        console.log(err)
    }
}

// create user from admin service

export const getNewUserCreatedFromAdminService = (channel: amqp.Channel) => {
    try {
        const exchange = 'user.create.admin'
        const queue = 'USER_CREATE_USER_SERVICE'

        // assert exhchange and queue
        channel.assertExchange(exchange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind queue to exchange
        channel.bindQueue(queue, exchange, '')

        // consume message from queue
        channel.consume(queue, async (data: any) => {
            const message = JSON.parse(data.content)
            const user = message.newUser
            const newUser = new User({ name: user.name, email: user.email, image: user.image, userId: user.userId })
            await newUser.save()

            // acknowledge the queue
            channel.ack(data)
            console.log("user data stored in db")
        })

    } catch (err) {
        console.log(err)
    }
}
