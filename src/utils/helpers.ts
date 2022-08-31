import { TAny, TClassConstructor, TFunction, TObject } from '../types'

export function getConstructor<T = TObject>(instance: T): TFunction {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return Object.getPrototypeOf(instance).constructor
}

export function isConstructor<T = TAny>(v: T): v is T & TClassConstructor {
    return typeof v === 'function' && Object.getOwnPropertyNames(v).includes('prototype') && !Object.getOwnPropertyNames(v).includes('caller') && !!v.name
}
