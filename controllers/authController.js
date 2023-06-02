const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/user");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
// const verificationToken = require("../models/verificationToken");

/*
 * @des      register new user -sign up
 * @route   /api/auth/register
 * @method  POST
 * @acc      public
 */

//hyda bizid user bl data base
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  //validation (rah nktub el validation bl user model)
  const { error } = validateRegisterUser(req.body);
  if (error) {
    //status 400 yaene bad request l ghalat mn el user baeml return enu el code el baeda ma yshtghl
    return res.status(400).json({ message: error.details[0].message });
  }
  //is user already exists

  var user = await User.findOne({ email: req.body.email });
  if (user) {
    //iza kn badu yaeml register w hue already mawjud bital3lu message
    return res.status(400).json({ message: "user already exist" });
  }

  //hash the password
  //el package yalle btaeml hash hiye el bcrypt js

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  // creating new verificationToken & save it toDB
  // const verificationToken = new verificationToken({
  //   userId: user._id,
  //   token: crypto.randomBytes(32).toString("hex"),
  // });
  // await verificationToken.save();

  // making the link
  const link = `http://localhost:3000/users/${user._id}/verify/${verificationToken.token}`;

  //puting the link into an html template
  const htmlTemplate = `
 <div>
 <p> click on the link below to verify your email </p>
 <a href="${link}"> verify </a>
 </div> `;

  // sending email to the user
  await sendEmail(user.email, "verify youtr email", htmlTemplate);

  // send response to client
  //201 yaene created successfully
  res.status(201).json({
    message: "we sent to you an email, please verify your email address",
  });
});

/*
 * @des      log in user
 * @route   /api/auth/login
 * @method   POST
 * @access   public
 */

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  // 1. validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. is user exist
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  // 3.check the password
  const isPasswordMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "invalid email or password" });
  }

  // @TODO  - sending email (verify account if not verofied)
//   if (!user.isAccountVerified) {
//    let verificationTokenn = await verificationToken.findOne({
//     userId: user._id,
//    });

//    if(!verificationTokenn){
//     verificationTokenn = new verificationToken({
//       userId: user._id,
//       token: crypto.randomBytes(32).toString("hex")
//     });
//     await verificationTokenn.save();
//    }

//   const link = `http://localhost:3000/users/${user._id}/verify/${verificationToken.token}`;

//   const htmlTemplate = `
//  <div>
//  <p> click on the link below to verify your email </p>
//  <a href="${link}"> verify </a>
//  </div> `;

//   // await sendEmail(user.email, "verify youtr email", htmlTemplate);
//     return res
//     .status(400)
//     .json({ message: "we sent to you an email, please verify your email address", });
//   }
 
  // 4. generate token
  //(la aete token bade nazel library essma jsonwebtoken bnazela bl terminal (npm i jsonwebtoken))
  const token = user.generateAuthToken();
  res.status(200).json({
    _id: user._id,
    username: user.userName,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
  });
});

/*
 * @des      verify user Account
 * @route   /api/auth/:userId/verify/:token
 * @method   GET
 * @access   public
 */

module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  const verificationToken = await verificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
console.log(verificationToken,"hello")
  // if (!verificationToken) {
  //   return res.status(400).json({ message: "invalid link" });
  // }

  // user.isAccountVerified = true;
  await user.save();

  await verificationToken.remove();

  res.status(200).json({ message: " your account verified"});
});
