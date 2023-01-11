import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = ({ show, user, handleError }) => {
  const [author, setAuthor] = useState(null)
  const [genre, setGenre] = useState(null)
  const bookQuery = useQuery(ALL_BOOKS, {
    variables: {
      author: author,
      genre: genre,
    }
  })
  const genreQuery = useQuery(ALL_GENRES)

  useEffect(() => {
    if (user) {
      setGenre(user.favouriteGenre)
    }
  }, [user])

  if (!show) {
    return null
  }

  if (bookQuery.error) {
    handleError(bookQuery.error.message, 'error')
  }

  return (
    <div>
      <h2>books</h2>
      {genre ? (
        <p>
          {user && user.favouriteGenre === genre ? 'books in your favorite genre' : 'in genre'}{' '}
          <strong>{genre}</strong>
        </p>
      ) : (
        <p>all books</p>
      )}
      {genreQuery.data && (
        <div>
          {genreQuery.data.allGenres.map((genre, index) => (
            <button key={index} onClick={() => setGenre(genre)}>{genre}</button>
          ))}
          <button onClick={() => setGenre(null)}>all books</button>
        </div>
      )}
      {bookQuery.loading ? (
        <div>loading...</div>
      ) : (
        <>
          {!bookQuery.data ? (
            <p>No books</p>
          ) : (
            <table>
              <tbody>
                <tr>
                  <th></th>
                  <th>author</th>
                  <th>published</th>
                </tr>
                {bookQuery.data.allBooks.map((a) => (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{a.author.name}</td>
                    <td>{a.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}

export default Books
