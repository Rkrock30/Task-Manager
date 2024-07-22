const { httpErrorResponseHandler, httpSuccessResponseHandler, createToken } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const { User } = require('../model/user');
const Joi = require('joi');

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'any.required': 'Email cannot be empty',
    }),
    password: Joi.string().min(8).pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)).required().messages({
        'string.min': 'The entered password should be at least 8 characters long',
        'string.pattern.base': 'The password must contain at least 1 special character, 1 uppercase, 1 lowercase, 1 numeric character, and no white spaces',
        'any.required': 'Password cannot be empty',
    })
}).unknown(false);

async function loginUser(req, res) {
    try {
        const { valid, data, error } = await bodyValidation(res, loginSchema, req.body);
        if (!valid) {
            return httpErrorResponseHandler(res, 400, error);
        }

        const { email, password } = data;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return httpErrorResponseHandler(res, 400, 'Invalid email or password');
        }

        const token = await createToken({ userId: user._id });
        return httpSuccessResponseHandler(res, 200, "Login Successfully", { token });
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.loginUser = loginUser;
