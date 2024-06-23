const User = require('../models/user.model.js')
const Product = require('../models/product.model.js')
const Order = require("../models/order.model.js")
const Tags = require('../models/tags.model.js')
const bcrypt = require('bcryptjs')
const Admin = require('../models/admin.model.js');
const Shops = require('../models/shop.model.js');
const CheckoutAdress = require('../models/checkoutadress.model')




const getNextSequentialId = async (ids) => {
  let existingIds = [];
  let lastId;
  let idPrefix;
  let idLength = 8;

  if (ids === "AKCUS") {
    idPrefix = "AKCUS";
    lastId = await User.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.userId ? lastId.userId : "");
  }
  if(ids === "PD"){
    idPrefix = "PD";
    lastId = await Product.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.productId ? lastId.productId : "");
  }
  if(ids ==="ADMIN"){
    idPrefix = "ADMIN";
    lastId = await Admin.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.adminId ? lastId.adminId : "");
  }
  if(ids==="SHOP"){
    idPrefix = "SHOP";
    lastId = await Shops.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.shop_id ? lastId.shop_id : "");
  }
  if(ids==="ORDER"){
    idPrefix = "ORDER";
    lastId = await Order.findOne().sort({ _id: -1 });
    existingIds.push(lastId && lastId.orderId ? lastId.orderId : "");
  }
  // Uncomment the else block if needed
  // else {
  //   idPrefix = "AKPD";
  //   lastId = await Product.findOne().sort({ _id: -1 });
  //   existingIds.push(lastId && lastId.productId ? lastId.productId : "");
  // }

  const maxNumericPart = existingIds.reduce((max, id) => {
    if (!id || !id.startsWith(idPrefix)) return max; // Check if id is undefined or doesn't start with idPrefix

    const numericPart = parseInt(id.substring(idPrefix.length), 10);
    return numericPart > max ? numericPart : max;
  }, 0);

  const nextCount = maxNumericPart + 1;
  const paddedCount = String(nextCount).padStart(idLength - (idPrefix ? idPrefix.length : 0), "0");
  const nextId = idPrefix + paddedCount;


  return nextId;
};

const checkPassword = async (password, hashedPassword) => {
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};


const getLastAndIncrementId = async () => {
  try {
      // Find the document with the highest ID
      const lastTag = await Tags.aggregate([
          { $group: { _id: null, tag_id: { $max: "$tag_id" } } }
      ]);
    
      // If there are no tags yet, start with ID 1
      let newId = 1;

      // If there are tags, increment the maximum ID by 1
      if (lastTag.length > 0) {
          newId = lastTag[0].tag_id + 1;
      }

      return newId;
  } catch (error) {
      console.error("Error occurred while getting and incrementing the last ID:", error);
      throw error;
  }
};

const getLastTypeId = async () => {
  try {
      // Find the document with the highest ID
      const lastTag = await Shops.aggregate([
          { $group: { _id: null, type: { $max: "$type" } } }
      ]);
    
      // If there are no tags yet, start with ID 1
      let newId = 1;

      // If there are tags, increment the maximum ID by 1
      if (lastTag.length > 0) {
          newId = lastTag[0].type + 1;
      }

      return newId;
  } catch (error) {
      console.error("Error occurred while getting and incrementing the last ID:", error);
      throw error;
  }
};




const getLastAdressId = async () => {
  try {
      // Find the document with the highest ID
      const lastTag = await CheckoutAdress.aggregate([
          { $group: { _id: null, id: { $max: "$id" } } }
      ]);
    
      // If there are no tags yet, start with ID 1
      let newId = 1;

      // If there are tags, increment the maximum ID by 1
      if (lastTag.length > 0) {
          newId = lastTag[0].id + 1;
      }

      return newId;
  } catch (error) {
      console.error("Error occurred while getting and incrementing the last ID:", error);
      throw error;
  }
};






module.exports  =  {
    getNextSequentialId,
    checkPassword,
    getLastAndIncrementId,
    getLastTypeId,
    getLastAdressId
  }
  