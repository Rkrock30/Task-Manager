const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { User } = require('../model/user');

async function getAllTaskAndSubtask(req, res) {
    try {
        const { user } = req;
        const userId = user._id;

        const getAllTask = await User.aggregate([
            { $match: { _id: userId } },
            {
                $project: {
                    tasks: {
                        $filter: {
                            input: "$tasks",
                            as: "task",
                            cond: { $eq: ["$$task.deleteFlag", "N"] }
                        }
                    }
                }
            },
            { $unwind: "$tasks" },
            {
                $addFields: {
                    "tasks.subtasks": {
                        $filter: {
                            input: "$tasks.subtasks",
                            as: "subtask",
                            cond: { $eq: ["$$subtask.deleteFlag", "N"] }
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    tasks: { $push: "$tasks" }
                }
            },
            { $project: { tasks: 1 } }
        ]);

        if (!getAllTask || getAllTask.length === 0) {
            return httpErrorResponseHandler(res, 404, "No tasks or subtasks found or they are already deleted");
        }

        return httpSuccessResponseHandler(res, 200, "Tasks and subtasks retrieved successfully", getAllTask);
    } catch (err) {
        console.error("Error fetching tasks and subtasks:", err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.getAllTaskAndSubtask = getAllTaskAndSubtask;
