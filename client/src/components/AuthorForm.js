import { useState } from 'react'

const AuthorForm = ({ authors, handleUpdateAuthor }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const submit = async (event) => {
    event.preventDefault()

    handleUpdateAuthor({  variables: { name, setBornTo: born } })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h3>set birth year</h3>
      <form onSubmit={submit}>
        <div>
          name{' '}
          <select 
            value={name ? name : setName(authors[0].name)}
            onChange={({ target }) => setName(target.value)}
          >
          {authors.map((author) => (
              <option key={author.id} value={author.name}>
                {author.name}
              </option>
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
          disabled={born === ''}
        >
          update author
        </button>
      </form>
    </div>
  )
}

export default AuthorForm
