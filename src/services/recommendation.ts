import { IUser, IUser } from "../interfaces/IUser";

/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

const User : Models.UserModel = require('../models/User')
const Track : Models.TrackModel = require('../models/Track')
const Album = require('../models/Album')
import mongoose from 'mongoose'
const moment = require('moment')
const recommendedSongsAmount = 60 
// We are going to go functional for this

/* Music recommendation algorithm explaned 

*/
export const getRecommendations = async (userId: string) => {
  var userHasNotListenedToAnythingYet = false 
  var firstWeekOfUsageHasNotPassed = false
  var firstMonthOfUsageHasNotPassed = false 
  var user = await User.findById(userId) 
  // We alter the user document to set up the data for the daily, weekly and monthly recommendation algorithm to run
  user = await checkCurrentDay(userHasNotListenedToAnythingYet, user) 
  user = await checkCurrentWeek(firstWeekOfUsageHasNotPassed, user)
  user = await checkCurrentMonth(firstMonthOfUsageHasNotPassed, user)

}

const dailyRecommendations = (user: IUser) => {
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
  })
}

const getRecommendedSongs = (user: IUser, oldArtistsObj: any, newArtistsObj: any): Promise<any> => {
  return new Promise( async (resolve, reject) => {
    var extraSongsAmount = 0 /* When we get rid of decimals in our calculations 
    // we will be an added amount of decimals short of reaching 
    our desired amount of 60 recommended songs 
    Depending on whether we have more new artists than old or viceversa 
    We will choose extra songs from one group or the other*/
    const mergedArtistsObjects = oldArtistsObj.songsAmountArray.concat(newArtistsObj.songsAmountArray)
    var recommendedTracks = mergedArtistsObjects.map( async (obj: any) => { 
      const tracks = await Track.find({inspiredArtists: obj.inspiredArtists}) // TODO: Check if this works 
      extraSongsAmount += tracks.length < obj.amount ? obj.amount - tracks.length : extraSongsAmount
      if(tracks.length < obj.amount) { // If the artist does not have an enough amount of songs to satisfy our criteria 
        extraSongsAmount += obj.amount - tracks.length 
      }
      return {id: obj.id, tracks: tracks}
    }) 
    // Get the extra songs 
    // The extra songs come from the added decimals that we removed when fixing our floats from percentage calculations
    // with respect to sixty and songs that were lacking in our search for a desired amount of songs per artist
    // Now we are going to check if our user has changed his listening patterns towards new artists or not
    // In order to get our extra songs from new artists or older artists
  })
}

const getExtraSongs = (extraSongsAmount: number, newArtistsObj: any, oldArtistsObj: any): Promise<any> => { 
  return new Promise( async (resolve, reject) => {
    if(newArtistsObj){ 
      if(oldArtistsObj.songsAmount + newArtistsObj.songsAmount < 60) {
        extraSongsAmount = 60 - oldArtistsObj.songsAmount + newArtistsObj.songsAmount 
      }
      // Now we extract the respective amount of songs for each artist, accounting for the inspiredArtists variable
    } else if(oldArtistsObj.songsAmount < 60) {
      extraSongsAmount = 60 - oldArtistsObj.songsAmount
    }
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
    if(currentDate.diff(lastMonthDate, 'days') >= 7) {
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