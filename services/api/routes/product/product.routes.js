import express from 'express';
const router = express.Router();
import { addToCart, createProduct , createTags, deleteCartItems, getAllCartProducts, getAllProducts, getAllTags, getTotalRatings } from '../../controllers/product.controller.js';
import {ensureAuthenticated} from '../../middleware/jwtVerify.js'
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('files', 10);

router.post('/create/:adminId', upload, createProduct);
router.get('/getAllProducts', getAllProducts);
router.post('/createTags/:adminId', createTags);
router.get('/getalltags',getAllTags)
router.get('/getallratings',getTotalRatings)
router.put('/addToCart',addToCart)
router.get('/getallcartproducts',getAllCartProducts)
router.put("/deleteCart",deleteCartItems)






export default router;