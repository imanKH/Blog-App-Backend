const mongoose = require("mongoose");
const joi = require("joi");

//comment schema
const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
      require: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//Comment Model
const Comment = mongoose.model("comment", commentSchema);

// validate create comment
function validateCreateComment(obj) {
  const schema = joi.object({
    postId: joi.string().required().label("Post ID is required"),
    text: joi.string().trim().required().label("Text is required"),
    user: joi.string().required().label("User ID is required")
  });
  return schema.validate(obj);
}
// validate update comment
function validateUpdateComment(obj) {
  const schema = joi.object({
    text: joi.string().trim().required(),
  });
  return schema.validate(obj);
}
module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment,
};
