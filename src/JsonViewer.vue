/*
 *    Copyright (C) 2026 JASE Software LLC.
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 */
<template>
  <div class="json-viewer">
    <p
      v-if="parseError"
      class="json-viewer__error text-negative q-mb-sm"
      role="alert"
    >
      {{ parseError }}
    </p>
    <q-tree
      v-else
      v-model:expanded="expanded"
      :nodes="nodes"
      node-key="id"
      :dense="dense"
      class="json-viewer__tree"
    >
      <template #default-header="prop">
        <div class="json-viewer__node">
          <span class="json-viewer__key">{{ prop.node.key }}</span>
          <template v-if="isContainer(prop.node.type)">
            <span class="json-viewer__summary text-grey-7">
              {{ prop.node.summary }}
            </span>
          </template>
          <template v-else>
            <span class="json-viewer__sep text-grey-6">:</span>
            <span
              class="json-viewer__value"
              :class="`json-viewer__value--${prop.node.type}`"
            >{{ formatPrimitive(prop.node.type, prop.node.value) }}</span>
          </template>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import {
  collectExpandedIds,
  formatPrimitive,
  jsonToTreeNodes,
  parseJsonInput,
  type JsonTreeNode,
  type JsonValueType,
} from './jsonToTreeNodes';

defineOptions({
  name: 'JsonViewer',
});

const props = withDefaults(
  defineProps<{
    /** Object, array, primitive, or JSON string. */
    modelValue?: unknown;
    /**
     * Expand nodes shallower than this depth (root = 0).
     * Use `Infinity` (default) for fully expanded.
     */
    defaultExpandDepth?: number;
    dense?: boolean;
  }>(),
  {
    modelValue: undefined,
    defaultExpandDepth: Number.POSITIVE_INFINITY,
    dense: true,
  },
);

const expanded = ref<string[]>([]);

const parsed = computed(() => parseJsonInput(props.modelValue));

const parseError = computed(() =>
  parsed.value.ok ? null : parsed.value.error,
);

const rootNode = computed<JsonTreeNode | null>(() => {

  if (!parsed.value.ok) {

    return null;

  }

  return jsonToTreeNodes(parsed.value.value);

});

const nodes = computed<JsonTreeNode[]>(() =>
  rootNode.value == null ? [] : [rootNode.value],
);

watch(
  [rootNode, () => props.defaultExpandDepth],
  () => {

    if (rootNode.value == null) {

      expanded.value = [];
      return;

    }

    expanded.value = collectExpandedIds(
      rootNode.value,
      props.defaultExpandDepth,
    );

  },
  { immediate: true },
);

function isContainer(type: JsonValueType): boolean {

  return type === 'object' || type === 'array';

}
</script>

<style scoped>
.json-viewer__tree {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8125rem;
}

.json-viewer__node {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  min-width: 0;
}

.json-viewer__key {
  color: var(--q-primary);
}

.json-viewer__value--string {
  color: #0a7a3e;
}

.json-viewer__value--number {
  color: #1d4ed8;
}

.json-viewer__value--boolean {
  color: #a16207;
}

.json-viewer__value--null {
  color: #6b7280;
  font-style: italic;
}

:global(body.body--dark) .json-viewer__value--string {
  color: #4ade80;
}

:global(body.body--dark) .json-viewer__value--number {
  color: #93c5fd;
}

:global(body.body--dark) .json-viewer__value--boolean {
  color: #fbbf24;
}

:global(body.body--dark) .json-viewer__value--null {
  color: #9ca3af;
}
</style>
