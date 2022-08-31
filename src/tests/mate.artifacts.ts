/* eslint-disable @typescript-eslint/no-unused-vars */
import { Mate } from '..'

const mate = new Mate('test', {
    readReturnType: true,
    readType: true,
})
const D1 = mate.decorate('d1', 'v1')
const D2 = mate.decorate('d2', 'v2')
const D3 = mate.decorate('d3', 'v3')
const Apply3 = mate.apply(D1, D2, D3)

@mate.decorate('class', 'class value')
@mate.decorate('classArray', 'class value 1', true)
@mate.decorate('classArray', 'class value 2', true)
export class DecoratorHelpersTestClass {
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
}

@Apply3
export class DecoratorHelpersTestClass2 {
    @mate.decorate('method', 'method value')
    @Reflect.metadata('key', 'value')
    @Apply3
    test() {
        //
    }
}
