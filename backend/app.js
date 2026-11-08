const express = require('express')
const authRoutes = require('./routes/auth.routes.js')
const noteRoutes = require('./routes/note.routes.js')
const errorMiddleware = require('./middlewares/error.middleware.js')
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/auth', authRoutes)
app.use('/api',noteRoutes)

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware)

module.exports = app