import * as mongoose from "mongoose"

const Schema = mongoose.Schema

export const userVerificationSchema = new Schema({
    userId: { type: String},
    uniqueString:{type: String},
    creation_date: { type: Date},
    expiring_date:{type:Date},
})

export interface UserVerification extends mongoose.Document{
    userId:string
    uniqueString:string
    creation_date:Date
    expiring_date:Date
    
}