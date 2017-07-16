import { Component } from 'react';
import styles, { classes } from '../styles.js';
import { ReStore } from '../../../shared/ReStore';
import { post } from '../../../shared/xhr';
import config from '../../../shared/config.js';

import Header from '../../../components/Header';
import AnchorList from '../../../components/AnchorList';
import Decision from '../../../components/Decision';

let submitting = false;

export default class OnboardOverlap extends Component {
  handleSkip() {
    submitting = true;

    post(`${config.app.api.url}/api/onboard/skip`, {}, (err, data) => {
      if (err) {
        console.error(err);
        alert(err.message);
        submitting = false;
        return;
      }

      window.location = '/';
    });
  }

  render() {
    const { query } = this.props.url;
    console.log(query);
    const { account, orgsAlreadyAvailable, orgs } = query;

    const initialState = {
      account: account
    };

    return (
      <ReStore store={initialState}>
        <Header />

        <div className={classes.wrap}>
          <header>
            <sup>👋</sup>
            <span>Welcome to Conjure! Let's get started.</span>
          </header>

          <article>
            <span>
              {
                orgsAlreadyAvailable.length === 1 ? `Looks like there's already an Org on Conjure that you have access to:` :
                  `Looks like there are already ${orgsAlreadyAvailable.length} Orgs on Conjure that you have access to:`
              }
            </span>
          </article>

          <main className={classes.textListWrap}>
            <ol className={classes.textList}>
              {orgsAlreadyAvailable.map(org => {
                return (
                  <li key={org}>
                    {org}
                  </li>
                );
              })}
            </ol>

            <Decision
              className={classes.decision}
              size='medium'
              color='blue'
              primaryText='Skip to Dashboard'
              secondaryText='Set up a different Org'
              onPrimaryClick={this.handleSkip.bind(this)}
              onSecondaryClick={() => {
                window.location = '/onboard/orgs';
              }}
            />
          </main>

          {styles}
        </div>
      </ReStore>
    );
  }
}