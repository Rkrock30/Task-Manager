const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')


let subTaskSchema=new mongoose.Schema({
    subject: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, required: true, enum: ['P', 'I', 'C'] },
    deleteFlag: { type: String, default: "N" }
})


let taskSchema=new mongoose.Schema({
    subject: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, required: true, enum: ['P', 'I', 'C'] },
    deleteFlag: { type: String, default: "N" },
    subtasks: [subTaskSchema]

})

let userSchema= new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tasks: [taskSchema]
})


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };


const User = mongoose.model('User', userSchema);

module.exports = {User};