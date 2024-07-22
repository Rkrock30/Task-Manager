const jwt = require('jsonwebtoken');

const httpSuccessResponseHandler = (res, code, msg, data) => {
  return res.status(code).send({ message: msg, data });
};

const decodedToken = async (token) => {
  return jwt.verify(token, process.env.SECRET_KEY);
};

const createToken = async (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: process.env.REDDIS_EXPIRY_TIME });
};

const httpErrorResponseHandler = (res, code = 400, msg) => {
  return res.status(code).send({ message: msg });
};

module.exports = {
  httpSuccessResponseHandler,
  httpErrorResponseHandler,
  createToken,
  decodedToken,
};
