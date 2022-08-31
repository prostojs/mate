require('reflect-metadata')

import { Reflect as _reflect } from '../reflect' 

@_reflect.metadata('class-key', 'class-value')
@Reflect.metadata('class-key', 'class-value')
export class ReflectTestClass {
    constructor(
        @_reflect.metadata('prop-a', 'prop-a-value')
        @Reflect.metadata('prop-a', 'prop-a-value')
        a: boolean,
        @_reflect.metadata('prop-b', 'prop-b-value')
        @Reflect.metadata('prop-b', 'prop-b-value')
        b: Date,
    ) { /** */ }

    @_reflect.metadata('method-key', 'method-value')
    @Reflect.metadata('method-key', 'method-value')
    method(
        @_reflect.metadata('prop-a', 'prop-a-value')
        @Reflect.metadata('prop-a', 'prop-a-value')
        a: string,
        @_reflect.metadata('prop-b', 'prop-b-value')
        @Reflect.metadata('prop-b', 'prop-b-value')
        b: number,
    ) { /** */ }
}
