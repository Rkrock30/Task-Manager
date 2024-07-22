require('dotenv').config()
require('./model/Db')
const express=require('express')
const app=express()
const bodyparser=require('body-parser')
const router=require('./router/router')
app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json());

app.use('/api',router)
global.Joi = require("joi");
global.httpSuccessResponseHandler=require('./utils/common').httpSuccessResponseHandler
global.httpErrorResponseHandler=require('./utils/common').httpErrorResponseHandler

app.listen(process.env.PORT,()=>{
    console.log("server is running on http://localhost:4500");
})
