# prostojs/mate

This small library is TS Metadata Organizer based on [`reflect-metadata`](https://github.com/rbuckton/reflect-metadata). "MA-TE" is for "ME-TA" in reverse order.

It allows you to define, manipulate, and read metadata at different levels, including classes, properties, methods, and parameters.

The primary purpose of Mate is to streamline the use of metadata, making it simpler and more efficient to handle.

## Installation

You can install Mate from the npm registry.

```bash
npm install @prostojs/mate
```

## Usage

After installation, you can start using Mate to define and handle metadata in your TypeScript project. Below is an example that showcases different levels of metadata usage.

```ts
import { TMateParamMeta } from '@prostojs/mate';
import { Mate } from '@prostojs/mate';

// Define your metadata interfaces
interface TClassMeta {
    name: string;
    model: string;
    fromParam: string;
    manufacturer: string;
    data: string[];
    inherit?: bolean;
}

interface TPropMeta<TParamMeta> {
    description: string;
    params: (TMateParamMeta & TParamMeta)[];
    inherit?: bolean
}

interface TParamMeta {
    required: boolean;
}

const mate = new Mate<TClassMeta, TPropMeta<TParamMeta>>('robot-meta', {
    readReturnType: true,
    readType: true,
    collectPropKeys: true,
    inherit(classMeta, targetMeta, level, prop) {
        return !!targetMeta?.inherit || !!classMeta?.inherit;
    },
});

// Annotate your class
@mate.decorate('name', 'NXT') 
@mate.decorate('model', 'EV3') 
@mate.decorate('manufacturer', 'LEGO')
@mate.decorate('data', 'NXT-0001', true)  
class Robot {
    @mate.decorate('description', 'Robotic arm for grabbing objects')
    arm: string;

    @mate.decorate('description', 'Sensors to detect objects') 
    sensors(
        @mate.decorateClass('fromParam', 'hoised value')  
        @mate.decorate('required', true) 
        input: string
    ): string {
        return 'Activated sensors with input: ' + input;
    }
}

// Read the metadata
let classMeta = mate.read(Robot);
console.log(classMeta);
// Expected Output:
// {
//     name: 'NXT',
//     model: 'EV3',
//     fromParam: 'hoised value',
//     manufacturer: 'LEGO',
//     data: ['NXT-0001'],  // Array type metadata
//     properties: ['arm', 'sensors'],
//     type: Function, // Type of Robot
//     returnType: undefined // Only for methods
// }

// read the property metadata
let armMeta = mate.read(Robot, 'arm');
console.log(armMeta);
// Expected Output:
// {
//     description: 'Robotic arm for grabbing objects',
//     params: [],
//     type: Function, // Type of 'arm'
//     returnType: undefined // Only for methods
// }

// read the method metadata
let sensorsMeta = mate.read(Robot, 'sensors');
console.log(sensorsMeta);
// Expected Output:
// {
//     description: 'Sensors to detect objects',
//     params: [{ type: String, required: true }],
//     type: Function, // Type of 'sensors'
//     returnType: String // Return type of 'sensors'
// }
```

## Metadata Inheritance

It's possible to enable metadata inheritance and set some rules on whether it should be inherited from parent classes or not

### Metadata Inheritance ON

Simply use `true` on `inherit` key to enable metadata inheritance

```ts
const mate = new Mate<MyMeta>('my-metadata-key', {
    inherit: true, // this will enable metadata inheritance for all the classes
})
```

### Conditional Metadata Inheritance

This example illustrates how to set a callback with logic to decide whether to inherit or not

```ts
const mate = new Mate<MyMeta>('my-metadata-key', {
    inherit(classMeta, prop, methodMeta) {
        if (prop) {
            // if it is a method metadata
            // we require a key `inherit` to be true for inheritance
            return !!methodMeta?.inherit || !!(classMeta?.inherit && !methodMeta)
        }
        // otherwise (in case of class metadata) we require a key `inherit`
        // to be true for inheritance on class metadata
        return !!classMeta?.inherit
    }
})
```

## API Reference

1. **`Mate<TClassMeta, TPropMeta>`**: The main Mate class. It provides methods to decorate and read metadata.

2. **`decorate(key, value?, isArray?, level?)`**: A method for adding metadata to classes, properties, methods, and parameters.

3. **`decorateClass(key, value?, isArray?)`**: A method for hoisting metadata from methods or parameters to the class level.

4. **`read(target, prop?, paramIndex?)`**: A method for reading metadata.

## Use of **reflect-metadata**

It is recomended to include `reflect-metadata` dependency to rely on the original implementation. Although it's still possible to use `@prostojs/mate` with no dependency on `reflect-metadata` because it already includes its own limited implementation of reflect-metadata which ships only the features used by `@prostojs/mate` such as:

- `getOwnMetadata(key, target, prop?)`

- `defineMetadata(key, data, target, prop?)`

- `metadata(key, data)`
