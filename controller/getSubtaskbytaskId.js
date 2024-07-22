const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { User } = require('../model/user');
const mongoose = require('mongoose');

async function getSubtaskByTaskId(req, res) {
    try {
        const { user } = req;
        const userId = user._id;
        const { taskId } = req.params;

        if (!taskId) {
            return httpErrorResponseHandler(res, 400, "Task Id is required");
        }

        const objectIdUserId =  new mongoose.Types.ObjectId(userId)  || null;
        const objectIdTaskId =  new mongoose.Types.ObjectId(taskId) || null;

        if (!objectIdUserId || !objectIdTaskId) {
            return httpErrorResponseHandler(res, 400, "Invalid User Id or Task Id");
        }

        const tasks = await User.aggregate([
            { $match: { _id: objectIdUserId } },
            { $unwind: "$tasks" },
            { $match: { "tasks._id": objectIdTaskId } },
            {
                $project: {
                    subtasks: {
                        $filter: {
                            input: "$tasks.subtasks",
                            as: "subtask",
                            cond: { $eq: ["$$subtask.deleteFlag", "N"] }
                        }
                    }
                }
            }
        ]);

        if (!tasks || tasks.length === 0) {
            return httpErrorResponseHandler(res, 404, "Task or Subtask not found or already deleted");
        }

        return httpSuccessResponseHandler(res, 200, "Subtasks retrieved successfully", tasks[0]?.subtasks);
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, 500, 'Internal Server Error');
    }
}

module.exports.getSubtaskByTaskId = getSubtaskByTaskId;
