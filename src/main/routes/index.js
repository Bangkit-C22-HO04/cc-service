import express from "express"
import loginController from "../controllers/loginController.js"
import registerController from "../controllers/registerController.js"
import rateLimit from "express-rate-limit"
import hotelController from "../controllers/hotelController.js"
import tokenAuth from "../functions/tokenAuth.js"

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many login attempts from this IP, please try again in 15 minutes.",
})

router.get("/", function (req, res, next) {
  res.send("Hello from capstone bangkit C22-HO04")
})

router.post("/login", loginLimiter, (req, res) => loginController.login(req, res))
router.post('/register', (req, res) => registerController.register(req, res))

router.post('/get-hotel', (req,res) => hotelController.getHotel(req,res))
router.post('/get-ranking', tokenAuth.verify, (req,res) => hotelController.hotelRanking(req, res))
export default router
