const { httpErrorResponseHandler, httpSuccessResponseHandler,createToken } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const { User } = require('../model/user');
const Joi = require('joi');

async function createUser(req, res) {
    try {
        const regSchema = Joi.object({
            name: Joi.string().required().messages({
                'string.empty': 'Name cannot be empty',
            }),
            email: Joi.string().email().required().messages({
                'string.email': 'Email must be a valid email address',
                'any.required': 'Email cannot be empty',
            }),
            password: Joi.string().min(8).pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)).required().messages({
                'string.min': 'The entered password should be at least 8 characters long',
                'string.pattern.base': 'The password must contain at least 1 special character, 1 uppercase, 1 lowercase, 1 numeric character, and no white spaces',
                'any.required': 'Password cannot be empty',
            }),
            confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
                'any.only': 'Password and Confirm Password do not match',
                'any.required': 'Confirm Password cannot be empty',
            })
        }).unknown(false);

        const { valid, data, error } = await bodyValidation(res, regSchema, req.body);
        if (!valid) {
            return httpErrorResponseHandler(res, 400, error);   
        }

        const { name, email, password } = data;

        const checkUserExist = await User.findOne({ email });
        if (checkUserExist) {
            return httpErrorResponseHandler(res, 200, 'User already exists');
        }

        const insertUser = await User.create({ name, email, password });
        if (insertUser && insertUser._id) {
            return httpSuccessResponseHandler(res, 200, 'User registered successfully');
        } else {
            return httpErrorResponseHandler(res, 500, 'Something went wrong');
        }
    } catch (err) {
        httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
        console.error(err);
    }
}

module.exports.createUser = createUser;
