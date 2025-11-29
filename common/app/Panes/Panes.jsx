import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import {
  panesSelector,
  panesByNameSelector,
  panesMounted,
  heightSelector,
  widthSelector
} from './redux';
import Pane from './Pane.jsx';
import Divider from './Divider.jsx';

const mapStateToProps = createSelector(
  panesSelector,
  panesByNameSelector,
  heightSelector,
  widthSelector,
  (panes, panesByName, height) => {
    let lastDividerPosition = 0;
    return {
      panes: panes
        .map(({ name }) => panesByName[name])
        .filter(({ isHidden })=> !isHidden)
        .map((pane, index, { length: numOfPanes }) => {
          const dividerLeft = pane.dividerLeft || 0;
          const left = lastDividerPosition;
          lastDividerPosition = dividerLeft;
          return {
            ...pane,
            left: index === 0 ? 0 : left,
            right: index + 1 === numOfPanes ? 0 : 100 - dividerLeft
          };
        }, {}),
      height
    };
  }
);

const mapDispatchToProps = { panesMounted };

const propTypes = {
  height: PropTypes.number.isRequired,
  panes: PropTypes.array,
  panesMounted: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired
};

export class Panes extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandedPane: null
    };
  }

  componentDidMount() {
    this.props.panesMounted();
  }

  handlePaneExpand = (paneName) => {
    this.setState(prevState => ({
      expandedPane: prevState.expandedPane === paneName ? null : paneName
    }));
  }

  renderPanes() {
    const {
      render,
      panes
    } = this.props;
    return panes.map(({ name, left, right, dividerLeft }) => {
      const divider = dividerLeft ?
        (
          <Divider
            key={ name + 'divider' }
            left={ dividerLeft }
            name={ name }
          />
        ) :
        null;

      return [
        <Pane
          key={ name }
          left={ left }
          name={ name }
          right={ right }
          isExpanded={this.state.expandedPane === name}
          onExpandToggle={() => this.handlePaneExpand(name)}
          >
          { render(name) }
        </Pane>,
        divider
      ];
    }).reduce((panes, pane) => panes.concat(pane), [])
      .filter(Boolean);
  }

  render() {
    const { height } = this.props;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    
    const outerStyle = {
      height,
      position: 'relative',
      width: '100%'
    };
    
    const innerStyle = isMobile ? {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      height: '100%',
      overflowY: 'auto'
    } : {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
    return (
      <div style={outerStyle}>
        <div className={isMobile ? 'panes-container-mobile' : ''} style={innerStyle}>
          { this.renderPanes() }
        </div>
      </div>
    );
  }
}

Panes.displayName = 'Panes';
Panes.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Panes);
