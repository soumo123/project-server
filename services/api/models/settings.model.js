import mongoose from 'mongoose'

const settingSchema= new mongoose.Schema({

    adminId: {
        type: String
    },
    type:{
        type: Number,
        required: true
    },
    browse_category:{
        type:Boolean,
        default:true
    },
    home:{
        type:Boolean,
        default:true
    },
    products:{
        type:Boolean,
        default:true
    },
    blog:{
        type:Boolean,
        default:true
    },
    search:{
        type:Boolean,
        default:true
    },
    user:{
        type:Boolean,
        default:true
    },
    cart:{
        type:Boolean,
        default:true
    },
    user_details:{
        type:Boolean,
        default:true
    },
    caraousel1:{
        type:Boolean,
        default:true
    },

    category:{
        type:Boolean,
        default:true
    },
    feature_products:{
        type:Boolean,
        default:true
    },
    feature_card:{
        type:Boolean,
        default:true

    },
    trending_products:{
        type:Boolean,
        default:true

    },
    trending_cards:{
        type:Boolean,
        default:true

    },

    deals:{
        type:Boolean,
        default:true

    },

    deals_products:{
        type:Boolean,
        default:true

    },
    deals_products_card:{
        type:Boolean,
        default:true

    },
    middle_card:{
        type:Boolean,
        default:true

    },
    client:{
        type:Boolean,
        default:true

    },
    new_products:{
        type:Boolean,
        default:true

    },

    new_product_card:{
        type:Boolean,
        default:true

    },

    browse_recent_post:{
        type:Boolean,
        default:true

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

const Settings = mongoose.model('settings', settingSchema);

export default Settings;