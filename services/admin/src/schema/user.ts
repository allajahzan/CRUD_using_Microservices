import { model, Schema } from "mongoose";

export interface userType {
    userId: string,
    name: string,
    email: string,
    image: string,
    isAdmin: Boolean
}

const userSchema = new Schema<userType>({
    userId: {
        type: String,
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    isAdmin: {
        type: Boolean,
        default : false
    }
}, { timestamps: true })

const User = model<userType>('User', userSchema)
export default User