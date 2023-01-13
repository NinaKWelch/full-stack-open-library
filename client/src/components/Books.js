import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
import GenreSelection from './GenreSelection'
import BookList from './BookList'

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

  if (error) {
    handleError(error.message, 'error')
    return null
  }

  return (
    <div>
      <h2>books</h2>
      {(genreQuery.data && genreQuery.data.allGenres.length > 0) && (
        <GenreSelection
          user={user}
          genres={genreQuery.data.allGenres}
          currentGenre={genre}
          handleGenre={setGenre}
        />
      )}
      {loading ? (
        <div>loading...</div>
      ) : (
        <>
          {!data || data.allBooks.length === 0 ? (
            <p>no books</p>
          ) : (
            <BookList books={data.allBooks} />
          )}
        </>
      )}
    </div>
  )
}

export default Books
