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

const mapDispatchToProps = { toggleThisPanel };
// make selectors unique to each component
// see
// reactjs/reselect
// sharing-selectors-with-props-across-multiple-components
function mapStateToProps(_, { dashedName }) {
  return createSelector(
    makeSuperBlockSelector(dashedName),
    makePanelOpenSelector(dashedName),
    (superBlock, isOpen) => ({
      isOpen,
      dashedName,
      title: superBlock.title || dashedName,
      blocks: superBlock.blocks || [],
      message: superBlock.message
    })
  );
}

const propTypes = {
  blocks: PropTypes.array,
  dashedName: PropTypes.string,
  isOpen: PropTypes.bool,
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

  renderHeader(isOpen, title, isCompleted) {
    return (
      <div className={ isCompleted ? 'faded' : '' }>
        <FA
          className={ `${ns}-caret` }
          name={ isOpen ? 'caret-down' : 'caret-right' }
          size='lg'
        />
        { title }
      </div>
    );
  }

  render() {
    const {
      title,
      dashedName,
      blocks,
      message,
      isOpen
    } = this.props;
    return (
      <Panel
        bsClass={ `${ns}-accordion-panel` }
        collapsible={ true }
        eventKey={ dashedName || title }
        expanded={ isOpen }
        header={ this.renderHeader(isOpen, title) }
        id={ title }
        key={ dashedName || title }
        onSelect={ this.handleSelect }
        >
        { this.renderMessage(message) }
        <Blocks blocks={ blocks } />
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
