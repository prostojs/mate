// Global compile-time constants
declare var __DEV__: boolean
declare var __TEST__: boolean
declare var __BROWSER__: boolean
declare var __GLOBAL__: boolean
declare var __ESM_BUNDLER__: boolean
declare var __ESM_BROWSER__: boolean
declare var __NODE_JS__: boolean
declare var __SSR__: boolean
declare var __COMMIT__: string
declare var __VERSION__: string

declare namespace Reflect {
    function getOwnMetadata(
        key: string | symbol,
        target: TObject | TFunction,
        prop?: string | symbol,
    ): unknown
    function defineMetadata(
        key: string | symbol,
        data: unknown,
        target: TObject | TFunction,
        prop?: string | symbol,
    ): void
    function metadata(
        key: string | symbol,
        data: unknown,
    ): ClassDecorator & MethodDecorator & ParameterDecorator
}

declare var self: Record<string | symbol, unknown>
