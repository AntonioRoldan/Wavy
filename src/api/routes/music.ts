// This route is reponsible for managing playlists, music tracks, albums, etc 
//
// IMPORTANT 
// Route add-single-tracks req.body: {"trackObjects": [{
//  "trackName": , "trackInspiredArtists": ["", ""], "hasImage": true/false
// }]} req.files {trackaudios, trackimages}
// We use the s3 service to upload the images which will return an array of imageUrls which we will store in our own variable 
// We use the s3 service again to upload the audio files which will return an array of audio urls that we will also store in our own variable
// Now we loop through the objects, get the image and audio urls and store them in mongodb
//
// Route add-new-album 
// req.body : {"albumTitle": '', "trackObjects": [{
// "trackName": '', "trackInspiredArtists": ["",""]}]} req.files {trackAudios, album undercover}
// We upload album under cover using the s3-service module which returns the image url, then store album object
// Having the album object already along with its id inside the mongoose.save() callback
// we use the s3 service to upload the track files which returns an array of s3 urls
// then we loop through the array of track objects store the track documents using our album url as the image for them
// as well as their references in the album document via javascript push 
// We store the following object in the array of track references within our album document 
// {trackId: "", trackName: "", trackUrl: "", trackImageUrl: "", trackInspiredArtists: ""}
//
// Route add-tracks-to-existing-album req.body : {"albumId": , "trackObjects": [{
// "trackName": '', "trackInspiredArtists": ["",""]}]} req.files {trackAudios}
// First we do mongoose.find(albumID) and inside the callback 
// we use the s3 service to upload the track files which returns an array of urls 
// then we loop through the array of track objects and use mongoose to store all their corresponding documents 
// then we store the track documents 
// then we store {"trackId", "trackName", "trackUrl", "trackImageUrl", "trackInspiredArtists" (we have this url in the album document and access it within the find callback)}
// via push in memory https://stackoverflow.com/questions/33049707/push-items-into-mongo-array-via-mongoose
//
// Add existing track to album req.body : {trackId: "", albumId: ""} we have to change the undercover image of the track
// Delete tracks from album req.body : {albumId, trackId} // We remove the track and the album reference to it https://stackoverflow.com/questions/38011068/how-to-remove-object-taking-into-account-references-in-mongoose-node-js
// https://stackoverflow.com/questions/19786075/mongoose-deleting-pull-a-document-within-an-array-does-not-work-with-objectid
// Delete tracks req.body : trackId
