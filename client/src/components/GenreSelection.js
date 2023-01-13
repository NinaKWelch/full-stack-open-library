import React from 'react'

const GenreSelection = ({
  user,
  genres,
  currentGenre,
  handleGenre,
}) => (
  <>
    {currentGenre ? (
      <p>
        {user && user.favouriteGenre === currentGenre
          ? 'books in your favorite genre'
          : 'in genre'
        }{' '}
        <strong>{currentGenre}</strong>
      </p>
    ) : (
      <p>all books</p>
    )}
    <div>
      {genres.map((genre) => (
        <button
          key={genre}
          onClick={() => handleGenre(genre)}
        >
          {genre}
        </button>
      ))}
      <button onClick={() => handleGenre('')}>
        all books
      </button>
    </div>
  </>
)

export default GenreSelection