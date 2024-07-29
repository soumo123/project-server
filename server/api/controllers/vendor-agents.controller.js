const Vendor = require('../models/vendor.model.js');
const Agent = require("../models/agent.model.js");
const Product = require("../models/product.model.js")
const Distribute = require('../models/distribute-order.model.js')
const uploadFileToS3 = require('../utils/fileUpload.js');
const { getNextSequentialId } = require('../utils/helper.js');




const addVendor = async (req, res) => {
    try {
        let { name, email, phone } = req.body;
        const shop_id = req.query.shop_id;
        const file = req.file;

        if (!name || !email || !phone) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const emailData = await Vendor.find({ email: email });
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
        const lastId = await getNextSequentialId("VEN")

        const vendor = await Vendor.create({
            vendorId: lastId, name, email, phone, image: s3Url, role: "2", shopId: shop_id
        })

        return res.status(201).send({ message: "Vendor Added", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const addAgent = async (req, res) => {
    try {
        let { name, email, phone, address } = req.body;
        const { shop_id, vendor_id } = req.query;
        const file = req.file;

        if (!name || !email || !phone || !address) {
            return res.status(400).send({
                message: 'Field is missing'
            });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const emailData = await Agent.find({ email: email });
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
        const lastId = await getNextSequentialId("AGENT")

        const agent = await Agent.create({
            agentId: lastId, name, email, phone, address, image: s3Url, shopId: shop_id, vendorId: vendor_id
        })
        console.log

        return res.status(201).send({ message: "Agent Added", success: true })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }


}


const getAllVendors = async (req, res) => {

    try {
        const shop_id = req.query.shop_id;
        const key = req.query.search;
        let queryFilter = undefined;

        if (!shop_id) {
            return res.status(400).send({ status: false, message: "Missing shop id" })
        }
        if (key) {
            queryFilter = { shopId: shop_id, name: { $regex: key, $options: 'i' } }
        } else {
            queryFilter = { shopId: shop_id }
        }
        console.log("queryFilter", queryFilter)
        let vendors = await Vendor.find(queryFilter).sort({ _id: -1 })

        vendors = vendors.map((ele) => {
            return {
                vendorId: ele.vendorId,
                vendor_name: ele.name,
                vendor_phone: ele.phone,
                vendor_image: ele.image
            }
        })


        if (vendors.length === 0) {
            return res.status(400).send({ message: "No Vendors Fouond", success: false, data: [] })
        }

        return res.status(200).send({ message: "Get All Vendors", success: true, data: vendors })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const getallAgents = async (req, res) => {

    try {
        const { shop_id, key } = req.query;
        let queryFilter = undefined;

        if (!shop_id) {
            return res.status(400).send({ status: false, message: "Missing shop id" })
        }
        if (key) {
            queryFilter = { shopId: shop_id, name: { $regex: key, $options: 'i' } }
        } else {
            queryFilter = { shopId: shop_id }
        }

        let agents = await Agent.find(queryFilter).sort({ _id: -1 })
        agents = agents.map((ele) => {
            return {
                vendorId: ele.vendorId,
                agentId: ele.agentId,
                agent_name: ele.name,
                agent_phone: ele.phone,
                agent_image: ele.image
            }
        })


        if (agents.length === 0) {
            return res.status(400).send({ message: "No Agents Fouond", success: false, data: [] })
        }

        return res.status(200).send({ message: "Get All Agents", success: true, data: agents })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const addInventory = async (req, res) => {

    try {
        const { adminId, vendorId, agentId, shop_id, type } = req.query
        const body = req.body;
        console.log("body", body)
        let totalPrice = 0
        let resultArray = [];
        let json = undefined;
        if (!body) {
            return res.status(400).send({ message: "Misiing fields", success: false })
        }

        const distributerName = await Agent.findOne({ agentId: agentId })
        let transctionId = await getNextSequentialId("TRANS")

        for (let ele of body) {
            let lastId = await getNextSequentialId("PD")

            json = {
                productId: lastId,
                shop_id: Number(shop_id),
                type: Number(type),
                name: ele.productName,
                description: "",
                other_description1: "",
                other_description2: "",
                weight: ele.weights,
                unit: ele.unit,
                // price: 0,
                purchase_price: "",
                delivery_partner: distributerName.name,
                selling_price_method: "",
                zomato_service: false,
                swiggy_service: false,
                zepto_service: false,
                blinkit_service: false,
                zomato_service_price: 0,
                swiggy_service_price: 0,
                zepto_service_price: 0,
                blinkit_service_price: 0,
                product_type: 2,
                tags: [],
                isBestSelling: false,
                isFeatured: false,
                isOffered: false,
                isTopSelling: false,
                isBranded: false,
                // discount: 0,
                // actualpricebydiscount: 0,
                ratings: 0,
                // stock: 0,
                color: "",
                searchstring: "",
                size: [],
                adminId: adminId,
                visiblefor: 0,
                thumbnailimage: "",
                otherimages: [],
                deliverydays: 0,
                likes: 0,
                numOfReviews: 0,
                whishListIds: [],
                reviews: [],
                active: 0
            }

            await Product.create(json)

            ele.weights.forEach((uu) => {
                totalPrice += uu.price * uu.stock
                resultArray.push({
                    productId: lastId,
                    quantity: Number(uu.stock),
                    weight: uu.weight,
                    price: Number(uu.price)
                })
            })
        }

        json = {
            transaction_id: transctionId,
            distributorId: agentId,
            vendorId: vendorId,
            distributorName: distributerName.name,
            shopOwnerId: shop_id,
            products: resultArray,
            totalAmount: totalPrice,
            pay: 0,
            balance: Number(totalPrice)
        }
        await Distribute.create(json)

        console.log("resultArray,resultArray", resultArray, totalPrice)
        return res.status(201).send({ message: "Order added", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });

    }

}


const getTransctions = async (req, res) => {
    try {
        const { shop_id, agentId } = req.query;
        if (!shop_id || !agentId) {
            return res.status(400).send({ message: "Missing fields", success: false });
        }

        // Fetch all transactions with only the required fields, sorted by order_date
        const transactions = await Distribute.find({ shopOwnerId: shop_id, distributorId: agentId })
            .select('_id transaction_id distributorId vendorId distributorName paid totalAmount pay balance order_date')
            .sort({ order_date: -1 });

        if (transactions.length === 0) {
            return res.status(404).send({ message: "No transactions found", success: false });
        }
        const [lastTransaction, ...remainingTransactions] = transactions;
        return res.status(200).send({
            message: "Get Transaction Details",
            data: {
                lastTransaction: lastTransaction || null,
                remainingTransactions: remainingTransactions
            }
        });

    } catch (error) {
        console.error(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
};



const updateMoney = async (req, res) => {

    try {
        const { shop_id, agentId, transaction_id, pay } = req.query;
        if (!shop_id || !agentId || !transaction_id) {
            return res.status(400).send({ message: "Missing fields", success: false });
        }
        let paid = false;

        const isValid = await Distribute.findOne({ shopOwnerId: shop_id, transaction_id: transaction_id, distributorId: agentId })

        let totalAmount = isValid.totalAmount;
        let currentPay = isValid.pay +  Number(pay)
        let balance = Number(totalAmount) - Number(currentPay)
        if(totalAmount===currentPay){
            paid = true
        }

        if (!isValid) {
            return res.status(400).send({ message: "Credentials Wrong" })
        }

        await Distribute.updateOne({ shopOwnerId: shop_id, transaction_id: transaction_id, distributorId: agentId }, {
            $set: {
                pay: Number(currentPay),
                balance:Number(balance),
                paid:paid
            },
            $push: {
                paymentInfo: {
                    pay: Number(pay),
                    date: new Date().toISOString() 
                }
            }
        })

        return res.status(201).send({message:"Transction Updated", succes:true})

    } catch (error) {
        console.error(error.stack);
        return res.status(500).send({ message: "Internal Server Error", success:false,error: error.stack });
    }
}


const updateStock = async (req, res) => {

    const { shop_id, type, agentId, adminId } = req.query;
    const { savedProducts, addedProducts } = req.body;
    let totalPrice = 0
    let resultArray = [];
    let addedArray = [];
    let json = undefined;



    try {
        if (!savedProducts) {
            return res.status(400).send({ message: "Misiing fields", success: false })
        }

        const distributerName = await Agent.findOne({ agentId: agentId })
        let transctionId = await getNextSequentialId("TRANS")

        if (addedProducts.length > 0) {
            for (let ele of addedProducts) {
                let lastId = await getNextSequentialId("PD")
                json = {
                    productId: lastId,
                    shop_id: Number(shop_id),
                    type: Number(type),
                    name: ele.productName,
                    description: "",
                    other_description1: "",
                    other_description2: "",
                    weight: ele.weights,
                    unit: ele.unit,
                    price: 0,
                    purchase_price: "",
                    delivery_partner: distributerName.name,
                    selling_price_method: "",
                    zomato_service: false,
                    swiggy_service: false,
                    zepto_service: false,
                    blinkit_service: false,
                    zomato_service_price: 0,
                    swiggy_service_price: 0,
                    zepto_service_price: 0,
                    blinkit_service_price: 0,
                    product_type: 2,
                    tags: [],
                    isBestSelling: false,
                    isFeatured: false,
                    isOffered: false,
                    isTopSelling: false,
                    isBranded: false,
                    discount: 0,
                    actualpricebydiscount: 0,
                    ratings: 0,
                    stock: 0,
                    color: "",
                    searchstring: "",
                    size: [],
                    adminId: adminId,
                    visiblefor: 0,
                    thumbnailimage: "",
                    otherimages: [],
                    deliverydays: 0,
                    likes: 0,
                    numOfReviews: 0,
                    whishListIds: [],
                    reviews: [],
                    active: 0
                }
                await Product.create(json)
                ele.weights.forEach((uu) => {
                    totalPrice += uu.price * uu.stock
                    addedArray.push({
                        productId: lastId,
                        quantity: Number(uu.stock),
                        weight: uu.weight,
                        price: Number(uu.price)
                    })
                })
            }

        }


        for (let ele of savedProducts) {
            let lastId = ele.productId;

            const update = await Product.updateOne({ productId: ele.productId, type: Number(type), adminId: adminId }, { $set: { weight: ele.weights } })


            ele.weights.forEach((uu) => {
                totalPrice += uu.price * uu.stock
                resultArray.push({
                    productId: lastId,
                    quantity: Number(uu.stock),
                    weight: uu.weight,
                    price: Number(uu.price)
                })
            })

        }

        let concatinateArray = resultArray.concat(addedArray)

        json = {
            transaction_id: transctionId,
            distributorId: agentId,
            vendorId: "",
            distributorName: distributerName.name,
            shopOwnerId: shop_id,
            products: concatinateArray,
            totalAmount: Number(totalPrice),
            pay: 0,
            balance: Number(totalPrice)

        }
        await Distribute.create(json)
        return res.status(201).send({ message: "added", success: true })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const viewTransaction = async (req, res) => {
    const { transaction_id, agentId, shop_id } = req.query;

    try {
        if (!shop_id || !agentId || !transaction_id) {
            return res.status(400).send({ message: "Missing fields", success: false });
        }

        // Find the transaction
        const result = await Distribute.findOne({
            transaction_id: transaction_id,
            distributorId: agentId,
            shopOwnerId: shop_id
        });

        if (!result) {
            return res.status(400).send({ message: "Credentials Wrong" });
        }

        // Fetch product details
        const productIds = [...new Set(result.products.map(p => p.productId))];
        const products = await Product.find({ productId: { $in: productIds } });

        // Create a map of productId to productName
        const productMap = products.reduce((acc, product) => {
            acc[product.productId] = product.name;
            acc["unit"] = product.unit;
            acc["thumbnailimage"] = product.thumbnailimage
            return acc;
        }, {});
        // Group products by productId and aggregate by weight
        const productsGroupedByProductId = result.products.reduce((acc, product) => {
            const existingProduct = acc.find(p => p.productId === product.productId);
            if (existingProduct) {
                existingProduct.weight.push({
                    quantity: Number(product.quantity),
                    weight: product.weight,
                    price: Number(product.price)
                });
            } else {
               
                acc.push({
                    productId: product.productId,
                    thumbImage:productMap.thumbnailimage || "",
                    unit: productMap.unit,
                    productName: productMap[product.productId] || 'Unknown',  // Include product name
                    weight: [{
                        quantity: Number(product.quantity),
                        weight: product.weight,
                        price: Number(product.price)
                    }]
                });
            }
            return acc;
        }, []);

        // Prepare the filtered result
        const filteredResult = {
            transaction_id: result.transaction_id,
            distributorId: result.distributorId,
            products: productsGroupedByProductId,
            paid: result.paid,
            totalAmount: result.totalAmount,
            pay: result.pay,
            balance: result.balance,
            paymentInfo: result.paymentInfo,
            order_date: result.order_date
        };

        return res.status(200).send({
            message: "Get Transactional Details",
            success: true,
            data: filteredResult
        });

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



module.exports = {
    addVendor,
    addAgent,
    getAllVendors,
    getallAgents,
    addInventory,
    getTransctions,
    updateStock,
    updateMoney,
    viewTransaction
}