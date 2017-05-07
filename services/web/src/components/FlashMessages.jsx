import React from 'react';

function alertClass (type = 'success') {
  let classes = {
    error: 'alert-danger',
    alert: 'alert-warning',
    notice: 'alert-info',
    success: 'alert-success'
  };
  return classes[type];
}

const Alert = ({message, deleteFlashMessage}) => {
  const alertClassName = `alert ${alertClass(message.type)} fade in`;
  return (
    <div className={alertClassName} role='alert'>
      <button
        className='close'
        onClick={deleteFlashMessage}
        data-dismiss='alert'>
        &times;
      </button>
      {message.text}
    </div>
  )
}

const FlashMessages = ({messages, deleteFlashMessage}) => {
  const Alerts = messages.map((message, index) => {
    return (
      <Alert
        key={index}
        deleteFlashMessage={() => deleteFlashMessage(index)}
        message={message} />
    )
  })

  return (
    <div>
      {Alerts}
    </div>
  )
}

export default FlashMessages
