const express = require('express')
const {registerUser, loginUser, getCurrentUser, logoutUser} = require('../controllers/auth.controller.js')
const authMiddleware = require('../middlewares/auth.middleware.js')

const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me',authMiddleware, getCurrentUser)
router.post('/logout', logoutUser)

module.exports = router