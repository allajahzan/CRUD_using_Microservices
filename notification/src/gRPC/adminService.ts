import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader'
import path from 'path'
import { sendEmail } from '../mail/nodeMailer'

const packageDefinition = protoloader.loadSync(
    path.join(__dirname, '..', 'proto/admin.proto')
)

const adminProto = grpc.loadPackageDefinition(packageDefinition).admin

const sendNotification = async (call: any, callback: any) => {
    try {
        const { id, email } = call.request

        if (id === process.env.NOTIFICATION_ID) {
            sendEmail(email, function (error: any, info: any) {
                if (error) {
                    callback(null, { status: 401, msg: error })
                } else {
                    callback(null, { status: 200, msg: info })
                }
            });
        } else {
            console.log("not valid request")
            callback(null, { status: 403, msg: 'not valid request' })
        }
    } catch (err) {
        console.log(err)
        callback(null, { status: 403, msg: 'not valid request' })
    }
}

export const grpcServerForAdminService = () => {
    try {
        const server = new grpc.Server()
        server.addService((adminProto as any).AdminService.service, { sendNotification })
        // notification:50052 - docker compose
        // 0.0.0.0:50052 - in kubernetes clustor beacuase it will Bind to all network interfaces (0.0.0.0) and port 50052 
        server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
            console.log("Auth gRPC server for admin service running on port 50052")
        })
    } catch (err) {
        console.log(err)
    }
}