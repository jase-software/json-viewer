# @jase/json-viewer

Quasar `q-tree` JSON browser for Vue 3.

**Repository:** [github.com/jase-software/json-viewer](https://github.com/jase-software/json-viewer)

- Browse objects/arrays with expand/collapse
- Accepts a JS value **or** a JSON string
- **Relaxed JSON** (aligned with JASE Suite / System.Text.Json):
  - `//` line comments (not `/* */`)
  - trailing commas before `}` / `]`

View-only for now (no inline editing).

## Requirements (peer dependencies)

| Package | Version |
|---------|---------|
| `vue` | ^3.5 |
| `quasar` | ^2.16 (`QTree` must be available — Quasar CLI apps already include it) |

## Install from GitHub

Prefer a **tagged release** so consumers don’t float on `main`.

**npm:**

```bash
npm install github:jase-software/json-viewer#v0.1.0
```

**Yarn:**

```bash
yarn add github:jase-software/json-viewer#v0.1.0
```

Or in `package.json`:

```json
{
  "dependencies": {
    "@jase/json-viewer": "github:jase-software/json-viewer#v0.1.0"
  }
}
```

Then run `npm install` / `yarn`.

Until you cut `v0.1.0`, you can temporarily pin a branch or commit:

```json
{
  "dependencies": {
    "@jase/json-viewer": "github:jase-software/json-viewer#main"
  }
}
```

### Vite / Quasar prebundle

Serve package **source** (including `.vue`) instead of prebundling:

```ts
// quasar.config.ts → build.extendViteConf, or vite.config.ts
viteConf.optimizeDeps ??= {};
viteConf.optimizeDeps.exclude = [
  ...(viteConf.optimizeDeps.exclude ?? []),
  '@jase/json-viewer',
];
```

No separate library build step is required for a Vite/Quasar consumer.

### Local / monorepo alternative

If you vendor the package (or develop it inside another repo):

```json
{
  "dependencies": {
    "@jase/json-viewer": "file:./packages/json-viewer"
  }
}
```

Yarn workspaces: put this package under `packages/*` and depend on `"@jase/json-viewer": "0.1.0"`.

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { JsonViewer } from '@jase/json-viewer';

const json = ref(`{
  // comments and trailing commas are OK
  "name": "demo",
  "tags": ["a", "b",],
}`);
</script>

<template>
  <JsonViewer
    :model-value="json"
    :default-expand-depth="Infinity"
    dense
  />
</template>
```

`model-value` can also be an object/array (skip string parsing):

```vue
<JsonViewer :model-value="{ a: 1, b: [2, 3] }" />
```

Invalid JSON strings show an error message instead of the tree (`role="alert"`).

### Props

| Prop | Type | Default | Notes |
|------|------|---------|--------|
| `modelValue` | `unknown` | — | Object, array, primitive, or JSON string (relaxed) |
| `defaultExpandDepth` | `number` | `Infinity` | Expand nodes with depth **&lt;** this value (root = `0`). Use `0` for fully collapsed, `1`/`2` for shallow |
| `dense` | `boolean` | `true` | Passed through to `q-tree` |

## Helpers (no Vue)

Useful if you only need parsing / tree shaping:

```ts
import {
  parseRelaxedJson,   // uncomment + strip trailing commas + JSON.parse
  uncommentJson,      // // comments only, string-aware
  stripTrailingCommas,
  parseJsonInput,     // viewer input normalizer (objects pass through; strings → relaxed parse)
  jsonToTreeNodes,    // value → q-tree node shape
  collectExpandedIds,
  formatPrimitive,
} from '@jase/json-viewer';
```

## Layout

```
json-viewer/
  LICENSE
  package.json
  README.md
  src/
    index.ts              # public exports
    JsonViewer.vue        # q-tree UI
    jsonToTreeNodes.ts    # tree transform + parseJsonInput
    relaxedJson.ts        # // comments + trailing commas
    *.test.ts             # Vitest unit tests
```

## Versioning for consumers

1. Push `main` with the package sources.
2. Create an annotated tag when the API is worth pinning:

```bash
git tag -a v0.1.0 -m "v0.1.0"
git push origin v0.1.0
```

3. Point dependencies at `#v0.1.0` (not `#main`) for stable installs.

## License

Mozilla Public License 2.0 — see [LICENSE](./LICENSE).
