import mongoose from 'mongoose'

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

const Cart = mongoose.model('carts', addToCartSchema);

export default Cart;