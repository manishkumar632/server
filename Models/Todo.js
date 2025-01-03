import mongoose from 'mongoose'

const todoSchema = new mongoose.Schema({
    task: String,
    done: Boolean,
})  

export default mongoose.model('Todo', todoSchema)
