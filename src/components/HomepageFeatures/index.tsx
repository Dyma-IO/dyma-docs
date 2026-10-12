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
    title: 'Verified at the source',
    description: (
      <>
        Quests are checked on chain, through X, Discord, Telegram, YouTube and GitHub, through a
        project&apos;s own signed REST endpoint, or by a moderator. Points are credited the moment a
        quest is verified.
      </>
    ),
  },
  {
    title: 'Rewards you can check',
    description: (
      <>
        Projects pay token rewards themselves, or lock the pool in Dyma&apos;s open-source CosmWasm
        escrow on Safrochain, where the split, the deadlines and every payout are on chain.
      </>
    ),
  },
  {
    title: 'Built for projects',
    description: (
      <>
        Studio runs the Project → Campaign → Quest hierarchy: a campaign wizard, a review queue,
        exports, integrations and plans paid in USDC on Safrochain.
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
