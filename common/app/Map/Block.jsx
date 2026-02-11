import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import FA from 'react-fontawesome';
import { Panel } from 'react-bootstrap';

import ns from './ns.json';
import Challenges from './Challenges.jsx';
import {
  toggleThisPanel,

  makePanelOpenSelector
} from './redux';

import { makeBlockSelector } from '../entities';
import { userSelector } from '../redux';
import { CERT_REQUIREMENTS, isContentLocked } from './cert-requirements';

const dispatchActions = { toggleThisPanel };
function makeMapStateToProps(_, { dashedName, superBlock }) {
  return createSelector(
    makeBlockSelector(dashedName),
    makePanelOpenSelector(dashedName),
    userSelector,
    (block, isOpen, user) => {
      // console.log(`Block: ${dashedName} in SuperBlock: ${superBlock}`);
      // Normalize superBlock to lowercase for case-insensitive lookup
      const superBlockKey = superBlock ? superBlock.toLowerCase() : '';
      const requirement = CERT_REQUIREMENTS[superBlockKey];
      
      // Use the new isContentLocked helper function
      const isLocked = isContentLocked(requirement, user);
      
      return {
        isOpen,
        dashedName,
        title: block.title,
        time: block.time,
        challenges: block.challenges || [],
        isLocked
      };
    }
  );
}
const propTypes = {
  challenges: PropTypes.array,
  dashedName: PropTypes.string,
  isOpen: PropTypes.bool,
  isLocked: PropTypes.bool,
  time: PropTypes.string,
  title: PropTypes.string,
  toggleThisPanel: PropTypes.func
};

export class Block extends PureComponent {
  constructor(...props) {
    super(...props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  handleSelect(eventKey, e) {
    e.preventDefault();
    this.props.toggleThisPanel(eventKey);
  }

  renderHeader(isOpen, title, time, isCompleted, isLocked) {
    return (
      <div className={ isCompleted ? 'faded' : '' }>
        <FA
          className='map-caret'
          name={ isLocked ? 'lock' : (isOpen ? 'caret-down' : 'caret-right') }
          size='lg'
          style={ isLocked ? { color: 'lightblue' } : {} }
        />
        <span>
        { title }
        </span>
        <span className={ `${ns}-block-time` }>({ time })</span>
      </div>
    );
  }

  render() {
    const {
      title,
      time,
      dashedName,
      isOpen,
      challenges,
      isLocked
    } = this.props;
    return (
      <Panel
        bsClass={ `${ns}-accordion-panel` }
        collapsible={ true }
        eventKey={ dashedName || title }
        expanded={ isOpen }
        header={ this.renderHeader(isOpen, title, time, false, isLocked) }
        id={ title }
        key={ title }
        onSelect={ this.handleSelect }
        >
        { isOpen && <Challenges challenges={ challenges } /> }
      </Panel>
    );
  }
}

Block.displayName = 'Block';
Block.propTypes = propTypes;

export default connect(makeMapStateToProps, dispatchActions)(Block);
