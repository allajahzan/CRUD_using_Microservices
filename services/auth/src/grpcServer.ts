import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader'
import path from 'path'
import User from './schema/user'

const packageDefinition = protoloader.loadSync(
    path.join(__dirname, 'user.proto')
)

const userProto = grpc.loadPackageDefinition(packageDefinition).user

// get user data
const getUser = async (call: any, callback: any) => {
    const userId = call.request.userId
    try {
        const user = await User.findById(userId)
        if (!user)
            callback(null, { status: 404, msg: 'User not found', user: null })
        else
            callback(null, { status: 200, msg: 'User found', user: { userId: user._id, name: user.name, email: user.email, image: user.image } });
    } catch (err) {
        console.log(err)
        callback(null, { status: 501, msg: 'Server error, please try again later', user: null })
    }
}

// update user data
const updateUser = async (call: any, callback: any) => {
    try {
        const { userId, name, email, image } = call.request

        const userPromise = User.findById(userId)
        const isUserPromise = User.findOne({ _id: { $ne: userId }, email: email, isAdmin: false })
        const [user, isUser] = await Promise.all([userPromise, isUserPromise])
        if (!user) {
            callback(null, { status: 404, msg: 'User not found' })
        } else if (isUser) {
            callback(null, { status: 409, msg: 'This email already exists' })
        }
        else {
            user.name = name
            user.email = email
            user.image = image
            await user.save()
            callback(null, { status: 200, msg: 'User data updated' })
        }
    } catch (err) {
        console.log(err)
        callback(null, { status: 501, msg: 'Server error, please try again later' })
    }
}

export const grpcServer = () => {
    const server = new grpc.Server();
    server.addService((userProto as any).UserService.service, { getUser, updateUser });
    server.bindAsync('localhost:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('Auth gRPC server running on port 50051');
    });
}