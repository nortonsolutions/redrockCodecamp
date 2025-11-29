import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
  isCollapsed: PropTypes.bool,
  isExpanded: PropTypes.bool,
  isMobile: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onDoubleClick: PropTypes.func,
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

  render() {
    const { name, isCollapsed, isExpanded, isMobile, onToggle } = this.props;
    
    const headerStyle = {
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      padding: '8px 12px',
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
      ? name
      : (isExpanded ? `${name} (Click to restore)` : name);

    return (
      <div style={headerStyle} onClick={this.handleClick}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{headerTitle}</span>
        <button style={buttonStyle} type="button">
          {displayIcon}
        </button>
      </div>
    );
  }
}

PaneHeader.displayName = 'PaneHeader';
PaneHeader.propTypes = propTypes;

export default PaneHeader;
