const router = require("express").Router();
const {createCategoryCtrl, getALLCategoriesCtrl, deleteCategoryCtrl} = require("../controllers/categoriesController");
const {verifyTokenAndAdmin} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
// /api/categories
router.route("/")
.post(verifyTokenAndAdmin, createCategoryCtrl)
.get(getALLCategoriesCtrl);

// /api/categories/:id
router.route("/:id").delete(validateObjectId,verifyTokenAndAdmin,deleteCategoryCtrl)

module.exports=router;