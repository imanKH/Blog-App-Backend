const router = require("express").Router();
const { validateCreatePostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, updatePostCtrl, updatePostImageCtrl, toggleLikeCtrl } = require("../controllers/postContoller");
const photoUpload = require("../middlewares/photoUpload");
const { verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
// /api/posts
router.route("/").post(verifyToken, photoUpload.single("image"), validateCreatePostCtrl)
.get(getAllPostsCtrl);

// /api/posts/count
router.route("/count").get(getPostCountCtrl);

// /api/posts/:id
router.route("/:id")
.get(validateObjectId,getSinglePostCtrl)
.delete(validateObjectId,verifyToken, deletePostCtrl)
.put(validateObjectId, verifyToken , updatePostCtrl);
module.exports = router;

// /api/posts/update-image/:id
router.route("/update-image/:id")
.put(validateObjectId , verifyToken, photoUpload.single("image"),updatePostImageCtrl );

// /api/posts/likes/:id
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;