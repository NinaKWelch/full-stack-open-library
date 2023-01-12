import { gql } from '@apollo/client'

// fragments
const AUTHOR_DETAILS = gql`
  fragment AuthorDetails on Author {
    name
    born
    bookCount
    id
  }
`

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    author {
      ...AuthorDetails
    }
    genres
    id
  }
  ${AUTHOR_DETAILS}
`

// queries (exported)
export const ALL_AUTHORS = gql`
  query getAuthors {
    allAuthors {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

export const ALL_BOOKS = gql`
  query getBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const ALL_GENRES = gql`
  query getGenre {
    allGenres
  }
`

export const CURRENT_USER = gql`
  query getCurrentUser {
    me {
      username
      favouriteGenre
      id
    }
  }
`

// mutations (exported)
export const CREATE_BOOK = gql`
  mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

export const UPDATE_AUTHOR = gql`
  mutation updateAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo,
    ) {
      ...AuthorDetails
    }
  }
  ${AUTHOR_DETAILS}
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

// subscriptions (exported)
export const BOOK_ADDED = gql`
  subscription onBookAdded {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`