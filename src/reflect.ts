/**
 * This limited reflect-metadata (and not 100% accurate)
 * implementation supports only features required for
 * @prostojs/mate
 *
 * It's using WeakMaps to store metadata, which allows
 * garbage collection of unused class references
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

let classMetadata = new WeakMap<object, Record<string, unknown>>()
let paramMetadata = new WeakMap<object, Record<string, unknown>>()

const root =
    typeof global === 'object' ? global : typeof self === 'object' ? self : {}

function getMetaObject(
    target: TObject | TFunction,
    prop?: string | symbol,
): Record<symbol | string, unknown> {
    const isParam = typeof prop !== 'undefined'
    const metadata = isParam ? paramMetadata : classMetadata
    const targetKey = getConstructor(target)
    let meta = metadata.get(targetKey)
    if (!meta) {
        meta = {} as Record<string, unknown>
        metadata.set(targetKey, meta)
    }
    if (isParam) {
        meta = (meta[prop as keyof typeof meta] =
            meta[prop as keyof typeof meta] || {}) as Record<
            string | symbol,
            unknown
        >
    }
    return meta
}

const _reflect = {
    getOwnMetadata(
        key: string | symbol,
        target: TObject | TFunction,
        prop?: string | symbol,
    ): unknown {
        return getMetaObject(target, prop)[key]
    },
    defineMetadata(
        key: string | symbol,
        data: unknown,
        target: TObject | TFunction,
        prop?: string | symbol,
    ): void {
        const meta = getMetaObject(target, prop)
        meta[key] = data
    },
    metadata(
        key: string | symbol,
        data: unknown,
    ): ClassDecorator & MethodDecorator & ParameterDecorator {
        return ((target: TObject, propKey?: string | symbol) => {
            Reflect.defineMetadata(key, data, target, propKey)
        }) as MethodDecorator & ClassDecorator & ParameterDecorator
    },
    /**
     * Cleanup function to reset metadata
     *
     * It is usefull in dev mode when server restarts
     */
    _cleanup: (() => {
        classMetadata = new WeakMap<object, Record<string, unknown>>()
        paramMetadata = new WeakMap<object, Record<string, unknown>>()
    }) as (() => void) | undefined,
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
    for (const func of funcs) {
        if (typeof target[func] !== 'function') {
            Object.defineProperty(target, func, {
                configurable: true,
                writable: true,
                value: _reflect[func],
            })
        }
    }
}

export const Reflect = _reflect
