import mongoose from 'mongoose'

const tagsSchema = new mongoose.Schema({

    userId: {
        type: String,
        // required: true //Who create the Tags 
    },
    tag_name: {
        type: String,
        required: true
    },
    tag_id: {
        type: Number,
        required: true
    },
    type:{
        type: Number,
        required: true
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

const Tags = mongoose.model('tags', tagsSchema);

export default Tags;