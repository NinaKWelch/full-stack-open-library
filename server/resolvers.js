const { UserInputError, AuthenticationError } = require('@apollo/server')
const jwt = require('jsonwebtoken')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

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
        try {
          const author = await Author.findOne({ name: args.author })

          if (!author) {
            return null
          }

          if (author) {
            try {
              if (args.genre) {
                books = await Book.find(
                  { author: { $in: author._id },
                  genres: { $in: args.genre } }
                ).populate('author')
              }
    
              if (!args.genre) {
                books = await Book.find({ author: { $in: author._id } }).populate('author')
              }
            } catch (err) {
              handleError(err.message, args)
            }
          }
        } catch (err) {
          handleError(err.message, args)
        }

        return books
      }

      if (!args.author && args.genre) {
        try {
          books = await Book.find({ genres: { $in: args.genre } }).populate('author')
        } catch (err) {
          handleError(err.message, args)
        }

        return books
      }

      try {
        books = await Book.find({}).populate('author')
      } catch (err) {
        handleError(err.message, args)
      }

      return books
    },
    allAuthors: async (root, args) => {
      try {
        const authors = await Author.find({})
        return authors
      } catch (err) {
        handleError(err.message, args)
      }
    },
    allGenres: async (root, args) => {
      let allGenres = []

      try {
        const books = await Book.find({})

        if (books && books.length > 0) {
          books.forEach((book) => {
            book.genres.forEach((genre) => {
              if (!allGenres.includes(genre)) {
                allGenres = allGenres.concat(genre)
              }
            })
          })
        }
      } catch (err) {
        handleError(err.message, args)
      }

      return allGenres
    },
    me: (root, args, { currentUser }) => {
      return currentUser
    }
  },
  Author: {
    bookCount: (root) => {
      return root.books.length
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      // only allow logged in users to add books
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      try {
        // check if author already exists
        const isAuthor = await Author.findOne({ name: args.author })
        const author = isAuthor ? isAuthor : new Author({ name: args.author, books: [], bookCount: 0 })

        if (author) {
          const book = new Book({ ...args, author: author })
          
          try {
            await book.save()
            author.books = author.books.concat(book)

            try {
              await author.save()
            } catch (err) {
              handleError(err.message, args)
            }

            // subscription
            pubsub.publish('BOOK_ADDED', { bookAdded: book })
          } catch (err) {
            handleError(err.message, args)
          }

          return book
        }
      } catch (err) {
        handleError(err.message, args)
      }
    },
    editAuthor: async (root, args, { currentUser }) => {
      // only allow logged in users to edit
      if (!currentUser) {
        throw new AuthenticationError('not authenticated')
      }

      try {
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
        }

        return author
      } catch (err) {
        handleError(err.message, args)
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
      try {
        const user = await User.findOne({ username: args.username })

        if ( !user || args.password !== 'secret' ) {
          handleError('wrong credentials', args.password)
        }

        return { value: jwt.sign({ id: user._id }, process.env.JWT_SECRET) }
      } catch (err) {
        handleError(err.message, args)
      }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers
