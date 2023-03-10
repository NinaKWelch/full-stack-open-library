import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const LoginForm = ({ show, handleShow, handleError, handleLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [ login, { loading, error, data } ] = useMutation(LOGIN, {
    onError: (error) => {
      handleError(error.graphQLErrors[0].message, 'error')
    }
  })

  useEffect(() => {
    if ( data ) {
      handleLogin(data.login.value)
    }
  }, [data]) // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
    handleShow('books')
  }

  if (!show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    handleError(error.message, 'error')
  }

  return (
    <div>
      <h2>login</h2>
      <form onSubmit={submit}>
        <div>
          username{' '}
          <input
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{' '}
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm