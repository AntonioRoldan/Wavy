import React, { useState, useEffect } from 'react'
import LandingMessage from '../components/LandingMessage/LandingMessage'

const LandingMessageContainer = ({ textBlock, index }) => {
  const [rightPosition, setRightPosition] = useState('0px')
  const [leftPosition, setLeftPosition] = useState('0px')
  const variableLeftBlockStyle = {
    right: rightPosition,
    left: leftPosition
  }
  useEffect(() => {
    const setLeftBlockElementsPositionAccordingToIndex = () => {
      switch (index) {
        case 1:
          setRightPosition('230px')
          setLeftPosition('63%')
          break
        case 3:
          setRightPosition('60px')
          setLeftPosition('66%')
          break
        default:
      }
    }
    setLeftBlockElementsPositionAccordingToIndex(index)
  }, [index])

  return (
    <LandingMessage textBlock={textBlock} variableLeftBlockStyle={variableLeftBlockStyle} />
  )
}

export default LandingMessageContainer
