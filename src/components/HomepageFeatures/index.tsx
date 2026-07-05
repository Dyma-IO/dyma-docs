import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Verifiable work',
    description: (
      <>
        Quests are validated by on-chain indexers, platform integrations, project APIs, or
        moderated review. Rewards settle from escrow directly to contributor wallets.
      </>
    ),
  },
  {
    title: 'Portable reputation',
    description: (
      <>
        Completions accumulate into DR (Dima Reputation) and DP (Dyma Points). Credentials travel
        with the user across campaigns and projects.
      </>
    ),
  },
  {
    title: 'Built for projects',
    description: (
      <>
        Launch campaigns in Studio with a Project → Campaign → Quest hierarchy, dynamic task types,
        and optional custom verification endpoints.
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

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
