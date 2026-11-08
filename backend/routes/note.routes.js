const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const {getNotes, createNotes, getNoteById, deleteNote, updateNote} = require("../controllers/note.controller")
const router = express.Router()

router.get('/notes', authMiddleware, getNotes)
router.post('/notes', authMiddleware, createNotes)
router.get('/notes/:id', authMiddleware, getNoteById)
router.delete('/notes/:id', authMiddleware, deleteNote)
router.patch('/notes/:id', authMiddleware, updateNote)

module.exports = router