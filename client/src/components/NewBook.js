import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { CREATE_BOOK, ALL_GENRES } from '../queries'

const NewBook = ({ show, handleError }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [ createBook ] = useMutation(CREATE_BOOK, {
    // update(cache, { data: { addBook } }) {
    //   cache.modify({
    //     fields: {
    //       allBooks(existingBooks = []) {
    //         const newBookRef = cache.writeFragment({
    //           data: addBook,
    //           fragment: gql`
    //             fragment NewBook on Book {
    //               title
    //               author {
    //                 name
    //                 born
    //                 bookCount
    //                 id
    //               }
    //               published
    //               genres
    //               id
    //             }
    //           `
    //         })
    //         return [...existingBooks, newBookRef];
    //       }
    //     }
    //   })
    // },
    update(cache, { data: { addBook } }) {
      cache.modify({
        fields: {
          allAuthors(existingAuthors = []) {
            const updatedAuthorRef = cache.writeFragment({
              data: addBook.author,
              fragment: gql`
                fragment UpdatedAuthor on Author {
                  name
                  born
                  bookCount
                  id
                }
              `
            })
            // remove author if already listed and add updated or new author to list
            existingAuthors.filter((author) => author !== updatedAuthorRef).concat(updatedAuthorRef)
          }
        }
      })
    },
    refetchQueries: [ {query: ALL_GENRES} ],
    onError: (error) => {
      handleError(error.graphQLErrors[0].message, 'error')
    },
  })

  if (!show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    createBook({  variables: { title, author, published, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <h2>add book</h2>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button" disabled={genre === ''}>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button
          type="submit"
          disabled={genres.length === 0 || title === '' || author === '' || published === ''}
        >
          create book
        </button>
      </form>
    </div>
  )
}

export default NewBook
