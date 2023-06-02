const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");

//user schema
const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {virtuals:true},
    toObject : {virtuals:true}
  }
);

// Populate Posts That Belongs To This user when he/she get his/her profile
userSchema.virtual("posts",{ // el virtual ha yzid el properties post iftiradi bestaemla waet el hajje
  ref: "post", //ref yaene bishir ela el post (mn ayya model bde ekhud bhadd hon)
  foreignField : "user", 
  localField: "_id", // hyda el id biswewe el user
});

//generate auth token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET || "default_secret"
  );
};

// user model
const User = mongoose.model("User", userSchema);

//validate register user
//byaemel validation 3a mestawa express js
function validateRegisterUser(obj) {
  const schema = joi.object({
    userName: joi.string().min(2).max(100).required(),
    email: joi.string().min(5).max(100).required().email(),
    password: joi.string().min(8).required(),
  });
  return schema.validate(obj);
}
//validate login user
function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().min(5).max(100).required().email(),
    password: joi.string().min(8).required(),
  });
  return schema.validate(obj);
}

//validate update user
function validateUpdateUser(obj) {
  const schema = joi.object({
    userName: joi.string().trim().min(2).max(100),
    password: joi.string().min(8).optional(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
