import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config({
    path:"D:/cake-shop/server/services/api/config/config.env"
});


AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.region,
});

export default AWS;