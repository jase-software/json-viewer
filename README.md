# @jase/json-viewer

Quasar `q-tree` JSON browser for Vue 3.

**Repository:** [github.com/jase-software/json-viewer](https://github.com/jase-software/json-viewer)

- Browse objects and arrays with expand/collapse
- Accepts a JavaScript value or a JSON string
- Supports relaxed JSON:
  - `//` line comments
  - trailing commas before `}` / `]`

View-only (no inline editing).

## Requirements

Peer dependencies:

| Package | Version |
|---------|---------|
| `vue` | ^3.5 |
| `quasar` | ^2.16 (`QTree` must be available) |

## Install

```bash
npm install github:jase-software/json-viewer#v0.1.0
# or
yarn add github:jase-software/json-viewer#v0.1.0
```

`package.json`:

```json
{
  "dependencies": {
    "@jase/json-viewer": "github:jase-software/json-viewer#v0.1.0"
  }
}
```

### Vite / Quasar

Exclude the package from dependency prebundling so `.vue` source resolves correctly:

```ts
viteConf.optimizeDeps ??= {};
viteConf.optimizeDeps.exclude = [
  ...(viteConf.optimizeDeps.exclude ?? []),
  '@jase/json-viewer',
];
```

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

Objects and arrays can be passed directly:

```vue
<JsonViewer :model-value="{ a: 1, b: [2, 3] }" />
```

Invalid JSON strings show an error instead of the tree.

### Props

| Prop | Type | Default | Notes |
|------|------|---------|--------|
| `modelValue` | `unknown` | — | Object, array, primitive, or JSON string |
| `defaultExpandDepth` | `number` | `Infinity` | Expand nodes with depth less than this value (root = `0`) |
| `dense` | `boolean` | `true` | Passed through to `q-tree` |

## Helpers

Parsing and tree helpers are also exported (no Vue required):

```ts
import {
  parseRelaxedJson,
  uncommentJson,
  stripTrailingCommas,
  parseJsonInput,
  jsonToTreeNodes,
  collectExpandedIds,
  formatPrimitive,
} from '@jase/json-viewer';
```

## License

Mozilla Public License 2.0 — see [LICENSE](./LICENSE).
