import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import FA from 'react-fontawesome';
import { Panel } from 'react-bootstrap';

import ns from './ns.json';
import Blocks from './Blocks.jsx';
import {
  toggleThisPanel,

  makePanelOpenSelector
} from './redux';
import { makeSuperBlockSelector } from '../entities';
import { userSelector } from '../redux';
import { CERT_REQUIREMENTS, isContentLocked } from './cert-requirements';

const mapDispatchToProps = { toggleThisPanel };
// make selectors unique to each component
// see
// reactjs/reselect
// sharing-selectors-with-props-across-multiple-components
function mapStateToProps(_, { dashedName }) {
  return createSelector(
    makeSuperBlockSelector(dashedName),
    makePanelOpenSelector(dashedName),
    userSelector,
    (superBlock, isOpen, user) => {
      const title = superBlock.title;
      // console.log(`Checking lock for superBlock: ${title} with dashedName: ${dashedName}`);
      var titleKey = title ? title.toLowerCase() : '';
      const requirement = CERT_REQUIREMENTS[titleKey];
      
      // Use the new isContentLocked helper function
      const isLocked = isContentLocked(requirement, user);
      
      return {
        isOpen,
        dashedName,
        title,
        blocks: superBlock.blocks || [],
        message: superBlock.message,
        isLocked
      };
    }
  );
}

const propTypes = {
  blocks: PropTypes.array,
  dashedName: PropTypes.string,
  isOpen: PropTypes.bool,
  isLocked: PropTypes.bool,
  message: PropTypes.string,
  title: PropTypes.string,
  toggleThisPanel: PropTypes.func
};

export class SuperBlock extends PureComponent {
  constructor(...props) {
    super(...props);
    this.handleSelect = this.handleSelect.bind(this);
  }
  handleSelect(eventKey, e) {
    e.preventDefault();
    this.props.toggleThisPanel(eventKey);
  }

  renderMessage(message) {
    if (!message) {
      return null;
    }
    return (
      <div className={ `${ns}-block-description` }>
        { message }
      </div>
    );
  }

  renderHeader(isOpen, title, isCompleted, isLocked) {
    return (
      <div className={ isCompleted ? 'faded' : '' }>
        <FA
          className={ `${ns}-caret` }
          name={ isLocked ? 'lock' : (isOpen ? 'caret-down' : 'caret-right') }
          size='lg'
          style={ isLocked ? { color: 'lightblue' } : {} }
        />
        { title }
        {/* { isLocked && (
          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#d9534f', fontWeight: 'normal' }}>
            (Certification Required)
          </span>
        )} */}
      </div>
    );
  }

  render() {
    const {
      title,
      dashedName,
      blocks,
      message,
      isOpen,
      isLocked
    } = this.props;
    return (
      <Panel
        bsClass={ `${ns}-accordion-panel` }
        collapsible={ true }
        eventKey={ dashedName || title }
        expanded={ isOpen }
        header={ this.renderHeader(isOpen, title, false, isLocked) }
        id={ title }
        key={ dashedName || title }
        onSelect={ this.handleSelect }
        >
        { this.renderMessage(message) }
        <Blocks blocks={ blocks } superBlock={ title } />
      </Panel>
    );
  }
}

SuperBlock.displayName = 'SuperBlock';
SuperBlock.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SuperBlock);
