import { Component } from 'react';
import { get } from '../../shared/xhr';
import actions from './actions';
import styles, { classes } from './styles.js';
import { ReStore, connect } from '../../shared/ReStore';
import config from '../../shared/config.js';
import classnames from 'classnames';

import Header from '../../components/Header';
import Button from '../../components/Button';
import Timeline from './components/Timeline';

let activelyPullingDelta = false;

class Dashboard extends Component {
  constructor(props) {
    super(props);

    // set at render
    this.orgDropdown = null;
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch.clearTimeline();
    this.onDropdownChange();
  }

  pullTimeline(apiUrl = `${config.app.api.url}/api/org/${this.orgDropdown.value}/containers/timeline`, apiArgs = { page: 0 }) {
    const { dispatch } = this.props;

    get(apiUrl, apiArgs, (err, data) => {
      if (err) {
        console.error(err);
        alert(err.message);
        return;
      }

      dispatch.pushTimeline({
        addition: data.timeline,
        pagingHref: data.paging.next
      });

      this.queueDeltaCheck(data.delta);
    });
  }

  pullTimelineDelta() {
    if (activelyPullingDelta === true) {
      return;
    }

    activelyPullingDelta = true;

    const { dispatch, timeline, timelineDelta } = this.props;
    const deltaFetched = [];
    let countDeltaFetched = 0;

    const finish = () => {
      dispatch.clearTimelineDelta({}, () => {
        activelyPullingDelta = false;

        // should be not possible
        if (deltaFetched.length === 0) {
          return;
        }

        dispatch.unshiftTimeline({
          addition: deltaFetched
        });
      });
    };

    // todo: the 32 should be configured
    const pullNext = (apiUrl = `${config.app.api.url}/api/org/${this.orgDropdown.value}/containers/timeline`, apiArgs = { page: 0 }) => {
      // apiUrl should not be null, but will assume done if it is, anyway
      if (apiUrl === null || deltaFetched.length >= timelineDelta) {
        return finish();
      }

      get(apiUrl, apiArgs, (err, data) => {
        if (err) {
          console.error(err);
          alert(err.message);
          activelyPullingDelta = false;
          return;
        }

        for (let i = 0; i < data.timeline.length; i++) {
          // assuming at least one timeline state record, since pullNext should not be able to be called otherwise
          if (data.timeline[i].id === timeline[0].id) {
            return finish();
          }
          deltaFetched.push(data.timeline[i]);
        }

        // must have more rows to pull, so kicking off another request
        pullNext(data.paging.next);
      });
    };

    pullNext();
  }

  queueDeltaCheck(deltaUrl) {
    setTimeout(() => {
      this.checkDelta.bind(this)(deltaUrl);
    }, 30 * 1000);
  }

  checkDelta(deltaUrl) {
    get(deltaUrl, null, (err, data) => {
      if (err) {
        console.error(err);
        alert(err.message);
        return;
      }

      if (data.count === 0) {
        return this.queueDeltaCheck(deltaUrl);
      }

      const { timeline } = this.props;

      if (!timeline.length) {
        return this.pullTimeline();
      }

      const { dispatch } = this.props;

      dispatch.setTimelineDelta({
        delta: data.count
      });

      this.queueDeltaCheck(deltaUrl);
    });
  }

  onDropdownChange() {
    const { dispatch } = this.props;
    dispatch.setOrg({
      org: this.orgDropdown.value
    });
    this.pullTimeline();
  }

  render() {
    const { orgs, pagingHref, timelineDelta } = this.props;

    return (
      <div className={classes.root}>
        <Header>
          <span className={classes.headerContent}>
            <select
              ref={ref => this.orgDropdown = ref}
              onChange={this.onDropdownChange.bind(this)}
            >
              {orgs.map(org => {
                return (
                  <option
                    value={org.login}
                    key={org.id}
                  >
                    {org.login}
                  </option>
                );
              })}
            </select>
          </span>
        </Header>

        {isNaN(timelineDelta) || timelineDelta <= 0 ? null : (
          <div
            className={classes.viewNew}
          >
            <span
              className={classes.actionable}
              onClick={this.pullTimelineDelta.bind(this)}
            >
              View {timelineDelta} new activit{timelineDelta === 1 ? 'y' : 'ies'}
            </span>
          </div>
        )}

        <Timeline />

        {!pagingHref ? null : (
          <div className={classnames(classes.wrap, classes.paging)}>
            <Button
              size='small'
              color='blue'
              hallow={true}
              onClick={() => {
                this.pullTimeline(pagingHref, null);
              }}
            >
              View More
            </Button>
          </div>
        )}

        {styles}
      </div>
    );
  }
}

const selector = store => {
  return {
    timeline: store.timeline,
    pagingHref: store.pagingHref,
    timelineDelta: store.timelineDelta
  };
};

const ConnectedDashboard = connect(selector)(Dashboard);

const PageContent = ({ url, children }) => {
  // todo: avoid using props.url.query?
  const { account, orgs } = url.query;

  const initialState = {
    account,
    org: null,
    pagingHref: null,
    timeline: null,
    timelineDelta: null
  };

  return (
    <ReStore store={initialState} actions={actions}>
      <ConnectedDashboard orgs={orgs} />
    </ReStore>
  );
};

export default PageContent;
