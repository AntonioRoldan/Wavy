/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import React from 'react'

import './Style/Post.css'

const Post = props => {
  return (
    <div className='post'>
      <div className='post-info'>
        <div className='profile-info'>
          <img className='avatar' src='https://happytravel.viajes/wp-content/uploads/2020/04/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png' />
          <p className='username'>{props.username}</p>
        </div>
        <span>
          <p className='date'>{props.date}</p>
        </span>
      </div>
      <div className='post-content'>
        <p></p>
        <img></img>
      </div>
    </div>
  )
}

export default Post
