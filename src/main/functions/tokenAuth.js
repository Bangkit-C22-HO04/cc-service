import jwt from "jsonwebtoken"

const generateToken = async (data) => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '24h' })
}

export default {
    generate: generateToken
}