const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/user");
//la hata aemel teshfit lal password bhtej el bcrypt
const bcrypt = require("bcryptjs");
const path = require("path");
const {cloudinaryUploadImage , cloudinaryRemoveImage,cloudinaryRemoveMultipleImage} = require("../utils/cloudinary")
const fs = require("fs"); // module from js to help me delete image
const {comment} = require("../models/comment");
const { post } = require("../models/post")


/*
 * @des      get all users profile
 * @route   /api/users/profile
 * @method  GET
 * @acc     Pivate (only admin)
 */
module.exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
});

/*
 * @des      get user profile
 * @route   /api/users/profile/:id
 * @method  GET
 * @access  public
 */
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password").populate("posts");
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }
  res.status(200).json(user);
});

/*
 * @des      update user profile
 * @route   /api/users/profile/:id
 * @method  PUT
 * @access  private (only user himself)
 */
//awal she mnaeml validation
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  //mnaeml check baeden hal el user badu yaeml change user (iza ma bdu yaeml udpdate lal password hyde el if ma ha tshtghl)
  if (req.body.password && req.body.password !== "") {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  // hon mnaeml uppdate lal user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        userName: req.body.userName,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  ).select("-password"); 
  // .populate("posts"); //get user With all his posts
  res.status(200).json(updatedUser); 
});

/*
 * @des      get  users count
 * @route   /api/users/count
 * @method  GET
 * @acc     Pivate (only admin)
 */
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const count = await User.count();
  res.status(200).json(count);
});

/*
 * @des      Profile photo upload
 * @route   /api/users/profile-photo-upload
 * @method  POST
 * @acc     Private (only logged in user)
 */
module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
 // 1. validation
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: "Please select a file." });
  }
 // 2. get the path to the image
 const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
 
 // 3. upload to cloudinary
 const result = await cloudinaryUploadImage(imagePath);
 console.log(result);

 // 4. get the user from DB(lzm nekhod el user mn db mishn naaerf ayya user bdu yaeml update)
const user= await User.findById(req.user.id);
  
 // 5.delete the old profile photo if exist(iza fe sura bl cloudinary mnmhiya laan ma bdna ydal images bl cloudinary)
 if(user.profilePhoto.publicId !== null){
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
 }

 // 6. change the profilePhoto field in the DB
user.profilePhoto ={
  url: result.secure_url, 
  publicId : result.public_id,
}
await user.save();// la yaemel save lal new change


  // 7. send response to client
  res.status(200).json({
     message: "Profile photo uploaded successfully." ,
     profilePhoto : {url: result.secure_url, publicId:result.public_id} ///hon baete lal user el new profile photo
    });
// 8. remove image from the server
fs.unlinkSync(imagePath) // hyde el method btaeml delete lal files  fe el node js yale mnekhda mn el file system
//baete b alb el method el path yalle bdu ymhe mna
});

/*
 * @des      delete user profile (Account)
 * @route   /api/users/profile/:id
 * @method  DELETE
 * @acc     Private (only admin or user himself)
 */
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
// 1.get the user from db 
const user = await User.findById(req.params.id);
if(!user){
  return res.status(404).json({message: " user not found"});
}
//- 2. get all posts from DB (bde ekhud kl l posts yalle byntemu la hayda el user)
const posts = await post.find({ user : user._id});


// @TODO - 3. get the public ids from the posts
const publicIds = posts?.map((post) => post.image.publicId);


//- 4. Delete all posts image from cloudinary that belong to this user
if(publicIds?.length > 0){  // (hatet hayde ? laan iza kn null aw undefined tama yaete error)
  await cloudinaryRemoveMultipleImage (publicIds);
}


// 5. Delete the profile picture from cloudinary
if(user.profilePhoto.publicId !== null){
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
}

// - 6. delete user himself (delete user & comments)
await post.deleteMany({ user: user._id});
await comment?.deleteMany({ user: user._id});

// 7. send a response to client
await User.findByIdAndDelete(req.params.id);
// 8. send a response to the client 
res.status(200).json({message: "your profile has been delete"})
});