const mongoose = require("mongoose");

/**
 * Middleware to check if a given ID is a valid MongoDB ObjectId.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
module.exports = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(422)
      .json({
        message: "Invalid ID format. Must be a valid MongoDB ObjectId.",
      });
  }
  next();
};
