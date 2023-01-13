const BookListItem = ({ book }) => (
  <tr>
    <td>{book.title}</td>
    <td>{book.author.name}</td>
    <td>{book.published}</td>
  </tr>
)

export default BookListItem
