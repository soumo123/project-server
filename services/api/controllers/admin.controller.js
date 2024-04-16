import User from '../models/user.model.js'
import Cart from '../models/cart.model.js'
import Admin from '../models/admin.model.js'
import Images from '../models/images.model.js'
import uploadFileToS3 from '../utils/fileUpload.js'
import { getNextSequentialId, checkPassword, getLastTypeId } from '../utils/helper.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Shops from '../models/shop.model.js'
import Settings from '../models/settings.model.js'







const signUp = async (req, res) => {
    let { name, email, password, mobile } = req.body;
    const file = req.file;
    try {
        if (!name || !email || !password || !mobile) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        console.log("name, email, password, mobile", name, email, password, mobile, file)
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

        const cart = await Cart.create({
            userId: lastId,
            type: 1,
            products: []
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
            image: user.image,
            mobile: user.mobile,

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
        const user = await User.findOne({ userId })

        if (!user) {
            return res.status(400).send({ message: "User Not Found", success: false })
        }
        return res.status(200).send({ message: "Get User", success: true, data: user })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}





//Get Dynamic Images //


const getAllImages = async (req, res) => {

    try {
        const type = Number(req.query.type);

        const images = await Images.find({ type: type })

        if (!images) {
            return res.status(404).send({ message: 'Not Found', success: false })
        }

        return res.status(200).send({ message: 'Get All Images', data: images })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}

//admin //

const getuserDetailsByAdmin = async (req, res) => {

    const type = Number(req.query.type)

    try {

        const users = await User.find({ type: type });

        if (users.length === 0) {
            return res.status(404).send({ message: 'Not User Found In This Platform', success: false, data: [] })
        }

        let result = users && users.map((ele) => ({
            userId: ele.userId,
            name: ele.name,
            created_at: ele.created_at
        }));

        return res.status(200).send({ message: 'Get all users by admin', success: true, data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const userSpecificDetails = async (req, res) => {

    const userId = req.query.userId;
    const type = Number(req.query.type);

    try {

        //get all add to cart products //

        const carts = await Cart.find({ type: type, userId: userId })

        let result1 = carts.products.length === 0 ? [] : carts.products.map((ele) => ({
            name: ele.name,
            description: ele.description,
            price: ele.price,
            count: ele.itemCount,
            totalPrice: ele.totalPrice,
            discount: ele.discount,
            thumbImage: ele.thumbImage
        }))

        //get all orders ///




        return res.status(200).send({
            message: 'Get All Data',
            carts: result1,
            orders: []
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}




//Master Dashboard Signup and Signin///

const registerAdmin = async (req, res) => {

    try {

        let { firstname, lastname, email, phone, address, password } = req.body

        const file = req.file;

        if (!firstname || !lastname || !email || !address || !password || !phone) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const emailData = await Admin.find({ email: email });
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
        const lastId = await getNextSequentialId("ADMIN")
        password = await bcrypt.hash(password, 10)

        const admin = await Admin.create({
            adminId: lastId, firstname, lastname, email, password, phone, address, image: s3Url
        })

        return res.status(200).json({ message: 'Owner Craeted Successfully', success: true });


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}



const signinAdmin = async (req, res) => {

    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).send({ message: "Email or Password is missing", success: false });
        }
        const user = await Admin.findOne({ email }).select('+password')

        if (!user) {
            return res.status(400).send({ message: "Invalid email or password", success: false })
        }
        const isPasswordMatch = await checkPassword(password, user.password);

        if (!isPasswordMatch) {
            return res.status(400).send({ message: "Invalid email Or password", success: false })
        }

        const jwtTokenObject = {
            _id: user._id,
            adminId: user.adminId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            image: user.image,
            phone: user.mobile,

        }

        const jwtToken = jwt.sign(jwtTokenObject, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRE
        })

        return res.status(200).send({
            success: true,
            message: "Owner Login Successfully",
            token: jwtToken,
            admin: jwtTokenObject
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}



const getAdmin = async (req, res) => {
    const adminId = req.query.adminId
    try {
        const user = await Admin.findOne({ adminId })

        if (!user) {
            return res.status(400).send({ message: "User Not Found", success: false })
        }
        return res.status(200).send({ message: "Get User", success: true, data: user })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const createShop = async (req, res) => {

    try {

        const { shop_name, adminId } = req.body;
        const file = req.file;

        if (!shop_name) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
        const lastId = await getNextSequentialId("SHOP")
        const lastType = await getLastTypeId()



        const result = await Shops.create({
            adminId: adminId, shop_id: lastId, shop_name, type: Number(lastType), logo: s3Url
        })

        const settings = await Settings.create({
            adminId: adminId,
            type: Number(lastType)
        })


        return res.status(200).json({ message: 'Shop Craeted Successfully', success: true });

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const getAllShopsForParticularOwner = async(req,res)=>{

    const adminId = req.query.adminId;

    try {

        if(!adminId){
            return res.status(400).send({
                message:"Admin Id Missing"
            })
        }
        
        const result = await Shops.find({ adminId: adminId});
        if(result.length===0){
            return res.status(400).send({
                message:"Shops Not Found"
            })
        }

        return res.status(200).send({
            message:"Get All Shops",
            success: true,
            data:result
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}




export { signUp, signIn, getUser, getAllImages, getuserDetailsByAdmin, userSpecificDetails, registerAdmin, signinAdmin, createShop, getAdmin,getAllShopsForParticularOwner }