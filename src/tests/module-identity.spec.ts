import {
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
    vi,
    type MockInstance,
} from 'vitest'
import {
    MATE_MODULE_IDENTITY_KEY,
    TMateModuleIdentity,
    warnOnDuplicateMate,
} from '../module-identity'

const g = globalThis as Record<symbol, TMateModuleIdentity | undefined>

describe('module-identity', () => {
    let warn: MockInstance

    beforeEach(() => {
        delete g[MATE_MODULE_IDENTITY_KEY]
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('must stamp globalThis and not warn on first load', () => {
        warnOnDuplicateMate()
        expect(warn).not.toHaveBeenCalled()
        const stamp = g[MATE_MODULE_IDENTITY_KEY]
        expect(stamp).toBeDefined()
        expect(stamp?.version).toBe('VITEST_TEST')
        expect(stamp?.path).toContain('module-identity')
    })

    it('must warn with the first copy info when a second copy is loaded', () => {
        const first: TMateModuleIdentity = {
            version: '9.9.9',
            path: 'file:///fake/first/index.mjs',
        }
        g[MATE_MODULE_IDENTITY_KEY] = first
        warnOnDuplicateMate()
        expect(warn).toHaveBeenCalledTimes(1)
        const message = warn.mock.calls[0][0] as string
        expect(message).toContain(
            '[mate] A second copy of @prostojs/mate was loaded',
        )
        expect(message).toContain('v9.9.9 at file:///fake/first/index.mjs')
        expect(message).toContain('now vVITEST_TEST')
        expect(message).toContain('will NOT be visible across copies')
        expect(g[MATE_MODULE_IDENTITY_KEY]).toBe(first)
    })

    it('must run the check when the package entry is imported', async () => {
        g[MATE_MODULE_IDENTITY_KEY] = { version: '9.9.9' }
        await import('../index')
        expect(warn).toHaveBeenCalledTimes(1)
        const message = warn.mock.calls[0][0] as string
        expect(message).toContain(
            '[mate] A second copy of @prostojs/mate was loaded',
        )
        expect(message).toContain('(v9.9.9,')
    })
})
