import express from 'express';
const router = express.Router();
import { addToCart, addWhishList, adminProducts, createProduct , createTags, deleteCartItems, deleteProductByAdmin, deleteSpecificItemFromCart, deleteTags, editTag, getAllCartProducts, getAllProducts, getAllTags, getTotalRatings } from '../../controllers/product.controller.js';
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
router.put("/deleteById",deleteSpecificItemFromCart)
router.put("/add_whishlist",addWhishList)



//admin//

router.get('/get_admin_products', adminProducts);
router.delete('/delete_product_by_admin', deleteProductByAdmin);
router.delete("/delete_tags/:adminId",deleteTags)
router.put("/update_tags/:adminId/:tag_id",editTag)


export default router;