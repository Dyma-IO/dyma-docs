/**
 * A host of Dyma UTXO's site: `example.io`, `app.example.io`; with a prefix (a second deployment
 * such as the preprod demo), `demo.example.io`, `demo-app.example.io`. Shared by the config and
 * the pages' components.
 */
export function utxoHost(domain: string, prefix: string | null, subdomain?: string): string {
  if (prefix) return `${subdomain ? `${prefix}-${subdomain}` : prefix}.${domain}`;
  return subdomain ? `${subdomain}.${domain}` : domain;
}
