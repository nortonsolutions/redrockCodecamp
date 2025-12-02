import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import classnames from 'classnames';
import debug from 'debug';

import { clickOnChallenge } from './redux';
import { userSelector } from '../redux';
import { challengeMapSelector } from '../entities';
import { Link } from '../Router';
import { onRouteChallenges } from '../routes/Challenges/redux';
import { CERT_REQUIREMENTS } from './cert-requirements';

const propTypes = {
  block: PropTypes.string,
  challenge: PropTypes.object,
  clickOnChallenge: PropTypes.func.isRequired,
  dashedName: PropTypes.string,
  isComingSoon: PropTypes.bool,
  isCompleted: PropTypes.bool,
  isDev: PropTypes.bool,
  isLocked: PropTypes.bool,
  isRequired: PropTypes.bool,
  title: PropTypes.string,
  superBlock: PropTypes.string,
  isRespWebDesignCert: PropTypes.bool,
  isJsAlgoDataStructCert: PropTypes.bool,
  isFrontEndCert: PropTypes.bool,
  isFrontEndLibsCert: PropTypes.bool,
  isApisMicroservicesCert: PropTypes.bool,
  isInfosecQaCert: PropTypes.bool,
  isBackEndCert: PropTypes.bool,
  isFullStackCert: PropTypes.bool,
  isDataVisCert: PropTypes.bool,
  prerequisiteMet: PropTypes.bool,
  userHasChallengeMap: PropTypes.bool
};

const mapDispatchToProps = { clickOnChallenge };

function makeMapStateToProps(_, { dashedName }) {
  return createSelector(
    userSelector,
    challengeMapSelector,
    (
      { challengeMap: userChallengeMap, isRespWebDesignCert, isJsAlgoDataStructCert, isFrontEndCert, isFrontEndLibsCert, isApisMicroservicesCert, isInfosecQaCert, isBackEndCert, isFullStackCert, isDataVisCert },
      challengeMap
    ) => {
      const {
        id,
        title,
        block,
        isLocked,
        isRequired,
        isComingSoon,
        superBlock,
        prerequisite
      } = challengeMap[dashedName] || {};
      const isCompleted = userChallengeMap ? !!userChallengeMap[id] : false;
      const prerequisiteMet = !prerequisite ? true : userChallengeMap ? (userChallengeMap[prerequisite]? true: false) : false;
      const userHasChallengeMap = userChallengeMap? true : false;

      return {
        dashedName,
        isCompleted,
        title,
        block,
        isLocked,
        isRequired,
        isComingSoon,
        superBlock,
        isDev: debug.enabled('rrcc:*'),
        isRespWebDesignCert,
        isJsAlgoDataStructCert,
        isFrontEndCert,
        isFrontEndLibsCert,
        isApisMicroservicesCert,
        isInfosecQaCert,
        isBackEndCert,
        isFullStackCert,
        isDataVisCert,
        prerequisiteMet,
        userHasChallengeMap
      };
    }
  );
}

export class Challenge extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.showModal && !prevState.showModal) {
      // Modal opened - prevent body scroll
      document.body.style.overflow = 'hidden';
    } else if (!this.state.showModal && prevState.showModal) {
      // Modal closed - restore body scroll
      document.body.style.overflow = '';
    }
  }

  componentWillUnmount() {
    // Cleanup: restore body scroll if component unmounts with modal open
    document.body.style.overflow = '';
  }

  handleLockedClick = (e) => {
    e.preventDefault();
    this.setState({ showModal: true });
  }

  closeModal = () => {
    this.setState({ showModal: false });
  }

  renderCompleted(isCompleted, isLocked) {
    if (isLocked || !isCompleted) {
      return null;
    }
    return <span className='sr-only'>completed</span>;
  }

  renderRequired(isRequired) {
    if (!isRequired) {
      return '';
    }
    return <span className='text-primary'><strong>*</strong></span>;
  }

  renderComingSoon(isComingSoon) {
    if (!isComingSoon) {
      return null;
    }
    return (
      <span className='text-info small'>
        &thinsp; &thinsp;
        <strong>
          <em>Coming Soon</em>
        </strong>
      </span>
    );
  }

  renderLocked(title, isRequired, isComingSoon, className) {
    return (
      <p
        className={ className }
        key={ title }
        >
        { title }
        { this.renderRequired(isRequired) }
        { this.renderComingSoon(isComingSoon) }
      </p>
    );
  }

  renderModal(requiredCert) {
    if (!this.state.showModal) {
      return null;
    }
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        overflow: 'auto'
      }}>
        <div 
          className='modal-backdrop fade in' 
          style={{ 
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            minHeight: '100vh',
            minWidth: '100vw',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={this.closeModal}
        />
        <div 
          className='modal fade in' 
          style={{ 
            display: 'block',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000000,
            width: '85%',
            maxWidth: '450px',
            margin: '0 auto'
          }} 
          role='dialog'
        >
          <div className='modal-dialog' style={{ margin: 0, width: '100%' }}>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className='close' onClick={this.closeModal}>
                  <span>&times;</span>
                </button>
                <h4 className='modal-title'>Certification Required</h4>
              </div>
              <div className='modal-body'>
                <p>You need to obtain the <strong>{requiredCert}</strong> certification before accessing this challenge.</p>
                <p>Advanced students can email <a href='mailto:dave@silvermedal.net'>dave@silvermedal.net</a> to request an override.</p>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-primary' onClick={this.closeModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  render() {
    const {
      block,
      clickOnChallenge,
      dashedName,
      isComingSoon,
      isCompleted,
      isDev,
      isLocked,
      isRequired,
      title,
      superBlock,
      isRespWebDesignCert,
      isJsAlgoDataStructCert,
      isFrontEndCert,
      isFrontEndLibsCert,
      isApisMicroservicesCert,
      isInfosecQaCert,
      isBackEndCert,
      isFullStackCert,
      isDataVisCert,
      prerequisiteMet,
      userHasChallengeMap
    } = this.props;
    if (!title) {
      return null;
    }

    let certLocked = false;
    let requiredCertName = null;
    
    // Check certification requirements using lookup object
    const requirement = CERT_REQUIREMENTS[superBlock.toLowerCase()];
    if (requirement) {
      if (requirement.cert === null) {
        certLocked = false;
      } else {
        const hasCert = this.props[requirement.cert];
        certLocked = !hasCert;
        requiredCertName = requirement.name;
      }
    }
    if (!certLocked && !prerequisiteMet && userHasChallengeMap) {
      certLocked = true;
      requiredCertName = 'prerequisite challenge';
    }

    const challengeClassName = classnames({
      'text-primary': true,
      'padded-ionic-icon': true,
      'map-challenge-title': true,
      'ion-checkmark-circled faded': !(isLocked || isComingSoon || certLocked) && isCompleted,
      'ion-ios-circle-outline': !(isLocked || isComingSoon || certLocked) && !isCompleted,
      'ion-locked': isLocked || isComingSoon || certLocked,
      disabled: isLocked || (!isDev && isComingSoon),
      'slightly-faded': certLocked
    });
    if (isLocked || (!isDev && isComingSoon)) {
      return this.renderLocked(
        title,
        isRequired,
        isComingSoon,
        challengeClassName
      );
    }
    
    if (certLocked) {
      return (
        <div>
          <div
            className={ challengeClassName }
            key={ title }
            style={{ color: 'lightblue' }}
            >
            <a
              href='#'
              onClick={ this.handleLockedClick }
              style={{ cursor: 'pointer', color: 'lightblue' }}
              >
              <span>
                { title }
                { this.renderRequired(isRequired) }
              </span>
            </a>
          </div>
          { this.renderModal(requiredCertName) }
        </div>
      );
    }
    
    return (
      <div
        className={ challengeClassName }
        key={ title }
        >
        <Link
          onClick={ clickOnChallenge }
          to={ onRouteChallenges({ dashedName, block }) }
          >
          <span >
            { title }
            { this.renderCompleted(isCompleted, isLocked) }
            { this.renderRequired(isRequired) }
          </span>
        </Link>
      </div>
    );
  }
}

Challenge.propTypes = propTypes;
Challenge.displayName = 'Challenge';

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Challenge);
