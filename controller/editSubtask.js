const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const Joi = require('joi');
const {User}=require('../model/user')
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

async function editSubTask(req, res) {
    try {
        const { valid, data, error } = await bodyValidation(res, editSchema, req.body);
        if (!valid) {
            return httpErrorResponseHandler(res, 400, error);
        }

        const { taskId, subTaskId } = req.params;
        if (!taskId || !subTaskId) {
            return httpErrorResponseHandler(res, 400, "Task ID or Subtask ID cannot be null");
        }

        const { subject, deadline, status } = data;
        const { user } = req;

        const userId = user._id;
        const taskObjectId = taskId;
        const subTaskObjectId = subTaskId;

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskObjectId,
                'tasks.deleteFlag': 'N',
                'tasks.subtasks._id': subTaskObjectId,
                'tasks.subtasks.deleteFlag': 'N'
            },
            {
                $set: {
                    'tasks.$[task].subtasks.$[subtask].subject': subject,
                    'tasks.$[task].subtasks.$[subtask].deadline': deadline,
                    'tasks.$[task].subtasks.$[subtask].status': status
                }
            },
            {
                arrayFilters: [
                    { 'task._id': taskObjectId },
                    { 'subtask._id': subTaskObjectId }
                ],
                new: true
            }
        );

        if (!updatedUser) {
            return httpErrorResponseHandler(res, 404, "Task or Subtask not found or already deleted");
        }

        return httpSuccessResponseHandler(res, 201, "Subtask updated successfully", { subject, deadline, status });
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.editSubTask = editSubTask;
