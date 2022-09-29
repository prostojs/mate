/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mate, TProstoMetadata } from '..'

export const mate = new Mate<{inherit?: boolean, fromPropertyCb?: string[]} & TProstoMetadata>('test', {
    readReturnType: true,
    readType: true,
    inherit(classMeta, prop, methodMeta) {
        if (prop) {
            return !!methodMeta?.inherit || !!(classMeta?.inherit && !methodMeta)
        }
        return !!classMeta?.inherit
    },
})
const D1 = mate.decorate('d1', 'v1')
const D2 = mate.decorate('d2', 'v2')
const D3 = mate.decorate('d3', 'v3')
const Apply3 = mate.apply(D1, D2, D3)

@mate.decorate('class', 'class value')
@mate.decorate('classArray', 'class value 1', true)
@mate.decorate('classArray', 'class value 2', true)
export class MateTestClass {
    constructor(
        @mate.decorate('param', 'param a')
        @mate.decorate('paramArray', 'param a1', true)
        @mate.decorate('paramArray', 'param a2', true)
            _a: string
    ) {
        //
    }

    @mate.decorate('method', 'method value')
    @mate.decorate('methodArray', 'method value1', true)
    @mate.decorate('methodArray', 'method value2', true)
    test(
        @mate.decorate('param', 'param b')
        @mate.decorate('paramArray', 'param b1', true)
        @mate.decorate('paramArray', 'param b2', true)
            _b: string): string {
        return 'abc'
    }

    @mate.decorate(meta => ({
        ...meta,
        fld1: 'test1',
        fld2: 'test2',
        }))
    @mate.decorate('method2', 'method value2')
    @mate.decorate(meta => ({
        ...meta,
        fld3: 'test3',
        fld4: 'test4',
        }))
    @mate.decorate('method', 'method value')
    viaCB(
        @mate.decorate('param1', 'param c1')
        @mate.decorate(meta => ({ ...meta, cb1: 'ok' }))
        @mate.decorate('param2', 'param c2')
        @mate.decorate(meta => ({ ...meta, cb2: 'ok' }))
        @Apply3
            _c: string) {
        //
    }

    @mate.decorate('property', 'property value')
    @mate.decorateClass('fromProperty', 'toClass', true)
    @mate.decorateClass((meta, key) => {
        meta.fromPropertyCb = meta.fromPropertyCb || []
        meta.fromPropertyCb.push(key as string)
        return meta
    })
    param: string = ''
}

@Apply3
export class MateTestClass2 {
    constructor(a: string) {
        //
    }

    @mate.decorate('method', 'method value')
    @Reflect.metadata('key', 'value')
    @Apply3
    test(@mate.decorateClass((meta, key, i) => {
        (meta as unknown as { arg1: unknown }).arg1 = { key, i }
        return meta
    }) arg1: number, arg2: boolean) {
        //
    }

    @mate.decorate('method', 'method from class 2')
    @mate.decorate('method2', 'method from class 2')
    toOverwriteMeta() {
        //
    }
}

@mate.decorate('inherit', true)
export class MateTestClass3 extends MateTestClass2 {
    constructor() {
        super('a.toString()')
    }

    @mate.decorate('method', 'method test2')
    test2() {
        //
    }

    @mate.decorate('method2', 'method from class 3')
    @mate.decorate('inherit', true)
    toOverwriteMeta() {
        //
    }
}

@mate.decorate('inherit', false)
export class MateTestClass4 extends MateTestClass2 {
    constructor() {
        super('a.toString()')
    }

    @mate.decorate('method', 'method test2 4')
    test2() {
        //
    }

    @mate.decorate('method2', 'method from class 3 4')
    toOverwriteMeta() {
        //
    }
}
