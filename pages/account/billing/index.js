import { Component } from 'react';
import actions from './actions';
import styles, { classes } from './styles.js';
import { ReStore } from '../../../shared/ReStore';

import Header from '../../../components/Header';
import Button from '../../../components/Button';
import CardUI from './card-ui.js';

class Billing extends Component {
  render() {
    const { account, cards } = this.props;

    // if no cards available, then redirect user to billing entry view
    if (cards.length === 0) {
      window.location = '/account/billing/entry';
      return;
    }

    return (
      <span>
        <Header />

        <div className={classes.buttonWrap}>
          <div className={classes.wrap}>
            <Button
              color='blue'
              hallow={false}
              size='small'
              onClick={() => {
                window.location='/account/billing/entry';
              }}
            >
              Add New Card
            </Button>
          </div>
        </div>

        <div className={classes.wrap}>
          {cards.map(card => {
            return (
              <CardUI
                key={`account-card-${card.id}`}
                card={card}
                className={classes.card}
              />
            );
          })}

          {styles}
        </div>
      </span>
    );
  }
}

const selector = store => {
  return {
    account: store.account,
    cards: store.cards
  };
};

const ConnectedBilling = connect(selector)(Billing);

export default ({ url }) => {
  const { account, cards } = url.query;

  if (cards.length === 0) {
    window.location = '/account/billing/entry';
    return;
  }

  const initialState = {
    account,
    cards
  };

  return (
    <ReStore store={initialState} actions={actions}>
      <ConnectedBilling />
    </ReStore>
  );
};
