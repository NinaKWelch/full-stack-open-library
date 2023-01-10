import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../queries'

const LoginForm = ({ show, handleShow, handleError, setToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [ login, { loading, error, data } ] = useMutation(LOGIN, {
    onError: (error) => {
      handleError(error.graphQLErrors[0].message)
    }
  })

  useEffect(() => {
    if ( data ) {
      const token = data.login.value
      setToken(token)
      localStorage.setItem('phonenumbers-user-token', token)
    }
  }, [data]) // eslint-disable-line

  const submit = async (event) => {
    event.preventDefault()

    login({ variables: { username, password } })
    handleShow('books')
  }

  if (!show) {
    return null
  }

  if (loading) {
    return <div>loading...</div>
  }

  if (error) {
    handleError(error.message)
  }

  return (
    <div>
      <h2>LoginForm</h2>
      <form onSubmit={submit}>
        <div>
          username{' '}
          <input
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