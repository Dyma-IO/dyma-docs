import type {ReactNode} from 'react';
import CodeBlock from '@theme/CodeBlock';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {UtxoSiteFields} from '@site/docusaurus.config';
import {utxoHost} from '@site/src/utils/utxo-host';

/**
 * Dyma UTXO's own names in its pages (docs-utxo/). Its domain is never written in the
 * repository: the build reads it from DOCS_URL or DOCS_SITE_DOMAIN (docusaurus.config.ts) and
 * these components print it.
 */
export function useUtxoSite(): UtxoSiteFields {
  const {siteConfig} = useDocusaurusContext();
  const fields = siteConfig.customFields as Partial<UtxoSiteFields> | undefined;
  if (fields?.edition !== 'utxo' || !fields.siteDomain) {
    throw new Error('These components belong to Dyma UTXO pages (DOCS_EDITION=utxo).');
  }
  return fields as UtxoSiteFields;
}

/** `example.io`, or `app.example.io` with `sub="app"` (`demo-app.example.io` on the demo). */
function host(site: UtxoSiteFields, sub?: string): string {
  return utxoHost(site.siteDomain, site.hostPrefix ?? null, sub);
}

/** A host of the site as code, e.g. `api.example.io` (for hosts that are not pages to visit). */
export function Host({sub}: {sub?: string}): ReactNode {
  return <code>{host(useUtxoSite(), sub)}</code>;
}

/** A link to the landing page or to an app of the site; its text is the host unless given. */
export function SiteLink({sub, path = '', children}: {sub?: string; path?: string; children?: ReactNode}): ReactNode {
  const name = host(useUtxoSite(), sub);
  return <a href={`https://${name}${path}`}>{children ?? name}</a>;
}

/** An address of the site as code, e.g. `https://app.example.io/login?ref=<your code>`. */
export function SiteUrl({sub, path = ''}: {sub?: string; path?: string}): ReactNode {
  return <code>{`https://${host(useUtxoSite(), sub)}${path}`}</code>;
}

/** The site's contact address, then its second one: `hello@<domain>` and dymaweb3@gmail.com. */
export function ContactEmails({separator = ' and '}: {separator?: string}): ReactNode {
  const site = useUtxoSite();
  return (
    <>
      <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
      {separator}
      <a href={`mailto:${site.secondContactEmail}`}>{site.secondContactEmail}</a>
    </>
  );
}

/**
 * A code block that names the site's hosts: `{domain}` becomes the domain and `{app}`, `{api}`…
 * the host of that subdomain.
 */
export function SiteCode({children, language, title}: {children: string; language?: string; title?: string}): ReactNode {
  const site = useUtxoSite();
  const text = children.replace(/\{(domain|app|api|studio|admin|docs)\}/g, (_, name: string) =>
    name === 'domain' ? site.siteDomain : host(site, name),
  );
  return (
    <CodeBlock language={language} title={title}>
      {text}
    </CodeBlock>
  );
}
