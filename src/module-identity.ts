/**
 * Duplicate-copy detection for @prostojs/mate
 *
 * Mate stores class metadata in WeakMaps keyed by constructor reference.
 * If a bundler loads two copies of mate (or of a decorated class),
 * decorators run against one copy while lookups hit the other, and
 * metadata silently "disappears". The first loaded copy stamps
 * `globalThis` under a global symbol; any subsequent copy finds the
 * stamp and warns.
 */

export interface TMateModuleIdentity {
    version?: string
    path?: string
}

export const MATE_MODULE_IDENTITY_KEY = Symbol.for(
    'prostojs:mate:module-identity',
)

function getModulePath(): string | undefined {
    try {
        // Rolldown shims import.meta.url for the CJS build;
        // the try/catch guards exotic runtimes where the shim throws
        return import.meta.url
    } catch {
        return undefined
    }
}

function formatIdentity(identity: TMateModuleIdentity): string {
    const version = identity.version
        ? `v${identity.version}`
        : 'unknown version'
    return identity.path ? `${version} at ${identity.path}` : version
}

/**
 * Stamps `globalThis` with this copy's identity and warns if another
 * copy of @prostojs/mate was already loaded.
 *
 * Invoked once at module scope from index.ts, so importing the package
 * performs the check.
 */
export function warnOnDuplicateMate(): void {
    const g = globalThis as Record<symbol, TMateModuleIdentity | undefined>
    const identity: TMateModuleIdentity = {}
    if (typeof __VERSION__ === 'string') {
        identity.version = __VERSION__
    }
    const path = getModulePath()
    if (path) {
        identity.path = path
    }
    const first = g[MATE_MODULE_IDENTITY_KEY]
    if (first) {
        console.warn(
            `[mate] A second copy of @prostojs/mate was loaded (${formatIdentity(
                first,
            )}, now ${formatIdentity(identity)}). Decorator metadata is ` +
                'stored per-copy and will NOT be visible across copies. ' +
                'Check your bundler/dedupe settings.',
        )
    } else {
        g[MATE_MODULE_IDENTITY_KEY] = identity
    }
}
