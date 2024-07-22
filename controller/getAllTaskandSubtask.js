const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const {User}=require('../model/user')


async function getAllTaskAndSubtask(req, res) {
    try {
        const { user } = req;
        const userId = user._id;

        const getAllTask = await User.aggregate([
            { $match: { _id: userId } },
            { $project: {
                tasks: {
                  $filter: {
                    input: "$tasks",
                    as: "task",
                    cond: { $and: [
                      { $eq: ["$$task.deleteFlag", "N"] },
                      { $setDifference: [
                        {
                          $map: {
                            input: "$$task.subtasks",
                            as: "subtask",
                            in: { $eq: ["$$subtask.deleteFlag", "N"] }
                          }
                        },
                        [false]
                      ]}
                    ]}
                  }
                }
              }
            }
          ]);
      

        if (!getAllTask) {
            return httpErrorResponseHandler(res, 404, "Task or Subtask not found or already deleted");
        }

        return httpSuccessResponseHandler(res, 201, "Subtask updated successfully", getAllTask);
    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.getAllTaskAndSubtask = getAllTaskAndSubtask;
