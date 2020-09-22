/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import events from './events'
import { EventSubscriber, On } from 'event-dispatch'
import { runUploadConsumer, runAddNewTracksConsumer, runDeleteAlbumConsumer, runEditCoverConsumer, runDeleteTrackConsumer } from '../workers/album'
@EventSubscriber()
export default class AlbumSubscriber {

  @On(events.album.upload)
  public async onAlbumUpload() {
    try { 
      const successMessage = await runUploadConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.album.addNewTracks)
  public async onAddNewTracks() {
    try { 
      const successMessage = await runAddNewTracksConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.album.editCover)
  public async onEditCover() {
    try { 
      const successMessage = await runEditCoverConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.album.delete)
  public async onDeleteAlbum() {
    try { 
      const successMessage = await runDeleteAlbumConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  @On(events.album.deleteTrack)
  public async onDeleteAlbumTrack() {
    try { 
      const successMessage = await runDeleteTrackConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }
  
}