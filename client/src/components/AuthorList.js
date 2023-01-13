import AuthorListItem from './AuthorListItem'

const AuthorList = ({ authors }) => (
  <table>
    <tbody>
      <tr>
        <th></th>
        <th>born</th>
        <th>books</th>
      </tr>
      {authors.map((author) => (
        <AuthorListItem key={author.id} author={author} />  
      ))}
    </tbody>
  </table>
)

export default AuthorList
