import { Reflect as _reflect } from './reflect'
import { TAny, TFunction, TObject } from'./types'
import { getConstructor, isConstructor } from './utils/helpers'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const Reflect = global?.Reflect || self?.Reflect || _reflect

type TLevels = 'CLASS' | 'METHOD' | 'PROP' | 'PARAM'

export interface TMergedDecoratorArgs {
    target: TFunction | TObject
    propKey?: string | symbol
    descriptor?: TypedPropertyDescriptor<TAny>
    index?: number
    level?: TLevels
}

export interface TMateParamMeta {
    type?: TFunction
}

export interface TMatePropMeta<TParam extends TObject = TEmpty> {
    params?: (TParam & TMateParamMeta)[]
}

export interface TMateClassMeta<TParam> {
    properties?: (string | symbol)[]
    type?: TFunction
    returnType?: TFunction
    params?: (TParam & TMateParamMeta)[]
}

type TCommonMate<TParam extends TObject> = TMateClassMeta<TParam> & TMatePropMeta<TParam>
type TCommonMateWithParam<TParam extends TObject> = TMateClassMeta<TParam> & TMatePropMeta<TParam> & TParam

interface TConsoleBase { error: ((...args: any) => void) }

export interface TMateOptions<TClass extends TObject = TMateClassMeta<TMateParamMeta>, TProp extends { params: TMateParamMeta[] } = Required<TMatePropMeta<TMateParamMeta>>> {
    logger?: TConsoleBase
    readReturnType?: boolean
    readType?: boolean
    collectPropKeys?: boolean
    inherit?: boolean | ((classMeta: TClass & TMateClassMeta<TMateParamMeta>, targetMeta: (TMatePropMeta<TProp['params'][0]> & TProp) | (TMateParamMeta & TProp['params'][0]), level: 'CLASS' | 'PROP' | 'PARAM', key?: string) => boolean)
}

interface TEmpty {}

export class Mate<TClass extends TObject = TMateClassMeta<TMateParamMeta>, TProp extends { params: TMateParamMeta[] } = Required<TMatePropMeta<TMateParamMeta>>> {
    protected logger: TConsoleBase

    constructor(protected workspace: string, protected options: TMateOptions<TClass, TProp> = {}) {
        this.logger = options.logger || console
    }

    set<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>>(
        args: TMergedDecoratorArgs,
        cb: ((meta: T, level: TLevels, propKey?: string | symbol, index?: number) => T),
    ): void

    set<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T>(
        args: TMergedDecoratorArgs,
        key: keyof T,
        value: T[K]
    ): void

    set<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T>(
        args: TMergedDecoratorArgs,
        key: keyof T,
        value: T[K],
        isArray: boolean | undefined,
    ): void

    set<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T>(
        args: TMergedDecoratorArgs,
        key: keyof T | ((meta: T, level: TLevels, propKey?: string | symbol, index?: number) => T),
        value?: T[K],
        isArray?: boolean,
    ): void {
        type TT = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>
        let level: TLevels = 'CLASS'
        const newArgs = args.level === 'CLASS' ? { target: args.target }
            : args.level === 'PROP' ? { target: args.target, propKey: args.propKey }
                : args
        let meta: TT = (Reflect.getOwnMetadata(this.workspace, newArgs.target, newArgs.propKey as string) || {}) as TT
        if (newArgs.propKey && this.options.readReturnType && !meta.returnType && args.descriptor) {
            meta.returnType = Reflect.getOwnMetadata('design:returntype', newArgs.target, newArgs.propKey as string) as TFunction
        }
        if (newArgs.propKey && this.options.readType && !meta.type) {
            meta.type = Reflect.getOwnMetadata('design:type', newArgs.target, newArgs.propKey as string) as TFunction
        }
        const { index } = newArgs
        const cb = typeof key === 'function' ? key : undefined
        let data: TT = meta
        if (!data.params) {
            data.params = (Reflect.getOwnMetadata('design:paramtypes', newArgs.target, newArgs.propKey as string) as TFunction[])?.map((f) => ({ type: f }))
        }
        if (typeof index === 'number') {
            level = 'PARAM'
            data.params = data.params || []
            data.params[index] = data.params[index] || {
                type: undefined,
            }
            if (cb) {
                data.params[index] = cb(data.params[index] as T, level, args.propKey, typeof args.index === 'number' ? args.index : undefined) as TCommonMateWithParam<TProp['params'][0]>
            } else {
                data = data.params[index] as TT
            }
        } else if (!index && !args.descriptor && args.propKey && this.options.collectPropKeys && args.level !== 'CLASS') {
            this.set<TMateClassMeta<TMateParamMeta>>(
                { ...args, level: 'CLASS' },
                (meta) => {
                    if (!meta.properties) {
                        meta.properties = [args.propKey as string]
                    } else if (!meta.properties.includes(args.propKey as string)) {
                        meta.properties.push(args.propKey as string)
                    }
                    return meta
                }
            )
        }
        level = typeof index === 'number' ? 'PARAM' : newArgs.propKey && newArgs.descriptor ? 'METHOD' : newArgs.propKey ? 'PROP' : 'CLASS'
        if (typeof key !== 'function') {
            if (isArray) {
                const newArray = ((data as T)[key] || []) as unknown[]
                if (!Array.isArray(newArray)) {
                    /* istanbul ignore next line */
                    this.logger.error('Mate.add (isArray=true) called for non-array metadata')
                }
                newArray.unshift(value)
                ;(data as T)[key] = newArray as T[K]
            } else {
                (data as T)[key] = value as T[K]
            }
        } else if (cb && typeof index !== 'number') {
            meta = cb(data as T, level, args.propKey, typeof args.index === 'number' ? args.index : undefined) as TT
        }
        Reflect.defineMetadata(
            this.workspace,
            meta,
            newArgs.target,
            newArgs.propKey as string
        )
    }

    read<PK>(target: TFunction | TObject, propKey?: PK): PK extends PropertyKey ? (TClass & TProp & TCommonMate<TProp['params'][0]> | undefined) : TClass | undefined {
        const isConstr = isConstructor(target)
        const constructor = isConstr ? target : getConstructor(target)
        const proto = constructor.prototype as TObject
        type TT = TClass & TProp & TCommonMate<TProp['params'][0]>
        let ownMeta = Reflect.getOwnMetadata(
            this.workspace,
            typeof propKey === 'string' ? proto : constructor,
            propKey as string
        ) as TT
        if (ownMeta && propKey === undefined && ownMeta.params === undefined) {
            const parent = Object.getPrototypeOf(constructor) as TFunction
            if (
                typeof parent === 'function' &&
                parent !== fnProto &&
                parent !== constructor
            ) {
                ownMeta.params = (this.read(parent) as { params: [] })?.params
            }
        }
        if (this.options.inherit) {
            const inheritFn =
                    typeof this.options.inherit === 'function'
                        ? this.options.inherit
                        : undefined
            let shouldInherit = this.options.inherit as boolean
            if (inheritFn) {
                if (typeof propKey === 'string') {
                    const classMeta = Reflect.getOwnMetadata(
                        this.workspace,
                        constructor,
                    ) as TClass & TMateClassMeta<TMateParamMeta>
                    shouldInherit = inheritFn(
                        classMeta,
                            ownMeta as unknown as TProp,
                            'PROP',
                            propKey,
                    )
                } else {
                    shouldInherit = inheritFn(
                            ownMeta as unknown as TClass,
                            ownMeta as unknown as TProp,
                            'CLASS',
                    )
                }
            }
            if (shouldInherit) {
                const parent = Object.getPrototypeOf(
                    constructor,
                ) as TFunction
                if (
                    typeof parent === 'function' &&
                        parent !== fnProto &&
                        parent !== constructor
                ) {
                    const inheritedMeta = (this.read(parent, propKey) ||
                            {}) as TT
                    const ownParams = ownMeta?.params
                    ownMeta = { ...inheritedMeta, ...ownMeta } as TT
                    if (
                        typeof propKey === 'string' &&
                            ownParams &&
                            inheritedMeta?.params
                    ) {
                        for (let i = 0; i < ownParams.length; i++) {
                            if (
                                typeof inheritedMeta?.params[i] !==
                                    'undefined'
                            ) {
                                const ownParam = ownParams[i]
                                if (
                                    ownMeta.params &&
                                        inheritFn &&
                                        inheritFn(
                                            ownMeta as unknown as TClass,
                                            ownParam as unknown as TProp,
                                            'PARAM',
                                            typeof propKey === 'string'
                                                ? propKey
                                                : undefined,
                                        )
                                ) {
                                    ownMeta.params[i] = {
                                        ...inheritedMeta?.params[i],
                                        ...ownParams[i],
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return ownMeta
    }

    apply(...decorators: (MethodDecorator | ClassDecorator | ParameterDecorator | PropertyDecorator)[]) {
        return ((target: TObject, propKey: string | symbol, descriptor: TypedPropertyDescriptor<TAny> | number): void => {
            for (const d of decorators) {
                (d as MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator)(target, propKey, descriptor as TypedPropertyDescriptor<TAny>)
            }
        }) as MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    }
    
    decorate<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>>(
        cb: ((meta: T, level: TLevels, propKey?: string | symbol, index?: number) => T)
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorate<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T>(
        key:  K,
        value: T[K],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorate<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T, TIsArray extends boolean = false>(
        key:  K,
        value: TIsArray extends true ? ArrayElementType<T[K]> : T[K],
        isArray: TIsArray,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorate<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T, TIsArray extends boolean = false>(
        key:  K | ((meta: T, level: TLevels, propKey?: string | symbol, index?: number) => T),
        value: TIsArray extends true ? ArrayElementType<T[K]> : T[K],
        isArray: TIsArray,
        level: TMergedDecoratorArgs['level'],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorate<T = TClass & TProp & TCommonMateWithParam<TProp['params'][0]>, K extends keyof T = keyof T, TIsArray extends boolean = false>(
        key:  K,
        value?: TIsArray extends true ? ArrayElementType<T[K]> : T[K],
        isArray?: TIsArray,
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
            this.set<T, K>(args, key, value as T[K], isArray)
        }) as MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    }

    decorateConditional(
        ccb: (level: TLevels) => (MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator) | void | undefined
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator {
        return ((target: TObject, propKey: string | symbol, descriptor: TypedPropertyDescriptor<TAny> | number): void => {
            const hasIndex = typeof descriptor === 'number'
            const decoratorLevel: TLevels = hasIndex ? 'PARAM' : propKey && descriptor ? 'METHOD' : propKey ? 'PROP' : 'CLASS'
            const d = ccb(decoratorLevel)
            if (d) {
                d(target, propKey, descriptor as TypedPropertyDescriptor<TAny>)
            }
        }) as MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    }
    
    decorateClass<T = TClass>(
        cb: ((meta: T, level: TLevels, propKey?: string | symbol, index?: number) => T)
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorateClass<T = TClass, K extends keyof T = keyof T, TIsArray extends boolean = false>(
        key:  K,
        value: TIsArray extends true ? ArrayElementType<T[K]> : T[K],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorateClass<T = TClass, K extends keyof T = keyof T, TIsArray extends boolean = false>(
        key:  K,
        value: TIsArray extends true ? ArrayElementType<T[K]> : T[K],
        isArray: boolean | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorateClass<T = TClass, K extends keyof T = keyof T, TIsArray extends boolean = false>(
        key:  K | ((meta: T, level: TLevels, propKey?: string | symbol, index?: number) => T),
        value?: TIsArray extends true ? ArrayElementType<T[K]> : T[K],
        isArray?: boolean,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator {
        return this.decorate<T, K>(key, value as T[K], isArray as false, 'CLASS')
    }
}

const fnProto = Object.getPrototypeOf(Function) as TFunction

type ArrayElementType<T> = T extends (infer E)[] ? E : never;
