const jwt = require('jsonwebtoken');
/** The cached error response for an invalid token. */
const invalidTokenResponse = { message: "Invalid token, access denied" };
/** The cached error response for missing token. */
const missingTokenResponse = { message: "No token provided, access denied" };

/**
 * Verifies JWT tokens supplied in the authorization header of a request.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json(missingTokenResponse);
  }

  const token = authToken.split(" ")[1];

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    if (!decodedPayload) {
      return res.status(401).json(invalidTokenResponse);
    }
    
    req.user = decodedPayload;
    return next();
  } catch (error) {
    return res.status(401).json(invalidTokenResponse);
  }
}

/**
 * Middleware to verify JWT token and role being admin
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 */
//verify Token & Admin
function verifyTokenAndAdmin(req, res, next) {
   verifyToken(req, res, () => {
    if (req.user.isAdmin) {
        next();
    } else {
        return res.status(401).json ({message: "Not allowed, only admin"});
    }
   }) ;
}

//verify Token & only user himself
function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req, res, () => {
   if (req.user.id == req.params.id) {
       next();
   } else {
       return res.status(401).json ({message: "Not allowed, only user himself"});
   }
  }) ;
}

//verify Token & Authorization
function verifyTokenAuthorization(req, res, next) {
  verifyToken(req, res, () => {
   if (req.user.id == req.params.id || req.user.isAdmin) {
       next();
   } else {
       return res.status(401).json ({message: "Not allowed, only user himself or admin "});
   }
  }) ;
}

module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAuthorization
}