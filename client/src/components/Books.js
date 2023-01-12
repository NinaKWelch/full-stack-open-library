import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = ({ show, user, handleError }) => {
  const [author, setAuthor] = useState(null)
  const [genre, setGenre] = useState('')
  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: {
      author: author,
      genre: genre,
    }
  })
  const genreQuery = useQuery(ALL_GENRES)

  useEffect(() => {
    user && setGenre(user.favouriteGenre)
  }, [user])

  if (!show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    handleError(error.message, 'error')
    return null
  }

  return (
    <div>
      <h2>books</h2>
      {loading ? (
        <div>loading...</div>
      ) : (
        <>
          {(!data || data.allBooks.length === 0) && (
            <p>no books</p>
          )}
          {(data && data.allBooks.length > 0) && (
            <>
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
                  {genreQuery.data.allGenres.length > 0 && genreQuery.data.allGenres.map((genre) => (
                    <button key={genre} onClick={() => setGenre(genre)}>{genre}</button>
                  ))}
                  <button onClick={() => setGenre(null)}>all books</button>
                </div>
              )}
              <div>
                <table>
                  <tbody>
                    <tr>
                      <th></th>
                      <th>author</th>
                      <th>published</th>
                    </tr>
                    {data.allBooks.length > 0 && data.allBooks.map((a) => (
                      <tr key={a.title}>
                        <td>{a.title}</td>
                        <td>{a.author.name}</td>
                        <td>{a.published}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default Books
