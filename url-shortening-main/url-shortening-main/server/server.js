require('dotenv').config()  // Load environment variables from .env file
const mongoose = require('mongoose')
const cors = require('cors')
const express = require('express')
const app = express()

// Import your routes
const indexRouter = require('./routes/index')

const PORT = process.env.PORT || 5500  // Use the port from environment variable or default to 5500

// Test route for basic server verification
app.get('/test', (req, res) => {
    res.send('Test route is working!')
})

// Enable CORS for all origins (You might want to restrict it in production)
app.use(cors())

// Middleware to parse incoming JSON request bodies
app.use(express.json())

// Register your routes
app.use('/', indexRouter)

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Database connection successful'))
.catch((err) => {
    console.error('Error connecting to the database', err)  // More detailed error message
    process.exit(1)  // Exit the process if DB connection fails
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
