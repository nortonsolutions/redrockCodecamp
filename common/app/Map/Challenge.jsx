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

const certificationNames = {
  'Beginning Html And Css (phase I Term 1)': { name: 'user account', cert: null },
  'Advanced Html And Css (phase I Term 2)': { name: 'user account', cert: null },
  'Beginning Javascript (phase I Term 3)': { name: 'Responsive Web Design', cert: 'isRespWebDesignCertified' },
  'Advanced Javascript (phase Ii Term 4)': { name: 'Responsive Web Design', cert: 'isRespWebDesignCertified' },
  'Beginning Web Development (phase Ii Term 5)': { name: 'JS Algorithms and Data Structures', cert: 'isJsAlgoDataStructCertified' },
  'Advanced Web Development (phase Ii Term 6)': { name: 'JS Algorithms and Data Structures', cert: 'isJsAlgoDataStructCertified' },
  'Front End Libraries (phase Iii Term 7)': { name: 'JavaScript Front-End Web Development', cert: 'isFrontEndCertified' },
  'Server Side Development (phase Iii Term 8)': { name: 'JavaScript Front-End Libraries', cert: 'isFrontEndLibsCertified' },
  'Advanced Server Side Development (phase Iii Term 9)': { name: 'JavaScript APIs and Microservices', cert: 'isApisMicroservicesCertified' },
  'More Javascript For Masochists (phase X)': { name: 'Information Security and QA', cert: 'isInfosecQaCertified' }
};

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
  isRespWebDesignCertified: PropTypes.bool,
  isJsAlgoDataStructCertified: PropTypes.bool,
  isFrontEndCertified: PropTypes.bool,
  isFrontEndLibsCertified: PropTypes.bool,
  isApisMicroservicesCertified: PropTypes.bool,
  isInfosecQaCertified: PropTypes.bool,
  isBackEndCertified: PropTypes.bool,
  isFullStackCertified: PropTypes.bool,
  isNewDataVisCertified: PropTypes.bool,
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
      const isRespWebDesignCertified = isRespWebDesignCert;
      const isJsAlgoDataStructCertified = isJsAlgoDataStructCert;
      const isFrontEndCertified = isFrontEndCert;
      const isFrontEndLibsCertified = isFrontEndLibsCert;
      const isApisMicroservicesCertified = isApisMicroservicesCert;
      const isInfosecQaCertified = isInfosecQaCert;
      const isBackEndCertified = isBackEndCert;
      const isFullStackCertified = isFullStackCert;
      const isDataVisCertified = isDataVisCert;
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
        isRespWebDesignCertified,
        isJsAlgoDataStructCertified,
        isFrontEndCertified,
        isFrontEndLibsCertified,
        isApisMicroservicesCertified,
        isInfosecQaCertified,
        isBackEndCertified,
        isFullStackCertified,
        isDataVisCertified,
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
      <div className='modal fade in' style={{ display: 'block' }} role='dialog'>
        <div className='modal-dialog'>
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
      isRespWebDesignCertified,
      isJsAlgoDataStructCertified,
      isFrontEndCertified,
      isFrontEndLibsCertified,
      isApisMicroservicesCertified,
      isInfosecQaCertified,
      isBackEndCertified,
      isFullStackCertified,
      isDataVisCertified,
      prerequisiteMet,
      userHasChallengeMap
    } = this.props;
    if (!title) {
      return null;
    }

    let certLocked = false;
    let requiredCertName = null;
    
    switch (superBlock) {
      
        case "Beginning Html And Css (phase I Term 1)":
          if (!userHasChallengeMap) {
            certLocked = true;
            requiredCertName = 'user account';
          }
          break;

        case "Advanced Html And Css (phase I Term 2)":
          if (!userHasChallengeMap) {
            certLocked = true;
            requiredCertName = 'user account';
          }
          break;  

        case "Beginning Javascript (phase I Term 3)":
          if (!isRespWebDesignCertified) {
            certLocked = true;
            requiredCertName = 'Responsive Web Design';
          }
          break;

        case "Advanced Javascript (phase Ii Term 4)":
          if (!isRespWebDesignCertified) {
            certLocked = true;
            requiredCertName = 'Responsive Web Design';
          }
          break;

        case "Beginning Web Development (phase Ii Term 5)":
          if (!isJsAlgoDataStructCertified) {
            certLocked = true;
            requiredCertName = 'JS Algorithms and Data Structures';
          }
          break;

        case "Advanced Web Development (phase Ii Term 6)":
          if (!isJsAlgoDataStructCertified) {
            certLocked = true;
            requiredCertName = 'JS Algorithms and Data Structures';
          }
          break;

        case "Front End Libraries (phase Iii Term 7)":
          if (!isFrontEndCertified) {
            certLocked = true;
            requiredCertName = 'JavaScript Front-End Web Development';
          }
          break;

        case "Server Side Development (phase Iii Term 8)":
          if (!isFrontEndLibsCertified) {
            certLocked = true;
            requiredCertName = 'JavaScript Front-End Libraries';
          }
          break;

        case "Advanced Server Side Development (phase Iii Term 9)":
          if (!isApisMicroservicesCertified) {
            certLocked = true;
            requiredCertName = 'JavaScript APIs and Microservices';
          }
          break;

        case "More Javascript For Masochists (phase X)":
          if (!isInfosecQaCertified) {
            certLocked = true;
            requiredCertName = 'Information Security and QA';
          }
          break;
    }
    
    if (!prerequisiteMet && !certLocked) {
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
            >
            <a
              href='#'
              onClick={ this.handleLockedClick }
              style={{ cursor: 'pointer' }}
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
Challenge.dispalyName = 'Challenge';

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(Challenge);
