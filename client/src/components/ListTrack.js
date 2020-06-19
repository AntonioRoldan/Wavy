import React from 'react'
import { Typography, Box } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

// import { video } from '../res/SampleVideo_1280x720_1mb.mp4'

const styles = theme => ({
  // this group of buttons will be aligned to the right side
  trackName: {
    position: 'relative',
    top: -3,
    left: '30%'
  },
  track: {
    border: 1,
    height: '1/4',
    width: '80%',
    display: 'flex',
    flexDirection: 'row'
  },
  trackDuration: {
    position: 'relative',
    top: -3,
    left: '90%'
  }
})

const TrackList = props => {
  const { classes, trackName, trackDuration, onClick } = props
  return (
    <div onClick={onClick} >
      <Box className={classes.track}>
        <Box className={classes.trackName}>
          <Typography >{trackName}</Typography>
        </Box>
        <Box className={classes.trackDuration}>
          {trackDuration}
        </Box>
      </Box>
    </div>
  )
}

export default withStyles(styles)(TrackList)
