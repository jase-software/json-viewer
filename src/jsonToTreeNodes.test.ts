/*
 *    Copyright (C) 2026 JASE Software LLC.
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 */
import { describe, expect, it } from 'vitest';

import {
  collectExpandedIds,
  formatPrimitive,
  jsonToTreeNodes,
  parseJsonInput,
} from './jsonToTreeNodes';

describe('parseJsonInput', () => {

  it('treats null/empty as empty object', () => {

    expect(parseJsonInput(null)).toEqual({ ok: true, value: {} });
    expect(parseJsonInput('')).toEqual({ ok: true, value: {} });

  });

  it('parses JSON strings', () => {

    expect(parseJsonInput('{"a":1}')).toEqual({ ok: true, value: { a: 1 } });

  });

  it('parses Suite-style // comments and trailing commas', () => {

    const input = `{
  // note
  "a": 1,
  "b": [2,],
}`;
    expect(parseJsonInput(input)).toEqual({
      ok: true,
      value: { a: 1, b: [2] },
    });

  });

  it('returns parse errors for invalid JSON strings', () => {

    const result = parseJsonInput('{nope');
    expect(result.ok).toBe(false);
    if (!result.ok) {

      expect(result.error.length).toBeGreaterThan(0);

    }

  });

  it('passes objects through', () => {

    const value = { x: true };
    expect(parseJsonInput(value)).toEqual({ ok: true, value });

  });

});

describe('jsonToTreeNodes', () => {

  it('maps nested object/array/primitives', () => {

    const root = jsonToTreeNodes({
      name: 'Forge',
      count: 2,
      active: true,
      tags: ['a', null],
      meta: { nested: false },
    });

    expect(root.id).toBe('root');
    expect(root.type).toBe('object');
    expect(root.summary).toBe('{5}');
    expect(root.children?.map((c) => c.key)).toEqual([
      'name',
      'count',
      'active',
      'tags',
      'meta',
    ]);

    const tags = root.children?.find((c) => c.key === 'tags');
    expect(tags?.type).toBe('array');
    expect(tags?.summary).toBe('[2]');
    expect(tags?.children?.[1]).toMatchObject({
      key: '1',
      type: 'null',
      value: null,
    });

    const name = root.children?.find((c) => c.key === 'name');
    expect(name).toMatchObject({
      type: 'string',
      value: 'Forge',
    });

  });

  it('roots a top-level array', () => {

    const root = jsonToTreeNodes([1, 2], 'items');
    expect(root).toMatchObject({
      id: 'items',
      key: 'items',
      type: 'array',
      summary: '[2]',
    });
    expect(root.children?.[0]).toMatchObject({
      id: 'items.0',
      key: '0',
      type: 'number',
      value: 1,
    });

  });

});

describe('collectExpandedIds', () => {

  it('expands nodes shallower than maxDepth', () => {

    const root = jsonToTreeNodes({
      a: { b: { c: 1 } },
      d: [ { e: 2 } ],
    });

    expect(collectExpandedIds(root, 0)).toEqual([]);
    expect(collectExpandedIds(root, 1)).toEqual(['root']);
    expect(collectExpandedIds(root, 2).sort()).toEqual(
      ['root', 'root.a', 'root.d'].sort(),
    );

  });

});

describe('formatPrimitive', () => {

  it('quotes strings and renders null', () => {

    expect(formatPrimitive('string', 'hi')).toBe('"hi"');
    expect(formatPrimitive('null', null)).toBe('null');
    expect(formatPrimitive('boolean', true)).toBe('true');
    expect(formatPrimitive('number', 3)).toBe('3');

  });

});
