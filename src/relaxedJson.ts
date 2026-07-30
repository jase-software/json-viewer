/*
 *    Copyright (C) 2026 JASE Software LLC.
 *
 *    This Source Code Form is subject to the terms of the Mozilla Public
 *    License, v. 2.0. If a copy of the MPL was not distributed with this
 *    file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 */

/**
 * Relaxed JSON helpers aligned with JASE.Serializers.Json:
 * - `//` line comments via {@link uncommentJson} (Suite `UncommentJson`)
 * - trailing commas via {@link stripTrailingCommas} (STJ `AllowTrailingCommas`)
 */

/**
 * Removes `//` line comments outside of strings.
 * Port of `JASE.Serializers.Json.UncommentJson` (comment strip only — no parse).
 */
export function uncommentJson(json: string): string {

  const length = json.length;
  let result = '';
  let inString = false;
  let i = 0;

  while (i < length) {

    const ch = json[i]!;

    if (!inString) {

      if (ch === '/' && i + 1 < length && json[i + 1] === '/') {

        i += 2;
        while (i < length && json[i] !== '\r' && json[i] !== '\n') {

          i++;

        }

        if (i < length) {

          if (json[i] === '\r') {

            result += '\r';
            i++;

            if (i < length && json[i] === '\n') {

              result += '\n';
              i++;

            }

            continue;

          }

          result += '\n';
          i++;
          continue;

        }

        continue;

      }

      result += ch;

      if (ch === '"') {

        inString = true;

      }

    } else {

      result += ch;

      if (ch === '"') {

        let backslashCount = 0;
        let j = i - 1;

        while (j >= 0 && json[j] === '\\') {

          backslashCount++;
          j--;

        }

        if ((backslashCount % 2) === 0) {

          inString = false;

        }

      }

    }

    i++;

  }

  return result;

}

/**
 * Drops commas that immediately precede `}` or `]` (whitespace allowed between),
 * outside of strings — same intent as System.Text.Json `AllowTrailingCommas`.
 */
export function stripTrailingCommas(json: string): string {

  const length = json.length;
  let result = '';
  let inString = false;
  let i = 0;

  while (i < length) {

    const ch = json[i]!;

    if (inString) {

      result += ch;

      if (ch === '"') {

        let backslashCount = 0;
        let j = i - 1;

        while (j >= 0 && json[j] === '\\') {

          backslashCount++;
          j--;

        }

        if ((backslashCount % 2) === 0) {

          inString = false;

        }

      }

      i++;
      continue;

    }

    if (ch === '"') {

      inString = true;
      result += ch;
      i++;
      continue;

    }

    if (ch === ',') {

      let k = i + 1;

      while (
        k < length
        && (json[k] === ' '
          || json[k] === '\t'
          || json[k] === '\r'
          || json[k] === '\n')
      ) {

        k++;

      }

      if (k < length && (json[k] === '}' || json[k] === ']')) {

        // Skip the trailing comma; keep following whitespace for readability.
        i++;
        continue;

      }

    }

    result += ch;
    i++;

  }

  return result;

}

/** Strip Suite-style comments + trailing commas, then `JSON.parse`. */
export function parseRelaxedJson(json: string): unknown {

  const cleaned = stripTrailingCommas(uncommentJson(json));
  return JSON.parse(cleaned) as unknown;

}
