# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**@prostojs/mate** — a typed TypeScript metadata organizer built on top of `reflect-metadata`. The name "MA-TE" is "ME-TA" reversed. It provides decorator factories for attaching/reading metadata on classes, methods, properties, and parameters with full type safety. Zero runtime dependencies; the built-in reflect shim means `reflect-metadata` is optional.

## Commands

```bash
pnpm test              # Run tests (jest --runInBand, serial due to global Reflect state)
pnpm test:cov          # Run tests with coverage
pnpm test -- --testPathPattern=mate.spec   # Run a single test file
pnpm build             # Build with rollup + api-extractor (outputs to dist/)
pnpm lint              # ESLint with --fix
```

## Architecture

### Core (`src/mate.ts`)

The `Mate<TClass, TProp>` class is the entire public API. A Mate instance is created with a unique workspace string key and options. It provides:

- **`decorate(key, value?, isArray?, level?)`** — returns a universal decorator (class/method/property/parameter). Accepts a callback for dynamic metadata.
- **`decorateClass(key, value?, isArray?)`** — forces metadata to class-level regardless of decorator placement (hoists param/method data up to class metadata).
- **`decorateConditional(cb)`** — decorator that receives the resolved level (`CLASS|METHOD|PROP|PARAM`) to pick behavior dynamically.
- **`apply(...decorators)`** — compose multiple decorators into one.
- **`read(target, propKey?)`** — reads metadata from a class or property/method. Handles both constructors and instances. Supports inheritance.
- **`_cleanup()`** — resets stored metadata (for hot-reload/dev scenarios).

Key types: `TMateOptions`, `TMateClassMeta`, `TMatePropMeta`, `TMateParamMeta`, `TMergedDecoratorArgs`, `TLevels`.

### Reflect Shim (`src/reflect.ts`)

A built-in limited reflect-metadata implementation using two WeakMaps. Auto-installs on global `Reflect` if `reflect-metadata` isn't already loaded. If the real package is present, it takes precedence. Only implements `getOwnMetadata`, `defineMetadata`, `metadata`.

### Helpers (`src/utils/helpers.ts`)

`getConstructor(instance)` and `isConstructor(v)` — utilities for resolving class constructors from instances.

### Test Structure (`src/tests/`)

Tests use `.artifacts.ts` files for fixture classes (decorated with mate) and `.spec.ts` files for assertions. This separation keeps test setup reusable. Tests **must** run serially (`--runInBand`) because reflect-metadata uses global state.

## Build

Rollup v2 with `rollup-plugin-typescript2` outputs `esm-bundler` and `cjs` formats to `dist/`. After rollup, `@microsoft/api-extractor` rolls up `.d.ts` files into a single `dist/mate.d.ts`. Compile-time constants (`__DEV__`, `__VERSION__`, `__COMMIT__`, `__DYE_*__`) are replaced at build time.

## Conventions

- **TypeScript strict mode** with `emitDecoratorMetadata` and `experimentalDecorators` enabled
- **Style:** 4-space indent, single quotes, no semicolons, trailing commas, LF line endings
- **Commit messages:** conventional commits enforced by git hook — `type(scope)?: subject` where type is one of: `feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release`
- **Array metadata** uses `unshift` (prepend, not append) when `isArray: true`
- Package manager: **pnpm**
