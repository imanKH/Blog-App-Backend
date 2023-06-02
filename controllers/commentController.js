const asyncHandler = require("express-async-handler");
const {Comment,validateCreateComment,validateUpdateComment} = require("../models/comment");
const { User } = require("../models/user");
/*
 * @des      create new comment
 * @route   /api/comments
 * @method  POST
 * @acc     Private (only logged in user)
 */
module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const profile = await User.findById(req.user.id);

  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.userName,
  });
  res.status(201).json({comment});

});

/*
 * @des     Get All comments
 * @route   /api/comments
 * @method  GET
 * @acc     Private (only Admin)
 */
module.exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user");

  res.status(200).json(comments);
});

/*
 * @des     delete comment
 * @route   /api/comments
 * @method  DELETE
 * @acc     Private (only Admin or owner of the comment)
 */
module.exports.deleteCommentsCtrl = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if(!comment){
    return res.status(404).json({ message : "comment not found"});
  }

  if(req.user.isAdmin || req.user.id === comment.user._id.toString()){
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message :"comment has been deleted"});
  } else {
    res.status(403).json({ message: "access denied , not allowed"});
  }
});

/*
 * @des      update comment
 * @route   /api/comments
 * @method  PUT
 * @acc     Private (only owner of the comment)
 */
module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  //get comment from db
 const comment = await Comment.findById(req.params.id);
 if(!comment) {
  return res.status(404).json({ message : "comment not found" })
 }

 // Authorization (iza kn el userid nafss el user id tabae el cmnt)
 if(req.user.id !== comment.user.toString()){
  return res.status(403).json({ message : "access denied, only user himslef can edit his comment"});
 }

 // iza kl she ok byaeml update
 const updateComment  = await Comment.findByIdAndUpdate(req.params.id , {
  $set :{
    text :req.body.text,
  }
 }, {new :true});

 // wna3te el response
 res.status(200).json(updateComment);

});

