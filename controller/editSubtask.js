const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const Joi = require('joi');
const { User } = require('../model/user');

const editSchema = Joi.object({
    subject: Joi.string().required().messages({
        'any.required': 'Subject cannot be empty',
        'string.empty': 'Subject cannot be empty'
    }),
    deadline: Joi.date().iso().greater(Date.now()).required().messages({
        'date.base': 'Deadline must be a valid date',
        'date.isoDate': 'Deadline must be in ISO 8601 date format',
        'date.greater': 'Deadline must be in the future',
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

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskId,
                'tasks.deleteFlag': 'N',
                'tasks.subtasks._id': subTaskId,
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
                    { 'task._id': taskId },
                    { 'subtask._id': subTaskId }
                ],
                new: true
            }
        );

        if (!updatedUser) {
            return httpErrorResponseHandler(res, 404, "Task or Subtask not found or already deleted");
        }

        const updatedTask = updatedUser.tasks.id(taskId);
        const updatedSubTask = updatedTask.subtasks.id(subTaskId);

        return httpSuccessResponseHandler(res, 200, "Subtask updated successfully", updatedSubTask);
    } catch (err) {
        console.error("Error updating subtask:", err);
        return httpErrorResponseHandler(res, 500, err.message || 'Internal Server Error');
    }
}

module.exports.editSubTask = editSubTask;
