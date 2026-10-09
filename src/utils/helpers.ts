import { TAny, TClassConstructor, TFunction } from '../types'

// `Object.hasOwn` semantics (both go through [[GetOwnProperty]], so proxy
// `getOwnPropertyDescriptor` traps fire identically) without allocating a
// property descriptor, and without requiring the ES2022 lib/runtime.
const hasOwn = Object.prototype.hasOwnProperty

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
        hasOwn.call(v, 'prototype') &&
        !hasOwn.call(v, 'caller') &&
        !!v.name
    )
}
