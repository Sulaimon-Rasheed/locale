import * as mongoose from "mongoose"

const Schema = mongoose.Schema

export const userSchema = new Schema({
    first_name: { type: String, required:true},
    last_name: { type: String, required:true},
    email:{type:String,required:true},
    phoneNum:{type:String, required:true},
    api_key: { type: String, unique: true, required:true}
})


export interface User extends mongoose.Document{
    id:string
    first_name:string
    last_name:string
    email:string
    phoneNum:string
    api_key:string
}