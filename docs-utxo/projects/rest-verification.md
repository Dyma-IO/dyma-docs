---
description: A Custom (Project REST API) quest asks your own server, in a signed call, whether an earner did something.
---

import RestVerificationSetup from '@site/docs-shared/projects/_rest-verification-setup.mdx';
import RestVerificationReceiver from '@site/docs-shared/projects/_rest-verification-receiver.mdx';

# Project REST verification

<RestVerificationSetup />

```
<timestamp>
<METHOD>             upper case: GET or POST
<path?query>         exactly as requested, e.g. /dyma/verify?quest=q_123&wallet=stake1...
<body>               the raw request body, empty for GET
```

<RestVerificationReceiver />
