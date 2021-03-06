import { Component } from 'react'
import styles, { classes } from './styles.js'
import { connect } from '@conjurelabs/federal'

import { post } from 'shared/xhr'
import config from 'client.config.js'
import sysMessageActions from 'components/SystemMessages/actions'

import Page from 'components/Page'
import Button from 'components/Button'
import AnchorMultiList from 'components/AnchorList/MultiSelect'

let submitting = false

class WatchRepos extends Component {
  constructor() {
    super()

    this.anchorList = null // set by ref

    this.state = {
      repoSelected: false
    }
  }

  isRepoSelected() {
    const listSelected = this.anchorList.selected
    this.setState({
      repoSelected: listSelected.length > 0
    })
  }

  submit() {
    if (submitting) {
      return
    }
    submitting = true

    const { dispatch } = this.props

    post(`${config.app.api.url}/api/watch`, this.anchorList.selected.map(selection => selection.value), err => {
      if (err) {
        dispatch.addSystemMessage({
          type: 'error',
          message: err.message
        })
        submitting = false
        return
      }

      window.location = '/'
    })
  }

  render() {
    const { repos, withOrgLabel, watchedRepos } = this.props

    const listedRepos = repos.filter(repo => !watchedRepos.includes(repo.name))

    return (
      <div>
        <div className={classes.content}>
          <header>
            <sup>🎟</sup>
            <span>Select the GitHub repos you'd like to use with Conjure</span>
          </header>

          <main>
            <div className={classes.listOuterWrap}>
              <span className={classes.listWrap}>
                <AnchorMultiList
                  list={listedRepos.map(repo => {
                    return {
                      label: !withOrgLabel ? repo.name : `${repo.org} / ${repo.name}`,
                      value: repo.id,
                      key: repo.id
                    }
                  })}
                  onSelect={this.isRepoSelected.bind(this)}
                  className={classes.anchorList}
                  ref={ref => this.anchorList = ref}
                />

                <Button
                  size='medium'
                  color='blue'
                  onClick={this.submit.bind(this)}
                  className={classes.button}
                  disabled={!this.state.repoSelected}
                >
                  Continue
                </Button>
              </span>
            </div>
          </main>
        </div>

        {styles}
      </div>
    )
  }
}

const ConnectedWatchRepos = connect(() => {}, sysMessageActions)(WatchRepos)

export default class WatchReposPage extends Page {
  render() {
    return (
      <this.Layout
        limitedHeader={true}
        title='Add Repos'
      >
        <ConnectedWatchRepos
          {...this.props}
        />
      </this.Layout>
    )
  }
}
