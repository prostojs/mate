import { describe, it, expect } from 'vitest'
import { Mate } from '../mate'
import {
    MateTestClass,
    MateTestClass2,
    MateTestClass3,
    mate,
    MateTestClass4,
    MateTestParentClass,
    MateTestChildClass,
    MateTestChildClass2,
} from './mate.artifacts'
import { getConstructor, isConstructor } from '../utils/helpers'

describe('Mate', () => {
    const classMeta = mate.read(MateTestClass)
    const propMeta = mate.read(MateTestClass, 'prop1')
    const emptyMeta = mate.read(MateTestClass, 'empty')
    const methodMeta = mate.read(MateTestClass, 'test')
    const propertyMeta = mate.read(MateTestClass, 'param')
    const viaCBMeta = mate.read(MateTestClass, 'viaCB')
    const classMeta2 = mate.read(MateTestClass2)
    const methodMeta2 = mate.read(MateTestClass2, 'test')
    const classMeta3 = mate.read(MateTestClass3)
    const methodMeta3test = mate.read(MateTestClass3, 'test')
    const methodMeta3test2 = mate.read(MateTestClass3, 'test2')

    it('must process class meta', () => {
        expect(classMeta).toEqual({
            multi: 'for CLASS',
            class: 'class value',
            classArray: ['class value 1', 'class value 2'],
            properties: ['prop1', 'prop2', 'param'],
            fromProperty: ['toClass'],
            fromPropertyCb: ['param'],
            params: [
                {
                    param: 'param a',
                    paramArray: ['param a1', 'param a2'],
                    type: String,
                },
            ],
        })
        expect(propMeta).toEqual({
            multi: 'for PROP',
            prop1D: 'p1val',
            type: String,
            params: undefined,
        })
        expect(emptyMeta).toEqual({
            empty: 'test',
            params: [],
            returnType: undefined,
            type: Function,
        })
    })
    it('must process method meta', () => {
        expect(methodMeta).toEqual({
            multi: 'for METHOD',
            method: 'method value',
            methodArray: ['method value1', 'method value2'],
            returnType: String,
            type: Function,
            params: [
                {
                    multi: 'for PARAM',
                    param: 'param b',
                    paramArray: ['param b1', 'param b2'],
                    type: String,
                },
            ],
        })
    })
    it('must process property meta', () => {
        console.log({ propertyMeta })
        expect(propertyMeta).toEqual({
            property: 'property value',
            type: String,
        })

        class A {
            @mate.decorate('propS', 'propS data')
            s: string = ''
        }
        expect(mate.read(A, 's')).toEqual({
            params: undefined,
            propS: 'propS data',
            returnType: undefined,
            type: String,
        })
    })
    it('must properly add data metadata provided via callback', () => {
        expect(viaCBMeta).toEqual({
            fld1: 'test1',
            fld2: 'test2',
            fld3: 'test3',
            fld4: 'test4',
            method: 'method value',
            method2: 'method value2',
            returnType: undefined,
            type: Function,
            params: [
                {
                    param1: 'param c1',
                    param2: 'param c2',
                    cb1: 'ok',
                    cb2: 'ok',
                    d1: 'v1',
                    d2: 'v2',
                    d3: 'v3',
                    type: String,
                },
            ],
        })
    })
    it('must process mate-apply meta', () => {
        expect(classMeta2).toEqual({
            d1: 'v1',
            d2: 'v2',
            d3: 'v3',
            arg1: { i: 0, key: 'test' },
            params: [{ type: String }],
        })
    })
    it('must process solo method meta', () => {
        expect(methodMeta2).toEqual({
            d1: 'v1',
            d2: 'v2',
            d3: 'v3',
            method: 'method value',
            params: [{ type: Number }, { type: Boolean }],
            returnType: undefined,
            type: Function,
        })
    })
    it('must read metadata by class instance', () => {
        expect(methodMeta2).toEqual(mate.read(new MateTestClass2('1'), 'test'))
    })
    it('must read inherited class metadata', () => {
        expect(classMeta3).toEqual({
            d1: 'v1',
            d2: 'v2',
            d3: 'v3',
            inherit: true,
            arg1: { i: 0, key: 'test' },
            params: [],
        })
    })
    it('must read inherited method metadata', () => {
        expect(methodMeta3test).toEqual({
            d1: 'v1',
            d2: 'v2',
            d3: 'v3',
            method: 'method value',
            params: [{ type: Number }, { type: Boolean }],
            returnType: undefined,
            type: Function,
        })
    })
    it('must read own method meta', () => {
        expect(methodMeta3test2).toEqual({
            method: 'method test2',
            params: [],
            returnType: undefined,
            type: Function,
        })
        expect(mate.read(MateTestClass2, 'toOverwriteMeta')).toEqual({
            method: 'method from class 2',
            method2: 'method from class 2',
            params: [
                {
                    type: String,
                },
            ],
            returnType: undefined,
            type: Function,
        })
        expect(mate.read(MateTestClass3, 'toOverwriteMeta')).toEqual({
            method: 'method from class 2',
            method2: 'method from class 3',
            params: [],
            inherit: true,
            returnType: undefined,
            type: Function,
        })
    })

    it('must not inherit when condition for inheritance is false', () => {
        const classMeta = mate.read(MateTestClass4)
        const methodMetaTest = mate.read(MateTestClass4, 'test')
        const methodMetaTest2 = mate.read(MateTestClass4, 'test2')
        const methodMetaTest3 = mate.read(MateTestClass4, 'toOverwriteMeta')

        expect(classMeta).toEqual({
            inherit: false,
            params: [],
        })
        expect(methodMetaTest).toBeUndefined()
        expect(methodMetaTest2).toEqual({
            method: 'method test2 4',
            params: [],
            returnType: undefined,
            type: Function,
        })
        expect(methodMetaTest3).toEqual({
            method2: 'method from class 3 4',
            params: [],
            returnType: undefined,
            type: Function,
        })
    })
})

describe('helpers/getConstructor', () => {
    it('must return constructor of an instance', () => {
        expect(getConstructor(mate)).toBe(Mate)
    })
})

describe('helpers/isConstructor', () => {
    it('must return true if class constructor passed', () => {
        expect(isConstructor(Mate)).toBe(true)
    })
    it('must return false if arrow function passed', () => {
        const fn = () => {
            /** */
        }
        expect(isConstructor(fn)).toBe(false)
    })
    it('must return false if anon function passed', () => {
        expect(
            isConstructor(function () {
                /** */
            }),
        ).toBe(false)
    })
    it('must return false if arrow function passed 2', () => {
        expect(
            isConstructor(() => {
                /** */
            }),
        ).toBe(false)
    })
    // ? not possible to distinguish regular named fn from class constructor
    // it('must return false if named function passed', () => {
    //     function fn () {/** */}
    //     expect(isConstructor(fn)).toBe(false)
    // })
    // it('must return false if anon function as const passed', () => {
    //     const fn = function(){/** */}
    //     expect(isConstructor(fn)).toBe(false)
    // })

    // Reference: the original descriptor-allocating implementation. The
    // hasOwnProperty-based one must agree with it on every input.
    const isConstructorRef = (v: unknown) =>
        typeof v === 'function' &&
        Object.getOwnPropertyDescriptor(v, 'prototype') !== undefined &&
        Object.getOwnPropertyDescriptor(v, 'caller') === undefined &&
        !!v.name
    class Named {
        m() {
            /** */
        }
    }
    const anonClass = (() => class {})()
    Object.defineProperty(anonClass, 'name', { value: '' })
    // eslint-disable-next-line no-new-func
    const sloppyFn = new Function('return function sloppy() {}')() as () => void
    function namedFn() {
        /** */
    }
    const cases: [string, unknown, boolean][] = [
        ['class', Named, true],
        ['anonymous class', anonClass, false],
        ['named function (strict)', namedFn, true],
        ['named function (sloppy)', sloppyFn, false],
        ['arrow function', () => undefined, false],
        ['async function', async function af() {}, false],
        ['generator function', function* gf() {}, true],
        ['method shorthand', { m() {} }.m, false],
        ['bound function', namedFn.bind(null), false],
        ['bound class', Named.bind(null), false],
        ['proxy of class', new Proxy(Named, {}), true],
        ['proxy of arrow', new Proxy(() => undefined, {}), false],
        ['Function', Function, true],
        ['plain object', {}, false],
        ['instance', new Named(), false],
        ['class prototype object', Named.prototype, false],
        ['Object.prototype', Object.prototype, false],
        ['null-prototype object', Object.create(null), false],
        ['null', null, false],
        ['undefined', undefined, false],
        ['string', 'Named', false],
    ]
    it('anonymous class has an empty name (test precondition)', () => {
        expect(anonClass.name).toBe('')
    })
    for (const [label, value, expected] of cases) {
        it(`${label} -> ${expected} (same as reference)`, () => {
            expect(isConstructor(value)).toBe(expected)
            expect(isConstructor(value)).toBe(isConstructorRef(value))
        })
    }
    it('fires proxy getOwnPropertyDescriptor traps exactly like the reference', () => {
        const traced = () => {
            const seen: PropertyKey[] = []
            const p = new Proxy(Named, {
                getOwnPropertyDescriptor(t, k) {
                    seen.push(k)
                    return Reflect.getOwnPropertyDescriptor(t, k)
                },
            })
            return { p, seen }
        }
        const a = traced()
        const b = traced()
        expect(isConstructor(a.p)).toBe(isConstructorRef(b.p))
        expect(a.seen).toEqual(['prototype', 'caller'])
        expect(a.seen).toEqual(b.seen)
    })
    it('honours a proxy that hides prototype / reports caller', () => {
        const noProto = new Proxy(Named, {
            getOwnPropertyDescriptor: (t, k) =>
                k === 'prototype'
                    ? undefined
                    : Reflect.getOwnPropertyDescriptor(t, k),
            // prototype is non-configurable on the target, so hiding it must
            // throw (proxy invariant) — in both implementations
        })
        expect(() => isConstructor(noProto)).toThrow(TypeError)
        expect(() => isConstructorRef(noProto)).toThrow(TypeError)
        const withCaller = new Proxy(Named, {
            getOwnPropertyDescriptor: (t, k) =>
                k === 'caller'
                    ? {
                          value: null,
                          configurable: true,
                          writable: false,
                          enumerable: false,
                      }
                    : Reflect.getOwnPropertyDescriptor(t, k),
        })
        expect(isConstructor(withCaller)).toBe(isConstructorRef(withCaller))
    })
})

describe('Mate.read cache', () => {
    const fresh = () =>
        new Mate<
            { tag?: string },
            { params: { type?: Function; tag?: string }[]; tag?: string }
        >('read-cache-' + Math.random())
    const desc = (C: { prototype: object }, k: string) =>
        Object.getOwnPropertyDescriptor(C.prototype, k) as PropertyDescriptor

    it('returns the same cached object for class, instance and repeated reads', () => {
        const m = fresh()
        class A {
            h() {
                /** */
            }
        }
        m.decorate('tag', 'cls')(A)
        m.decorate('tag', 'h')(A.prototype, 'h', desc(A, 'h'))
        const viaInstance = m.read(new A(), 'h')
        const viaClass = m.read(A, 'h')
        expect(viaClass?.tag).toBe('h')
        expect(viaInstance).toBe(viaClass)
        expect(m.read(A, 'h')).toBe(viaClass)
        expect(m.read(A)?.tag).toBe('cls')
        expect(m.read(A)).toBe(m.read(new A()))
    })

    it('caches undefined results and invalidates on set', () => {
        const m = fresh()
        class A {
            h() {
                /** */
            }
        }
        expect(m.read(A, 'h')).toBeUndefined()
        expect(m.read(A, 'h')).toBeUndefined()
        m.decorate('tag', 'late')(A.prototype, 'h', desc(A, 'h'))
        expect(m.read(A, 'h')?.tag).toBe('late')
    })

    it('keeps anonymous-class semantics regardless of read order', () => {
        // An anonymous class fails isConstructor, so reading it directly
        // resolves to Function, while its instances resolve to the class.
        const m = fresh()
        const Anon = (() =>
            class {
                h() {
                    /** */
                }
            })()
        // transpilers may name it (e.g. swc names it `_class`); force a true anonymous class
        Object.defineProperty(Anon, 'name', { value: '' })
        expect(Anon.name).toBe('')
        m.decorate('tag', 'anon-h')(Anon.prototype, 'h', desc(Anon, 'h'))
        const inst = new Anon()
        for (let i = 0; i < 2; i++) {
            expect(m.read(inst, 'h')?.tag).toBe('anon-h')
            expect(m.read(Anon, 'h')).toBeUndefined()
        }
        const m2 = fresh()
        m2.decorate('tag', 'anon-h')(Anon.prototype, 'h', desc(Anon, 'h'))
        for (let i = 0; i < 2; i++) {
            expect(m2.read(Anon, 'h')).toBeUndefined()
            expect(m2.read(inst, 'h')?.tag).toBe('anon-h')
        }
    })

    it('invalidates both caches on set and on _cleanup', () => {
        const m = fresh()
        class A {
            h() {
                /** */
            }
        }
        const Anon = (() =>
            class {
                h() {
                    /** */
                }
            })()
        Object.defineProperty(Anon, 'name', { value: '' })
        const inst = new Anon()
        expect(m.read(A, 'h')).toBeUndefined()
        expect(m.read(inst, 'h')).toBeUndefined()
        m.decorate('tag', 'anon')(Anon.prototype, 'h', desc(Anon, 'h'))
        expect(m.read(inst, 'h')?.tag).toBe('anon')
        m.decorate('tag', 'a')(A.prototype, 'h', desc(A, 'h'))
        expect(m.read(A, 'h')?.tag).toBe('a')
        expect(m.read(inst, 'h')?.tag).toBe('anon')
        const caches = m as unknown as Record<string, unknown>
        expect(caches._readCache).toBeDefined()
        expect(caches._readCacheNonCtor).toBeDefined()
        m._cleanup()
        expect(caches._readCache).toBeUndefined()
        expect(caches._readCacheNonCtor).toBeUndefined()
        expect([m.read(A, 'h')?.tag, m.read(inst, 'h')?.tag]).toEqual([
            'a',
            'anon',
        ])
    })

    it('resolves non-constructor functions to their .constructor', () => {
        const m = fresh()
        const arrow = () => undefined
        const bound = function named() {
            /** */
        }.bind(null)
        for (let i = 0; i < 2; i++) {
            expect(m.read(arrow)).toBe(m.read(Function))
            expect(m.read(bound)).toBe(m.read(Function))
        }
    })

    it('treats a proxy of a class as its own constructor sharing the prototype', () => {
        const m = fresh()
        class A {
            h() {
                /** */
            }
        }
        m.decorate('tag', 'h')(A.prototype, 'h', desc(A, 'h'))
        const P = new Proxy(A, {})
        const first = m.read(P, 'h')
        expect(first?.tag).toBe('h')
        expect(m.read(P, 'h')).toBe(first)
        expect(m.read(A, 'h')?.tag).toBe('h')
    })
})

describe('constructor params inheritence', () => {
    it('must inherit construtor params from parent class', () => {
        const parentMeta = mate.read(MateTestParentClass)
        const childMeta = mate.read(MateTestChildClass)
        expect(parentMeta?.params).toBeDefined()
        expect(parentMeta?.params).toHaveLength(1)
        expect(parentMeta?.params).toEqual(childMeta?.params)
    })
    it('must respect overriden construtor params', () => {
        const parentMeta = mate.read(MateTestParentClass)
        const childMeta = mate.read(MateTestChildClass2)
        expect(parentMeta?.params).toBeDefined()
        expect(parentMeta?.params).toHaveLength(1)
        expect(parentMeta?.params?.[0]?.type).toBe(String)
        expect(childMeta?.params).toBeDefined()
        expect(childMeta?.params).toHaveLength(1)
        expect(childMeta?.params?.[0]?.type).toBe(Number)
    })
})
