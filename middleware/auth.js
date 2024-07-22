const { decodedToken } = require("../utils/common");
const{User}=require('../model/user')

const auth = async (req, res, next) => {
  try {
    const token = req.header('token');
    if (!token) {
        return httpErrorResponseHandler(res, 401, "No token provided");
      }
      const decoded = await decodedToken(token);
    if (!decoded) {
        return httpErrorResponseHandler(res, 401, "Authorization Failed");
    }
    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
        throw new Error();
      }
    let userDetails={
      _id:user._id
    } 
    req.user = userDetails;
    next();
  } catch (err) {
    return httpErrorResponseHandler(res, 401, "Authorization Failed");
}
};

module.exports = auth;
