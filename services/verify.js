import jwt from "jsonwebtoken"
export function verify(token, SIGNATURE = process.env.SIGN){
    const decoded = jwt.verify(token,SIGNATURE)
    return decoded;
}
export function generateToken(data, SIGNATURE = process.env.SIGN, expiresIn = '1h'){
    const token = jwt.sign(data,SIGNATURE,{expiresIn})

    return token
}

