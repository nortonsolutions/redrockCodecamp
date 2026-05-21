import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
  isCollapsed: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isMobile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onDoubleClick: PropTypes.func,
  onMaximize: PropTypes.func,
  onToggle: PropTypes.func.isRequired
};

export class PaneHeader extends PureComponent {
  constructor(props) {
    super(props);
    this.lastClickTime = 0;
  }

  handleClick = (e) => {
    const now = Date.now();
    const timeSinceLastClick = now - this.lastClickTime;
    
    if (timeSinceLastClick < 300) {
      // Double click detected
      if (this.props.onDoubleClick) {
        this.props.onDoubleClick();
      }
    } else {
      // Single click
      this.props.onToggle();
    }
    
    this.lastClickTime = now;
  }

  handleMaximizeClick = (e) => {
    // Don't let the maximize click also trigger the row's collapse toggle.
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (this.props.onMaximize) {
      this.props.onMaximize();
    }
  }

  render() {
    const { name, isCollapsed, isExpanded, isMobile, onMaximize } = this.props;

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
      userSelect: 'none'
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
    
    const displayIcon = isMobile 
      ? (isCollapsed ? '+' : '−')
      : (isExpanded ? '↓' : '↕');
    
    const headerTitle = isMobile
      ? displayName
      : (isExpanded ? `${displayName} (Click to restore)` : displayName);

    return (
      <div style={headerStyle} onClick={this.handleClick}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{headerTitle}</span>
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && onMaximize && (
            <button
              style={buttonStyle}
              type="button"
              onClick={this.handleMaximizeClick}
              aria-label={isExpanded ? 'Restore pane' : 'Maximize pane'}
              title={isExpanded ? 'Restore' : 'Maximize'}
            >
              {isExpanded ? '⤺' : '⤢'}
            </button>
          )}
          <button style={buttonStyle} type="button">
            {displayIcon}
          </button>
        </span>
      </div>
    );
  }
}

PaneHeader.displayName = 'PaneHeader';
PaneHeader.propTypes = propTypes;

export default PaneHeader;
