require('reflect-metadata')

import { Reflect as _reflect } from '../reflect' 
import { ReflectTestClass } from './reflect.artifacts'

describe('Reflect', () => {
    it('must not replace original reflect-metadata functions', () => {
        expect(Reflect.metadata === _reflect.metadata).toBeFalsy()
        expect(Reflect.getOwnMetadata === _reflect.getOwnMetadata).toBeFalsy()
        expect(Reflect.defineMetadata === _reflect.defineMetadata).toBeFalsy()
    })

    it('must set class metadata similar way as reflect-metadata', () => {
        const m1 = Reflect.getOwnMetadata('class-key', ReflectTestClass)
        const m2 = _reflect.getOwnMetadata('class-key', ReflectTestClass)
        expect(m1).toEqual(m2)
    })

    it('must set class constructor metadata similar way as reflect-metadata', () => {
        const m1 = Reflect.getOwnMetadata('prop-a', ReflectTestClass)
        const m2 = _reflect.getOwnMetadata('prop-a', ReflectTestClass)
        expect(m1).toEqual(m2)
        const m3 = Reflect.getOwnMetadata('prop-b', ReflectTestClass)
        const m4 = _reflect.getOwnMetadata('prop-b', ReflectTestClass)
        expect(m3).toEqual(m4)
    })

    it('must set method metadata similar way as reflect-metadata', () => {
        const m1 = Reflect.getOwnMetadata('method-key', ReflectTestClass.prototype, 'method')
        const m2 = _reflect.getOwnMetadata('method-key', ReflectTestClass.prototype, 'method')
        expect(m1).toEqual(m2)
    })

    it('must set method params metadata similar way as reflect-metadata', () => {
        const m1 = Reflect.getOwnMetadata('prop-a', ReflectTestClass.prototype, 'method')
        const m2 = _reflect.getOwnMetadata('prop-a', ReflectTestClass.prototype, 'method')
        expect(m1).toEqual(m2)
        const m3 = Reflect.getOwnMetadata('prop-b', ReflectTestClass.prototype, 'method')
        const m4 = _reflect.getOwnMetadata('prop-b', ReflectTestClass.prototype, 'method')
        expect(m3).toEqual(m4)
    })
})
