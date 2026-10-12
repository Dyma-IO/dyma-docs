---
sidebar_position: 10
---

# Project REST verification

A **Custom (Project REST API)** quest asks *your* server whether an earner did something only you
can check (an in-app action, a purchase, a sign-up). Dyma calls your endpoint server-side, signs the
call, and credits the quest when you answer yes. Available on plans with the **project REST API**
feature (Growth and above by default).

## Configure

1. **Project → Settings → Integrations → REST API**: generate the project's **signing secret**. It
   is stored encrypted; copy it to your server.
2. In the quest editor, describe the request:

| Field | Detail |
|---|---|
| Method | `GET` or `POST` |
| URL | full `https://` URL. Templates are allowed in the path and query, **not** in the scheme or host, and every substituted value is URL-encoded, so earner input can never change where the call goes |
| Query parameters, headers | key/value pairs; values may use templates |
| JSON body | `POST` only; string values may use templates |
| Timeout | seconds, default 30 (capped by Dyma) |
| Sign request | on by default when the project has a secret |

Templates: `{{user.id}}`, `{{wallet}}`, `{{submission.id}}`, `{{quest.id}}`, `{{campaign.id}}`,
`{{project.id}}`, `{{inputs}}` (every field the earner filled in) and `{{inputs.<field>}}`. Earner
fields come from the quest's input schema. Dyma never sends e-mail addresses.

3. Use the editor's **dry run** to call your endpoint with sample values before publishing.

## Request signature (v2)

Every signed call carries three headers:

| Header | Value |
|---|---|
| `X-Dyma-Timestamp` | Unix time in seconds when the call was signed |
| `X-Dyma-Signature-V2` | `v2=` + hex HMAC-SHA256 of the canonical string below, keyed with your secret |
| `X-Dyma-Signature` | legacy: hex HMAC-SHA256 of the body only (kept so older receivers keep working; it does not cover the method, the path or the time — migrate to v2) |

Canonical string — four parts joined by `\n`:

```
<timestamp>
<METHOD>             upper case: GET or POST
<path?query>         exactly as requested, e.g. /dyma/verify?quest=q_123&wallet=addr_safro1...
<body>               the raw request body, empty for GET
```

Your receiver must:

1. Reject a timestamp more than **300 seconds** from its own clock (replay window).
2. Recompute the HMAC over the **raw** body (before any JSON parsing) and compare it in constant
   time.
3. Optionally de-duplicate by `submission.id` if you pass it.

Because the method, path, query and time are signed, a captured call can neither be replayed later
nor moved to another endpoint.

### Node.js

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifyDymaSignature({ secret, method, pathWithQuery, rawBody, timestamp, signature }) {
  const ts = Number(timestamp);
  if (!Number.isInteger(ts) || !signature?.startsWith('v2=')) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - ts) > 300) return false;
  const canonical = `${ts}\n${method.toUpperCase()}\n${pathWithQuery}\n${rawBody ?? ''}`;
  const expected = createHmac('sha256', secret).update(canonical).digest();
  const given = Buffer.from(signature.slice(3), 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Express: keep the raw body, e.g. app.use(express.raw({ type: '*/*' }))
// verifyDymaSignature({ secret, method: req.method, pathWithQuery: req.originalUrl,
//   rawBody: req.body.toString('utf8'), timestamp: req.get('X-Dyma-Timestamp'),
//   signature: req.get('X-Dyma-Signature-V2') })
```

### Python

```python
import hashlib, hmac, time

def verify_dyma_signature(secret: str, method: str, path_with_query: str,
                          raw_body: bytes, timestamp: str, signature: str) -> bool:
    if not signature or not signature.startswith("v2="):
        return False
    try:
        ts = int(timestamp)
    except (TypeError, ValueError):
        return False
    if abs(int(time.time()) - ts) > 300:
        return False
    canonical = f"{ts}\n{method.upper()}\n{path_with_query}\n".encode() + (raw_body or b"")
    expected = hmac.new(secret.encode(), canonical, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature[3:])
```

## Your response

| Requirement | Detail |
|---|---|
| Success | HTTP 2xx **and** a JSON body with `"verified": true` or `"success": true` |
| Not (yet) | non-2xx, or `verified`/`success` false; add a `reason` the earner can read |
| Optional | `metadata` (an object stored with the attempt) |

```json
{ "verified": true, "reason": "Account created on 2026-10-09", "metadata": { "plan": "pro" } }
```

- A negative answer keeps the quest **open**: the earner can fix things and verify again. Use
  `reason` to say what is missing.
- Dyma retries up to twice (short backoff) on 5xx answers and network errors, re-signing each
  attempt; 4xx answers are final for that attempt.
- Calls go out from Dyma's API servers; private and internal network addresses are refused.
