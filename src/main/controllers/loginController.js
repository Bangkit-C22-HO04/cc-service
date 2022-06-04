import bcrypt from "bcryptjs"
import token from "../functions/tokenAuth.js"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const login = async (req, res) => {
  try {
    if (!req.body.password || !req.body.email) {
      return res
        .status(404)
        .json({ message: "Email and Password must be filled" })
    }

    const account = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    })

    if (!account) {
      return res.status(404).json({ message: "Email not found" })
    }

    const verified = await bcrypt.compare(req.body.password, account.password)

    if (!verified) {
      return res.status(403).json({ message: "Email/Password Incorrect" })
    }

    const tokenData = {
      userId: account.id,
      email: account.email,
      gender: account.gender,
      birth_date: account.birth_date,
    }

    const jwtToken = await token.generate(tokenData)

    return res.status(200).json({ token: jwtToken })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "An Error Occured" })
  }
}

export default {
  login: login
}
