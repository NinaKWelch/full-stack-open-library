import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = ({ show }) => {
  const [author, setAuthor] = useState(null)
  const [genre, setGenre] = useState(null)

  const { loading, error, data } = useQuery(ALL_BOOKS, {
    variables: {
      author: author,
      genre: genre,
    }
  })

  if (!show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>books</h2>
      {!data ? (
        <p>No books</p>
      ) : (
        <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  )
}

export default Books
