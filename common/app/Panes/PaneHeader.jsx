import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
  // Visual state of the pane this header belongs to.
  // Mutually exclusive: at most one of isCollapsed / isExpanded is true.
  // Both false = 'normal' (default sized) layout.
  isCollapsed: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isMobile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  // Single action invoked on header click. The Pane owner is responsible
  // for cycling the state (normal -> expanded -> collapsed -> normal).
  onCycle: PropTypes.func.isRequired
};

export class PaneHeader extends PureComponent {
  handleClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    this.props.onCycle();
  }

  render() {
    const { name, isCollapsed, isExpanded } = this.props;

    // Display-name overrides: the internal pane name stays 'Step' (used as
    // a key throughout the redux pane state), but visually we show 'Lesson'.
    const displayName = name === 'Step' ? 'Lesson' : name;

    const headerStyle = {
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      userSelect: 'none',
      minHeight: '32px',
      flex: '0 0 auto'
    };

    const buttonStyle = {
      border: 'none',
      background: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      padding: '0 8px',
      color: '#337ab7'
    };

    // Single icon reflects current state and hints at next click action:
    //   normal     -> click maximizes      ('⤢' maximize-arrow)
    //   expanded   -> click minimizes       ('−' minus)
    //   collapsed  -> click restores normal ('+')
    const stateIcon = isCollapsed ? '+' : (isExpanded ? '−' : '⤢');
    const ariaLabel = isCollapsed
      ? 'Restore pane'
      : (isExpanded ? 'Minimize pane' : 'Maximize pane');

    return (
      <div
        style={headerStyle}
        onClick={this.handleClick}
        role='button'
        tabIndex={0}
        aria-label={ariaLabel}
        title={ariaLabel}
        >
        <span style={{ fontWeight: 'bold', fontSize: '14px', paddingLeft: '8px' }}>
          {displayName}
        </span>
        <button
          style={buttonStyle}
          type='button'
          tabIndex={-1}
          aria-hidden='true'
          >
          {stateIcon}
        </button>
      </div>
    );
  }
}

PaneHeader.displayName = 'PaneHeader';
PaneHeader.propTypes = propTypes;

export default PaneHeader;
