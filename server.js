const express = require('express'); // Import the Express library
const mongoose = require('mongoose'); // Import the mongoose library to interact with MongoDB
const Student = require('./models/Student');
require('dotenv').config();

const app = express(); // Create an instance of an Express application

app.use(express.static('public')); // Middleware to serve static files from the "public" folder
app.use(express.json()); // Middleware to parse JSON request bodies

// Define the MongoDB connection URI
// Replace 'localhost:27017/student-management' with your MongoDB URI (local or cloud-based)
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management';

// Connect to the MongoDB database using mongoose
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...')) // If the connection is successful, log a confirmation message
    .catch(err => console.error('MongoDB connection error:', err)); // If the connection fails, log an error message with the details

const users = [
    { username: 'admin', password: 'password123' } // Predefined user for testing
];

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

app.post('/students', async (req, res) => {
    try {
        const { name, email } = req.body;
        const student = new Student({ name, email });
        await student.save();
        res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ errors });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.get('/students', async (req, res) => {
    try {
        const students = await Student.find(); // Retrieve all student records
        res.status(200).json(students); // Send the list of students
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors and send a response
    }
});

app.get('/students/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id); // Retrieve a specific student record using id
        if (!student) return res.status(404).json({ error: 'Student not found' }); // If the id not found
        res.status(200).json(student); // Send the student record
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/students/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true, runValidators: true }
        );
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json({ message: 'Student updated successfully', student });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ errors });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

app.delete('/students/:id', async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id); // Find the student by id and delete the record
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });  // handle the error while delete the student record
    }
});

// Route to handle GET /about
app.get('/about', (req, res) => {
    // Respond with a message
    res.send('This is the Student Management App API!');
});

// Middleware to handle undefined routes
app.use((req, res) => {
    // Respond with a 404 status and a custom message
    res.status(404).send('Route not found');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Serve the index.html file for the root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Define the port for the server to listen on
const PORT = 3000;

// Start the server and log a message to the console
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});