/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import React from 'react'
import Post from '../Post/Post'
const Home = (props) => {
  const posts = [
    {
      username: 'Yolas',
      avatar: '',
      date: '5d',
      images: [],
      videos: [],
      text: [],
      tracks: [],
      mentions: []
    },
    {
      username: 'Yolas',
      avatar: '',
      date: '5d',
      images: [],
      videos: [],
      text: [],
      tracks: [],
      mentions: []
    },
    {
      username: 'Yolas',
      avatar: '',
      date: '5d',
      images: [],
      videos: [],
      text: [],
      tracks: [],
      mentions: []
    }
  ]
  return(
    <div>
      {posts.map((post, index) => {
        <Post username={post.username} date={post.date} />
      })}
    </div>
  )
}

export default Home
