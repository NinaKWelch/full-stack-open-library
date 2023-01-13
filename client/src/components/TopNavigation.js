const TopNavigation = ({ token, handlePage, handleLogout }) => (
  <nav>
    <button onClick={() => handlePage('authors')}>
      authors
    </button>
    <button onClick={() => handlePage('books')}>
      books
    </button>
    {token ? (
      <>
        <button onClick={() => handlePage('add')}>
          add book
        </button>
        <button onClick={handleLogout}>
          logout
        </button>
      </>
      
    ) : (
      <button onClick={() => handlePage('login')}>
        login
      </button>
    )}
  </nav>
)

export default TopNavigation
