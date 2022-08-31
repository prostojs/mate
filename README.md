# prostojs/mate

This small library is TS Metadata Organizer based on [`reflect-metadata`](https://github.com/rbuckton/reflect-metadata). "MA-TE" is for "ME-TA" in reverse order.

Make it easier to write, read and type metadata objects. Gather all your metadata at a single metadata key in a typed object and access it with a matter of one call of `mate.read()`

## Install

`npm install @prostojs/mate`

## Quick Example

```ts
import { TProstoMetadata, Mate } from '@prostojs/mate'

interface TMyMeta extends TProstoMetadata {
    required: boolean
    label: string
    items: string[]
}

// Create an instance of Mate with metadata 
// key 'my-metadata-key'
// This key will be used by Reflect.defineMetadata
// and Reflect.getMetadata
const mate = new Mate<TMyMeta>('my-metadata-key')

@mate.decorate('required', true)
@mate.decorate('label', 'My Class')
@mate.decorate('items', 'first item', true)
@mate.decorate('items', 'second item', true)
class MyClass {

}

console.log(mate.read(MyClass))
// {
//   params: undefined,
//   items: [ 'first item', 'second item' ],
//   label: 'My Class',
//   required: true
// }
```

## Method Decorators

```ts
import { Mate } from '@prostojs/mate'
const mate = new Mate('my-metadata-key')
class MyClass {
    @mate.decorate('required', true)
    @mate.decorate('label', 'My Method Label')
    methodName() {}
}
console.log(mate.read(MyClass, 'methodName'))
// { params: [], label: 'My Method Label', required: true }
```

## Constructor Params Decorators

```ts
import { Mate } from '@prostojs/mate'
const mate = new Mate('my-metadata-key')
class MyClass {
    constructor(
        @mate.decorate('label', 'my string')
        str: string,
        @mate.decorate('label', 'my number')
        n: number,
    ) {}
}
console.log(mate.read(MyClass))
// {
//   params: [
//     { type: [Function: String], label: 'my string' },
//     { type: [Function: Number], label: 'my number' }
//   ]
// }
```

## Method Params Decorators

```ts
import { Mate } from '@prostojs/mate'
const mate = new Mate('my-metadata-key')
class MyClass {
    myMethod(
        @mate.decorate('label', 'my string')
        str: string,
        @mate.decorate('label', 'my number')
        n: number,
    ) {}
}
console.log(mate.read(MyClass, 'myMethod'))
// {
//   params: [
//     { type: [Function: String], label: 'my string' },
//     { type: [Function: Number], label: 'my number' }
//   ]
// }
```

## Variety of use of Mate

```ts
import { TProstoMetadata, Mate } from '@prostojs/mate'

// Define the metadata type
interface MyMeta extends TProstoMetadata {
    arg0: string
    arg1: string
    n: number
    simple: boolean
}
const mate = new Mate<MyMeta>('my-metadata-key')

// Example of simple decorator
const SimpleDecorator = mate.decorate('simple', true)

// Example of factory decorator
const FactoryDecorator = (arg: string) => mate.decorate('arg0', arg)

// Example of complex decorator
// mate.apply returns a new decorator that applies
// all passed decorators
const ComplexDecorator = (arg: string) => mate.apply(
        SimpleDecorator,
        FactoryDecorator(arg),
    )

// Example of Callback Decorator
// meta.decorate may accept callback function
// instead of key/value pare in case if some
// complex logic need
const CallbackDecorator = (arg1: string, n: number) => mate.decorate(meta => {
    meta.arg1 = [meta.arg0, arg1].join(', ')
    meta.n = meta.simple ? n : n * n
    return meta
})

// Applying decorators to our classes
@SimpleDecorator
@FactoryDecorator('arg0 value')
class MyClass1 {

}
console.log(mate.read(MyClass1))
// { params: undefined, arg0: 'arg0 value', simple: true }

@CallbackDecorator('arg1 value', 5)
@ComplexDecorator('arg0 for complex decorator')
class MyClass2 {

}
console.log(mate.read(MyClass2))
// {
//   params: undefined,
//   simple: true,
//   arg0: 'arg0 for complex decorator',
//   arg1: 'arg0 for complex decorator, arg1 value',
//   n: 5
// }
```

## TS Typing

Metadata type is shared for class metadata and class method metadata and based on `TProstoMetadata` interface.

Constructor params and method params metadata are stored in `TProstoMetadata['params']` array.

By default `TProstoMetadata['params']` has type `TProstoParamsMetadata`.

Here's an example of fully typed metadata:
```ts
import { TProstoMetadata, TProstoParamsMetadata, Mate } from '@prostojs/mate'

interface TMyParamsMeta extends TProstoParamsMetadata {
    paramProp1: string
    paramProp2: number
}
interface TMyMeta extends TProstoMetadata<TMyParamsMeta> {
    prop1: string
    prop2: number
}

// class and method metadata will look like this:
// {
//     prop1: string
//     prop2: number
//     params: { // inherited from TProstoMetadata
//         type: Function // inherited from TProstoParamsMetadata
//         paramProp1: string
//         paramProp2: number
//     }[]
// }

// pass TMyMeta to Mate constructor to define types for mate instance
const mate = new Mate<TMyMeta>('my-metadata-key')
```