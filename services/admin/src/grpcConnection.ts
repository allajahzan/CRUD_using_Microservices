import * as grpc from '@grpc/grpc-js'
import * as protoloader from '@grpc/proto-loader'
import path from 'path'

const packageDefinition = protoloader.loadSync(
    path.join(__dirname, 'admin.proto')
)

const adminProto = grpc.loadPackageDefinition(packageDefinition).admin

const client = new (adminProto as any).AdminService('localhost:50052', grpc.ServerCredentials.createInsecure())

//  get users from auth service
const getUsersFromAuthSerivce = ()=>{
    return new Promise((resolve, reject)=>{
        client.getUsers({},(error:any, response:any)=>{
            if(error){
                reject(error)
            }else{
                
            }
        })
    })
}
