import { Mate } from '../mate'
import { DecoratorHelpersTestClass, DecoratorHelpersTestClass2 } from './mate.artifacts'
import { getConstructor, isConstructor } from '../utils/helpers'

const mate = new Mate('test')

describe('Mate', () => {
    const classMeta = mate.read(DecoratorHelpersTestClass)
    const methodMeta = mate.read(DecoratorHelpersTestClass, 'test')
    const viaCBMeta = mate.read(DecoratorHelpersTestClass, 'viaCB')
    const methodMeta2 = mate.read(DecoratorHelpersTestClass2, 'test')
    it('must process class meta', () => {
        expect(classMeta).toEqual({
            class: 'class value',
            classArray: [
                'class value 1',
                'class value 2',
            ],
            params: [
                {
                    param: 'param a',
                    paramArray: [
                        'param a1',
                        'param a2',
                    ],
                    type: String,
                },
            ],
        })
    })
    it('must process method meta', () => {
        expect(methodMeta).toEqual({
            method: 'method value',
            methodArray: [
                'method value1',
                'method value2',
            ],
            returnType: String,
            type: Function,
            params: [
                {
                    param: 'param b',
                    paramArray: [
                        'param b1',
                        'param b2',
                    ],
                    type: String,
                },
            ],
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
    it('must process solo method meta', () => {
        expect(methodMeta2).toEqual({
            d1: 'v1',
            d2: 'v2',
            d3: 'v3',
            method: 'method value',
            params: [],
            returnType: undefined,
            type: Function,
        })
    })
    it('must read metadata by instance class', () => {
        expect(methodMeta2).toBe(mate.read(new DecoratorHelpersTestClass2(), 'test'))
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
        const fn = () => {/** */}
        expect(isConstructor(fn)).toBe(false)
    })
    it('must return false if anon function passed', () => {
        expect(isConstructor(function(){/** */})).toBe(false)
    })
    it('must return false if arrow function passed 2', () => {
        expect(isConstructor(() => {/** */})).toBe(false)
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
})
