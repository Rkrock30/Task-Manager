const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { User } = require('../model/user');

async function deleteSubtask(req, res) {
    try {
        const { taskId, subTaskId } = req.params;
        if (!taskId || !subTaskId) {
            return httpErrorResponseHandler(res, 400, "Task ID or Subtask ID cannot be null");
        }

        const { user } = req;
        const userId = user._id;

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskId,
                'tasks.subtasks._id': subTaskId,
                'tasks.subtasks.deleteFlag': 'N'  // Ensure the subtask is not already deleted
            },
            {
                $set: {
                    'tasks.$[task].subtasks.$[subtask].deleteFlag': 'Y'
                }
            },
            {
                arrayFilters: [
                    { 'task._id': taskId },
                    { 'subtask._id': subTaskId }
                ],
                new: true,
                useFindAndModify: false
            }
        );

        if (!updatedUser) {
            return httpErrorResponseHandler(res, 404, "Task or Subtask not found or already deleted");
        }

        const updatedTask = updatedUser.tasks.id(taskId);
        const updatedSubtask = updatedTask.subtasks.id(subTaskId);

        return httpSuccessResponseHandler(res, 200, "Subtask deleted successfully", updatedSubtask);
    } catch (err) {
        console.error("Error deleting subtask:", err);
        return httpErrorResponseHandler(res, 500, err.message || 'Internal Server Error');
    }
}

module.exports.deleteSubtask = deleteSubtask;
