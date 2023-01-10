const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'title is required'],
    minlength: 2,
    unique: true,
    uniqueCaseInsensitive: true
  },
  published: {
    type: Number,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  genres: [
    { type: String }
  ]
})

bookSchema.plugin(uniqueValidator, { message: 'title must be unique' })

module.exports = mongoose.model('Book', bookSchema)
