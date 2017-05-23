import { Component, Children, isValidElement, cloneElement, createElement } from 'react';
import PropTypes from 'prop-types';

const problemMarker = Symbol('marker used for invalid or unknown value, likely due to error');

class ReStore extends Component {
  constructor(props) {
    super(props);

    const { store, actions } = Object.assign({
      store: {},
      actions: {}
    }, props);

    const dispatch = Object.keys(actions).reduce((mapping, actionName) => {
      mapping[actionName] = data => {
        this.store.all = actions[actionName](store, data);
      };
    }, {});

    this.state = {
      store,
      dispatch
    };

    setTimeout(() => {
      const newState = { store, dispatch };
      newState.store.org = 'MY Org!';
      this.setState(newState);
      console.log('twas triggered');
    }, 4000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.store !== this.store) {
      throw new Error('Can not alter ReStore.store data on the fly');
    }
  }

  getChildContext() {
    return {
      store: this.state.store,
      dispatch: this.state.dispatch
    };
  }

  render() {
    const { children } = this.props;

    return !children ? null :
      React.isValidElement(children) ? Children.only(children) :
      Array.isArray(children) ? (
        <span>{children}</span>
      ) :
      null;
  }

  static childContextTypes = {
    store: PropTypes.object.isRequired,
    dispatch: PropTypes.object.isRequired
  }
}

export { ReStore };

function connect(selector) {
  return function wrapper(InboundComponent) {
    class ReStoreWrap extends Component {
      render() {
        const { store, dispatch } = this.context;
        console.log(store, selector);

        const storeSelected = typeof selector === 'function' ? selector(store) :
          Array.isArray(selector) ? selector.reduce((selection, currentSelector) => {
            return currentSelector(selection);
          }, store) :
          problemMarker;

        if (storeSelected === problemMarker) {
          throw new Error(`An invalid selector was passed to connect() for ${InboundComponent.displayName}`);
        }

        // props passed manually will override those in the store
        const usedProps = Object.assign({
          dispatch
        }, storeSelected, this.props);

        return (
          <InboundComponent {...usedProps} />
        );
      }

      static contextTypes = {
        store: PropTypes.object.isRequired,
        dispatch: PropTypes.object.isRequired
      }
    }

    return ReStoreWrap;
  };
}

export { connect };
