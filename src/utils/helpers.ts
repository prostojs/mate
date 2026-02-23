import { TAny, TClassConstructor, TFunction } from '../types'

export function getConstructor<T = TAny>(instance: T): TFunction {
    return isConstructor(instance)
        ? instance
        : (instance as TAny).constructor
          ? (instance as TAny).constructor
          : Object.getPrototypeOf(instance).constructor
}

export function isConstructor<T = TAny>(v: T): v is T & TClassConstructor {
    return (
        typeof v === 'function' &&
        Object.getOwnPropertyDescriptor(v, 'prototype') !== undefined &&
        Object.getOwnPropertyDescriptor(v, 'caller') === undefined &&
        !!v.name
    )
}
