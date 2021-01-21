/// <reference types="express" />

/**
 * This type definition augments existing definition
 * from @types/express-flash
 */
/*
 Copyright (C) Wavy Ltd
 Unauthorized copying of this file, via any medium is strictly prohibited
 Proprietary and confidential
 */

declare namespace Express {
  export interface Request {
    flash(event: string, message: any): any
  }
}

interface Flash {
  flash(type: string, message: any): void
}

declare module 'express-flash'
