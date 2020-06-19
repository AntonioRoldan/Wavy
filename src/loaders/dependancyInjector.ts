/*  
  Copyright (c) 2020 Antonio Roldan 
  All rights reserved 
*/

import { Container } from 'typedi'
import config from '../config'


export default ({ mongoConnection, models}: { mongoConnection: any, models: {name: string, model: any}[]}) => {
  models.forEach(m => {
    Container.set(m.name, m.model)
  })
}