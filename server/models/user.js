const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username is required'],
    minlength: 3
  },
  favouriteGenre: {
    type: String,
    required: [true, 'genre is required'],
    minlength: 3
  },
})

module.exports = mongoose.model('User', userSchema)