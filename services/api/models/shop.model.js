import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema({

    adminId: {
        type: String,
        // required: true //Who create the Tags 
    },
    shop_id:{
        type:String
    },
    shop_name: {
        type: String,
        required: true
    },
    
    type: {
        type: Number,
        required: true
    },
    logo:{
        type:String
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

const Shops = mongoose.model('shops', shopSchema);

export default Shops;