import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'
import AuthorList from './AuthorList'
import AuthorForm from './AuthorForm'

const Authors = ({ show, user, handleError }) => {
  const { loading, error, data } = useQuery(ALL_AUTHORS)
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR)

  if (!show) {
    return null
  }

  if (error) {
    handleError(error.message, 'error')
    return null
  }

  return (
    <div>
      <h2>authors</h2>
      {loading ? (
        <div>loading...</div>
      ) : (
        <>
          {(!data || data.allAuthors.length === 0) && (
            <p>no authors</p>
          )}
          {(data && data.allAuthors.length > 0) && (
            <div>
              <AuthorList authors={data.allAuthors} />
              {user && (
                <AuthorForm
                  authors={data.allAuthors}
                  handleUpdateAuthor={updateAuthor}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Authors
