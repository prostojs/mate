import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

function createConfig(type) {
    const formats = { cjs: 'cjs', mjs: 'es' }
    return defineConfig({
        input: './src/index.ts',
        output: {
            file: `./dist/index.${type}`,
            format: formats[type],
            sourcemap: false,
        },
        define: {
            'process.env.NODE_ENV': JSON.stringify('production'),
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
