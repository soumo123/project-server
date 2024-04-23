import express from 'express';
const router = express.Router();
import { adminImageUpload, getAllSettingRule, updateSettings } from '../../controllers/settings.controller.js';
import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');


router.put("/update_settings",updateSettings)
router.get("/setting_rules",getAllSettingRule)
router.put("/update_image",upload,adminImageUpload)



export default router;