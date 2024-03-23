import User from '../models/user.model.js'
import Product from '../models/product.model.js'
import Tags from '../models/tags.model.js'
import bcrypt from 'bcryptjs'




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

  
  export {
    getNextSequentialId,
    checkPassword,
    getLastAndIncrementId
  }
  