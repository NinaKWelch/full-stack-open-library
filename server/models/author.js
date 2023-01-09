const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'author is required'],
    minlength: 4,
    unique: true,
    uniqueCaseInsensitive: true
  },
  born: {
    type: Number,
  },
  bookCount: {
    type: Number,
    required: [true, 'number of books is required'],
  },
})

authorSchema.plugin(uniqueValidator, { message: 'name must be unique' })

module.exports = mongoose.model('Author', authorSchema)