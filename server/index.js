require('dotenv').config()
const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

// Do not display DeprecationWarning
mongoose.set('strictQuery', true)

const url = process.env.MONGODB_URI
console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = gql`
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID! 
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]!): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
    createUser(username: String!, favouriteGenre: String!): User
    login(username: String!, password: String!): Token
  }
`

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
      console.log("BOOKS!")
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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})