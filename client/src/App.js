import { useState, useEffect } from 'react'
import { useApolloClient, useQuery, useSubscription, gql } from '@apollo/client'
import { CURRENT_USER, BOOK_ADDED } from './queries'
import TopNavigation from './components/TopNavigation'
import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import BookForm from './components/BookForm'
import LoginForm from './components/LoginForm'

const App = () => {
  const [message, setMessage] = useState(null)
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const client = useApolloClient()
  const userQuery = useQuery(CURRENT_USER)
  const { data } = useSubscription(BOOK_ADDED)
 
  const notify = (content, type) => {
    setMessage({ content, type })
    setTimeout(() => {
      setMessage(null)
    }, 10000)
  }

  // update token and currentUser on page refresh if user hasn't logged out
  useEffect(() => {
    if (!token) {
      const storedToken = localStorage.getItem('phonenumbers-user-token')

      if (storedToken) {
        setToken(storedToken) 
        userQuery.refetch()
      }
    }

    if (userQuery.data) {
      setCurrentUser(userQuery.data.me)
    }
  },[token, userQuery])

  useEffect(() => {
    if (data) {
      const subscriptionText = `${data.bookAdded.title} added`
      notify(subscriptionText, 'success')

      client.cache.modify({
        fields: {
          allBooks(existingBooks = []) {
            const newBookRef = client.cache.writeFragment({
              data: data.bookAdded,
              fragment: gql`
                fragment NewBook on Book {
                  title
                  author {
                    name
                    born
                    bookCount
                    id
                  }
                  published
                  genres
                  id
                }
              `
            })
            return [...existingBooks, newBookRef]
          }
        }
      })
    }
  }, [data]) // eslint-disable-line

  const login = (str) => {
    setToken(str)
    localStorage.setItem('phonenumbers-user-token', str)
    // refresh query results
    userQuery.refetch()
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
      <TopNavigation token={token} handlePage={setPage} handleLogout={() => logout()} />
      <Notify message={message} />
      <Authors
        show={page === 'authors'}
        user={currentUser}
        handleError={notify}
      />
      <Books
        show={page === 'books'}
        user={currentUser}
        handleError={notify}
      />
      <BookForm
        show={page === 'add'}
        handleError={notify}
      />
      <LoginForm
        show={page === 'login'}
        handleShow={setPage}
        handleError={notify}
        handleLogin={login}
      />
    </div>
  )
}

export default App
