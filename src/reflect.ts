/**
 * This limited reflect-metadata (and not 100% accurate)
 * implementation supports only features required for
 * @prostojs/mate
 * 
 * It's using js-objects to store metadata and not weak-map
 * to keep it simple (might be not the most optimal way)
 * 
 * In order to switch to original 'reflect-metadata' just
 * include "require('reflect-metadata')" line before
 * any imports from @prostojs/mate
 * 
 * From the user's perspective the behaviour of
 * getOwnMetadata, defineMetadata, metadata must
 * feel the same.
 * 
 * Docs to the original thing:
 * https://rbuckton.github.io/reflect-metadata/
 */
import { TFunction, TObject } from './types'
import { getConstructor } from './utils/helpers'

const classMetadata: Record<symbol, Record<symbol | string, unknown>> = {}
const paramMetadata: Record<symbol, Record<symbol | string, unknown>> = {}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const root = typeof global === 'object' ? global : typeof self === 'object' ? self : {}

function getMetaObject(target: TObject | TFunction, prop?: string | symbol): Record<symbol | string, unknown> {
    const isParam = typeof prop !== 'undefined'
    const metadata = isParam ? paramMetadata : classMetadata
    const targetKey = Symbol.for(getConstructor(target) as unknown as string)
    let meta = metadata[targetKey] = metadata[targetKey] || {}
    if (isParam) meta = (meta[prop] = meta[prop] || {}) as Record<string | symbol, unknown>
    return meta as typeof classMetadata
}

const _reflect = {
    getOwnMetadata(key: string | symbol, target: TObject | TFunction, prop?: string | symbol): unknown {
        return getMetaObject(target, prop)[key]
    },
    defineMetadata(key: string | symbol, data: unknown, target: TObject | TFunction, prop?: string | symbol): void {
        const meta = getMetaObject(target, prop)
        meta[key] = data
    },
    metadata(key: string | symbol, data: unknown): ClassDecorator & MethodDecorator & ParameterDecorator {
        return ((target: TObject, propKey?: string | symbol) => {
            Reflect.defineMetadata(key, data, target, propKey)
        }) as MethodDecorator & ClassDecorator & ParameterDecorator
    },
}

if (!root.Reflect) {
    root.Reflect = _reflect
} else {
    const funcs = [
        'getOwnMetadata',
        'defineMetadata',
        'metadata',
    ] as unknown as (keyof typeof Reflect)[]
    const target = root.Reflect as typeof Reflect
    let isOriginalReflectMetadata = true
    for (const func of funcs) {
        if (typeof target[func] !== 'function') {
            Object.defineProperty(target, func, { configurable: true, writable: true, value: _reflect[func] })
            isOriginalReflectMetadata = false
        }
    }
    // if (!isOriginalReflectMetadata) {
    //     warn('A limited \'reflect-metadata\' implementation is used. In case of any issues include original \'reflect-metadata\' package and require it before any @prostojs/mate import.')
    // }
}

export const Reflect = _reflect
