import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import capitalize from 'lodash/capitalize';
import { createSelector } from 'reselect';
import FCCSearchBar from 'react-freecodecamp-search';

import {
  Image,
  MenuItem,
  Nav,
  NavDropdown,
  NavItem,
  Navbar,
  NavbarBrand
} from 'react-bootstrap';

import { Link } from '../Router';
import navLinks from './links.json';
import SignUp from './Sign-Up.jsx';
import BinButton from './Bin-Button.jsx';
import {
  clickOnLogo,
  clickOnMap,
  openDropdown,
  closeDropdown,
  createNavLinkActionCreator,

  dropdownSelector
} from './redux';
import { isSignedInSelector, signInLoadingSelector } from '../redux';
import { panesSelector } from '../Panes/redux';


const fCClogo = 'https://s3.amazonaws.com/freecodecamp/freecodecamp_logo.svg';
// TODO @freecodecamp-team: place this glyph in S3 like above, PR in /assets
const fCCglyph = 'https://raw.githubusercontent.com/freeCodeCamp/assets/' +
  '3b9cafc312802199ebba8b31fb1ed9b466a3efbb/assets/logos/FFCFire.png';

const mapStateToProps = createSelector(
  isSignedInSelector,
  dropdownSelector,
  signInLoadingSelector,
  panesSelector,
  (
    isSignedIn,
    isDropdownOpen,
    showLoading,
    panes,
  ) => {
    return {
      panes: panes.map(({ name, type }) => {

        var displayName = name;

        switch (name) {
          case 'Map':
            displayName = 'All Lessons';
            break;
          case 'Editor':
            displayName = 'Code Editor';
            break;
          case 'Step':
            displayName = 'Lesson';
            break;
        }

        return {
          content: name,
          displayName: displayName,
          action: type
        };
      }, {}),
      isDropdownOpen,
      isSignedIn,
      showLoading
    };
  }
);

function mapDispatchToProps(dispatch) {
  const dispatchers = bindActionCreators(navLinks.reduce(
    (mdtp, { content }) => {
      const handler = `handle${capitalize(content)}Click`;
      mdtp[handler] = createNavLinkActionCreator(content);
      return mdtp;
    },
    {
      clickOnMap: e => {
        e.preventDefault();
        return clickOnMap();
      },
      clickOnLogo: e => {
        e.preventDefault();
        return clickOnLogo();
      },
      closeDropdown: () => closeDropdown(),
      openDropdown: () => openDropdown()
    }
  ), dispatch);
  dispatchers.dispatch = dispatch;
  return () => dispatchers;
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const panes = stateProps.panes.map(pane => {
    return {
      ...pane,
      actionCreator: () => dispatchProps.dispatch({ type: pane.action })
    };
  });
  return {
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
    panes
  };
}

const propTypes = {
  clickOnLogo: PropTypes.func.isRequired,
  clickOnMap: PropTypes.func.isRequired,
  closeDropdown: PropTypes.func.isRequired,
  isDropdownOpen: PropTypes.bool,
  isSignedIn: PropTypes.bool,
  openDropdown: PropTypes.func.isRequired,
  panes: PropTypes.array,
  showLoading: PropTypes.bool,
  signedIn: PropTypes.bool
};

export class FCCNav extends React.Component {
  renderLink(isNavItem, { isReact, isDropdown, content, link, links, target }) {
    const Component = isNavItem ? NavItem : MenuItem;
    const {
      isDropdownOpen,
      openDropdown,
      closeDropdown
    } = this.props;

    if (isDropdown) {
      // adding a noop to NavDropdown to disable false warning
      // about controlled component
      return (
        <NavDropdown
          id={`nav-${content}-dropdown`}
          key={content}
          noCaret={true}
          onClick={openDropdown}
          onMouseEnter={openDropdown}
          onMouseLeave={closeDropdown}
          onToggle={isDropdownOpen ? closeDropdown : openDropdown}
          open={isDropdownOpen}
          title={content}
        >
          {links.map(this.renderLink.bind(this, false))}
        </NavDropdown>
      );
    }
    if (isReact) {
      return (
        <Link
          key={content}
          onClick={this.props[`handle${content}Click`]}
          to={link}
        >
          <Component
            target={target || null}
          >
            {content}
          </Component>
        </Link>
      );
    }
    return (
      <Component
        href={link}
        key={content}
        onClick={this.props[`handle${content}Click`]}
        target={target || null}
      >
        {content}
      </Component>
    );
  }

  render() {
    const {
      panes,
      isSignedIn,
      clickOnLogo,
      clickOnMap,
      showLoading
    } = this.props;

    const shouldShowMapButton = panes.length === 0;
    return (
      <Navbar
        className='nav-height'
        id='navbar'
        staticTop={true}
      >
        <div className='nav-component-wrapper'>
          <Navbar.Header>
            <Navbar.Toggle children={'Menu'} />
            <NavbarBrand>
              <a
                href='http://redrockcodecamp.org/'
                target='_blank'
              >
                <Image
                  className='nav-logo'
                  alt='logo'
                  title='RedRock Portal'
                  src='/images/logos/logo-landscape.png'
                />                
              </a>
            </NavbarBrand>
            <NavbarBrand>
              <a
                href='/challenges/current-challenge'
                title='Current Challenge'
                onClick={clickOnLogo}
              >
                <p>
                  {process.env.businessAppName}
                </p>
              </a>
            </NavbarBrand>
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav
              navbar={true}
              pullRight={true}
            >
              {
                panes.map(({ content, displayName, actionCreator }) => (
                  <BinButton
                    content={displayName}
                    handleClick={actionCreator}
                    key={content}
                  />
                ))
              }
              {shouldShowMapButton ?
                <BinButton
                  content='All Lessons'
                  handleClick={clickOnMap}
                  key='Map'
                /> :
                null
              }
              <SignUp
                showLoading={showLoading}
                showSignUp={!isSignedIn}
              />
            </Nav>
          </Navbar.Collapse>
        </div>
      </Navbar>
    );
  }
}

FCCNav.displayName = 'FCCNav';
FCCNav.propTypes = propTypes;

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(FCCNav);
