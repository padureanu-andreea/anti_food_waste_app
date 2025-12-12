const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET

const User = require("../models/user")

const verifyToken = async(req , res , next)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message: "No token found"})
    }

    const token = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(token,JWT_SECRET) //?

        const user = await User.findByPk(decoded.userID)

        if(!user)
            return res.status(401).json({message:"Invalid token!"})

        req.user =user

        next()

    }catch(error){
        next(error)
    }
}

module.exports = verifyToken