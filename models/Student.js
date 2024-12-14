const mongoose = require('mongoose');

// Define the schema for student data
const studentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        minlength: [3, 'Name must be at least 3 characters long'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format'] 
    },
    createdAt: { type: Date, default: Date.now }
});

// Create a Mongoose model based on the schema
const Student = mongoose.model('Student', studentSchema);

// Export the model for use in other files
module.exports = Student;