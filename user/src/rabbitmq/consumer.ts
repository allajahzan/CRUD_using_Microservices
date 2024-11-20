import amqp from 'amqplib'
import User from '../schema/user';

// get new user created from auth service
export const getNewUserCreatedFromAuthService = (channel: amqp.Channel) => {
    try {
        const exchange = 'user.signup'
        const queue = 'USER_CREATED_FROM_AUTH_SERVICE_TO_USER_SERVICE'

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
        const queue = 'USER_DELETED_FROM_ADMIN_SERVICE_TO_USER_SERVICE'

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
        const queue = 'USER_CREATE_FROM_ADMIN_SERVICE_TO_USER_SERVICE'

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

// get updated user from admin service
export const updatedUserFromAdminService = (channel: amqp.Channel) => {
    try {
        const exhange = 'user.update.admin'
        const queue = 'USER_UPDATED_FROM_ADMIN_SERVICE_TO_USER_SERVICE'

        // assert exchange and queue
        channel.assertExchange(exhange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind queue to exchange
        channel.bindQueue(queue, exhange, '')

        // consume message from queue
        channel.consume(queue, async (data: any) => {
            const message = JSON.parse(data.content)
            const updatedUser = message.updatedUser

            const user = await User.findOne({userId : updatedUser.userId})
            if (!user) {
                // acknowledge the queue
                channel.ack(data)
                console.log("User not found")
                return
            }

            user.name = updatedUser.name
            user.email = updatedUser.email
            user.image = updatedUser.image
            await user.save()

            // acknowledge the queue
            channel.ack(data)
            console.log('user data updated in db')
        })

    } catch (err) {
        console.log(err)
    }
}