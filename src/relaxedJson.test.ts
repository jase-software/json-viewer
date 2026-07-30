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
  parseRelaxedJson,
  stripTrailingCommas,
  uncommentJson,
} from './relaxedJson';

describe('uncommentJson', () => {

  it('strips // comments outside strings', () => {

    const input = `{
  // product name
  "name": "Forge", // trailing note
  "url": "https://example.com//path"
}`;

    expect(uncommentJson(input)).toBe(`{
  
  "name": "Forge", 
  "url": "https://example.com//path"
}`);

  });

  it('keeps escaped quotes inside strings', () => {

    expect(uncommentJson('{ "a": "say \\"hi\\" // still string" }')).toBe(
      '{ "a": "say \\"hi\\" // still string" }',
    );

  });

});

describe('stripTrailingCommas', () => {

  it('removes commas before } and ]', () => {

    expect(stripTrailingCommas('{ "a": 1, "b": [2, 3,], }')).toBe(
      '{ "a": 1, "b": [2, 3] }',
    );

  });

  it('does not strip commas inside strings', () => {

    expect(stripTrailingCommas('{ "a": "x,}", }')).toBe('{ "a": "x,}" }');

  });

});

describe('parseRelaxedJson', () => {

  it('parses Suite-style comments and trailing commas', () => {

    const input = `{
  // root
  "enabled": true,
  "tags": [
    "a",
    "b", // last
  ],
}`;

    expect(parseRelaxedJson(input)).toEqual({
      enabled: true,
      tags: ['a', 'b'],
    });

  });

});
