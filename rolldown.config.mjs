import { readFileSync } from 'node:fs'
import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

const pkg = JSON.parse(
    readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
)

function createConfig(type) {
    const formats = { cjs: 'cjs', mjs: 'es' }
    return defineConfig({
        input: './src/index.ts',
        output: {
            file: `./dist/index.${type}`,
            format: formats[type],
            sourcemap: false,
        },
        // rolldown honors define only under transform.define
        // (top-level define is silently ignored)
        transform: {
            define: {
                'process.env.NODE_ENV': JSON.stringify('production'),
                __VERSION__: JSON.stringify(pkg.version),
            },
        },
    })
}

function createDtsConfig() {
    return defineConfig({
        input: './dts-build/index.d.ts',
        plugins: [
            dts({
                dtsInput: true,
            }),
        ],
        output: {
            file: './dist/index.d.ts',
            format: 'es',
            sourcemap: false,
        },
    })
}

export default [createConfig('mjs'), createConfig('cjs'), createDtsConfig()]
