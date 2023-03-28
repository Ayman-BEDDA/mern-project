const User = require('../models/user')
const errorResponse = require('../utils/errorResponse')


exports.signup = async (req, res, next)=>{
    const {email} = req.body;
    const userExist = await User.findOne({email})

    userExist && next(new errorResponse('Email is already taken', 400))

    try {
        const user = await User.create(req.body)
        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        next(new errorResponse(error, 400))
    }
}

exports.signin = async (req, res, next)=>{

    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }

        const user = await User.findOne({email})
        if (!user){
            next(new errorResponse('Invalid credentials', 400))
        }

        const isMatched = await user.comparePassword(password)
        if (!isMatched){
            next(new errorResponse('Invalid credentials', 400))

        }

        generateToken(user, 200, res)

    } catch (error) {
        next(new errorResponse('Cannot login, check your credentials', 400))
    }
}

const generateToken = async (user, statusCode, res) =>{
    const token = await user.jwtGenerateToken()

    const options = {
        httpOnly: true,
        expiresIn: new Date(Date.now() + process.env.EXPIRE_TOKEN )
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })
}

exports.logout = async (req, res, next) => {
    res.clearCookie('token')
    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
}

exports.singleUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
        res.status(200).json({
            success: true,
            user
        })
    } catch (error){
        next(new errorResponse(`User with this id: ${req.params.id} is not in db`, 404))
    }
}