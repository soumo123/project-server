import Cart from '../models/cart.model.js'
import Product from '../models/product.model.js'
import Tags from '../models/tags.model.js'
import uploadFileToS3 from '../utils/fileUpload.js'
import { getNextSequentialId, checkPassword, getLastAndIncrementId } from '../utils/helper.js'


const createProduct = async (req, res) => {

    let { name, description, type, price, stock, color, size, visiblefor, discount, deliverydays, tags, isBestSelling, isFeatured,
        isTopSelling, isBranded, isOffered
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
        console.log("productId", productId)
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
            tags: tags,
            visiblefor: visiblefor,
            thumbnailimage: thumbnailimage,
            otherimages: otherimages,
            searchstring: searchString,
            deliverydays: deliverydays,
            isBestSelling: Boolean(isBestSelling),
            isFeatured: Boolean(isFeatured),
            isTopSelling: Boolean(isTopSelling),
            isBranded: Boolean(isBranded),
            isOffered: Boolean(isOffered)
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


const getAllProducts = async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const type = Number(req.query.type);
    const searchData = req.query.key;
    let tags = req.query.tags;
    const ratings = Number(req.query.ratings)
    const startPrice = Number(req.query.startprice);
    const lastPrice = Number(req.query.lastprice);


    let query;
    try {

        const latest = new Date();
        latest.setDate(latest.getDate() - 4);

        if (tags.length > 0) {
            tags = tags.split(",").map(item => Number(item));
        }

        if (tags.length > 0) {
            query = { type: type, tags: { $in: tags }, price: { $gte: startPrice, $lte: lastPrice } };
        } else {
            query = { type: type, price: { $gte: startPrice, $lte: lastPrice } };
        }
        if (!type) {
            return res.status(200).send({
                message: 'Type not match , Not Getting Products',
            })
        }

        if (searchData) {
            query = { ...query, price: { $gte: startPrice, $lte: lastPrice }, searchstring: { $regex: searchData, $options: 'i' } }; // Case-insensitive search by name
        }

        console.log("query", query)

        const allData = await Product.find(query)
            .skip(offset)
            .limit(limit);

        const featuredData = await Product.find({ isFeatured: true })
            .skip(offset)
            .limit(limit);

        const bestSellingData = await Product.find({ isBestSelling: true })
            .skip(offset)
            .limit(limit);

        const brandedData = await Product.find({ isBranded: true })
            .skip(offset)
            .limit(limit);

        const topSellingData = await Product.find({ isTopSelling: true })
            .skip(offset)
            .limit(limit);

        const dealsData = await Product.find({ isOffered: true })
            .skip(offset)
            .limit(limit);

        const latestProducts = await Product.find({ created_at: { $gte: latest } })
            .skip(offset)
            .limit(limit);


        const totalProducts = await Product.find()

        return res.status(200).send({
            message: "Get All Products",
            totalData: totalProducts.length,
            allData: allData,
            featuredData: featuredData,
            bestSellingData: bestSellingData,
            brandedData: brandedData,
            topSellingData: topSellingData,
            dealsData: dealsData,
            latestProducts: latestProducts
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const getTotalRatings = async (eeq, res) => {

    try {

        const fivestar = await Product.find({ type: 1, ratings: 5 }).count();
        const fourtar = await Product.find({ type: 1, ratings: 4 }).count();
        const threestar = await Product.find({ type: 1, ratings: 3 }).count();
        const twostar = await Product.find({ type: 1, ratings: 2 }).count();

        return res.status(200).send({
            message: "Get All Ratings",
            fivestar: fivestar,
            fourtar: fourtar,
            threestar: threestar,
            twostar: twostar
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const createTags = async (req, res) => {

    const adminId = req.params.adminId
    const { name, type } = req.body

    try {

        if (!name) {
            return res.status(400).send({ message: "Name is missing" })
        }


        const tagId = await getLastAndIncrementId()
        console.log("tagId", tagId)
        const tags = Tags.create({
            tag_id: Number(tagId),
            userId: adminId,
            tag_name: name,
            type: Number(type)
        })

        return res.status(201).send({
            message: "Tags Created",
            success: true
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const getAllTags = async (req, res) => {

    const type = req.query.type;

    try {

        const tags = await Tags.find({ type: type })

        let result = tags.map((ele) => ({
            label: ele.tag_name,
            value: ele.tag_id
        }));


        return res.status(200).send({ message: "Get all tags", data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const addToCart = async (req, res) => {
    const userId = req.query.userId;
    const productId = req.query.productId;
    const type = req.query.type;

    try {
        const { name, description, price, itemCount, discount, thumbImage ,totalPrice} = req.body;

        const user = await Cart.findOne({ userId: userId });

        if (!user) {
            return res.status(400).send({ message: "User Not Found In cart", success: false });
        }

        const carts = await Cart.findOne({type:type,userId:userId},{products:{$elemMatch:{productId:productId}}})
        if(carts.products.length>0){
            return res.status(400).send({ message: "Product Already in cart", success: false });
        }

        let productIndex = -1;

        // Check if the product already exists in the cart
        user.products.forEach((product, index) => {
            if (product.productId === productId) {
                productIndex = index;
            }
        });

        if (productIndex === -1) {
            // Product not found in cart, so add it
            user.products.push({
                productId: productId,
                name: name,
                description: description,
                price: Number(price),
                itemCount: Number(itemCount),
                discount: Number(discount),
                totalPrice: Number(totalPrice),
                thumbImage: thumbImage,
            });
        } else {
            // Product found in cart, so update it
            user.products[productIndex] = {
                productId: productId,
                name: name,
                description: description,
                price: Number(price),
                itemCount: Number(itemCount),
                discount: Number(discount),
                totalPrice: Number(totalPrice),
                thumbImage: thumbImage

            };
        }

        // Save the updated cart
        await user.save();

        return res.status(200).send({ message: "Cart Updated" });
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};

const getAllCartProducts = async (req, res) => {

    const userId = req.query.userId;
    const type = Number(req.query.type)

    try {

        if (!userId) {
            return res.status(400).send({ message: "UserId Not Get", success: false }); C
        }

        const user = await Cart.findOne({ type: type, userId: userId });

        console.log("useruser", user)

        if (user === null || user.products.length === 0) {
            return res.status(400).send({ message: "No products in cart", success: false });
        }
        let totalPrice = 0;
        user.products.map((ele)=>{
            totalPrice = totalPrice + ele.totalPrice
        })


        return res.status(200).send({ message: "All cart items", data: user.products,totalPrice })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const deleteCartItems = async (req, res) => {
    const userId = req.query.userId;
    const type = Number(req.query.type)
    const productId = req.body.productId;

    try {
        const data  = await Cart.findOne({ userId:userId,type:type});

        if(data.products.length===0){
            return res.status(400).send({message:"No Product Found"})
        }

        let unmatchedProducts = data.products.filter(product => !productId.includes(product.productId));

        await Cart.updateOne({ userId: userId }, { $set: { products: unmatchedProducts } });

        return res.status(200).send({ message: "Cart Item deleted successfully" ,success:true})


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


export {
    createProduct,
    getAllProducts,
    createTags,
    getAllTags,
    getTotalRatings,
    addToCart,
    getAllCartProducts,
    deleteCartItems
}