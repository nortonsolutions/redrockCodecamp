import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ns from './ns.json';
import Block from './Block.jsx';

const propTypes = {
  blocks: PropTypes.array.isRequired,
  superBlock: PropTypes.string
};

export default class Blocks extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.blocks !== nextProps.blocks || this.props.superBlock !== nextProps.superBlock;
  }

  render() {
    const {
      blocks,
      superBlock
    } = this.props;
    if (blocks.length <= 0) {
      return null;
    }
    return (
      <div className={ `${ns}-accordion-block` }>
        {
          blocks.map(dashedName => (
            <Block
              dashedName={ dashedName }
              key={ dashedName }
              superBlock={ superBlock }
            />
          ))
        }
      </div>
    );
  }
}

Blocks.displayName = 'Blocks';
Blocks.propTypes = propTypes;
