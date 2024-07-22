const { httpErrorResponseHandler, httpSuccessResponseHandler } = require("../utils/common");
const { bodyValidation } = require('../utils/bodyValidation');
const Joi = require('joi');
const {User}=require('../model/user')

const subTaskSchema = Joi.object({
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

async function subTask(req, res) {
    try {
        const schema = Joi.array().items(subTaskSchema);
        const { valid, data, error } = await bodyValidation(res, schema, req.body);
        if (!valid) {
            return httpErrorResponseHandler(res, 400, error);
        }
        const { taskId } = req.params;
        if(!taskId){
            return httpErrorResponseHandler(res, 404, "Task Id is null"); 
        }
        const { user } = req;
        let UserDta=await User.findOne({_id:user._id})

        let checkTaskdelted=UserDta.tasks.find(e=>e._id==taskId && e.deleteFlag=="N" );
        if(!checkTaskdelted){
            return httpErrorResponseHandler(res, 404, "Task alreaday deleted"); 
        }

        
        let taskupdate=UserDta.tasks.id(taskId);
          taskupdate.subtasks.push(...data)
        const response = await UserDta.save();

        console.log(response);
        return httpSuccessResponseHandler(res, 201, "SubTask Created Successfully",taskupdate);

    } catch (err) {
        console.error(err);
        return httpErrorResponseHandler(res, err.code || 500, err.message || 'Internal Server Error');
    }
}

module.exports.subTask = subTask;