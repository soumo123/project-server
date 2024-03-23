import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';

dotenv.config({
    path:"D:/cake-shop/server/services/api/config/config.env"
});

const ensureAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(403).send({ message: "Token is required" });
    }

    const token = authHeader.split(' ')[1];

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);

    return next();
  } catch (error) {
    console.error('Error', error.stack);
    return res.status(401).send({ message: "Unauthorized" });
  }
};
    
  export {ensureAuthenticated}