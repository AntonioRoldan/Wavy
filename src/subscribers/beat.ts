/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */


import events from './events'
import { EventSubscriber, On } from 'event-dispatch'
import { runUploadConsumer, runAddNewTracksConsumer, runDeleteBeatConsumer, runEditCoverConsumer, runDeleteTrackConsumer } from '../workers/beat'
@EventSubscriber()
export default class BeatSubscriber {

  @On(events.beat.upload)
  public async onBeatUpload() {
    try { 
      const successMessage = await runUploadConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.beat.addNewTracks)
  public async onAddNewTracks() {
    try { 
      const successMessage = await runAddNewTracksConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.beat.editCover)
  public async onEditCover() {
    try { 
      const successMessage = await runEditCoverConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.beat.delete)
  public async onDeleteBeat() {
    try { 
      const successMessage = await runDeleteBeatConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.beat.deleteTrack)
  public async onDeleteTrack() {
    try { 
      const successMessage = await runDeleteTrackConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }
  
}