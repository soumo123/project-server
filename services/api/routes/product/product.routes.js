import express from 'express';
const router = express.Router();
import { createProduct , createTags, getAllProducts, getAllTags } from '../../controllers/product.controller.js';
import {ensureAuthenticated} from '../../middleware/jwtVerify.js'
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).array('files', 10);

router.post('/create/:adminId', upload, createProduct);
router.get('/getAllProducts', getAllProducts);
router.post('/createTags/:adminId', createTags);
router.get('/getalltags',getAllTags)



export default router;