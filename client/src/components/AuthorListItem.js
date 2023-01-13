const AuthorListItem = ({ author }) => (
  <tr>
    <td>{author.name}</td>
    <td>{author.born}</td>
    <td>{author.bookCount}</td>
  </tr>
)

export default AuthorListItem
