/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */

import { Container } from 'typedi'


export default ({ mongoConnection, models}: { mongoConnection: any, models: {name: string, model: any}[]}) => {
  models.forEach(m => {
    Container.set(m.name, m.model)
  })
}