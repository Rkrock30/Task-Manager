const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const {User}=require('../model/user')

async function deleteSubtask(req, res) {
    try {

        const { taskId, subTaskId } = req.params;
        if (!taskId || !subTaskId) {
            return httpErrorResponseHandler(res, 400, "Task ID or Subtask ID cannot be null");
        }
        const { user } = req;

        const userId = user._id;
        const taskObjectId = taskId;
        const subTaskObjectId = subTaskId;

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskObjectId,
                'tasks.subtasks._id': subTaskObjectId
            },
            {
                $set: {
                    'tasks.$[task].subtasks.$[subtask].deleteFlag': "Y"
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

        return httpSuccessResponseHandler(res, 201, "Subtask updated successfully", updatedUser);
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.deleteSubtask = deleteSubtask;
