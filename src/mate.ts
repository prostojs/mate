import { Reflect as _reflect } from './reflect'
import { panic } from './utils/panic'
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

export interface TMateClassMeta {
    properties?: (string | symbol)[]
    type?: TFunction
    returnType?: TFunction
}

export interface TMateOptions<TClass extends TObject = TEmpty, TProp extends TObject = TEmpty, TParam extends TObject = TEmpty> {
    readReturnType?: boolean
    readType?: boolean
    collectPropKeys?: boolean
    inherit?: boolean | ((classMeta: TClass & TMateClassMeta, targetMeta: (TMatePropMeta<TParam> & TProp) | (TMateParamMeta & TParam), level: 'CLASS' | 'PROP' | 'PARAM', key?: string) => boolean)
}

interface TEmpty {}

export class Mate<TClass extends TObject = TEmpty, TProp extends TObject = TEmpty, TParam extends TObject = TEmpty> {
    constructor(protected workspace: string, protected options: TMateOptions<TClass, TProp, TParam> = {}) {}

    set<TMeta extends TObject = Partial<TClass & TProp & TParam>>(
        args: TMergedDecoratorArgs,
        cb: ((meta: TMeta, level: TLevels, propKey?: string | symbol, index?: number) => TMeta),
    ): void

    set<TMeta extends TObject = Partial<TClass & TProp & TParam>, TKey extends keyof TMeta = keyof TMeta>(
        args: TMergedDecoratorArgs,
        key: keyof TMeta,
        value: TMeta[TKey]
    ): void

    set<TMeta extends TObject = Partial<TClass & TProp & TParam>, TKey extends keyof TMeta = keyof TMeta>(
        args: TMergedDecoratorArgs,
        key: keyof TMeta,
        value: TMeta[TKey],
        isArray: boolean | undefined,
    ): void

    set<TMeta extends TObject = Partial<TClass & TProp & TParam>, TKey extends keyof TMeta = keyof TMeta>(
        args: TMergedDecoratorArgs,
        key: keyof TMeta | ((meta: TMeta, level: TLevels, propKey?: string | symbol, index?: number) => TMeta),
        value?: TMeta[TKey],
        isArray?: boolean,
    ): void {
        let level: TLevels = 'CLASS'
        const newArgs = args.level === 'CLASS' ? { target: args.target }
            : args.level === 'PROP' ? { target: args.target, propKey: args.propKey }
                : args
        let meta: TClass & TMateClassMeta & TMatePropMeta & TMateParamMeta = Reflect.getOwnMetadata(this.workspace, newArgs.target, newArgs.propKey as string) as TClass || {}
        if (newArgs.propKey && this.options.readReturnType && !meta.returnType && args.descriptor) {
            meta.returnType = Reflect.getOwnMetadata('design:returntype', newArgs.target, newArgs.propKey as string) as TFunction
        }
        if (newArgs.propKey && this.options.readType && !meta.type) {
            meta.type = Reflect.getOwnMetadata('design:type', newArgs.target, newArgs.propKey as string) as TFunction
        }
        const { index } = newArgs
        const cb = typeof key === 'function' ? key : undefined
        let data: TMeta & TMateClassMeta & TMatePropMeta & TMateParamMeta = meta as unknown as (TMeta & TMateClassMeta & TMatePropMeta & TMateParamMeta)
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
                data.params[index] = cb(data.params[index] as TMeta, level, args.propKey, typeof args.index === 'number' ? args.index : undefined)
            } else {
                data = data.params[index] as TMeta & TMateClassMeta & TMatePropMeta & TMateParamMeta
            }
        } else if (!index && !args.descriptor && args.propKey && this.options.collectPropKeys && args.level !== 'CLASS') {
            this.set<TMateClassMeta>(
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
                const newArray = (data[key] || []) as unknown[]
                if (!Array.isArray(newArray)) {
                    /* istanbul ignore next line */
                    panic('Mate.add (isArray=true) called for non-array metadata')
                }
                newArray.unshift(value)
                data[key] = newArray as TMeta[TKey]
            } else {
                data[key] = value as TMeta[TKey]
            }
        } else if (cb && typeof index !== 'number') {
            meta = cb(data, level, args.propKey, typeof args.index === 'number' ? args.index : undefined) as unknown as TClass & TMateClassMeta & TMatePropMeta & TMateParamMeta
        }
        Reflect.defineMetadata(
            this.workspace,
            meta,
            newArgs.target,
            newArgs.propKey as string
        )
    }

    read<TMeta extends Partial<TClass & TMateClassMeta & TProp & TMatePropMeta<TParam> & TParam & TMateParamMeta>>(target: TFunction | TObject, propKey?: string | symbol): TMeta | undefined {
        const isConstr = isConstructor(target)
        const constructor = isConstr ? target : getConstructor(target)
        const proto = constructor.prototype as TObject
        let ownMeta = Reflect.getOwnMetadata(
            this.workspace,
            typeof propKey === 'string' ? proto : constructor,
            propKey as string
        ) as TMeta
        if (this.options.inherit) {
            const inheritFn = typeof this.options.inherit === 'function' ? this.options.inherit : undefined
            let shouldInherit = this.options.inherit as boolean
            if (inheritFn) {
                if (typeof propKey === 'string') {
                    const classMeta = Reflect.getOwnMetadata(this.workspace, constructor) as TClass & TMateClassMeta
                    shouldInherit = inheritFn(classMeta, ownMeta as unknown as TProp, 'PROP', propKey)
                } else {
                    shouldInherit = inheritFn(ownMeta as unknown as TClass, ownMeta as unknown as TProp, 'CLASS')
                }
            }
            if (shouldInherit) {
                const parent = Object.getPrototypeOf(constructor) as TFunction
                if (typeof parent === 'function' && parent !== fnProto && parent !== constructor) {
                    const inheritedMeta = this.read<TMeta>(parent, propKey) || {} as TMeta
                    const ownParams = ownMeta?.params
                    console.log({ownParams, inheritedMeta})
                    ownMeta = { ...inheritedMeta, ...ownMeta } as unknown as TMeta
                    if (typeof propKey === 'string' && ownParams && inheritedMeta?.params) {
                        for (let i = 0; i < ownParams.length; i++) {
                            if (typeof inheritedMeta?.params[i] !== 'undefined') {
                                const ownParam = ownParams[i]
                                if (ownMeta.params && inheritFn && inheritFn(ownMeta as unknown as TClass, ownParam as unknown as TProp, 'PARAM', typeof propKey === 'string' ? propKey : undefined)) {
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
    
    decorate<TMeta extends TObject = Partial<TClass & TProp & TParam>>(
        cb: ((meta: TMeta, level: TLevels, propKey?: string | symbol, index?: number) => TMeta)
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorate<TMeta extends Partial<TClass & TProp & TParam>, TKey extends keyof TMeta>(
        key:  TKey,
        value: TMeta[TKey],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorate<TMeta extends Partial<TClass & TProp & TParam>, TKey extends keyof TMeta, TIsArray extends boolean = false>(
        key:  TKey,
        value: TIsArray extends true ? ArrayElementType<TMeta[TKey]> : TMeta[TKey],
        isArray: TIsArray,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorate<TMeta extends Partial<TClass & TProp & TParam>, TKey extends keyof TMeta, TIsArray extends boolean = false>(
        key:  TKey | ((meta: TMeta, level: TLevels, propKey?: string | symbol, index?: number) => TMeta),
        value: TIsArray extends true ? ArrayElementType<TMeta[TKey]> : TMeta[TKey],
        isArray: TIsArray,
        level: TMergedDecoratorArgs['level'],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorate<TMeta extends Partial<TClass & TProp & TParam>, TKey extends keyof TMeta, TIsArray extends boolean = false>(
        key:  TKey,
        value?: TIsArray extends true ? ArrayElementType<TMeta[TKey]> : TMeta[TKey],
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
            this.set<TMeta, TKey>(args, key, value as TMeta[TKey], isArray)
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
    
    decorateClass<TMeta extends TObject = Partial<TClass & TProp & TParam>>(
        cb: ((meta: TMeta, level: TLevels, propKey?: string | symbol, index?: number) => TMeta)
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorateClass<TMeta extends TObject = Partial<TClass & TProp & TParam>, TKey extends keyof TMeta = keyof TMeta, TIsArray extends boolean = false>(
        key:  TKey,
        value: TIsArray extends true ? ArrayElementType<TMeta[TKey]> : TMeta[TKey],
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator

    decorateClass<TMeta extends TObject = Partial<TClass & TProp & TParam>, TKey extends keyof TMeta = keyof TMeta, TIsArray extends boolean = false>(
        key:  TKey,
        value: TIsArray extends true ? ArrayElementType<TMeta[TKey]> : TMeta[TKey],
        isArray: boolean | undefined,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator
    
    decorateClass<TMeta extends TObject = Partial<TClass & TProp & TParam>, TKey extends keyof TMeta = keyof TMeta, TIsArray extends boolean = false>(
        key:  TKey | ((meta: TMeta, level: TLevels, propKey?: string | symbol, index?: number) => TMeta),
        value?: TIsArray extends true ? ArrayElementType<TMeta[TKey]> : TMeta[TKey],
        isArray?: boolean,
    ): MethodDecorator & ClassDecorator & ParameterDecorator & PropertyDecorator {
        return this.decorate<TMeta, TKey>(key, value as TMeta[TKey], isArray as false, 'CLASS')
    }
}

const fnProto = Object.getPrototypeOf(Function) as TFunction

type ArrayElementType<T> = T extends (infer E)[] ? E : never;
