import express from 'express';
const router = express.Router();
import { signIn, signUp,getUser } from '../../controllers/admin.controller.js';
import {ensureAuthenticated} from '../../middleware/jwtVerify.js'
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

router.post('/signup', upload, signUp);
router.post('/signin', signIn);
router.get('/getUser', ensureAuthenticated , getUser);

export default router;