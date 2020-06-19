import React from 'react'

import './Style/LandingMessage.css'

const LandingMessage = ({ textBlock, variableLeftBlockStyle }) => {

  const textBlockStyle = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: textBlock.textAlign === 'left' ? 'flex-start' : 'flex-end',
    marginLeft: textBlock.textAlign === 'left' ? '6%' : '0%',
    marginRight: textBlock.textAlign === 'left' ? '0%' : '6%',
    textAlign: textBlock.textAlign
  }
  const underlineStyle = {
    position: 'relative',
    left: textBlock.textAlign === 'left' ? '0px' : variableLeftBlockStyle.left,
    borderTop: '10px solid #ffbcff',
    display: 'block',
    borderTopRightRadius: '10px',
    borderBottomLeftRadius: '10px',
    borderTopLeftRadius: '10px',
    borderBottom: '10px solid #ffbcff',
    borderBottomRightRadius: '10px',
    width: '100px'
  }
  const titleStyle = {
    right: textBlock.textAlign === 'left' ? '0px' : variableLeftBlockStyle.right,
    fontSize: '60px',
    fontWeight: 'bold',
    letterSpacing: '-1.44px',
    fontFamily: 'Nunito',
    top: '10px',
    position: 'relative',
    color: '#f5f5f9'
  }
  return (
    <div style={textBlockStyle}>
      <h3 style={titleStyle}>{textBlock.title}</h3>
      <div style={underlineStyle} />
      <p className='text'>{textBlock.paragraph}</p>
    </div>
  )
}

export default LandingMessage
