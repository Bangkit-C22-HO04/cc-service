import jwt from "jsonwebtoken"

const verify = async (req, res, next) => {
    const token = req.headers['authorization']

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

const generateToken = async (data) => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '24h' })
}

export default {
    generate: generateToken,
    verify: verify
}