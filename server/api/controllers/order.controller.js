const Order = require('../models/order.model.js');
const Cart = require("../models/cart.model.js")
const { getNextSequentialId } = require('../utils/helper.js');


const createOrder = async (req, res) => {

    try {

        const { receivedData, shippingPrice, tax, initialDeposit, orderedPrice } = req.body
        const { userId, type, shop_id } = req.query
        let orderId = await getNextSequentialId("ORDER");

        const order = await Order.create({
            orderId: orderId,
            userId,
            shopId: shop_id,
            type,
            products: receivedData,
            shippingPrice: Number(shippingPrice),
            tax: tax,
            initialDeposit: initialDeposit,
            orderedPrice: orderedPrice

        })

        const removeCart = await Cart.updateOne({ userId: userId }, { $set: { products: [] } })

        return res.status(201).send({
            success: true,
            message: "Order Created Successfully"
        })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}


const getAllOrders = async (req, res) => {

    try {
        let orders = undefined;
        const { status, shopId, type, key, userId } = req.query;

        if (status) {
            console.log("here")
            orders = await Order.find({ shop_id: shopId, type: type, status: {$in:[0,-1,1,2,3,4]}, orderId: { $regex: key, $options: 'i' } }).sort({ _id: -1 })
        } else {
            console.log("here1")
            orders = await Order.find({ shop_id: shopId, type: Number(type), userId: userId, orderId: { $regex: key, $options: 'i' } }).sort({ _id: -1 })
        }


        return res.status(200).send({ success: true, data: orders })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

const getSingleOrder = async (req, res) => {

    try {

        const orderId = req.params.orderId;

        const orders = await Order.findOne({ orderId: orderId })

        if (!orders) {
            return res.status(400).send({ success: false, message: "No Order Found" })
        }

        return res.status(200).send({ success: true, message: "Get Single Order", data: orders })
    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const updateOrder = async(req, res) => {
    try {

        const {orderId,shopId,type,status} = req.query;
        let response  = undefined;
        console.log("orderId,shopId,type,status",orderId,shopId,type,status)
        if(!status){
            return res.status(400).send({message: "Status missing",success:false})
        }
        if(Number(status)===4){
         response = await Order.updateOne({orderId:orderId,shopId:shopId,type:Number(type)},{$set:{status:Number(status),paid:true,updated_at:new Date()}})
        }else{
            response = await Order.updateOne({orderId:orderId,shopId:shopId,type:Number(type)},{$set:{status:Number(status)}})
        }

        if (response.modifiedCount === 1) {
            return res.status(200).send({ success: true, message: "Status updated" })
        } else {
            return res.status(400).send({ success: false, message: "Status Not Updated" })
        }

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}


const cancelOrder = async (req, res) => {

    try {

        const { orderId, userId, productId, check } = req.query;
        if (Number(check) === 0) {
            const removeOrder = await Order.deleteOne({ userId: userId, orderId: orderId })
        } else {
            const removeOrder = await Order.updateOne(
                { userId: userId, orderId: orderId },
                [
                    {
                        $set: {
                            products: {
                                $filter: {
                                    input: "$products",
                                    as: "product",
                                    cond: { $ne: ["$$product.productId", productId] }
                                }
                            },
                            orderedPrice: {
                                $subtract: [
                                    "$orderedPrice",
                                    {
                                        $arrayElemAt: [
                                            {
                                                $map: {
                                                    input: {
                                                        $filter: {
                                                            input: "$products",
                                                            as: "product",
                                                            cond: { $eq: ["$$product.productId", productId] }
                                                        }
                                                    },
                                                    as: "matchedProduct",
                                                    in: "$$matchedProduct.totalPrice"
                                                }
                                            },
                                            0
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]
            )
        }
        return res.status(200).send({ messgae: "Order Deleted" })

    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }
}



const countOrders = async (req, res) => {

    try {

        const { userId, type } = req.query;
        let pending = 0;
        let accept = 0;
        let processing = 0; 
        let complete = 0;


        const allOrders = await Order.find({ userId: userId, type: Number(type) });
        let totalOrders = allOrders.length;

        allOrders.forEach(item => {
            switch (item.status) {
                case 0:
                    pending++;
                    break;
                case 1:
                    accept++;
                    break;
                case 2:
                    processing++;
                    break;

                case 4 : 
                    complete++;
                    break;
                default:
                    break;
            }
        });

        return res.status(200).send({
            message: "Count of orders",
            totalOrders: totalOrders,
            pending: pending,
            processing:processing,
            accept: accept,
            complete: complete
        })


    } catch (error) {
        console.log(error.stack);
        return res.status(500).send({ message: "Internal Server Error", error: error.stack });
    }

}

module.exports = { createOrder, getAllOrders, getSingleOrder, updateOrder, cancelOrder, countOrders }