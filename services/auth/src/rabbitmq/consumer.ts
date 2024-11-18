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