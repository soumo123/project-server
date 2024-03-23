import User from '../models/user.model.js'
import uploadFileToS3 from '../utils/fileUpload.js'
import { getNextSequentialId, checkPassword } from '../utils/helper.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'





const signUp = async (req, res) => {
    let { name, email, password, mobile } = req.body;
    const file = req.file;
    try {
        if (!name || !email || !password || !mobile) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const emailData = await User.find({ email: email });
        if (emailData.length > 0) {
            return res.status(400).send({
                message: 'Email already present'
            });
        }

        // Access the buffer property of req.file
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
        const lastId = await getNextSequentialId("AKCUS")
        password = await bcrypt.hash(password, 10)



        const user = await User.create({
            userId: lastId, name, email, password, mobile, image: s3Url
        })

        return res.status(200).json({ message: 'User Craeted', success: true });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const signIn = async (req, res) => {

    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).send({ message: "Email or Password is missing", success: false });
        }
        const user = await User.findOne({ email }).select('+password')

        if (!user) {
            return res.status(400).send({ message: "Invalid email or password", success: false })
        }
        console.log("user", user)
        const isPasswordMatch = await checkPassword(password, user.password);
        console.log(isPasswordMatch);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid email Or password", success: false })
        }

        const jwtTokenObject = {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            image:user.image,
            mobile:user.mobile,

        }

        const jwtToken = jwt.sign(jwtTokenObject, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        })

        return res.status(200).send({
            success: true,
            message: "User Login Successfully",
            token: jwtToken,
            user: jwtTokenObject
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getUser = async (req, res) => {
    const userId = req.query.userId
    try {
        const user = await User.findOne({userId})

        if(!user){
            return res.status(400).send({ message: "User Not Found",success:false})
        }
        return res.status(200).send({ message: "Get User",success:true,data:user})

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}







export { signUp, signIn,getUser }