const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const handleError = (message, args) => {
  throw new UserInputError(message, {
    invalidArgs: args,
  })
}

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let books
      if (args.author) {
        const isAuthor = await Author.findOne({ name: args.author })

        if (!isAuthor) {
          return null
        }

        if (isAuthor) {
          if (args.genre) {
            books = await Book.find(
              { author: { $in: isAuthor._id },
              genres: { $in: args.genre } }
            ).populate('author')
          }

          if (!args.genre) {
            books = await Book.find({ author: { $in: isAuthor._id } }).populate('author')
          }
        }
        
        return books
      }

      if (!args.author && args.genre) {
        books = await Book.find({ genres: { $in: args.genre } }).populate('author')
        return books
      }

      books = await Book.find({}).populate('author')
      
      return books
    },
    allAuthors: async (root, args) => {
      const authors = await Author.find({})
      return authors
    },
    allGenres: async (root, args) => {
      let allGenres = []
      const books = await Book.find({})

      if (books) {
        books.forEach((book) => {
          book.genres.forEach((genre) => {
            if (!allGenres.includes(genre)) {
              allGenres = allGenres.concat(genre)
            }
          })
        })
      }
      
      return allGenres
    },
    me: (root, args, { currentUser }) => {
      return currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      // only allow logged in users to add books
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const isAuthor = await Author.findOne({ name: args.author })
      let author
      
      // check if author already exists
      if (isAuthor) {
        author = isAuthor
        author.bookCount++
      }

      if (!isAuthor) {
        author = new Author({ name: args.author, bookCount: 1 })
      }

      if (author) {
        try {
          const updatedAuthor = await author.save()

          if (updatedAuthor) {
            const book = new Book({ ...args, author: updatedAuthor })
            try {
              await book.save()
            } catch (err) {
              handleError(err.message, args)
            }

            return book
          }
        } catch (err) {
          handleError(err.message, args)
        }
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      // only allow logged in users to edit
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      if (author) {
        author.born = args.setBornTo

        try {
          await author.save()
        } catch (err) {
          handleError(err.message, args)
        }
  
        return author
      }
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favouriteGenre: args.favouriteGenre })
  
      try {
        await user.save()
      } catch (err) {
        handleError(err.message, args)
      }

      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        handleError('wrong credentials', args.password)
      }
  
      return { value: jwt.sign({ id: user._id }, process.env.JWT_SECRET) }
    },
  }
}

module.exports = resolvers
