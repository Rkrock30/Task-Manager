const mongoose=require('mongoose')

mongoose.connect('mongodb://localhost:27017/Task-Manager')
.then(()=>{
    console.log("Connected to mongo");
}).catch((err)=>{
    console.log("Getting error while connecting to mongoDb",err);
})