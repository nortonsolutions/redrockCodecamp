import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import FA from 'react-fontawesome';
import HonestyPolicy from './honesty-policy.js';

const propTypes = {
  isHonest: PropTypes.bool,
  policy: PropTypes.arrayOf(PropTypes.string),
  updateIsHonest: PropTypes.func.isRequired
};

// Keyframes for the bouncing arrow that draws the eye to the Agree button.
// Injected once at module load so we don't need a separate CSS file.
const BOUNCE_STYLE_ID = 'honesty-bounce-keyframes';
if (typeof document !== 'undefined' &&
    !document.getElementById(BOUNCE_STYLE_ID)) {
  const styleEl = document.createElement('style');
  styleEl.id = BOUNCE_STYLE_ID;
  styleEl.innerHTML = `
    @keyframes honestyBounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(14px); }
      60% { transform: translateY(7px); }
    }
    @keyframes honestyPulse {
      0% { box-shadow: 0 0 0 0 rgba(217,83,79,0.55); }
      70% { box-shadow: 0 0 0 14px rgba(217,83,79,0); }
      100% { box-shadow: 0 0 0 0 rgba(217,83,79,0); }
    }
    .honesty-sticky-banner {
      position: sticky;
      top: 0;
      z-index: 1030;
      background: #d9534f;
      color: #fff;
      padding: 12px 16px;
      text-align: center;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      margin-bottom: 16px;
    }
    .honesty-bounce-arrow {
      display: inline-block;
      margin-left: 10px;
      animation: honestyBounce 1.4s infinite;
    }
    .honesty-agree-btn {
      animation: honestyPulse 1.8s infinite;
    }
  `;
  document.head.appendChild(styleEl);
}

class Honesty extends Component {
  handleAgreeClick = () => this.props.updateIsHonest();

  renderAgreeButton = () => (
    <div
      style={{
        border: '2px solid #d9534f',
        borderRadius: '6px',
        padding: '24px',
        marginBottom: '24px',
        background: 'rgba(217,83,79,0.04)'
      }}
    >
      <div className='honesty-sticky-banner'>
        <FA name='exclamation-triangle' />
        {' '}Action Required: Scroll down and click
        {' '}<u>I Agree</u> to unlock your settings
        <span className='honesty-bounce-arrow'>
          <FA name='arrow-down' />
        </span>
      </div>
      <Alert bsStyle='danger' style={{ marginBottom: '16px' }}>
        <strong>
          <FA name='lock' />{' '}Action Required
        </strong>
        {' '}— You must agree to the Academic Honesty Policy before your
        settings and certificates become accessible.
      </Alert>
      <h2 style={{ marginTop: 0 }}>Redrock Academic Honesty Policy</h2>
      <HonestyPolicy />
      <br />
      <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '28px', color: '#d9534f' }}>
        <span className='honesty-bounce-arrow'>
          <FA name='arrow-down' />
        </span>
      </div>
      <Button
        className='honesty-agree-btn'
        bsStyle='success'
        bsSize='lg'
        block={true}
        onClick={this.handleAgreeClick}
      >
        <FA name='check' />{' '}I Agree — Unlock My Settings
      </Button>
    </div>
  );

  renderIsHonestAgreed = () => (
    <Alert bsStyle='success' style={{ marginBottom: '16px' }}>
      <FA name='check-circle' />{' '}You have accepted the Redrock Academic Honesty Policy.
    </Alert>
  );

  render() {
    const { isHonest } = this.props;

    return (
      <section className='text-center'>

          {isHonest ? this.renderIsHonestAgreed() : this.renderAgreeButton()}

      </section>
    );
  }
}

Honesty.displayName = 'Honesty';
Honesty.propTypes = propTypes;

export default Honesty;
