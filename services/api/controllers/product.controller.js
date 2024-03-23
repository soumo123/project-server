import Product from '../models/product.model.js'
import Tags from '../models/tags.model.js'
import uploadFileToS3 from '../utils/fileUpload.js'
import { getNextSequentialId, checkPassword , getLastAndIncrementId } from '../utils/helper.js'


const createProduct = async (req, res) => {

    let { name, description, type, price, stock, color, size, visiblefor, discount, deliverydays,tags,isBestSelling,isFeatured,
        isTopSelling,isBranded
    } = req.body;
    const adminId = req.params.adminId
    const files = req.files;
    let thumbnailimage = "";
    let otherimages = []

    try {
      
        tags = tags.split(",").map(item => Number(item));
        if (!name || !description || !type || !price || !stock) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.files) {
            return res.status(400).json({ error: 'Files is not selected' });
        }

        const bucketName = process.env.S3_BUCKT_NAME;
        for (let i = 0; i < files.length; i++) {
            const fileBuffer = files[i].buffer;
            const key = files[i].originalname;
            const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
            if (i === 0) {
                thumbnailimage = s3Url;
            } else {
                otherimages.push(s3Url);
            }
        }

        let productId = await getNextSequentialId("PD");
        console.log("productId",productId)
        let actualpricebydiscount;
        if (discount) {
            const discountData = req.body.price * discount / 100
            actualpricebydiscount = req.body.price - discountData
        }
        let searchString = name + description + price
        const product = await Product.create({
            adminId: adminId,
            productId: productId,
            type: Number(type),
            name: name,
            description: description,
            price: Number(price),
            discount: Number(discount),
            actualpricebydiscount: Number(actualpricebydiscount),
            stock: stock,
            color: color,
            size: size,
            tags:tags,
            visiblefor: visiblefor,
            thumbnailimage: thumbnailimage,
            otherimages: otherimages,
            searchstring: searchString,
            deliverydays: deliverydays,
            isBestSelling:Boolean(isBestSelling),
            isFeatured:Boolean(isFeatured),
            isTopSelling:Boolean(isTopSelling),
            isBranded:Boolean(isBranded)

        })

        return res.status(201).send({
            message: "Product Created",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getAllProducts = async (req,res) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const type = Number(req.query.type);
    const searchData = req.query.key;
    let tags = req.query.tags;
    let isBestSelling = Boolean(req.query.isBestSelling);
    let isFeatured = Boolean(req.query.isFeatured);
    let isTopSelling = Boolean(req.query.isTopSelling);
    let isBranded = Boolean(req.query.isBranded);
    const startPrice = Number(req.query.startprice);
    const lastPrice = Number(req.query.lastprice);

    let query;
    try {
       
        if(tags.length>0){
            tags = tags.split(",").map(item => Number(item));
        }

        if(tags.length>0){
           
            query = { type: type , tags:{$in:tags} , price: { $gte: startPrice , $lte: lastPrice }};
        }else{
            query = { type: type , price: { $gte: startPrice, $lte: lastPrice }, isBestSelling:isBestSelling , isFeatured:isFeatured,isTopSelling:isTopSelling,isBranded:isBranded};

        }
        if (!type) {
            return res.status(200).send({
                message: 'Type not match , Not Getting Products',
            })
        }
        

        if (searchData) {
            query = { ...query, price: { $gte: startPrice, $lte: lastPrice } , searchstring: { $regex: searchData, $options: 'i' } }; // Case-insensitive search by name
        }
       
        console.log("query",query)

        const products = await Product.find(query)
            .skip(offset)
            .limit(limit);

        const totalProducts = await Product.find()

        return res.status(200).send({
            message: "Get All Products",
            totalData: totalProducts.length,
            data: products
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}



const createTags = async(req,res)=>{

    const adminId = req.params.adminId
    const {name,type}  = req.body

    try {
        
        if(!name){
            return res.status(400).send({message:"Name is missing"})
        }


        const tagId = await getLastAndIncrementId()
        console.log("tagId",tagId)
        const tags  = Tags.create({
            tag_id:Number(tagId),
            userId:adminId,
            tag_name:name,
            type:Number(type)
        })

        return res.status(201).send({
            message:"Tags Created",
            success:true
        })

        
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const getAllTags = async(req,res)=>{

    const type=req.query.type;

    try {

        const tags = await Tags.find({type:type})
        
        let result = tags.map((ele) => ({
            label: ele.tag_name,
            value: ele.tag_id
        }));


        return res.status(200).send({ message: "Get all tags", data:result})
        
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}



export {
    createProduct,
    getAllProducts,
    createTags,
    getAllTags
}