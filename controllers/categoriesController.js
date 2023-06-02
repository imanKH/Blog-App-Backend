const asyncHandler = require("express-async-handler");
const {Category, validateCreateCategory} = require ("../models/category");


/*
 * @des      create new category
 * @route   /api/categories
 * @method  POST
 * @acc     Private (only admin)
 */
module.exports.createCategoryCtrl = asyncHandler(async(req , res) =>{
    const {error} = validateCreateCategory(req.body);
    if(error){
        return res.status(400).json({ message : error.details[0].context.message })
    }

    const category = await Category.create({
        title: req.body.title,
        user: req.user.id
    });
    res.status(201).json(category);
});

/*
 * @des     Get All category
 * @route   /api/categories
 * @method  GET
 * @acc    Public
 */
module.exports.getALLCategoriesCtrl = asyncHandler(async(req , res) =>{
    const categories = await Category.find();
    res.status(201).json(categories);
});

/*
 * @des     Delete category
 * @route   /api/categories/:id
 * @method  DELETE
 * @acc    Private(only admin)
 */
module.exports.deleteCategoryCtrl = asyncHandler(async(req , res) =>{
    const category =await Category.findById(req.params.id);
  if(!category){
    return res.status(404).json( { message: 'category not found'});
}
    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
        message : 'category has been deleted successfully',
        categoryId: category._id,
    })
 
 });