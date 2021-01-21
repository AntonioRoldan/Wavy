/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */



import { Document } from 'mongoose'
export interface ISession extends Document {
  email: string

  APIkey: string

  expire_at: Date
 
}