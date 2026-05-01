import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  executeChallenge,
  openHelpModal
} from './redux';
import { makeToast } from '../../Toasts/redux';

const mapDispatchToProps = {
  executeChallenge,
  openHelpModal,
  makeToast
};

const propTypes = {
  executeChallenge: PropTypes.func.isRequired,
  makeToast: PropTypes.func.isRequired,
  openHelpModal: PropTypes.func.isRequired
};

// A small, persistent action bar that keeps the most-used controls
// (Run / Reset / Help) within reach on every challenge view, on both
// mobile and desktop. On mobile it spans the bottom of the viewport;
// on desktop it sits in the bottom-right as a compact pill.
export class MobileActionBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isMobile: typeof window !== 'undefined' && window.innerWidth <= 768
    };
    this.handleResize = this.handleResize.bind(this);
    this.handleRun = this.handleRun.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleHelp = this.handleHelp.bind(this);
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize);
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.handleResize);
    }
  }

  handleResize() {
    const next = window.innerWidth <= 768;
    if (next !== this.state.isMobile) {
      this.setState({ isMobile: next });
    }
  }

  handleRun() {
    this.props.executeChallenge();
  }

  handleReset() {
    this.props.makeToast({
      message: 'This will restore your code editor to its original state.',
      action: 'clear my code',
      actionCreator: 'clickOnReset',
      timeout: 4000
    });
  }

  handleHelp() {
    this.props.openHelpModal();
  }

  render() {
    const { isMobile } = this.state;

    const barStyle = isMobile ? {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      gap: '6px',
      padding: '6px 8px calc(6px + env(safe-area-inset-bottom)) 8px',
      background: 'rgba(20, 20, 20, 0.92)',
      borderTop: '1px solid rgba(255,255,255,.08)',
      zIndex: 1500,
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)'
    } : {
      position: 'fixed',
      right: '16px',
      bottom: '16px',
      display: 'flex',
      gap: '6px',
      padding: '6px 8px',
      background: 'rgba(20, 20, 20, 0.85)',
      borderRadius: '999px',
      boxShadow: '0 4px 14px rgba(0,0,0,.35)',
      zIndex: 1500,
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)'
    };

    const btnBase = {
      flex: isMobile ? '1 1 0' : '0 0 auto',
      border: 'none',
      borderRadius: isMobile ? '6px' : '999px',
      padding: isMobile ? '10px 8px' : '8px 14px',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      lineHeight: 1,
      transition: 'background .15s ease'
    };

    const runStyle = {
      ...btnBase,
      background: '#2563eb',
      color: '#fff'
    };
    const secondaryStyle = {
      ...btnBase,
      background: 'rgba(255,255,255,.08)',
      color: '#fff'
    };

    return (
      <div
        className='mobile-action-bar'
        role='toolbar'
        aria-label='Challenge actions'
        style={ barStyle }
        >
        <button
          aria-label='Run tests (Ctrl + Enter)'
          onClick={ this.handleRun }
          style={ runStyle }
          title='Run tests (Ctrl + Enter)'
          type='button'
          >
          <span aria-hidden='true'>▶</span>
          <span>Run</span>
        </button>
        <button
          aria-label='Reset your code'
          onClick={ this.handleReset }
          style={ secondaryStyle }
          title='Reset your code'
          type='button'
          >
          <span aria-hidden='true'>↺</span>
          <span>Reset</span>
        </button>
        <button
          aria-label='Get help'
          onClick={ this.handleHelp }
          style={ secondaryStyle }
          title='Get help'
          type='button'
          >
          <span aria-hidden='true'>?</span>
          <span>Help</span>
        </button>
      </div>
    );
  }
}

MobileActionBar.displayName = 'MobileActionBar';
MobileActionBar.propTypes = propTypes;

export default connect(
  null,
  mapDispatchToProps
)(MobileActionBar);
