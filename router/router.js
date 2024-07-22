const express=require('express')
const router=express.Router()
const {createUser}=require('../controller/createUser')
const {loginUser}=require('../controller/login')
const auth=require('../middleware/auth')
const {createTask}=require('../controller/createTask')
const {editTask}=require('../controller/editTask')
const {deleteTask}=require('../controller/deleteTask')
const {subTask}=require('../controller/createSubTask')
const {editSubTask}=require('../controller/editSubtask')
const {getAllTaskAndSubtask}=require('../controller/getAllTaskandSubtask')
const {deleteSubtask}=require('../controller/deleteSubtask')





router.post('/createUser',(req,res)=>{
    createUser(req,res)
})
router.post('/login',(req,res)=>{
    loginUser(req,res)
})
router.get('/tasks',auth,(req,res)=>{
    getAllTaskAndSubtask(req,res)
})
  router.post('/tasks',auth,(req,res)=>{
    createTask(req,res)
})
router.put('/tasks/:taskId',auth,(req,res)=>{
    editTask(req,res)
})
router.delete('/tasks/:taskId',auth,(req,res)=>{
    deleteTask(req,res)
})
router.put('/tasks/:taskId/subtasks',auth,(req,res)=>{
    subTask(req,res)
})

router.put('/tasks/:taskId/subtasks/:subTaskId',auth,(req,res)=>{
    editSubTask(req,res)
})
router.delete('/tasks/:taskId/subtasks/:subTaskId',auth,(req,res)=>{
    deleteSubtask(req,res)
})




module.exports=router