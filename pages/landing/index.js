import { Component } from 'react';
import styles, { classes } from './styles.js';
import Button from '../../components/Button';
import config from '../../shared/config.js';
import classnames from 'classnames';

import Glimpse from './components/Glimpse';

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.form = null; // placehoder for form el ref
  }

  submitForm(e) {
    e.preventDefault();
    this.form.submit();
  }

  render() {
    return (
      <div className={classes.root}>
        <form
          action={`${config.app.api.url}/auth/github`}
          className={classes.trueForm}
          method='post'
          ref={form => this.form = form}
        />

        <header className={classes.header}>
          <nav className={classes.navigation}>
            <h1 className={classes.serviceName}>Conjure</h1>

            <ol className={classes.linkslist}>
              <li className={classes.item}>
                <a
                  className={classes.link}
                  onClick={this.submitForm.bind(this)}
                  href=''
                >
                  Sign In
                </a>
              </li>

              <li className={classes.item}>
                <Button
                  size='small'
                  color='white'
                  onClick={this.submitForm.bind(this)}
                >
                  Sign Up
                </Button>
              </li>
            </ol>
          </nav>

          <div className={classes.ctaContainer}>
            <p className={classes.mark}>⎔</p>
            <div className={classes.firstImpression}>
              <sup className={classes.name}>Conjure</sup>
              <span>runs your development branches</span>
              <p>Conjure watches development branches, and provides engineers and product managers a link to view working changes.</p>
            </div>

            <div>
              <Button
                size='large'
                className={classes.cta}
                color='white'
                onClick={this.submitForm.bind(this)}
              >
                <span className={classes.label}>Sign Up</span>
              </Button>
              <sub className={classes.info}>With GitHub</sub>
            </div>
          </div>

          <Glimpse />
        </header>

        <div className={classes.steps} id='#how-it-works'>
          <div>
            <article>
              <header>
                <h3>Conjure for Developers</h3>
                <span>Conjure streamlines the peer review process, letting engineers focus on what they do best, and avoid context switch.</span>
              </header>

              <ol>
                <li>
                  <span className={classes.number}>1</span>
                  <span className={classes.label}>Code</span>
                </li>
                <li>
                  <span className={classes.number}>2</span>
                  <span className={classnames(classes.label, classes.standOut)}>Conjure</span>
                </li>
                <li>
                  <span className={classes.number}>3</span>
                  <span className={classes.label}>Merge</span>
                </li>
              </ol>
            </article>

            <article>
              <header>
                <h3>Conjure for Product</h3>
                <span>Conjure gives you a visibility into what changes your team is working on. See changes before they are ship, and get feedback to engineers and design.</span>
              </header>

              <ol>
                <li>
                  <span className={classes.number}>1</span>
                  <span className={classes.label}>Assign</span>
                </li>
                <li>
                  <span className={classes.number}>2</span>
                  <span className={classnames(classes.label, classes.standOut)}>Conjure</span>
                </li>
                <li>
                  <span className={classes.number}>3</span>
                  <span className={classes.label}>Feedback</span>
                </li>
              </ol>
            </article>
          </div>
        </div>

        {styles}
      </div>
    );
  }
}
