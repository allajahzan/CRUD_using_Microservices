import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader'
import path from 'path'
import User from '../schema/user'

const packageDefinition = protoloader.loadSync(
    path.join(__dirname, '..', '/proto/admin.proto')
)

const adminProto = grpc.loadPackageDefinition(packageDefinition).admin

// get users
const getUsers = async (call: any, callback: any) => {
    try {
        const users = await User.find({})
        console.log(users)
    } catch (err) {
        console.log(err)
        callback(null, { status: 501, msg: 'Server error, please try again later' })
    }
}

export const grpcServer_adminService = () => {
    const server = new grpc.Server()
    server.addService((adminProto as any).AdminService.service, { getUsers })
    server.bindAsync('localhost:50052', grpc.ServerCredentials.createInsecure(), () => {
        console.log("Auth gRPC server for admin service running on port 50052")
    })
}