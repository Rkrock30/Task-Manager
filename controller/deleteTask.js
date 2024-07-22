const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { User } = require('../model/user');

async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;
        if (!taskId) {
            return httpErrorResponseHandler(res, 400, "Task ID cannot be null");
        }

        const { user } = req;
        const userId = user._id;

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskId,
            },
            {
                $set: {
                    'tasks.$.deleteFlag': 'Y'
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

        const updatedTask = updatedUser.tasks.id(taskId);

        return httpSuccessResponseHandler(res, 200, "Task deleted successfully", updatedTask);
    } catch (err) {
        console.error("Error deleting task:", err);
        return httpErrorResponseHandler(res, 500, err.message || 'Internal Server Error');
    }
}

module.exports.deleteTask = deleteTask;
