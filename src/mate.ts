require('reflect-metadata')
import 'reflect-metadata'
import { panic } from './utils/panic'
import { TAny, TFunction, TObject } from'./types'
import { getConstructor, isConstructor } from './utils/helpers'

export interface TMergedDecoratorArgs {
    target: TFunction | TObject
    propKey?: string | symbol
    descriptor?: TypedPropertyDescriptor<TAny>
    index?: number
}

export interface TProstoMetadata<TParams extends TProstoParamsMetadata = TProstoParamsMetadata> {
    params: TParams[]
}

export interface TProstoParamsMetadata {
    type: TFunction
}

export class Mate<T extends TProstoMetadata = TProstoMetadata> {
    constructor(protected workspace: string) {}

    set<R extends T = T, RP = R['params'][0]>(
        args: TMergedDecoratorArgs,
        cb: ((meta: R & RP) => R & RP),
    ): void

    set<R extends T = T, RP = R['params'][0]>(
        args: TMergedDecoratorArgs,
        key: keyof R | keyof RP,
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
    ): void

    set<R extends T = T, RP = R['params'][0]>(
        args: TMergedDecoratorArgs,
        key: keyof R | keyof RP,
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
        isArray: boolean | undefined,
    ): void

    set<R extends T = T, RP = R['params'][0]>(
        args: TMergedDecoratorArgs,
        key: keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value?: (R & RP)[keyof R] & (R & RP)[keyof RP],
        isArray?: boolean,
    ): void {
        let meta: R = Reflect.getMetadata(this.workspace, args.target, args.propKey as string) as R || {}
        const { index } = args
        const cb = typeof key === 'function' ? key : undefined
        let data: R & RP = meta as R & RP
        if (!data.params) {
            data.params = (Reflect.getMetadata('design:paramtypes', args.target, args.propKey as string) as TFunction[])?.map((f) => ({ type: f }))
        }
        if (typeof index === 'number') {
            data.params = data.params || []
            data.params[index] = data.params[index] || {
                type: undefined,
            }
            if (cb) {
                data.params[index] = cb(data.params[index] as unknown as R &RP) as unknown as TProstoParamsMetadata
            } else {
                data = data.params[index] as unknown as (R & RP)
            }
        }
        if (typeof key !== 'function') {
            if (isArray) {
                const newArray = (data[key] || []) as unknown[]
                if (!Array.isArray(newArray)) {
                    /* istanbul ignore next line */
                    panic('Mate.add (isArray=true) called for non-array metadata')
                }
                newArray.unshift(value)
                data[key] = newArray as unknown as (R & RP)[keyof R] & (R & RP)[keyof RP]
            } else {
                data[key] = value as (R & RP)[keyof R] & (R & RP)[keyof RP]
            }
        } else if (cb && typeof index !== 'number') {
            meta = cb(data)
        }
        Reflect.defineMetadata(
            this.workspace,
            meta,
            // args.descriptor ? args.descriptor.value : args.target,
            args.target,
            args.propKey as string
        )
    }

    read<R = T>(target: TFunction | TObject, propKey?: string | symbol): R | undefined {
        return Reflect.getMetadata(
            this.workspace,
            typeof propKey === 'string' ? isConstructor(target) ? target.prototype : target : isConstructor(target) ? target : getConstructor(target),
            propKey as string
        ) as (R | undefined)
    }

    apply(...decorators: (MethodDecorator & ClassDecorator & ParameterDecorator)[]) {
        return ((target: TObject, propKey: string | symbol, descriptor: TypedPropertyDescriptor<TAny> | number): void => {
            for (const d of decorators) {
                d(target, propKey, descriptor as TypedPropertyDescriptor<TAny>)
            }
        }) as MethodDecorator & ClassDecorator & ParameterDecorator
    }
    
    decorate<R extends T = T, RP = R['params'][0]>(
        cb: ((meta: R & RP) => R & RP)
    ): MethodDecorator & ClassDecorator & ParameterDecorator
    
    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator

    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
        isArray: boolean | undefined
    ): MethodDecorator & ClassDecorator & ParameterDecorator
    
    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value?: (R & RP)[keyof R] & (R & RP)[keyof RP],
        isArray?: boolean
    ): MethodDecorator & ClassDecorator & ParameterDecorator {
        return ((target: TObject, propKey: string | symbol, descriptor: TypedPropertyDescriptor<TAny> | number): void => {
            const args: TMergedDecoratorArgs = { 
                target,
                propKey,
                descriptor: typeof descriptor === 'number' ? undefined : descriptor,
                index: typeof descriptor === 'number' ? descriptor : undefined,
            }
            this.set<R, RP>(args, key as keyof R, value, isArray)
        }) as MethodDecorator & ClassDecorator & ParameterDecorator
    }
}
