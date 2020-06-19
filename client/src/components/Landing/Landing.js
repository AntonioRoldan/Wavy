import React from 'react'
import { Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import LandingMessageContainer from '../../containers/LandingMessageContainer'
import WelcomeMessage from '../WelcomeMessage/WelcomeMessage'
// import { video } from '../res/SampleVideo_1280x720_1mb.mp4'
import './Style/Landing.css'

const Landing = () => {
  const textBlocks = [
    {
      title: 'Beats',
      paragraph: [
        'Sell drumkits and loops',
        <br />,
        'for other artists or fans',
        <br />,
        'to use or listen to'
      ],
      textAlign: 'left'
    },
    {
      title: 'Tutorials',
      paragraph: [
        'Upload music tutorials',
        <br />,
        'you can create your own',
        <br />,
        'tutorial series and',
        <br />,
        'monetize it through',
        <br />,
        'donations, selling price',
        <br />,
        'ads or a combination of',
        <br />,
        'either'
      ],
      textAlign: 'right'
    },
    {
      title: 'Livestreams',
      paragraph: [
        'Share a livestream with',
        <br />,
        'your fans and monetize',
        <br />,
        'them through donations',
        <br />,
        'or setting your own',
        <br />,
        'prices for access'
      ],
      textAlign: 'left'
    },
    {
      title: 'Subscriptions',
      paragraph: [
        'Sell a subscription to',
        <br />,
        'your fans having',
        <br />,
        'control over',
        <br />,
        'what discounts and',
        <br />,
        'advantages they will',
        <br />,
        'have when accessing',
        <br />,
        'your products'
      ],
      textAlign: 'right'
    },
    {
      title: 'Collaborations',
      paragraph: [
        'You can do a collaboration',
        <br />,
        'with other artists and split',
        <br />,
        'the profits'
      ],
      textAlign: 'left'
    }
  ]
  return (
    <div>
      <WelcomeMessage />
      <span className='welcome-buttons'>
        <Link id='welcome-button-link'>
          <Button id='welcome-button'>Share</Button>
        </Link>
        <Link id='welcome-button-link'>
          <Button id='welcome-button'>Join</Button>
        </Link>
      </span>
      <h3 className='info-section-title'>Benefit from multiple revenue streams </h3>
      {textBlocks.map((textBlock, index) => (
        <LandingMessageContainer key={index} textBlock={textBlock} index={index} />
      ))
      }
    </div>
  )
}

export default Landing
