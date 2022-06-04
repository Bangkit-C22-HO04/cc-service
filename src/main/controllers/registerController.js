import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    if (
      !req.body.email ||
      !req.body.password ||
      !req.body.gender ||
      !req.body.birth_date
    ) {
      return res
        .status(404)
        .json({ message: "Form is not completed", status: false });
    }

    const emailCheck = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    // check if username or email already exist
    if (emailCheck) {
      return res.status(400).json({
        message: `Account with email ${req.body.email} already exist`,
        status: false,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
        gender: req.body.gender,
        birth_date: req.body.birth_date + "T00:00:00Z"
      },
    });

    return res.status(201).json({
      message:
        "You have successfully registered an account! You can now login.",
      status: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error has occurred.",
      status: false,
    });
  }
};

export default {
  register: register,
};
