import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {useUtxoSite} from '@site/src/components/Edition';

import styles from '@site/src/pages/index.module.css';
import featureStyles from '@site/src/components/HomepageFeatures/styles.module.css';

/** Dyma UTXO's homepage (DOCS_EDITION=utxo): same layout as Dyma's, its own words and links. */

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Verified on Cardano',
    description: (
      <>
        Quests are checked on Cardano (transfers, stake delegation, mints, scripts, holdings),
        through X, Discord, Telegram, YouTube and GitHub, through a project&apos;s own signed REST
        endpoint, or by a moderator. Points are credited the moment a quest is verified.
      </>
    ),
  },
  {
    title: 'Rewards you claim yourself',
    description: (
      <>
        Projects pay token rewards themselves, or lock the pool in Dyma UTXO&apos;s open-source Aiken
        escrow. Each earner claims their share with their own wallet, and Dyma UTXO pays the network
        fee.
      </>
    ),
  },
  {
    title: 'Built for projects',
    description: (
      <>
        Studio runs the Project → Campaign → Quest hierarchy: a campaign wizard, a review queue,
        exports, integrations and plans priced in US dollars, paid in ADA or USDM.
      </>
    ),
  },
];

function Feature({title, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const site = useUtxoSite();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Read the docs
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            href={`https://${site.siteDomain}`}>
            Go to {site.siteDomain}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Official documentation for Dyma UTXO, the task-to-earn platform for the Cardano ecosystem.">
      <HomepageHeader />
      <main>
        <section className={featureStyles.features}>
          <div className="container">
            <div className="row">
              {FeatureList.map((props) => (
                <Feature key={props.title} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
