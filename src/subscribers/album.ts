/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import events from './events'
import { EventSubscriber, On } from 'event-dispatch'
import { runUploadConsumer } from '../workers/album'
@EventSubscriber()
export default class AlbumSubscriber {

  @On(events.album.uploadAlbum)
  public async onAlbumUpload() {
    try { 
      const successMessage = await runUploadConsumer()
      console.log(successMessage)
    } catch (err) {
      throw new Error(err)
    }
  }

  
}