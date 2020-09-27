import { IUser } from "../interfaces/IUser";

/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

const User : Models.UserModel = require('../models/User')
const Track : Models.TrackModel = require('../models/Track')
const moment = require('moment')
const recommendedSongsAmount = 40
// We are going to go functional for this

/* Music recommendation algorithm explaned 

*/

function shuffle(array: any[]) {
  //  Fisher-Yates (aka Knuth) shuffle algorithm
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
export const getRecommendations = async (userId: string) => {
  var userHasNotListenedToAnythingYet = false 
  var firstWeekOfUsageHasNotPassed = false
  var firstMonthOfUsageHasNotPassed = false 
  var dailyRecommendations: any[][] = []
  var user = await User.findById(userId) 
  // We alter the user document to set up the data for the daily, weekly and monthly recommendation algorithm to run
  user = await checkCurrentDay(userHasNotListenedToAnythingYet, user) 
  user = await checkCurrentWeek(firstWeekOfUsageHasNotPassed, user)
  user = await checkCurrentMonth(firstMonthOfUsageHasNotPassed, user)
  dailyRecommendations = await getDailyRecommendations(user)
}

const getDailyRecommendations = (user: IUser): Promise<any[][]>=> {
  return new Promise( async (resolve, reject) => {
    // First we check for artists on the last day that are not in the day before the last day array (newly discovered artists)
    // Why do we split artists into newly discovered and old artists? 
    // 
    const idsArtistsListenedOnDayBeforeLastDay = user.dayBeforeLastDayListens.map(item => item.id)
    const oldArtistsObj = await calculateOldArtistsPercentages(idsArtistsListenedOnDayBeforeLastDay, user)
    const idsnewArtistsListenedOnLastDay = user.lastDayListens.map(item => item.id).filter((id: any)=> idsArtistsListenedOnDayBeforeLastDay.indexOf(id) < 0)
    const newArtistsObj = await calculateNewArtistsPercentages(idsnewArtistsListenedOnLastDay, user)
    const totalPercentageSum = newArtistsObj.percentageSum + oldArtistsObj.percentageSum
    const newArtistsSongsObj = await calculateArtistsSongsAmount(totalPercentageSum, newArtistsObj)
    const oldArtistsSongsObj = await calculateArtistsSongsAmount(totalPercentageSum, oldArtistsObj)
    const recommendedSongsPlaylists = await getRecommendedSongs(user, oldArtistsSongsObj, newArtistsSongsObj)
    resolve(recommendedSongsPlaylists)
  })
}

const getRecommendedSongs = (user: IUser, oldArtistsObj: any, newArtistsObj: any): Promise<any> => {
  return new Promise( async (resolve, reject) => {
    var extraSongsAmount = 0 /* When we get rid of decimals in our calculations 
    // we will be an added amount of decimals short of reaching 
    our desired amount of 60 recommended songs 
    Depending on whether we have more new artists than old or viceversa 
    We will choose extra songs from one group or the other*/
    var recommendedTracks: any[] = []
    var extraTracks: any[] = []
    var playlists: any[] = [] // Two dimensional array containing arrays with tracks
    var playlist: any[] = [] // Array chunk
    const playlistSize = 10
    var thresholdIndex = playlistSize - 1 
    const mergedArtistsObjects = oldArtistsObj.songsAmountArray.concat(newArtistsObj.songsAmountArray)
    var artistsSelectedTracks = mergedArtistsObjects.map( async (obj: any) => { 
      const tracks = await Track.find({authorId: obj.id, inspiredArtists: {$in: obj.inspiredArtists}}) // TODO: Check if this works 
      extraSongsAmount += tracks.length < obj.songsAmount ? obj.songsAmount - tracks.length : extraSongsAmount
      // If the artist does not have an enough amount of songs to satisfy our criteria 
      return {id: obj.id, songsAmount: obj.songsAmount, tracks: tracks}
    }) // We add all the posible tracks without factoring in the amount of songs by a specific artist so we can fill the extra songs array
    extraTracks = await getExtraSongs(extraSongsAmount, artistsSelectedTracks, newArtistsObj, oldArtistsObj)
    recommendedTracks = artistsSelectedTracks.flatMap((artist: any) => {
      var canSelectAmount = 0 // We get the amount of possible candidates f we do not have our desired amount of songs matching our criteria 
      artist.tracks = artist.tracks.filter((track: any) => {
        !extraTracks.includes(track)
      })
      canSelectAmount = artist.songsAmount > artist.tracks.length ? artist.tracks.length : artist.songsAmount
      artist.tracks.sort(() => 0.5 - Math.random()).slice(0, canSelectAmount) // We select our desired amount of random songs from the array
    }) // We make sure that the recommended tracks do not belong to extraTracks
    recommendedTracks.concat(extraTracks)
    shuffle(recommendedTracks)
    recommendedTracks.forEach((value, index) => {
      if(index == thresholdIndex) { 
        playlists.push(playlist)
        playlist = []
        thresholdIndex += playlistSize // We set the point at which we'll get our next chunk
      }
      playlist.push(value)
    })
    console.log('playlists :', playlists)
    resolve(playlists)
  })
}

const getExtraSongs = (extraSongsAmount: number, artistsSelectedTracks: any[], newArtistsObj: any, oldArtistsObj: any): Promise<any[]> => { 
  return new Promise( async (resolve, reject) => {
    var extraTracks: any[] = []
    var inspiredArtists: any[] = []
    if(newArtistsObj){ 
      if(oldArtistsObj.songsAmount + newArtistsObj.songsAmount < 60) {
        extraSongsAmount = 60 - oldArtistsObj.songsAmount + newArtistsObj.songsAmount 
      }
      if(newArtistsObj.songsAmount >= oldArtistsObj.songsAmount) {
        extraTracks = artistsSelectedTracks.map(artist => {
          const isNewArtist = newArtistsObj.songAmountArray.filter((obj: any) => { // If the artist is a new artist
            obj.id === artist.id
          })[0]
          if(isNewArtist){
            inspiredArtists.concat(isNewArtist.inspiredArtists)
            extraSongsAmount -= 1 
            return artist.tracks[Math.random() * (artist.tracks.length - 1 - 0) + 0]
          }
        })
        if(extraSongsAmount){
          const tracks = await Track.find({inspiredArtists: { $in: inspiredArtists}})
          while(extraSongsAmount){
            extraSongsAmount -= 1
            extraTracks.push(tracks[Math.random() * (tracks.length - 1 - 0) + 0])
          }
        }
      } else {
        extraTracks = artistsSelectedTracks.map(artist => {
          const isOldArtist = oldArtistsObj.songAmountArray.filter((obj: any) => { // If the artist is a new artist
            obj.id === artist.id
          })[0]
          if(isOldArtist){
            inspiredArtists.concat(isOldArtist.inspiredArtists)
            extraSongsAmount -= 1 
            return artist.tracks[Math.random() * (artist.tracks.length - 1 - 0) + 0]
          }
        })
        if(extraSongsAmount){
          const tracks = await Track.find({inspiredArtists: {$in: inspiredArtists}})
          while(extraSongsAmount){
            extraSongsAmount -= 1
            extraTracks.push(tracks[Math.random() * (tracks.length - 1 - 0) + 0])
          }
        }
      }
    } else if(oldArtistsObj.songsAmount < 60) {
      extraSongsAmount = 60 - oldArtistsObj.songsAmount
      extraTracks = artistsSelectedTracks.map(artist => {
        const isOldArtist = oldArtistsObj.songAmountArray.filter((obj: any) => { // If the artist is a new artist
          obj.id === artist.id
        })[0]
        if(isOldArtist){
          inspiredArtists.concat(isOldArtist.inspiredArtists)
          extraSongsAmount -= 1 
          return artist.tracks[Math.random() * (artist.tracks.length - 1 - 0) + 0]
        }
      })
      if(extraSongsAmount){
        const tracks = await Track.find({inspiredArtists: {$in: inspiredArtists}})
        while(extraSongsAmount){
          extraSongsAmount -= 1
          extraTracks.push(tracks[Math.random() * (tracks.length - 1 - 0) + 0])
        }
      }
    }
    resolve(extraTracks)
  })
}

const calculateNewArtistsPercentages = (idsNewArtistsListenedOnLastDay: any, user: IUser): Promise<any> => {
  return new Promise( async (resolve, reject) => {
    const newArtistsListenedOnLastDay = idsNewArtistsListenedOnLastDay.map((id: any) => user.lastDayListens.filter(obj => obj.id === id)[0])
    if(newArtistsListenedOnLastDay) {
      var percentagesOfRepeatedListensNew = newArtistsListenedOnLastDay.map((obj: any) => { return {id: obj.id, inspiredArtists: obj.inspiredArtists, percentage: Number((Number(obj.numberofrepeatedlistens) / Number(obj.numberoflistens) + Number(obj.numberofrepeatedtracks) / Number(obj.numberoftrackslistened)).toFixed())}})
      const percentageSumNew = percentagesOfRepeatedListensNew.map((obj: any) => obj.percentage).reduce((prev: any, cur: any) => prev + cur)
      resolve({percentageSum: percentageSumNew, percentagesOfRepeatedListens: percentagesOfRepeatedListensNew})      
    }
    resolve({})
  })
}

const calculateOldArtistsPercentages = (idsOldArtistsListened: any, user: IUser): Promise<any> => {
  return new Promise( async (resolve, reject) => {
    const oldArtistsListened = idsOldArtistsListened.map((id: any) => user.dayBeforeLastDayListens.filter(obj => obj.id === id)[0])
    var percentagesOfRepeatedListensOld = oldArtistsListened.map((obj: any) => { return {id: obj.id, inspiredArtists: obj.inspiredArtists, percentage: Number((Number(obj.numberofrepeatedlistens) / Number(obj.numberoflistens) + Number(obj.numberofrepeatedtracks) / Number(obj.numberoftrackslistened)).toFixed())}})
    const percentageSumNew = percentagesOfRepeatedListensOld.map((obj: any) => obj.percentage).reduce((prev: any, cur: any) => prev + cur)
    resolve({percentageSum: percentageSumNew, percentagesOfRepeatedListens: percentagesOfRepeatedListensOld})      
  })
}

const calculateArtistsSongsAmount = (totalPercentageSum: number, artistsObj: any): Promise<any> => { 
  return new Promise( async (resolve, reject) => {
    /* 
    It takes a new artists object or an old artists object with an array of *percentages and the percentage sum of all objects in the array
    Returns an object with two fields: 
    -An array of objects containing an artist id 
    and how many songs by that artist we will select. 
    -The total amount of songs that will be played 
    * Check the exact definition of percentage in the context of this algorithm at the top of the file 
    */
    const amountOfArtistsSongsToRecommendArray = artistsObj.percentagesOfRepeatedListens.map((obj: any) => { return {id: obj.id, inspiredArtists: obj.inspiredArtists, amount: Number(((obj.percentage / totalPercentageSum * 100) * recommendedSongsAmount / 100).toFixed())}})
    const amountOfArtistsSongsToRecommend = amountOfArtistsSongsToRecommendArray.map((obj: any) => obj.percentage).reduce((prev: any, cur: any) => prev + cur)
    resolve({songsAmount: amountOfArtistsSongsToRecommend, songsAmountArray: amountOfArtistsSongsToRecommendArray})
  })
}


//////// DATES AND DATA SET-UP METHODS ////////////////

//////// DAILY DATE AND DATA SET-UP 
const checkCurrentDay = (userHasNotListendToAnythingYet: boolean, user: IUser): Promise<IUser> => {
  return new Promise( async (resolve, reject) => {
  const lastDayDate = moment.utc(new Date(user.lastDayDate))
  const currentDate = moment.utc(new Date(Date.now()))
  if(currentDate.diff(lastDayDate, 'days') >= 1) {
    if(!user.currentDayListens) {
      if(!user.lastDayListens){
        userHasNotListendToAnythingYet = true 
        resolve(user)
      }
      if(!user.dayBeforeLastDayListens){
        /* We transfer data from last Day listens to day before last day listens
        return, last day listens and day before last day listens will be the same 
        in this case */
        user.dayBeforeLastDayListens = user.lastDayListens
        user = await user.save()
        resolve(user)
      }
     /*
      We do nothing and return 
      This is to avoid the day before last day listens to be filled by last day listens 
      data in which case, without any data in current day listens we may spoil the 
      recommendation engine because last day listens and day before last day listens would be the same unaccidentally
      */   
      resolve(user)
    }
    if(!user.lastDayListens){
      /* If last day listens is empty we know for sure that day before last day listens is also empty
      We transfer data from current day listens to last day listens and empty current day listens 
      before returning 
      */
      user.lastDayListens = user.currentDayListens
      user.dayBeforeLastDayListens = user.lastDayListens // They both will be the same in this case so the recommendation engine will work after one day of usage
      user.currentDayListens = null
      user.lastDayDate = currentDate
      user = await user.save()
      resolve(user)
    }
    /* 
    We transfer data from last day listens to day before last day listens and from current day listens to last day listens
    then we empty current day listens and return 
    */
    user.dayBeforeLastDayListens = user.lastDayListens
    user.lastDayListens = user.currentDayListens
    user.currentDayListens = null
    user.lastDayDate = currentDate
    user = await user.save()
    resolve(user)
  }
  })
}

/////// WEEKLY DATE AND DATA SET-UP 

const checkCurrentWeek = (userHasNotListenedToAnythingYet: boolean, user: IUser): Promise<IUser> => {
  return new Promise( async (resolve, reject) => {
    const lastWeekDate = moment.utc(new Date(user.lastWeekDate))
    const currentDate = moment.utc(new Date(Date.now()))
    if(currentDate.diff(lastWeekDate, 'days') >= 7) {
      if(!user.currentWeekListens) {
        if(!user.lastWeekListens){
          userHasNotListenedToAnythingYet = true 
          resolve(user)
        }
        if(!user.weekBeforeLastWeekListens){
          /* We transfer data from last Day listens to day before last day listens
          return, last day listens and day before last day listens will be the same 
          in this case */
          user.weekBeforeLastWeekListens = user.lastWeekListens
          user = await user.save()
          resolve(user)
        }
        /*
        We do nothing and return 
        This is to avoid the day before last day listens to be filled by last day listens 
        data in which case, without any data in current day listens we may spoil the 
        recommendation engine because last day listens and day before last day listens would be the same unaccidentally
        */
        resolve(user)
      }
      if(!user.lastWeekListens){
        /* If last day listens is empty we know for sure that day before last day listens is also empty
        We transfer data from current day listens to last day listens and empty current day listens 
        before returning 
        */
        user.lastWeekListens = user.currentWeekListens
        user.weekBeforeLastWeekListens = user.lastWeekListens // They both will be the same in this case so the recommendation engine will work after one day of usage
        user.currentWeekListens = null
        user.lastWeekDate = currentDate
        user = await user.save()
        resolve(user)
      }
      /* 
        We transfer data from last day listens to day before last day listens and from current day listens to last day listens
        then we empty current day listens and return 
       */
      user.weekBeforeLastWeekListens = user.lastWeekListens
      user.lastWeekListens = user.currentWeekListens
      user.currentWeekListens = null
      user.lastWeekDate = currentDate
      user = await user.save()
      resolve(user)
    }
    })
}

////////// MONTHLY DATE AND DATA SET-UP 

const checkCurrentMonth = (firstMonthOfUsageHasNotPassed: boolean, user: IUser): Promise<IUser> => {
  return new Promise( async (resolve, reject) => {
    const lastMonthDate = moment.utc(new Date(user.lastMonthDate))
    const currentDate = moment.utc(new Date(Date.now()))
    if(currentDate.diff(lastMonthDate, 'days') >= 30) {
      if(!user.currentMonthListens) {
        if(!user.lastMonthListens){
          firstMonthOfUsageHasNotPassed = true 
          resolve(user)
        }
        if(!user.monthBeforeLastMonthListens){
          /* We transfer data from last Day listens to day before last day listens
          return, last day listens and day before last day listens will be the same 
          in this case */
          user.monthBeforeLastMonthListens = user.lastMonthListens
          user = await user.save()
          resolve(user)
        }
         /*
        We do nothing and return 
        This is to avoid the day before last day listens to be filled by last day listens 
        data in which case, without any data in current day listens we may spoil the 
        recommendation engine because last day listens and day before last day listens would be the same unaccidentally
        */
        resolve(user)
      }
      if(!user.lastMonthListens){
        /* If last day listens is empty we know for sure that day before last day listens is also empty
        We transfer data from current day listens to last day listens and empty current day listens 
        before returning 
        */
        user.lastMonthListens = user.currentMonthListens
        user.monthBeforeLastMonthListens = user.lastMonthListens // They both will be the same in this case so the recommendation engine will work after one day of usage
        user.currentMonthListens = null
        user.lastMonthDate = currentDate
        user = await user.save()
        resolve(user)
      }
      /* 
        We transfer data from last day listens to day before last day listens and from current day listens to last day listens
        then we empty current day listens and return 
       */
      user.monthBeforeLastMonthListens = user.lastMonthListens
      user.lastMonthListens = user.currentMonthListens
      user.currentMonthListens = null
      user.lastMonthDate = currentDate
      user = await user.save()
      resolve(user)
    }
    })
}