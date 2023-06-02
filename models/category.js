const mongoose = require("mongoose");
const joi = require("joi");

//category schema
const categorySchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    title: {
      type: String,
      required: true,
      trim:true,
    },
  }, {
    timestamps: true,
  }
);

//Category Model
const Category = mongoose.model("category", categorySchema);

// validate create category
function validateCreateCategory(obj) {
  const schema = joi.object({
    title: joi.string().trim().required().label("Title"),
  });
  return schema.validate(obj);
}

module.exports = {
  Category,
 validateCreateCategory
};
