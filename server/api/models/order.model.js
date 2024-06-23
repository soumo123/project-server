const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    shopId: {
        type: String
    },
    type: {
        type: Number
    },

    products: {
        type: Array,
        required: true
    },
    tax:{
        type:Number
    },
    shippingPrice:{
        type:String
    },
    initialDeposit:{
        type:Number
    },
    orderedPrice:{
        type:Number
    },

    paymentmethod: {
        type: String,
        default: "offline"
    },
    status: {
        type: Number,
        default: 0
    },
    paid:{
        type:Boolean,
        default:false
    },
    isreturn: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: () => {
            return Date.now();
        },
        immutable: true
    },
    updated_at: {
        type: Date,
        default: () => {
            return Date.now();
        }
    }

})

module.exports = mongoose.model('orders', orderSchema);
