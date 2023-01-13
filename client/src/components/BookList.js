import BookListItem from './BookListItem'

const BookList = ({ books }) => (
  <table>
    <tbody>
      <tr>
        <th></th>
        <th>author</th>
        <th>published</th>
      </tr>
      {books.map((book) => (
        <BookListItem key={book.id} book={book} />
      ))}
    </tbody>
  </table>
)

export default BookList
