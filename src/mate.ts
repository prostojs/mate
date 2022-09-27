import { Reflect as _reflect } from './reflect'
import { panic } from './utils/panic'
import { TAny, TFunction, TObject } from'./types'
import { getConstructor, isConstructor } from './utils/helpers'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Reflect = global?.Reflect || self?.Reflect || _reflect

export interface TMergedDecoratorArgs {
    target: TFunction | TObject
    propKey?: string | symbol
    descriptor?: TypedPropertyDescriptor<TAny>
    index?: number
    level?: 'CLASS' | 'PROPERTY'
}

export interface TProstoMetadata<TParams extends TProstoParamsMetadata = TProstoParamsMetadata> {
    params: TParams[]
    type?: TFunction
    returnType?: TFunction
}

export interface TProstoParamsMetadata {
    type?: TFunction
}

export interface TMateOptions<T extends TProstoMetadata = TProstoMetadata> {
    readReturnType?: boolean
    readType?: boolean
    inherit?: boolean | ((classMeta: T, propKey?: string, methodMeta?: T, ) => boolean)
}

export class Mate<T extends TProstoMetadata = TProstoMetadata> {
    constructor(protected workspace: string, protected options: TMateOptions<T> = {}) {}

    set<R extends T = T, RP = R['params'][0]>(
        args: TMergedDecoratorArgs,
        cb: ((meta: R & RP, propKey?: string | symbol, index?: number) => R & RP),
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
        key: keyof R | keyof RP | ((meta: R & RP, propKey?: string | symbol, index?: number) => R & RP),
        value?: (R & RP)[keyof R] & (R & RP)[keyof RP],
        isArray?: boolean,
    ): void {
        const newArgs = args.level === 'CLASS' ? { target: args.target }
            : args.level === 'PROPERTY' ? { target: args.target, propKey: args.propKey }
                : args
        let meta: R = Reflect.getOwnMetadata(this.workspace, newArgs.target, newArgs.propKey as string) as R || {}
        if (newArgs.propKey && this.options.readReturnType && !meta.returnType) {
            meta.returnType = Reflect.getOwnMetadata('design:returntype', newArgs.target, newArgs.propKey as string) as TFunction
        }
        if (newArgs.propKey && this.options.readType && !meta.type) {
            meta.type = Reflect.getOwnMetadata('design:type', newArgs.target, newArgs.propKey as string) as TFunction
        }
        const { index } = newArgs
        const cb = typeof key === 'function' ? key : undefined
        let data: R & RP = meta as R & RP
        if (!data.params) {
            data.params = (Reflect.getOwnMetadata('design:paramtypes', args.target, args.propKey as string) as TFunction[])?.map((f) => ({ type: f }))
        }
        if (typeof index === 'number') {
            data.params = data.params || []
            data.params[index] = data.params[index] || {
                type: undefined,
            }
            if (cb) {
                data.params[index] = cb(data.params[index] as unknown as R &RP, args.propKey, typeof index === 'number' ? index : undefined) as unknown as TProstoParamsMetadata
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
            meta = cb(data, args.propKey, typeof index === 'number' ? index : undefined)
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        Reflect.defineMetadata(
            this.workspace,
            meta,
            // args.descriptor ? args.descriptor.value : args.target,
            newArgs.target,
            newArgs.propKey as string
        )
    }

    read<R extends T = T>(target: TFunction | TObject, propKey?: string | symbol, index?: number): R | undefined {
        const isConstr = isConstructor(target)
        const constructor = isConstr ? target : getConstructor(target)
        const proto = constructor.prototype as TObject
        let ownMeta = Reflect.getOwnMetadata(
            this.workspace,
            typeof propKey === 'string' ? proto : constructor,
            propKey as string
        ) as (R | undefined)
        if (this.options.inherit) {
            const inheritFn = typeof this.options.inherit === 'function' ? this.options.inherit : undefined
            let shouldInherit = this.options.inherit as boolean
            if (inheritFn) {
                if (typeof propKey === 'string') {
                    const classMeta = Reflect.getOwnMetadata(this.workspace, constructor) as T
                    shouldInherit = inheritFn(classMeta, propKey, ownMeta as T)
                } else {
                    shouldInherit = inheritFn(ownMeta as T)
                }
            }
            if (shouldInherit) {
                const parent = Object.getPrototypeOf(constructor) as TFunction
                if (typeof parent === 'function' && parent !== fnProto && parent !== constructor) {
                    const inheritedMeta = this.read<R>(parent, propKey)
                    ownMeta = { ...inheritedMeta, ...ownMeta, params: ownMeta?.params } as R
                }
            }
        }
        return ownMeta
    }

    apply(...decorators: (MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator)[]) {
        return ((target: TObject, propKey: string | symbol, descriptor: TypedPropertyDescriptor<TAny> | number): void => {
            for (const d of decorators) {
                d(target, propKey, descriptor as TypedPropertyDescriptor<TAny>)
            }
        }) as MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    }
    
    decorate<R extends T = T, RP = R['params'][0]>(
        cb: ((meta: R & RP, propKey?: string | symbol, index?: number) => R & RP)
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
        isArray: boolean | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
        isArray: boolean | undefined,
        level: TMergedDecoratorArgs['level'],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorate<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value?: (R & RP)[keyof R] & (R & RP)[keyof RP],
        isArray?: boolean,
        level?: TMergedDecoratorArgs['level'],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator {
        return ((target: TObject, propKey: string | symbol, descriptor: TypedPropertyDescriptor<TAny> | number): void => {
            const args: TMergedDecoratorArgs = { 
                target,
                propKey,
                descriptor: typeof descriptor === 'number' ? undefined : descriptor,
                index: typeof descriptor === 'number' ? descriptor : undefined,
                level,
            }
            this.set<R, RP>(args, key as keyof R, value, isArray)
        }) as MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    }
    
    decorateClass<R extends T = T, RP = R['params'][0]>(
        cb: ((meta: R & RP, propKey?: string | symbol, index?: number) => R & RP)
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorateClass<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorateClass<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value: ((R & RP)[keyof R] & (R & RP)[keyof RP]) | undefined,
        isArray: boolean | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorateClass<R extends T = T, RP = R['params'][0]>(
        key:  keyof R | keyof RP | ((meta: R & RP) => R & RP),
        value?: (R & RP)[keyof R] & (R & RP)[keyof RP],
        isArray?: boolean,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator {
        return this.decorate<R, RP>(key, value, isArray, 'CLASS')
    }
}

const fnProto = Object.getPrototypeOf(Function) as TFunction
