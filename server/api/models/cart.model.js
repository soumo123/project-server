const mongoose  = require('mongoose')

const addToCartSchema = new mongoose.Schema({

    userId: {
        type: String
    },
    type:{
        type:Number
    },
    products:[
        {
            productId:{
                type:String,
                required:true
            },
            name:{
                type:String,
                required:true
            },
            description:{
                type:String,
                required:true
            },
            price:{
                type:Number,
                required:true
            },
            color:{
                type:String,
                default:""
            },
            weight:{
                type:String,
                default:""
            },
            itemCount:{
                type:Number
            },
            totalPrice:{
                type:Number
            },
            discount:{
                type:Number
            },
            thumbImage:{
                type:String
            }
        }
    ],

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

module.exports = mongoose.model('carts', addToCartSchema);
