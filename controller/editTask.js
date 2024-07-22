const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const { User } = require('../model/user');
const Joi = require('joi');
const mongoose = require('mongoose');

const editSchema = Joi.object({
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

async function editTask(req, res) {
    try {
        const { valid, data, error } = await bodyValidation(res, editSchema, req.body);
        if (!valid) {
            return httpErrorResponseHandler(res, 400, error);
        }
        const { taskId } = req.params;
        if (!taskId) {
            return httpErrorResponseHandler(res, 400, "Task Id is null");
        }

        const { subject, deadline, status } = data;
        const { user } = req;
        const userId = user._id;
        const taskObjectId = taskId;

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskObjectId,
                'tasks.deleteFlag': 'N'
            },
            {
                $set: {
                    'tasks.$.subject': subject,
                    'tasks.$.deadline': deadline,
                    'tasks.$.status': status
                }
            },
            {
                new: true,
                useFindAndModify: false
            }
        );

        if (!updatedUser) {
            return httpErrorResponseHandler(res, 404, "Task not found or already deleted");
        }

        const updatedTask = updatedUser.tasks.id(taskObjectId);

        return httpSuccessResponseHandler(res, 201, "Task Updated Successfully", updatedTask);
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.editTask = editTask;
