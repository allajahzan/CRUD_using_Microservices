import amqp from 'amqplib'
import User from '../schema/user'

// get updated user from user service
export const getUpdatedUserFromUserService = async (channel: amqp.Channel) => {
    const exhange = 'user.update'
    const queue = 'USER_UPDATED_AUTH_SERVICE'

    // assert exchange and queue
    channel.assertExchange(exhange, 'fanout', { durable: true })
    channel.assertQueue(queue, { durable: true })

    // bind queue to exchange
    channel.bindQueue(queue, exhange, '')

    // consume message from queue
    channel.consume(queue, async (data: any) => {
        const message = JSON.parse(data.content)
        const updatedUser = message.updatedUser
        const user = await User.findById(updatedUser.userId)
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

// get userId to delete user from admin service
export const deleteUserFromAdminService = (channel: amqp.Channel) => {
    try {
        const exhange = 'user.delete.admin'
        const queue = 'USER_DELETED_AUTH_SERVICE'

        // assert exchange and queue
        channel.assertExchange(exhange, 'fanout', { durable: true })
        channel.assertQueue(queue, { durable: true })

        // bind queue to exchange
        channel.bindQueue(queue, exhange, '')

        // consume message from queue
        channel.consume(queue, async (data: any) => {
            const message = JSON.parse(data.content)
            const userId = message.userId
            await User.deleteOne({ userId: userId })

            // acknowledge the queue
            channel.ack(data)
            console.log("user data deleted from db")
        })
    } catch (err) {
        console.log(err)
    }
}