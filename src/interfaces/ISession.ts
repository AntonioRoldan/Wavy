/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/


import { Document } from 'mongoose'
export interface ISession extends Document {
  email: string

  APIkey: string

  expire_at: Date
 
}