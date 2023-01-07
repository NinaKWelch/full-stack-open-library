import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'

const Authors = ({ show }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const result = useQuery(ALL_AUTHORS)

  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR)

  const submit = async (event) => {
    event.preventDefault()

    updateAuthor({  variables: { name, setBornTo: born } })

    setName('')
    setBorn('')
  }


  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>set birth year</h3>
      <form onSubmit={submit}>
        <div>
          name{' '}
          <select 
            value={name ? name : setName(result.data.allAuthors[0].name)}
            onChange={({ target }) => setName(target.value)}
          >
          {result.data.allAuthors.map((a) => (
              <option key={a.id} value={a.name}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          born{' '}
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
        <button
          type="submit"
          disabled={name === '' || born === ''}
        >
          update author
        </button>
      </form>
    </div>
  )
}

export default Authors
