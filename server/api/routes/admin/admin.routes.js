const express = require('express');
const router = express.Router();
const { signIn, signUp,getUser, getAllImages, getuserDetailsByAdmin, userSpecificDetails, registerAdmin, signinAdmin, getAdmin, createShop, getAllShopsForParticularOwner, addReview, getAllReviews } = require('../../controllers/admin.controller.js');
const {ensureAuthenticated} = require('../../middleware/jwtVerify.js')
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');

router.post('/signup', upload, signUp);
router.post('/signin', signIn);
router.get('/getUser', ensureAuthenticated , getUser);
router.get('/getImages',getAllImages)


//admin//
router.get('/get_users_by_admin',getuserDetailsByAdmin)
router.get('/get_user_details',userSpecificDetails)
router.put('/addreview',addReview)
router.get('/getreviews',getAllReviews)


//master admin //
router.post('/registerAdmin', upload, registerAdmin);
router.post('/adminLogin',signinAdmin)
router.get('/get_admin', ensureAuthenticated , getAdmin);
router.post('/craete_shop',upload,createShop)
router.get("/get_all_shops",getAllShopsForParticularOwner)




module.exports = router