import { Mate } from '../mate'
import { MateTestClass, MateTestClass2, MateTestClass3, mate, MateTestClass4, MateTestParentClass, MateTestChildClass, MateTestChildClass2 } from './mate.artifacts'
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
            classArray: [
                'class value 1',
                'class value 2',
            ],
            properties: ['prop1', 'prop2', 'param'],
            fromProperty: ['toClass'],
            fromPropertyCb: ['param'],
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
            methodArray: [
                'method value1',
                'method value2',
            ],
            returnType: String,
            type: Function,
            params: [
                {
                    multi: 'for PARAM',
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
            params: [ { type: Number }, { type: Boolean } ],
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
            params: [{
                type: String,
            }],
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
