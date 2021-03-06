import styles, { classes } from './styles.js'

import Button from 'components/Button'

const featuredListed = [
  'Get set up in seconds',
  'Multi-language support',
  'Test every pull request',
  // 'Build with our API & CLI',
  'Parallel instances',
  'Simple YML configuration',
  'Create private share links'
  // 'Tail logs'
]

export default ({ submitForm }) => (
  <div className={classes.root}>
    <div className={classes.inner}>
      <ul>
        {featuredListed.map(feature => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>

      <div className={classes.ctaContainer}>
        <h2>Start Building With Conjure</h2>

        <Button
          size='large'
          className={classes.cta}
          color='white'
          hallow={false}
          onClick={submitForm}
        >
          <span className={classes.label}>Sign Up</span>
        </Button>
      </div>
    </div>

    {styles}
  </div>
)
