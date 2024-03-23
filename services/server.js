import app from "./app.js";
import Cloudinary from 'cloudinary'

const PORT = 8000;

const server = app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})
const CLOUDINARY_NAME = "a2z-website"
const CLOUDINARY_API_KEY = "814268977845364"
const CLOUDINARY_API_SECRET_KEY= "RdvLG4eH3xnNB7jWDMT2HACJur8"


Cloudinary.config({
    cloud_name:CLOUDINARY_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_API_SECRET_KEY
})
