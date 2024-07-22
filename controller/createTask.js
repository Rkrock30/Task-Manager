const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const { User } = require('../model/user');
const Joi = require('joi');
const taskSchema = Joi.object({
    subject: Joi.string().required().messages({
        'any.required': 'Subject cannot be empty',
        'string.empty': 'Subject cannot be empty'
    }),
    deadline: Joi.date().iso().greater(Date.now()).required().messages({
        'date.base': 'Deadline must be a valid date',
        'date.isoDate': 'Deadline must be in ISO 8601 date format',
        'any.required': 'Deadline cannot be empty',
    }),
    status: Joi.string().max(1).valid('P', 'C', 'I').required().messages({
        'string.base': 'Status must be a string',
        'string.max': 'Status must be a single character',
        'any.only': 'Status must be one of P, C, or I',
        'any.required': 'Status cannot be empty',
    })
}).unknown(false);

async function createTask(req, res) {
    try {
        const { valid, data, error } = await bodyValidation(res, taskSchema, req.body);
        if (!valid) {
            return httpErrorResponseHandler(res, 400, error);
        }

        const { subject, deadline, status } = data;
        const { user } = req;

        const userId = user._id;
        const newTask = { subject, deadline, status };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $push: { tasks: newTask } },
            { new: true, useFindAndModify: false }
        );

        if (!updatedUser) {
            return httpErrorResponseHandler(res, 404, "User not found");
        }

        return httpSuccessResponseHandler(res, 201, "Task Created Successfully", newTask);

    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.createTask = createTask;
