/*
 *    Copyright (C) 2026 JASE Software LLC.
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 */

import { parseRelaxedJson } from './relaxedJson';

/** JSON (or JSON-like) value kinds shown in the viewer. */
export type JsonValueType =
  | 'object'
  | 'array'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null';

/**
 * Quasar `q-tree` node for one JSON value.
 * Use `id` as `node-key`.
 */
export type JsonTreeNode = {
  id: string;
  /** Property name or array index (stringified). */
  key: string;
  /** Fallback label if a custom header slot is not used. */
  label: string;
  type: JsonValueType;
  /** Present for primitives; containers omit this. */
  value?: string | number | boolean | null;
  /** Collapsed summary for objects/arrays, e.g. `{3}` / `[12]`. */
  summary?: string;
  children?: JsonTreeNode[];
};

export type ParseJsonInputResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

/**
 * Normalizes viewer input: objects/arrays/primitives pass through;
 * strings are parsed with Suite-aligned relaxed JSON (`//` comments + trailing commas);
 * empty/null → empty object.
 */
export function parseJsonInput(input: unknown): ParseJsonInputResult {

  if (input == null || input === '') {

    return { ok: true, value: {} };

  }

  if (typeof input === 'string') {

    try {

      return { ok: true, value: parseRelaxedJson(input) };

    } catch (err) {

      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };

    }

  }

  return { ok: true, value: input };

}

/**
 * Builds a single root tree node for `q-tree` (`:nodes="[root]"`).
 */
export function jsonToTreeNodes(
  value: unknown,
  rootKey = 'root',
): JsonTreeNode {

  return toNode(value, rootKey, rootKey);

}

/**
 * Collects node ids whose depth is strictly less than `maxDepth`
 * (root depth = 0). Used to seed `q-tree` expanded state.
 */
export function collectExpandedIds(
  root: JsonTreeNode,
  maxDepth: number,
): string[] {

  if (maxDepth <= 0) {

    return [];

  }

  const ids: string[] = [];
  walkExpand(root, 0, maxDepth, ids);
  return ids;

}

function walkExpand(
  node: JsonTreeNode,
  depth: number,
  maxDepth: number,
  ids: string[],
): void {

  if (depth >= maxDepth) {

    return;

  }

  if (node.children == null || node.children.length === 0) {

    return;

  }

  ids.push(node.id);

  for (const child of node.children) {

    walkExpand(child, depth + 1, maxDepth, ids);

  }

}

function toNode(value: unknown, key: string, path: string): JsonTreeNode {

  if (value === null) {

    return {
      id: path,
      key,
      label: formatLeafLabel(key, 'null', null),
      type: 'null',
      value: null,
    };

  }

  if (Array.isArray(value)) {

    const children = value.map((item, index) =>
      toNode(item, String(index), `${path}.${index}`),
    );

    return {
      id: path,
      key,
      label: `${key} ${formatSummary('array', children.length)}`,
      type: 'array',
      summary: formatSummary('array', children.length),
      children,
    };

  }

  const valueType = typeof value;

  if (valueType === 'object') {

    const entries = Object.entries(value as Record<string, unknown>);
    const children = entries.map(([childKey, childValue]) =>
      toNode(childValue, childKey, `${path}.${escapePathSegment(childKey)}`),
    );

    return {
      id: path,
      key,
      label: `${key} ${formatSummary('object', children.length)}`,
      type: 'object',
      summary: formatSummary('object', children.length),
      children,
    };

  }

  if (valueType === 'string') {

    const text = value as string;
    return {
      id: path,
      key,
      label: formatLeafLabel(key, 'string', text),
      type: 'string',
      value: text,
    };

  }

  if (valueType === 'number') {

    const num = value as number;
    return {
      id: path,
      key,
      label: formatLeafLabel(key, 'number', num),
      type: 'number',
      value: num,
    };

  }

  if (valueType === 'boolean') {

    const flag = value as boolean;
    return {
      id: path,
      key,
      label: formatLeafLabel(key, 'boolean', flag),
      type: 'boolean',
      value: flag,
    };

  }

  // Unexpected (undefined, function, symbol, bigint) — stringify for visibility.
  const fallback = String(value);
  return {
    id: path,
    key,
    label: formatLeafLabel(key, 'string', fallback),
    type: 'string',
    value: fallback,
  };

}

function formatSummary(type: 'object' | 'array', count: number): string {

  return type === 'array' ? `[${count}]` : `{${count}}`;

}

function formatLeafLabel(
  key: string,
  type: JsonValueType,
  value: string | number | boolean | null,
): string {

  return `${key}: ${formatPrimitive(type, value)}`;

}

/** Display form for a primitive (also used by the viewer slot). */
export function formatPrimitive(
  type: JsonValueType,
  value: string | number | boolean | null | undefined,
): string {

  if (type === 'null' || value === null) {

    return 'null';

  }

  if (type === 'string') {

    return JSON.stringify(value ?? '');

  }

  return String(value);

}

function escapePathSegment(segment: string): string {

  // Keep ids readable; escape dots so path splits stay unambiguous for tooling later.
  return segment.replace(/\\/g, '\\\\').replace(/\./g, '\\.');

}
