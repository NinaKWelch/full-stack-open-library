require('dotenv').config()
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const author = require('./models/author')
const Author = require('./models/author')
const Book = require('./models/book')

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

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
  type Mutation {
    addBook(title: String!, author: String!, published: Int!, genres: [String!]): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
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
      let books

      if (args.author) {
        const isAuthor = await Author.findOne({ name: args.author })

        if (!isAuthor) {
          return null
        }

        if (isAuthor) {
          if (args.genre) {
            books = await Book.find({ author: { $in: isAuthor._id }, genres: { $in: args.genre } })
          }

          if (!args.genre) {
            books = await Book.find({ author: { $in: isAuthor._id } })
          }
        }
        
        return books
      }

      if (!args.author && args.genre) {
        books = await Book.find({ genres: { $in: args.genre } })
        return books
      }

      books = await Book.find({})
      return books
    },
    allAuthors: async (root, args) => {
      const authors = await Author.find({})
      return authors
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const isAuthor = await Author.findOne({ name: args.author })
      let author
      
      // check if author already exists
      if (isAuthor) {
        author = isAuthor
        author.bookCount++
      }

      if (!isAuthor) {
        const newAuthor = {
          name: args.author,
          bookCount: 1
        }
  
        author = new Author(newAuthor)
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
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      try {
        await author.save()
      } catch (err) {
        handleError(err.message, args)
      }

      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})