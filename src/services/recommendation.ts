/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

const User : Models.UserModel = require('../models/User')
const Track = require('../models/Track')
const Album = require('../models/Album')
const moment = require('moment')
// We are going to go functional for this

/* Music recommendation algorithm explaned 

*/
export const setUpRecommendationData = async (userId: string) => {
  const userHasNotListenedToAnythingYet = false 
  const user = await User.findById(userId) 
  const currentDate = new Date(Date.now())
  const lastDayDate = new Date(user.lastDayDate)
  const lastWeekDate = new Date(user.lastWeekDate)
  const lastMonthDate = new Date(user.lastMonthDate)
  var date = new Date(Date.now())
}

export const checkCurrentDay = (userHasNotListendToAnythingYet: boolean, user: any) => {
  // NOTE: We do not check if day before last day is empty because we don't have to transfer data from there to any other place
  // so we do not need to check if it's null 
  const lastDayDate = moment.utc(new Date(user.lastDayDate))
  const currentDate = moment.utc(new Date(Date.now()))
  if(currentDate.diff(lastDayDate, 'days') >= 1) {
    if(!user.currentDayListens) {
      if(!user.lastDayListens){
        userHasNotListendToAnythingYet = true 
        return 
      }
      // We transfer data from last Day listens to day before last day listens
      // return, last day listens and day before last day listens will be the same 
      // So the recommendation won't change 

    }
    if(!user.lastDayListens){
      // If last day listens is empty we know for sure that day before last day listens is also empty
      // We transfer data from current day listens to last day listens and empty current day listens 
      // before returning 
    }
    // We transfer data from last day listens to day before last day listens and from current day listens to last day listens
    // then we empty current day listens and return 
  }

}

export const checkCurrentWeek = (user: any) => {

}

export const checkCurrentMonth = (user: any) => {

}