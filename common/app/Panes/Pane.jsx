import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PaneHeader from './PaneHeader.jsx';

const mapStateToProps = null;
const mapDispatchToProps = null;
const propTypes = {
  children: PropTypes.element,
  isExpanded: PropTypes.bool,
  isReaderLayout: PropTypes.bool,
  expandedPaneName: PropTypes.string,
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

  // Editor fires this on every focus; non-editor panes listen below.
  // Re-firing lets the user re-open Lesson/Curriculum, then click back into
  // Editor to re-collapse them.
  // NOTE: auto-collapse on editor focus was removed because it left other
  // panes in a state the user couldn't easily restore (clicking their
  // headers cycled the parent's expandedPane but didn't clear the local
  // isCollapsed, so they appeared permanently blank). Maximize/restore is
  // now fully driven by header clicks via handleCycle below.

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

  // Single header click rotates the pane through three sizes:
  //   normal -> expanded -> collapsed -> normal
  // 'expanded' is owned by the parent Panes component (so siblings know to
  // shrink); 'collapsed' is local to this pane (header strip only).
  handleCycle = () => {
    const { isCollapsed } = this.state;
    const { isExpanded, onExpandToggle } = this.props;

    if (isCollapsed) {
      // collapsed -> normal
      this.setState({ isCollapsed: false });
      return;
    }
    if (isExpanded) {
      // expanded -> collapsed: clear parent's expanded slot AND mark local
      // collapsed. Order matters: set local state first so the re-render
      // triggered by onExpandToggle already reflects the collapsed state.
      this.setState({ isCollapsed: true });
      if (onExpandToggle) onExpandToggle();
      return;
    }
    // normal -> expanded
    if (onExpandToggle) onExpandToggle();
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
    const {
      children,
      left,
      right,
      name,
      isExpanded = false,
      expandedPaneName,
      isReaderLayout = false
    } = this.props;
    const { isCollapsed, showScrollTop, showScrollBottom } = this.state;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // When some other pane is maximized on mobile, shrink this one to a
    // header-only strip so the maximized pane gets the full viewport.
    const someoneElseExpanded = !!expandedPaneName && expandedPaneName !== name;

    // Mobile flex weight: give the editor the most room, then lesson, then map.
    // Editor and Preview share leftover space (both grow); Curriculum/Lesson
    // are fixed-basis so they don't push the editor down.
    // Reader layouts (Step/Waypoint challenges with no Editor/Preview) let
    // the Lesson pane grow to fill the space instead of being capped.
    const mobileFlex = isCollapsed
      ? '0 0 40px'
      : isExpanded
        ? '1 1 auto'
        : someoneElseExpanded
          ? '0 0 40px'
          : name === 'Editor'
            ? '1 1 0'
            : name === 'Preview'
              ? '1 1 0'
              : name === 'Curriculum'
                ? '0 0 18vh'
                : isReaderLayout
                  ? '1 1 0'
                  : '0 0 28vh';

    // On mobile, when another pane is maximized, hide our content too
    // (only the header strip remains visible/clickable to restore).
    const mobileContentHidden = isMobile && (isCollapsed || someoneElseExpanded);

    const style = isMobile ? {
      position: 'relative',
      width: '100%',
      flex: mobileFlex,
      minHeight: (isCollapsed || someoneElseExpanded) ? '40px' : 0,
      paddingLeft: '4px',
      paddingRight: '4px',
      display: 'flex',
      flexDirection: 'column',
      borderBottom: '1px solid #ddd',
      borderLeft: 'none',
      overflow: 'hidden',
      boxSizing: 'border-box'
    } : {
      // Desktop: panes are absolutely positioned side-by-side via left/right
      // percentages. Three vertical states:
      //   collapsed: only the header strip is visible at the top
      //   expanded:  62vh tall (other panes keep their normal full height)
      //   normal:    fills available vertical space (top:0, bottom:0)
      bottom: isCollapsed ? 'auto' : 0,
      left: left + '%',
      overflowX: 'hidden',
      overflowY: 'hidden',
      position: 'absolute',
      right: right + '%',
      top: 0,
      height: isCollapsed ? '32px' : (isExpanded ? '62vh' : 'auto'),
      maxHeight: isCollapsed ? '32px' : (isExpanded ? '62vh' : 'none'),
      paddingLeft: '4px',
      paddingRight: '4px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isExpanded ? 'white' : 'transparent',
      transition: 'all 0.3s ease'
    };
    
    const contentStyle = {
      flex: mobileContentHidden ? '0' : (isCollapsed ? '0' : '1'),
      overflowY: mobileContentHidden ? 'hidden' : (isCollapsed ? 'hidden' : 'auto'),
      transition: 'all 0.3s ease',
      display: mobileContentHidden ? 'none' : (isCollapsed ? 'none' : 'block'),
      position: 'relative'
    };
    
    return (
      <div style={ style }>
        {name && (
          <PaneHeader
            isCollapsed={isCollapsed || (isMobile && someoneElseExpanded)}
            isExpanded={isExpanded}
            isMobile={isMobile}
            name={name}
            onCycle={this.handleCycle}
          />
        )}
        <div style={contentStyle} ref={this.setContentRef}>
          { children }
        </div>
        {name !== 'Curriculum' && !isCollapsed &&
          (showScrollTop || showScrollBottom) &&
          this.renderScrollArrows()}
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
