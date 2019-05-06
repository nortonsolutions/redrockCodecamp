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
  isApiMicroservicesCertified: PropTypes.bool,
  isInfoSecQaCertified: PropTypes.bool,
  isBackEndCertified: PropTypes.bool,
  isFullStackCertified: PropTypes.bool,
  isNewDataVisCertified: PropTypes.bool
};

const mapDispatchToProps = { clickOnChallenge };

function makeMapStateToProps(_, { dashedName }) {
  return createSelector(
    userSelector,
    challengeMapSelector,
    (
      { challengeMap: userChallengeMap, isRespWebDesignCert, isJsAlgoDataStructCert, isFrontEndCert, isFrontEndLibsCert, isApiMicroservicesCert, isInfoSecQaCert, isBackEndCert, isFullStackCert, isDataVisCert },
      challengeMap
    ) => {
      const {
        id,
        title,
        block,
        isLocked,
        isRequired,
        isComingSoon,
        superBlock
      } = challengeMap[dashedName] || {};
      const isCompleted = userChallengeMap ? !!userChallengeMap[id] : false;
      const isRespWebDesignCertified = isRespWebDesignCert;
      const isJsAlgoDataStructCertified = isJsAlgoDataStructCert;
      const isFrontEndCertified = isFrontEndCert;
      const isFrontEndLibsCertified = isFrontEndLibsCert;
      const isApiMicroservicesCertified = isApiMicroservicesCert;
      const isInfoSecQaCertified = isInfoSecQaCert;
      const isBackEndCertified = isBackEndCert;
      const isFullStackCertified = isFullStackCert;
      const isDataVisCertified = isDataVisCert;
      return {
        dashedName,
        isCompleted,
        title,
        block,
        isLocked,
        isRequired,
        isComingSoon,
        superBlock,
        isDev: debug.enabled('fcc:*'),
        isRespWebDesignCertified,
        isJsAlgoDataStructCertified,
        isFrontEndCertified,
        isFrontEndLibsCertified,
        isApiMicroservicesCertified,
        isInfoSecQaCertified,
        isBackEndCertified,
        isFullStackCertified,
        isDataVisCertified
      };
    }
  );
}

export class Challenge extends PureComponent {
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
      isApiMicroservicesCertified,
      isInfoSecQaCertified,
      isBackEndCertified,
      isFullStackCertified,
      isDataVisCertified
    } = this.props;
    if (!title) {
      return null;
    }

    let hide = false;
    
    switch (superBlock) {
        
        case "Beginning Javascript (phase I Term 3)":
          if (!isRespWebDesignCertified) hide = true;
          break;

        case "Advanced Javascript (phase Ii Term 4)":
          if (!isRespWebDesignCertified) hide = true;
          break;

        case "Beginning Web Development (phase Ii Term 5)":
          if (!isJsAlgoDataStructCertified) hide = true;
          break;

        case "Advanced Web Development (phase Ii Term 6)":
          if (!isJsAlgoDataStructCertified) hide = true;
          break;

        case "Front End Libraries (phase Iii Term 7)":
          if (!isFrontEndCertified) hide = true;
          break;

        case "Server Side Development (phase Iii Term 8)":
          if (!isFrontEndLibsCertified) hide = true;
          break;

        case "Advanced Server Side Development (phase Iii Term 9)":
          if (!isApiMicroservicesCertified) hide = true;
          break;

        case "More Javascript For Masochists (phase X)":
          if (!isInfoSecQaCertified) hide = true;
          break;
    }
    
    const challengeClassName = classnames({
      'hidden': hide,
      'text-primary': true,
      'padded-ionic-icon': true,
      'map-challenge-title': true,
      'ion-checkmark-circled faded': !(isLocked || isComingSoon) && isCompleted,
      'ion-ios-circle-outline': !(isLocked || isComingSoon) && !isCompleted,
      'ion-locked': isLocked || isComingSoon,
      disabled: isLocked || (!isDev && isComingSoon)
    });
    if (isLocked || (!isDev && isComingSoon)) {
      return this.renderLocked(
        title,
        isRequired,
        isComingSoon,
        challengeClassName
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
