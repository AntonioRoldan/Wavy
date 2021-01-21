/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import events from './events'
import { EventSubscriber, On } from 'event-dispatch'
import { runUploadConsumer, runEditCoverConsumer, runDeleteConsumer } from '../workers/track'
@EventSubscriber()
export default class TrackSubscriber {

  @On(events.track.upload)
  public async onTrackUpload() {
    try { 
      const successMessage = await runUploadConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.track.editCover)
  public async onEditCover() {
    try { 
      const successMessage = await runEditCoverConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.track.delete)
  public async onDeleteBeat() {
    try { 
      const successMessage = await runDeleteConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }
  
}