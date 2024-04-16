import express from 'express';
const router = express.Router();
import { signIn, signUp,getUser, getAllImages, getuserDetailsByAdmin, userSpecificDetails, registerAdmin, signinAdmin, getAdmin, createShop, getAllShopsForParticularOwner } from '../../controllers/admin.controller.js';
import {ensureAuthenticated} from '../../middleware/jwtVerify.js'
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

router.post('/signup', upload, signUp);
router.post('/signin', signIn);
router.get('/getUser', ensureAuthenticated , getUser);
router.get('/getImages',getAllImages)


//admin//
router.get('/get_users_by_admin',getuserDetailsByAdmin)
router.get('/get_user_details',userSpecificDetails)



//master admin //
router.post('/registerAdmin', upload, registerAdmin);
router.post('/adminLogin',signinAdmin)
router.get('/get_admin', ensureAuthenticated , getAdmin);
router.post('/craete_shop',upload,createShop)
router.get("/get_all_shops",getAllShopsForParticularOwner)

export default router;