/* eslint-disable no-var */
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

// dye colors
declare var __DYE_RESET__: string
declare var __DYE_COLOR_OFF__: string
declare var __DYE_BG_OFF__: string
declare var __DYE_DIM__: string
declare var __DYE_DIM_OFF__: string
declare var __DYE_BOLD__: string
declare var __DYE_BOLD_OFF__: string
declare var __DYE_UNDERSCORE__: string
declare var __DYE_UNDERSCORE_OFF__: string
declare var __DYE_INVERSE__: string
declare var __DYE_INVERSE_OFF__: string
declare var __DYE_ITALIC__: string
declare var __DYE_ITALIC_OFF__: string
declare var __DYE_CROSSED__: string
declare var __DYE_CROSSED_OFF__: string
declare var __DYE_RED__: string
declare var __DYE_BG_RED__: string
declare var __DYE_RED_BRIGHT__: string
declare var __DYE_BG_RED_BRIGHT__: string
declare var __DYE_GREEN__: string
declare var __DYE_BG_GREEN__: string
declare var __DYE_GREEN_BRIGHT__: string
declare var __DYE_BG_GREEN_BRIGHT__: string
declare var __DYE_CYAN__: string
declare var __DYE_BG_CYAN__: string
declare var __DYE_CYAN_BRIGHT__: string
declare var __DYE_BG_CYAN_BRIGHT__: string
declare var __DYE_BLUE__: string
declare var __DYE_BG_BLUE__: string
declare var __DYE_BLUE_BRIGHT__: string
declare var __DYE_BG_BLUE_BRIGHT__: string
declare var __DYE_YELLOW__: string
declare var __DYE_BG_YELLOW__: string
declare var __DYE_YELLOW_BRIGHT__: string
declare var __DYE_BG_YELLOW_BRIGHT__: string
declare var __DYE_WHITE__: string
declare var __DYE_BG_WHITE__: string
declare var __DYE_WHITE_BRIGHT__: string
declare var __DYE_BG_WHITE_BRIGHT__: string
declare var __DYE_MAGENTA__: string
declare var __DYE_BG_MAGENTA__: string
declare var __DYE_MAGENTA_BRIGHT__: string
declare var __DYE_BG_MAGENTA_BRIGHT__: string
declare var __DYE_BLACK__: string
declare var __DYE_BG_BLACK__: string
declare var __DYE_BLACK_BRIGHT__: string
declare var __DYE_BG_BLACK_BRIGHT__: string

declare namespace Reflect {
    function getOwnMetadata(key: string | symbol, target: TObject | TFunction, prop?: string | symbol): unknown
    function defineMetadata(key: string | symbol, data: unknown, target: TObject | TFunction, prop?: string | symbol): void
    function metadata(key: string | symbol, data: unknown): ClassDecorator & MethodDecorator & ParameterDecorator
}

declare var self: Record<string | symbol, unknown>