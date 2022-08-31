/* istanbul ignore file */
import { banner } from './banner'

export function log(text: string) {
    console.log(__DYE_GREEN__ + __DYE_DIM__ + banner() + text + __DYE_RESET__)
}

export function logError(error: string) {
    console.error(__DYE_RED_BRIGHT__ + __DYE_BOLD__ + banner() + error + __DYE_RESET__)
}
