import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'
import { dye } from '@prostojs/dye'

export default defineConfig({
    plugins: [
        swc.vite({
            jsc: {
                parser: {
                    syntax: 'typescript',
                    decorators: true,
                },
                transform: {
                    decoratorMetadata: true,
                },
            },
        }),
    ],
    define: {
        __DYE_RED_BRIGHT__: JSON.stringify(dye('red-bright').open),
        __DYE_BOLD__: JSON.stringify(dye('bold').open),
        __DYE_RESET__: JSON.stringify(dye.reset),
        __DYE_RED__: JSON.stringify(dye('red').open),
        __DYE_COLOR_OFF__: JSON.stringify(dye('red').close),
        __DYE_GREEN__: JSON.stringify(dye('green').open),
        __DYE_GREEN_BRIGHT__: JSON.stringify(dye('green-bright').open),
        __DYE_BLUE__: JSON.stringify(dye('blue').open),
        __DYE_YELLOW__: JSON.stringify(dye('yellow').open),
        __DYE_DIM__: JSON.stringify(dye('dim').open),
        __DYE_DIM_OFF__: JSON.stringify(dye('dim').close),
        __VERSION__: JSON.stringify('VITEST_TEST'),
    },
    test: {
        include: ['**/*.spec.ts'],
        coverage: {
            include: ['src/**/*.ts'],
            exclude: ['**/*.artifacts.ts', '**/index.ts'],
            reportsDirectory: 'coverage',
            reporter: ['html', 'lcov', 'text'],
        },
    },
})
