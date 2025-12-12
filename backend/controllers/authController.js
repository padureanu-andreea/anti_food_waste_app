const { Op } = require("sequelize")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWST_SECRET


const User = require("../models/user")
// const { get } = require("../routes/authRouter")


const createUser = async (req, res, next) => {
    try {

        let { username, email, password, phone, bio } = req.body
        email = email.toLowerCase().trim()

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.username === username)
                return res.status(409).json({ message: "Username already used!" })
            if (existingUser.email === email)
                return res.status(409).json({ message: "Email already used!" })
        }

        const passwordHash = await bcrypt.hash(password, 10)


        await User.create({
            username,
            email,
            passwordHash,
            phone,
            bio
        })
        return res.status(201).json({ message: "User created!" })


    }
    catch (error) {
        next(error)
    }
}



const searchUser = async (req, res, next) => {
    try {

        let { username, email, password } = req.body
        email = email.toLowerCase().trim()

        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (existingUser) {
            const isTheSame = await bcrypt.compare(password, existingUser.passwordHash)
            if (!isTheSame)
                return res.status(401).json({ message: "Wrong credentials!" })
            else {
                const token = jwt.sign(
                    { userID: existingUser.id },
                    JWT_SECRET,
                    { expiresIn: "7d" }
                )

                return res.json({
                    username: username,
                    email: email,
                    message: "Login success",
                    token: token
                })
            }
        }
        else {
            return res.status(404).json({ message: "No match! Create an account." })
        }


    } catch (error) {
        next(error)
    }
}


const editUser = async (req, res, next) => {
    try {
        const user = req.user

        const allowedFileds = ["username", "phone", "bio"]

        const updates = {}

        for (const field of allowedFileds) {
            if (req.body[field] !== undefined)
                updates[field] = req.body[field]
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No fields to update" })
        }

        for (const field of Object.keys(updates)) {
            if (field === "username") {
                const existingUser = await User.findOne({
                    where: {
                        username: updates[field],
                        id: { [Op.ne]: user.id }
                    }
                })

                if (existingUser)
                    return res.status(400).json({ message: "Username already used!" })
            }
        }

        await user.update(updates)

        return res.json({
            message: "Profile updated!",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                bio: user.bio
            }
        })
    }
    catch (error) {
        next(error)
    }
}

const getMe = async (req, res, next) => {

    //preluat de la middleware
    const user = req.user


    return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        bio: user.bio
    })
}


//rute ajutatoare pentru verificari
// get all users
// get user by username

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "phone", "bio"] //fara parola
    });
    return res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({
      where: { username },
      attributes: ["id", "username", "email", "phone", "bio"]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
};



module.exports = { createUser, searchUser, editUser, getMe , getAllUsers, getUserByUsername }
