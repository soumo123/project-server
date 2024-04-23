import mongoose from 'mongoose'

const whishListSchema = new mongoose.Schema({

    productId: {
        type: String,
        // required: true
    },
    type:{
        type:Number,
    },
    userId:{
        type:String
    },
    likes:{
        type:Boolean,
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discount:{
        type:Number,
        default: 0
    },
    ratings: {
        type: Number,
        default:5
    },
    stock: {
        type: Number,
        required: true
    },
    thumbnailimage: {
        type: String,
        default:""
    },

    numOfReviews: {
        type: Number,
        default: 0
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

const Whishlists = mongoose.model('whislistproducts', whishListSchema);

export default Whishlists;