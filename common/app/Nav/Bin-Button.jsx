import React from 'react';
import PropTypes from 'prop-types';
import { NavItem } from 'react-bootstrap';

const propTypes = {
  content: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  href: PropTypes.string
};

export default function BinButton({ content, handleClick, href }) {
  return (
    <NavItem
      href={ href }
      onClick={ handleClick }
      >
      { content }
    </NavItem>
  );
}
BinButton.displayName = 'BinButton';
BinButton.propTypes = propTypes;
