const express = require("express");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { post, validateCreatePost , validateUpdatePost } = require("../models/post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const {Comment} = require ("../models/comment.js");


/*
 * @des      create new post
 * @route   /api/posts
 * @method  POST
 * @acc     Private (only logged in user)
 */
module.exports.validateCreatePostCtrl = asyncHandler(async (req, res) => {
  //1. validation for image
  if (!req.file) {
    //if no file is provided throw an error
    return res.status(400).json({ message: "no image provided" });
  }
  // 2.validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  // 3. upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 4. create new post and save it to DB
  const newPost = await post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id, //(get the logged in user id from req.user.id )
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  // 5. send response to the client
  res.status(201).json(newPost);

  // 6. remove image from the server
  fs.unlinkSync(imagePath);
});

/*
 * @des      get all posts
 * @route   /api/posts
 * @method  GET
 * @acc     public
 */

module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 4;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await post
      .find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await post
      .find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await post
      .find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]); // l populate byekhud el id mn el user (yalle bl post model )w bijib kl l properties tab3un el user
  }
  res.status(200).json(posts);
});

/*
 * @des      get single post
 * @route   /api/posts/ :id
 * @method  GET
 * @acc     public
 */
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post1 = await post
    .findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post1) {
    return res.status(404).json({ message: "post not found" });
  }

  res.status(200).json(post1);
});

/*
 * @des      get post count
 * @route   /api/posts/ :id
 * @method  GET
 * @acc     public
 */
module.exports.getPostCountCtrl = asyncHandler(async (req, res) => {
  const count = await post.count();
  res.status(200).json(count);
});

/*
 * @des      delete post
 * @route   /api/posts/ :id
 * @method  delete
 * @acc     private (only admin or owner of the post)
 */
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post1 = await post.findById(req.params.id);
  if (!post1) {
    return res.status(404).json({ message: "post not found" });
  }
  if (req.user.isAdmin || req.user.id === post1.user.toString()) {
    await post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    // delete all comments that belong to this post(bas nemsah post ha nemsah kl el comment tab3unu)
    await Comment.deleteMany({ postId: post1._id });


    res.status(200).json({
      message: "post has been deleted successfully",
      postId: post._id // am bebaat el id lal client
    });
  } else {
    res.status(403).json({ message: "access denied , forbidden" });
  }
});

/*
 * @des      update  post
 * @route   /api/posts / : id
 * @method  PUT
 * @acc     Private (only owner of the post)
 */

module.exports.updatePostCtrl = asyncHandler(async( req, res) => {
    // 1. validation  
    const { error } = validateUpdatePost (req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    // 2. Get the post from DB and check if post exist 
    const post2 = await post.findById(req.params.id);
    if(!post2){
        return res.status(404).json({ message: 'post not found'});
    }
    // 3. check if this post belong to logged in user
    if(req.user.id !== post2.user.toString()){
        return res.status(403).json ({ message : ' access denied, you are not allowed'});
    }
    //4. update post (iza kn kl khtwet yale foe ma fiyun mshkle byusal lal update)
    const updatePost = await post.findByIdAndUpdate(req.params.id , {
        $set: {
            title: req.body.title,
            description: req.body.description,
            category:req.body.category
        }
    }, { new: true }).populate("user", ["-password"])

    // 5. send response to the client
    res.status(200).json(updatePost);
    
});

/*
 * @des      update  post
 * @route   /api/posts/upload-image/:id
 * @method  PUT
 * @acc     Private (only owner of the post)
 */

module.exports.updatePostImageCtrl = asyncHandler(async( req, res) => {
    // 1. validation  
if(!req.file){
        return res.status(400).json({message: "no image provided"});
    }
    // 2. Get the post from DB and check if post exist 
    const post2 = await post.findById(req.params.id);
    if(!post2){
        return res.status(404).json({ message: 'post not found'});
    }
    // 3. check if this post belong to logged in user
    if(req.user.id !== post2.user.toString()){
        return res.status(403).json ({ message : ' access denied, you are not allowed'});
    }
    //4. update post image
    await cloudinaryRemoveImage(post.image.publicId);

    // 5. send response to the client
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    
    // 6.update the image field in the db
     const updatedPost = await post.findByIdAndUpdate(req.params.id , {
        $set: {
           image: {
            url : result.secure_url,
            publicId: result.public_id,
           }
        }
    }, { new: true }
    );

    // 7. Send response to client
    res.status(200).json(updatePost);

    //8. Remove image from the server
    fs.unlinkSync(imagePath);
    
});
   
/*
 * @des      toggle like
 * @route   /api/posts/like/:id
 * @method  PUT
 * @acc     Private (only logged in user)
 */

module.exports.toggleLikeCtrl = asyncHandler(async(req,res) => {
    const loggedInUser = req.user.id;
    const {id: postId} = req.params;
    let post1= await post.findById(req.params.id);
    if(!post1){
        return res.status(404).json({ message : "post not found"});
    }

    const isPostAlreadyLiked = post1.likes.find(
        (user) => user.toString() === req.user.id );

        if(isPostAlreadyLiked){
            post1 = await post.findByIdAndUpdate(
                postId, 
                {
                $pull: { likes : loggedInUser } //$pull bishil value mn array be mongoose(so hon btshil likes mn el array yale bynteme lal post hydda yalle 3iyatnelu foe)
            },
            {new: true});
        } else{
            post1 = await post.findByIdAndUpdate(
                postId, 
                {
                $push: { likes : loggedInUser } //$pull bishil value mn array be mongoose(so hon btshil likes mn el array yale bynteme lal post hydda yalle 3iyatnelu foe)
            },
            {new: true});
        }
        res.status(200).json(post1);
});