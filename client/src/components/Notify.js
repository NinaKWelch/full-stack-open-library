const Notify = ({ message }) => {
  if ( !message ) {
    return null
  }

  return (
    <div
      style={message.type === 'success'  ? { color: 'green' }  : { color: 'red' }}
    >
      {message.content}
    </div>
  )
}

export default Notify
