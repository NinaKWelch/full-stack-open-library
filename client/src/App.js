import { useState } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import { CURRENT_USER } from './queries'
import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  const userQuery = useQuery(CURRENT_USER)

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    // refresh query results
    userQuery.refetch()

    if (page === 'add' || page === 'login') {
      setPage('books')
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => logout()}>logout</button>
          </>
          
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Notify errorMessage={errorMessage} />
      <Authors show={page === 'authors'} handleError={notify} />
      <Books
        show={page === 'books'}
        user={userQuery.data ? userQuery.data.me : null}
        handleError={notify}
      />
      <NewBook
        show={page === 'add'}
        handleError={notify}
      />
      <LoginForm
        show={page === 'login'}
        handleShow={setPage}
        handleError={notify}
        setToken={setToken}
      />
    </div>
  )
}

export default App
