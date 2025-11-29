import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PaneHeader from './PaneHeader.jsx';

const mapStateToProps = null;
const mapDispatchToProps = null;
const propTypes = {
  children: PropTypes.element,
  isExpanded: PropTypes.bool,
  left: PropTypes.number.isRequired,
  name: PropTypes.string,
  onExpandToggle: PropTypes.func,
  right: PropTypes.number.isRequired
};

export class Pane extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: false,
      showScrollTop: false,
      showScrollBottom: false
    };
    this.contentRef = null;
  }

  componentDidMount() {
    this.checkScrollIndicators();
    if (this.contentRef) {
      this.contentRef.addEventListener('scroll', this.checkScrollIndicators);
    }
  }

  componentWillUnmount() {
    if (this.contentRef) {
      this.contentRef.removeEventListener('scroll', this.checkScrollIndicators);
    }
  }

  setContentRef = (element) => {
    this.contentRef = element;
  }

  checkScrollIndicators = () => {
    const element = this.contentRef;
    if (!element) return;

    const hasVerticalScroll = element.scrollHeight > element.clientHeight;
    const isAtTop = element.scrollTop < 50;
    const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;

    this.setState({
      showScrollTop: hasVerticalScroll && !isAtTop,
      showScrollBottom: hasVerticalScroll && !isAtBottom
    });
  }

  handleToggle = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  }

  handleExpandToggle = () => {
    if (this.props.onExpandToggle) {
      this.props.onExpandToggle();
    }
  }

  handleDoubleClick = () => {
    // Double-click: Expand this pane to full height
    if (!this.props.isExpanded && this.props.onExpandToggle) {
      this.props.onExpandToggle();
    }
  }

  handleScrollUp = () => {
    if (this.contentRef) {
      const scrollAmount = 150;
      this.contentRef.scrollTop -= scrollAmount;
    }
  }

  handleScrollDown = () => {
    if (this.contentRef) {
      const scrollAmount = 150;
      this.contentRef.scrollTop += scrollAmount;
    }
  }

  renderScrollArrows() {
    const { showScrollTop, showScrollBottom } = this.state;
    
    const arrowBaseStyle = {
      position: 'absolute',
      right: '15px',
      backgroundColor: 'rgba(51, 122, 183, 0.8)',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '20px',
      cursor: 'pointer',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'wobble 2s ease-in-out infinite',
      transition: 'all 0.3s ease'
    };

    return (
      <div>
        {showScrollTop && (
          <button
            style={{ ...arrowBaseStyle, top: '50px' }}
            onClick={this.handleScrollUp}
            onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(51, 122, 183, 1)'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(51, 122, 183, 0.8)'; }}
            aria-label="Scroll up"
          >
            ↑
          </button>
        )}
        {showScrollBottom && (
          <button
            style={{ ...arrowBaseStyle, bottom: '15px' }}
            onClick={this.handleScrollDown}
            onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(51, 122, 183, 1)'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(51, 122, 183, 0.8)'; }}
            aria-label="Scroll down"
          >
            ↓
          </button>
        )}
      </div>
    );
  }

  render() {
    const { children, left, right, name, isExpanded = false } = this.props;
    const { isCollapsed, showScrollTop, showScrollBottom } = this.state;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    const style = isMobile ? {
      position: 'relative',
      width: '100%',
      minHeight: isCollapsed ? '40px' : '200px',
      maxHeight: isCollapsed ? '40px' : 'none',
      paddingLeft: '4px',
      paddingRight: '4px',
      display: 'flex',
      flexDirection: 'column',
      borderBottom: '1px solid #ddd',
      borderLeft: 'none',
      overflowY: isCollapsed ? 'hidden' : 'auto',
      boxSizing: 'border-box'
    } : {
      bottom: 0,
      left: left + '%',
      overflowX: 'hidden',
      overflowY: 'hidden',
      position: 'absolute',
      right: right + '%',
      top: isExpanded ? 0 : 0,
      height: isExpanded ? '62vh' : 'auto',
      maxHeight: isExpanded ? '62vh' : 'none',
      paddingLeft: '4px',
      paddingRight: '4px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: isExpanded ? 10 : 1,
      backgroundColor: isExpanded ? 'white' : 'transparent',
      transition: 'all 0.3s ease'
    };
    
    const contentStyle = {
      flex: isCollapsed ? '0' : '1',
      overflowY: isCollapsed ? 'hidden' : 'auto',
      transition: 'all 0.3s ease',
      display: isCollapsed ? 'none' : 'block',
      position: 'relative'
    };
    
    return (
      <div style={ style }>
        {name && (
          <PaneHeader
            isCollapsed={isMobile ? isCollapsed : false}
            isExpanded={isExpanded}
            isMobile={isMobile}
            name={name}
            onToggle={isMobile ? this.handleToggle : this.handleExpandToggle}
            onDoubleClick={isMobile ? this.handleDoubleClick : null}
          />
        )}
        <div style={contentStyle} ref={this.setContentRef}>
          { children }
        </div>
        {(showScrollTop || showScrollBottom) && this.renderScrollArrows()}
      </div>
    );
  }
}

Pane.displayName = 'Pane';
Pane.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Pane);
