import * as bcrypt from "bcrypt"

export async function encodeApi_key(rawApi_key:string){
    let hashedApi_key =await bcrypt.hash(rawApi_key, 10)
    return hashedApi_key
}

export async function validateEncodedString(api_key:string, hashedApi_key:string){
    let compare = await bcrypt.compare(api_key, hashedApi_key)
    return compare
}