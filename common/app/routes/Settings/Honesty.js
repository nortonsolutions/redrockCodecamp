import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HonestyPolicy from './honesty-policy.js';
import { Breadcrumb } from 'react-bootstrap';

const propTypes = {
  isHonest: PropTypes.bool,
  policy: PropTypes.arrayOf(PropTypes.string),
  updateIsHonest: PropTypes.func.isRequired
};

class Honesty extends Component {
  handleAgreeClick = () => this.props.updateIsHonest();

  renderAgreeButton = () => (
    <div>
      <h1>KCJAE Academic Honesty Policy</h1>
            <br/>
              <HonestyPolicy />
            <br />
      <button onClick={this.handleAgreeClick}>
        Agree
      </button>
      <br/><br/><br/>
    </div>

  );

  renderIsHonestAgreed = () => (
      <p>You have accepted the KCJAE Academic Honesty Policy.</p>
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
