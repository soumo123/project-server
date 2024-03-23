import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({

    productId: {
        type: String,
        // required: true
    },
    type:{
        type:Number,
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
    tags:{
        type:Array,
        default:[]
    },
    isBestSelling:{
        type:Boolean,
        default:true
    },
    isFeatured:{
        type:Boolean,
        default:true

    },
    isTopSelling:{
        type:Boolean,
        default:true

    },
    isBranded:{
        type:Boolean,
        default:true
    },
    discount:{
        type:Number,
        default: 0
    },
    actualpricebydiscount: {
        type: Number,
        required: true
    },
    ratings: {
        type: Number,
        default:5
    },
    stock: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        default: ''
    },
    searchstring:{
        type:String
    },
    size:{
        type:Array,
        default:[]
    },
    adminId: {
        type: String
    },
    visiblefor: {
        type: Number,
        default: 0
    },
    thumbnailimage: {
        type: String,
        default:""
    },
    
    otherimages:{
        type: Array,
        default:[]
    },
    deliverydays:{
        type:Number,
        required:true
    },
    likes:{
        type:Number,
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            username: {
                type: String,
                required: true
            },
            userId:{
                type:String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
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

const Products = mongoose.model('products', productSchema);

export default Products;