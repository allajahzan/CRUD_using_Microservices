import amqp from 'amqplib'
import User, { userType } from '../schema/user';

// get new user from auth service
export const getNewUserCreatedFromAuthService = (channel: amqp.Channel) => {
    try {
        const exchange = 'user.signup'
        const queue = 'USER_CREATED_ADMIN_SERVICE'

        // assert exchange and queue
        channel.assertExchange(exchange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind queue to exchange
        channel.bindQueue(queue, exchange, '')

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

// get updated user from user service
export const getUpdatedUserFromUserService = async (channel: amqp.Channel) => {
    const exhange = 'user.update'
    const queue = 'USER_UPDATED_ADMIN_SERVICE'

    // assert exchange and queue
    channel.assertExchange(exhange, 'fanout', { durable: true })
    channel.assertQueue(queue, { durable: true })

    // bind queue to exchange
    channel.bindQueue(queue, exhange, '')

    // consume message from queue
    channel.consume(queue, async (data: any) => {
        const message = JSON.parse(data.content)
        const updatedUser: userType = message.updatedUser
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
}