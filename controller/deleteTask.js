const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { User } = require('../model/user');

async function deleteTask(req, res) {
    try {
        const { taskId } = req.params;
        if (!taskId) {
            return httpErrorResponseHandler(res, 404, "Task Id is null");
        }

        const { user } = req;
        const userId = user._id;
        const taskObjectId = taskId;

        const updatedUser = await User.findOneAndUpdate(
            {
                _id: userId,
                'tasks._id': taskObjectId,
            },
            {
                $set: {
                    'tasks.$.deleteFlag':'Y'
                }
            }
        );

        if (!updatedUser) {
            return httpErrorResponseHandler(res, 404, "Task not found or already deleted");
        }

        const updatedTask = updatedUser.tasks.id(taskObjectId);
        updatedTask.deleteFlag="Y"

        return httpSuccessResponseHandler(res, 200, "Task Deleted Successfully", updatedTask);
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.deleteTask = deleteTask;
