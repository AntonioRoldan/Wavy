/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import React from 'react'

import './Style/WelcomeMessage.css'

const WelcomeMessage = () => {
  const welcomeMessage = ['An innovative platform', <br />, 'by artists for artists', <br />, 'from the urban music', <br />, 'scene to share, collaborate,', <br />, 'explore and earn together']
  return (
    <div>
      <h3 className='welcome-message'>{welcomeMessage}</h3>
    </div>
  )
}

export default WelcomeMessage
