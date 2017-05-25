import { Component } from 'react';
import ReactDOM from 'react-dom';
import styles, { header } from './styles.styl';
import Button from 'c/Button';

const submitForm = Symbol('submit sign in/up form');

class Landing extends Component {
  constructor(props) {
    super(props);
    this.form = null; // placehoder for form el ref
  }

  [submitForm](e) {
    e.preventDefault();
    this.form.submit();
  }

  render() {
    return (
      <div className={styles.root}>
        <form
          action={`${config.app.api.url}/auth/github`}
          className={styles.trueForm}
          method='post'
          ref={form => this.form = form}
        />

        <header className={styles.header}>
          <nav className={styles.navigation}>
            <h1 className={styles.serviceName}>Conjure</h1>

            <ol className={styles.linkslist}>
              <li className={styles.item}>
                <a
                  className={styles.link}
                  onClick={this[submitForm].bind(this)}
                  href=''
                >
                  Sign In
                </a>
              </li>

              <li className={styles.item}>
                <Button
                  size='small'
                  color='black'
                  onClick={this[submitForm].bind(this)}
                >
                  Sign Up
                </Button>
              </li>
            </ol>
          </nav>

          <div className={styles.ctaContainer}>
            <p className={styles.mark}>⎔</p>
            <p className={styles.firstImpression}>
              <sup className={styles.name}>Conjure</sup>
              <span>brings your branches to life</span>
            </p>

            <div>
              <Button
                size='large'
                className={styles.cta}
                color='purple'
                onClick={this[submitForm].bind(this)}
              >
                <span className={styles.label}>Sign Up</span>
              </Button>
              <sub className={styles.info}>With GitHub</sub>
            </div>
          </div>

          <div className={styles.browserTeaser} />
        </header>
      </div>
    );
  }
}

ReactDOM.render(
  <Landing/>,
  document.getElementById('container')
);
