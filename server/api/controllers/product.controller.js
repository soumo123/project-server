const Cart = require('../models/cart.model.js')
const Product = require('../models/product.model.js')
const Tags = require('../models/tags.model.js')
const Whishlists = require('../models/whishlist.model.js')
const uploadFileToS3 = require('../utils/fileUpload.js')
const { getNextSequentialId, checkPassword, getLastAndIncrementId } = require('../utils/helper.js')


const createProduct = async (req, res, next) => {

    let { name, description, other_description1, other_description2, weight, unit, type, price, stock, color, size, visiblefor, discount, deliverydays, tags, isBestSelling, isFeatured,
        isTopSelling, isBranded, isOffered, purchase_price, delivery_partner, selling_price_method, zomato_service, swiggy_service, zepto_service, blinkit_service,
        zomato_service_price, swiggy_service_price, zepto_service_price, blinkit_service_price, product_type
    } = req.body;
    const adminId = req.params.adminId
    let files = req.files;
    let newTag = []
    console.log("tags", tags)

    let thumbnailimage = "";
    let otherimages = []


    try {
        if (tags) {
            if (Array.isArray(tags)) {
                newTag = newTag.concat(tags.map(ele => Number(ele)));
            } else {
                newTag.push(Number(tags));
            }
            console.log("newTag", newTag);
        }
        console.log("newTag", newTag)

        if (!name || !description || !type || !stock) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (!req.files) {
            return res.status(400).json({ error: 'Files is not selected' });
        }

        const bucketName = process.env.S3_BUCKT_NAME;
        for (let i = 0; i < files.length; i++) {
            console.log("fileBuffer", files[i])
            const fileBuffer = files[i].buffer;
            const key = files[i].originalname;
            const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
            console.log("s3Urls3Url", s3Url)
            if (i === 0) {
                thumbnailimage = s3Url;
                otherimages.push(s3Url);
            } else {
                otherimages.push(s3Url);
            }
        }

        let productId = await getNextSequentialId("PD");
        console.log("productId", productId)
        let actualpricebydiscount = undefined;
        if (discount) {
            const discountData = Number(req.body.price) * discount / 100
            console.log("actualpricebydiscountwwwwwwwww", discountData)
            actualpricebydiscount = Number(req.body.price) - discountData
        }
        let searchString = name + description + Number(req.body.price)
        const product = await Product.create({
            adminId: adminId,
            productId: productId,
            type: Number(type),
            name: name,
            description: description,
            other_description1: other_description1,
            other_description2: other_description2,
            weight: JSON.parse(req.body.weight11),
            unit: unit,
            price: Number(price),
            discount: Number(discount),
            actualpricebydiscount: Number(actualpricebydiscount),
            stock: stock,
            color: color,
            size: JSON.parse(req.body.size1),
            purchase_price: purchase_price,
            delivery_partner: delivery_partner,
            selling_price_method: selling_price_method,
            zomato_service: zomato_service,
            swiggy_service: swiggy_service,
            zepto_service: zepto_service,
            blinkit_service: blinkit_service,
            zomato_service_price: Number(zomato_service_price),
            swiggy_service_price: Number(swiggy_service_price),
            zepto_service_price: Number(zepto_service_price),
            blinkit_service_price: Number(blinkit_service_price),
            product_type: Number(product_type),
            tags: newTag,
            visiblefor: visiblefor,
            thumbnailimage: thumbnailimage,
            otherimages: otherimages,
            searchstring: searchString,
            deliverydays: deliverydays,
            isBestSelling: Boolean(isBestSelling),
            isFeatured: Boolean(isFeatured),
            isTopSelling: Boolean(isTopSelling),
            isBranded: Boolean(isBranded),
            isOffered: Boolean(isOffered),
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

const updateProduct = async (req, res, next) => {

    let { name, description, other_description1, other_description2, weight, unit, type, price, stock, color, size, visiblefor, discount, deliverydays, tags, isBestSelling, isFeatured,
        isTopSelling, isBranded, isOffered, purchase_price, delivery_partner, selling_price_method, zomato_service, swiggy_service, zepto_service, blinkit_service,
        zomato_service_price, swiggy_service_price, zepto_service_price, blinkit_service_price, product_type
    } = req.body;
    console.log("isBestSelling, isFeatured, isTopSelling, isBranded, isOffered,", isBestSelling)
    const adminId = req.params.adminId
    const productId = req.query.productId
    let files = req.files;
    console.log("files", files)
    let newTag = []
    console.log("tags", tags)
    let actualpricebydiscount = undefined;
    let thumbnailimage = "";
    let otherimages = []
    console.log("req.body.price", req.body.price)
    try {
        if (tags) {
            if (Array.isArray(tags)) {
                newTag = newTag.concat(tags.map(ele => Number(ele)));
            } else {
                newTag.push(Number(tags));
            }
            console.log("newTag", newTag);
        }
        console.log("newTag", newTag)

        if (!name || !description || !type || !stock) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }
        if (discount) {
            const discountData = Number(req.body.price) * discount / 100
            console.log("actualpricebydiscountwwwwwwwww", discountData)
            actualpricebydiscount = Number(req.body.price) - discountData
        }
        let searchString = name + description + Number(req.body.price)
        if (files.length > 0) {
            console.log("comming 1")
            const bucketName = process.env.S3_BUCKT_NAME;
            for (let i = 0; i < files.length; i++) {
                console.log("fileBuffer", files[i])
                const fileBuffer = files[i].buffer;
                const key = files[i].originalname;
                const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);
                console.log("s3Urls3Url", s3Url)
                if (i === 0) {
                    thumbnailimage = s3Url;
                    otherimages.push(s3Url);
                } else {
                    otherimages.push(s3Url);
                }
            }

            let json = {
                adminId: adminId,
                productId: productId,
                type: Number(type),
                name: name,
                description: description,
                other_description1: other_description1,
                other_description2: other_description2,
                weight: JSON.parse(req.body.weight11),
                unit: unit,
                price: Number(price),
                discount: Number(discount),
                actualpricebydiscount: Number(actualpricebydiscount),
                stock: stock,
                color: color,
                size: JSON.parse(req.body.size1),
                purchase_price: purchase_price,
                delivery_partner: delivery_partner,
                selling_price_method: selling_price_method,
                zomato_service: zomato_service,
                swiggy_service: swiggy_service,
                zepto_service: zepto_service,
                blinkit_service: blinkit_service,
                zomato_service_price: Number(zomato_service_price),
                swiggy_service_price: Number(swiggy_service_price),
                zepto_service_price: Number(zepto_service_price),
                blinkit_service_price: Number(blinkit_service_price),
                product_type: Number(product_type),
                tags: newTag,
                visiblefor: visiblefor,
                thumbnailimage: thumbnailimage,
                otherimages: otherimages,
                searchstring: searchString,
                deliverydays: deliverydays,
                isBestSelling: Boolean(isBestSelling),
                isFeatured: Boolean(isFeatured),
                isTopSelling: Boolean(isTopSelling),
                isBranded: Boolean(isBranded),
                isOffered: Boolean(isOffered),
            }
            const product = await Product.updateOne({ productId: productId, type: Number(type), adminId: adminId }, { $set: json })

            const whishList = await Whishlists.updateMany({ productId: productId, type: Number(type) }, {
                $set: {
                    name: name,
                    description: description,
                    price: Number(actualpricebydiscount),
                    discount: Number(discount),
                    stock: Number(stock),
                    thumbnailimage: thumbnailimage
                }
            })

            const carts = await Cart.updateMany({ type: Number(type) },
                {
                    $set: {
                        "products.$[elem].name": name,
                        "products.$[elem].description": description,
                        "products.$[elem].price": Number(actualpricebydiscount),
                        "products.$[elem].totalPrice": Number(actualpricebydiscount),
                        "products.$[elem].discount": Number(discount)
                    },

                },
                {
                    arrayFilters: [{ "elem.productId": productId }]
                }

            )

        } else {
            console.log("comming 2", isBestSelling)
            const product = await Product.updateOne({ productId: productId, type: Number(type), adminId: adminId }, {
                $set: {
                    adminId: adminId,
                    productId: productId,
                    type: Number(type),
                    name: name,
                    description: description,
                    other_description1: other_description1,
                    other_description2: other_description2,
                    weight: JSON.parse(req.body.weight11),
                    unit: unit,
                    price: Number(price),
                    discount: Number(discount),
                    actualpricebydiscount: Number(actualpricebydiscount),
                    stock: stock,
                    color: color,
                    size: JSON.parse(req.body.size1),
                    purchase_price: purchase_price,
                    delivery_partner: delivery_partner,
                    selling_price_method: selling_price_method,
                    zomato_service: zomato_service,
                    swiggy_service: swiggy_service,
                    zepto_service: zepto_service,
                    blinkit_service: blinkit_service,
                    zomato_service_price: Number(zomato_service_price),
                    swiggy_service_price: Number(swiggy_service_price),
                    zepto_service_price: Number(zepto_service_price),
                    blinkit_service_price: Number(blinkit_service_price),
                    product_type: Number(product_type),
                    tags: newTag,
                    visiblefor: visiblefor,
                    searchstring: searchString,
                    deliverydays: deliverydays,
                    isBestSelling: isBestSelling,
                    isFeatured: isFeatured,
                    isTopSelling: isTopSelling,
                    isBranded: isBranded,
                    isOffered: isOffered,
                }
            })


            const whishList = await Whishlists.updateMany({ productId: productId, type: Number(type) }, {
                $set: {
                    name: name,
                    description: description,
                    price: Number(actualpricebydiscount),
                    discount: Number(discount),
                    stock: Number(stock)

                }
            })

            const carts = await Cart.updateMany({ type: Number(type) },
                {
                    $set: {
                        "products.$[elem].name": name,
                        "products.$[elem].description": description,
                        "products.$[elem].price": Number(actualpricebydiscount),
                        "products.$[elem].totalPrice": Number(actualpricebydiscount),
                        "products.$[elem].discount": Number(discount)
                    },

                },
                {
                    arrayFilters: [{ "elem.productId": productId }]
                }

            )
        }





        return res.status(201).send({
            message: "Product Updated",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}

const avaliabilityCheck = async (req, res) => {

    let productId = req.query.productId;
    let type = Number(req.query.type);
    let adminId = req.query.adminId;
    let active = Number(req.query.active);

    try {

        if (active == undefined || active === null) {
            return res.status(400).send({ message: "Active not send" })
        }

        const products = await Product.updateMany({ adminId: adminId, productId: productId, type: type }, { $set: { active: active } })

        const cart = await Cart.updateOne({ type: 1 },
            {
                $pull: {
                    "products": { "productId": productId } // Remove the element with productId equal to "PD000009"
                }
            }

        )
        const whishlist = await Whishlists.deleteMany({ type: type, productId: productId })

        return res.status(200).send({
            success: true,
            message: "Status Update"
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
    const sort = Number(req.query.sort)

    let query;
    try {

        const latest = new Date();
        latest.setDate(latest.getDate() - 4);




        if (tags.length > 0) {
            tags = tags.split(",").map(item => Number(item));
        }

        if (tags.length > 0) {
            query = { type: type, active: 1, selling_price_method: "offline", tags: { $in: tags }, price: { $gte: startPrice, $lte: lastPrice } };
        } else {
            query = { type: type, active: 1, selling_price_method: "offline", price: { $gte: startPrice, $lte: lastPrice } };
        }
        if (!type) {
            return res.status(200).send({
                message: 'Type not match , Not Getting Products',
            })
        }

        if (searchData) {
            query = { ...query, price: { $gte: startPrice, $lte: lastPrice }, searchstring: { $regex: searchData, $options: 'i' } }; // Case-insensitive search by name
        }

        if (sort === 1) {
            query = { ...query, created_at: { $gte: latest } }
        } else if (sort === 2) {
            query = { ...query, isBestSelling: true }
        } else if (sort === 3) {
            query = { ...query, isTopSelling: true }
        }



        const allData = await Product.find(query).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);


        const featuredData = await Product.find({ active: 1, selling_price_method: "offline", isFeatured: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const bestSellingData = await Product.find({ active: 1, selling_price_method: "offline", isBestSelling: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const brandedData = await Product.find({ active: 1, selling_price_method: "offline", isBranded: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const topSellingData = await Product.find({ active: 1, selling_price_method: "offline", isTopSelling: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const dealsData = await Product.find({ active: 1, selling_price_method: "offline", isOffered: true }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);

        const latestProducts = await Product.find({ active: 1, selling_price_method: "offline", created_at: { $gte: latest } }).sort({ _id: -1 })
            .skip(offset)
            .limit(limit);


        const totalProducts = await Product.find({ active: 1, selling_price_method: "offline" })

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

const getProductById = async (req, res) => {

    const productId = req.query.productId;
    const type = Number(req.query.type);
    const adminId = req.query.adminId;
    let query = undefined;

    try {

        if (!productId || !type) {
            return res.status(400).send({
                success: false,
                message: "Fields are missing"
            })
        }

        if (adminId) {
            query = { type: type, adminId: adminId, productId: productId }
        } else {
            query = { type: type, productId: productId }
        }

        const products = await Product.find(query)
        if (products.length === 0) {
            return res.status(400).send({
                success: false,
                message: "No Product Found"
            })
        }

        return res.status(200).send({
            message: "Get Products by Id",
            success: true,
            data: products
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
    const file = req.file;

    try {

        if (!name) {
            return res.status(400).send({ message: "Name is missing" })
        }
        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        // Access the buffer property of req.file
        const fileBuffer = file.buffer;
        const bucketName = process.env.S3_BUCKT_NAME;
        const key = file.originalname;

        // Upload the file to S3
        const s3Url = await uploadFileToS3(bucketName, key, fileBuffer);


        const tagId = await getLastAndIncrementId()
        console.log("tagId", tagId)
        const tags = Tags.create({
            tag_id: Number(tagId),
            userId: adminId,
            tag_name: name,
            type: Number(type),
            thumbnailimage: s3Url
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


const deleteTags = async (req, res) => {

    const tagsId = Number(req.query.tagId);
    const type = Number(req.query.type);
    const adminId = req.params.adminId


    try {

        if (!tagsId) {
            return res.status(400).send({
                message: "Tag id is missing",
                success: false
            })
        }

        const response = await Tags.deleteOne({ type: type, userId: adminId, tag_id: tagsId })

        console.log("responseresponse", response)


        return res.status(200).send({
            message: "Tag deleted successfully",
            success: true
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const getAllTags = async (req, res) => {

    const type = Number(req.query.type);
    const adminId = req.query.userId;
    let tags = undefined
    try {

        if (!adminId) {
            tags = await Tags.find({ type: type })
        } else {
            tags = await Tags.find({ type: type, userId: adminId })
        }

        let result = tags.map((ele) => ({
            label: ele.tag_name,
            value: ele.tag_id,
            thumbnailImage: ele.thumbnailimage,
            topCategory: ele.topCategory
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
    const type = Number(req.query.type);

    try {
        const { name, description, price, itemCount, discount, weight, color, thumbImage, totalPrice } = req.body;

        const user = await Cart.findOne({ userId: userId });

        if (!user) {
            return res.status(400).send({ message: "User Not Found In cart", success: false });
        }
        console.log("type userId productId color weight ", type,
            userId,
            productId,
            color,
            weight)
        const carts = await Cart.findOne({ type: type, userId: userId }, { products: { $elemMatch: { productId: productId, color: color, weight: weight } } })

        console.log("carts", carts)


        // if (carts.products.length === 0) {
        //     const addData = await Cart.updateOne({ type: type, userId: userId }, {
        //         $push: {
        //             productId: productId,
        //             name: name,
        //             description: description,
        //             weight: weight,
        //             color:color,
        //             price: Number(price),
        //             itemCount: Number(itemCount),
        //             discount: Number(discount),
        //             totalPrice: Number(totalPrice),
        //             thumbImage: thumbImage
        //         }
        //     })
        // }else{
        //     const addData = await Cart.updateOne({type:type,userId:userId,"products.productId":productId,"products.weight":weight,"products.color":color},{
        //         $set:{
        //             "products.$.name": name,
        //             "products.$.description": description,
        //             "products.$.price": Number(price),
        //             "products.$.weight": weight,
        //             "products.$.totalPrice": totalPrice,
        //             "products.$.discount": discount,
        //             "products.$.thumbImage": thumbImage
        //         }
        //     })
        // }

        let productIndex = -1;

        // Check if the product already exists in the cart
        user.products.forEach((product, index) => {
            if (product.productId === productId && product.weight===weight && product.color===color) {
                productIndex = index;
            }
        });

        if (productIndex === -1) {
            console.log("comming 1")
            // Product not found in cart, so add it
            user.products.push({
                productId: productId,
                name: name,
                weight: weight,
                description: description,
                color:color,
                price: Number(price),
                itemCount: Number(itemCount),
                discount: Number(discount),
                totalPrice: Number(totalPrice),
                thumbImage: thumbImage
            });
        } else {
            console.log("comming 2")

            // Product found in cart, so update it
            user.products[productIndex] = {
                productId: productId,
                name: name,
                description: description,
                weight: weight,
                color:color,
                price: Number(price),
                itemCount: carts.products[0].itemCount + Number(itemCount),
                discount: Number(discount),
                totalPrice: Number(price) * (carts.products[0].itemCount + Number(itemCount)),
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



        if (user === null || user.products.length === 0) {
            return res.status(400).send({ message: "No products in cart", success: false });
        }
        let totalPrice = 0;
        user.products.map((ele) => {
            totalPrice = totalPrice + ele.totalPrice
        })


        return res.status(200).send({ message: "All cart items", data: user.products, totalPrice })

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
        const data = await Cart.findOne({ userId: userId, type: type });

        if (data.products.length === 0) {
            return res.status(400).send({ message: "No Product Found" })
        }

        let unmatchedProducts = data.products.filter(product => !productId.includes(product.productId));

        await Cart.updateOne({ userId: userId }, { $set: { products: unmatchedProducts } });

        return res.status(200).send({ message: "Cart Item deleted successfully", success: true })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const deleteSpecificItemFromCart = async (req, res) => {
    const userId = req.query.userId;
    const productId = req.query.productId;
    const type = Number(req.query.type)

    try {
        const data = await Cart.findOne({ userId: userId, type: type });



        if (data.products.length === 0) {
            return res.status(400).send({ message: "No Product Found" })
        }

        const updateProducts = data.products.filter(ele => ele.productId !== productId);

        await Cart.updateOne({ userId: data.userId, type: type }, { $set: { products: updateProducts } });

        return res.status(200).send({ message: "Item Deleted Successfully" })

    } catch (error) {
        return res.status(400).send(error.stack)

    }
}

//get all products of admin //

const adminProducts = async (req, res) => {

    const adminId = req.query.adminId;
    const type = Number(req.query.type);
    const keyword = req.query.keyword;
    const startPrice = Number(req.query.startprice);
    const lastPrice = Number(req.query.lastprice);
    console.log("startPrice , lastPrice", startPrice, lastPrice)
    try {
        let query = { adminId: adminId, type: type }
        if (!keyword && !startPrice && !lastPrice) {
            // 1. If no keyword and no startprice and lastprice, then get all products
            query = query
        } else if (keyword && !startPrice && !lastPrice) {
            // 2. If keyword present but startprice and last price missing, then get all products by matching keyword
            query = { ...query, searchstring: { $regex: keyword, $options: 'i' } };

        } else if (keyword && startPrice && lastPrice) {
            // 3. If keyword present and also startprice and last price present, then get all products by matching keyword and price
            query = {
                ...query,
                searchstring: { $regex: keyword, $options: 'i' },
                price: { $gte: startPrice, $lte: lastPrice }
            };
            console.log("Getting products by keyword and price...");
        } else if (!keyword && startPrice && lastPrice) {
            // 4. If keyword not present but startprice and last price present, then get all products by matching price
            query = {
                ...query,
                price: { $gte: startPrice, $lte: lastPrice }
            };
            console.log("Getting products by price...");
        } else if (startPrice && !lastPrice) {
            // 5. If only startprice present, then get all products with price greater than or equal to startprice
            query = {
                ...query,
                price: { $gte: startPrice }
            };
            console.log("Getting products with price greater than or equal to start price...");
        } else if (!startPrice && lastPrice) {
            // 6. If only lastprice present, then get all products with price less than or equal to lastprice
            query = {
                ...query,
                price: { $lte: lastPrice }
            };
            console.log("Getting products with price less than or equal to last price...");
        } else {
            return res.status(400).send({ message: "Invalid combination of parameters." });
        }

        const products = await Product.find(query).sort({ _id: -1 });

        if (products.length === 0) {
            return res.status(404).send({ message: "Get All Products", data: [] })
        }

        return res.status(200).send({ message: "Get All Products", data: products })


    } catch (error) {
        console.log(error.stack)
        return res.status(400).send(error.stack)
    }

}

//Delete Product By Admin ///


const deleteProductByAdmin = async (req, res) => {

    const adminId = req.query.adminId;
    const type = Number(req.query.type);
    const productId = req.query.productId


    try {
        const products = await Product.deleteOne({ adminId: adminId, type: type, productId: productId })
        const cart = await Cart.updateOne({ type: 1 },
            {
                $pull: {
                    "products": { "productId": productId } // Remove the element with productId equal to "PD000009"
                }
            }

        )
        const whishlist = await Whishlists.deleteMany({ type: type, productId: productId })

        return res.status(200).send({ message: "Product Deleted Successfully", success: true })

    } catch (error) {
        return res.status(400).send(error.stack)
    }
}


const editTag = async (req, res) => {
    const adminId = req.params.adminId;
    const tagId = Number(req.params.tag_id)
    const { name, type } = req.body
    const file = req.file;
    let s3Url = undefined;
    try {
        if (!tagId) {
            return res.status(400).send({ message: "Tag id is missing", success: false })
        }

        if (file) {
            // Access the buffer property of req.file
            const fileBuffer = file.buffer;
            const bucketName = process.env.S3_BUCKT_NAME;
            const key = file.originalname;
            s3Url = await uploadFileToS3(bucketName, key, fileBuffer);

            const response = await Tags.updateOne({ userId: adminId, type: type, tag_id: tagId }, { $set: { tag_name: name, thumbnailimage: s3Url } });
        } else {
            const response = await Tags.updateOne({ userId: adminId, type: type, tag_id: tagId }, { $set: { tag_name: name } });

        }


        // Upload the file to S3





        return res.status(201).send({ message: "Tag updated", success: true })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const addWhishList = async (req, res) => {

    try {
        const whish = req.query.status;
        const userId = req.query.userId;
        const type = Number(req.query.type)
        const prouctId = req.query.productId

        const { name, description, price, discount, stock, ratings, thumbnailimage, numOfReviews, totalPrice } = req.body;

        const whislistData = await Whishlists.findOne({ type: type, userId: userId, productId: prouctId })
        console.log("whislistData", whislistData)

        console.log("whish", whish, typeof (whish))
        if (whish === true || whish === "true") {
            if (whislistData) {
                const result = await Whishlists.updateOne({ userId: userId, productId: prouctId, type: type }, { $set: { likes: true } })
                await Product.updateOne({ type: type, productId: prouctId }, { $push: { whishListIds: userId } })
            } else {
                const result = await Whishlists.create({
                    productId: prouctId,
                    type: type,
                    userId: userId,
                    likes: true,
                    name: name,
                    description: description,
                    price: price,
                    discount: discount,
                    stock: stock,
                    numOfReviews: numOfReviews,
                    ratings: ratings,
                    thumbnailimage: thumbnailimage
                })

                await Product.updateOne({ type: type, productId: prouctId }, { $push: { whishListIds: userId } })
            }


        } else {
            let body = {
                productId: prouctId,
                type: type,
                userId: userId,
                likes: false,
                name: name,
                description: description,
                price: price,
                discount: discount,
                numOfReviews: numOfReviews,
                stock: stock,
                ratings: ratings,
                thumbnailimage: thumbnailimage
            }
            const result = await Whishlists.updateOne({ userId: userId, productId: prouctId, type: type }, { $set: body })

            await Product.updateOne({ tyoe: type, productId: prouctId }, { $pull: { whishListIds: userId } })
        }

        return res.status(200).send({ message: "Whislist Updated" })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const getWhishListProducts = async (req, res) => {

    const userId = req.query.userId;
    const type = Number(req.query.type);


    try {

        const result = await Whishlists.find({ userId: userId, type: type, likes: true });
        if (result.length === 0) {
            return res.status(404).send({ message: "No whishlist product found", data: [] })
        }

        return res.status(200).send({ message: "All Whishlist Products", data: result })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const countUpdate = async (req, res) => {
    try {
        let userId = req.query.userId;
        let productId = req.query.productId;
        let type = Number(req.query.type);
        let count = Number(req.query.count);
        let totalPrice = Number(req.body.totalPrice)
        let weight = req.body.weight
        let color = req.body.color
        // Assuming Product is your Mongoose model



        const response = await Cart.updateOne(
            {
                userId: userId,
                type: type,
                "products.productId": productId,
                "products.color":color,
                "products.weight":weight
            },
            {
                $set: {
                    "products.$.itemCount": count,
                    "products.$.totalPrice": totalPrice
                }
            }
        );


        if (response.modifiedCount === 1) {
            return res.status(200).send({ message: "Count Updated", success: true });
        } else {
            return res.status(404).send({ message: "Product not found or count not updated", success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }
};

const updateCategoryStatus = async (req, res) => {

    let userId = req.query.userId;
    let type = Number(req.query.type);
    let status = Number(req.query.status)
    let tag_id = Number(req.query.tag_id)

    try {
        console.log("userId , type  ,  status", userId, type, status)
        const response = await Tags.updateOne({ tag_id: tag_id, userId: userId, type: type }, { $set: { topCategory: status } })


        return res.status(200).send({ message: "Status Updated", success: true });


    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error", error: error.message });
    }


}


module.exports = {
    createProduct,
    updateProduct,
    avaliabilityCheck,
    getAllProducts,
    getProductById,
    createTags,
    getAllTags,
    getTotalRatings,
    addToCart,
    getAllCartProducts,
    deleteCartItems,
    deleteSpecificItemFromCart,
    adminProducts,
    deleteProductByAdmin,
    deleteTags,
    editTag,
    addWhishList,
    getWhishListProducts,
    countUpdate,
    updateCategoryStatus
} 