import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { challengeMetaSelector } from './redux';

import CompletionModal from './Completion-Modal.jsx';
import Classic from './views/classic';
import Step from './views/step';
import Project from './views/project';
import BackEnd from './views/backend';
import Quiz from './views/quiz';
import Modern from './views/Modern';

import {
  fetchChallenge,
  challengeSelector,
  updateTitle,
  userSelector
} from '../../redux';
import { makeToast } from '../../Toasts/redux';
import { paramsSelector } from '../../Router/redux';
import { challengeMapSelector } from '../../entities';
import { CERT_REQUIREMENTS, isContentLocked } from '../../Map/cert-requirements';
import { Link } from '../../Router';

const views = {
  backend: BackEnd,
  classic: Classic,
  modern: Modern,
  project: Project,
  quiz: Quiz,
  simple: Project,
  step: Step
};

const mapDispatchToProps = {
  fetchChallenge,
  makeToast,
  updateTitle
};

const mapStateToProps = createSelector(
  challengeSelector,
  challengeMetaSelector,
  paramsSelector,
  userSelector,
  challengeMapSelector,
  (
    { dashedName, isTranslated },
    { viewType, title },
    params,
    user,
    challengeMap
  ) => {
    const challenge = challengeMap[dashedName] || {};
    return {
      challenge: dashedName,
      isTranslated,
      params,
      title,
      viewType,
      user,
      superBlock: challenge.superBlock,
      isRespWebDesignCert: user ? user.isRespWebDesignCert : false,
      isJsAlgoDataStructCert: user ? user.isJsAlgoDataStructCert : false,
      isFrontEndCert: user ? user.isFrontEndCert : false,
      isFrontEndLibsCert: user ? user.isFrontEndLibsCert : false,
      isApisMicroservicesCert: user ? user.isApisMicroservicesCert : false,
      isInfosecQaCert: user ? user.isInfosecQaCert : false
    };
  }
);

const link = 'http://forum.freecodecamp.org/t/' +
  'guidelines-for-translating-free-code-camp' +
  '-to-any-language/19111';
const helpUsTranslate = <a href={ link } target='_blank'>Help Us</a>;
const propTypes = {
  isTranslated: PropTypes.bool,
  makeToast: PropTypes.func.isRequired,
  params: PropTypes.shape({
    block: PropTypes.string,
    dashedName: PropTypes.string,
    lang: PropTypes.string.isRequired
  }),
  superBlock: PropTypes.string, // e.g. "(2030) JavaScript Apprenticeship" - from challengeMap
  title: PropTypes.string,
  updateTitle: PropTypes.func.isRequired,
  user: PropTypes.object, // From userSelector - contains certification flags
  viewType: PropTypes.string,
  // Certification flags extracted from user object for access control
  isRespWebDesignCert: PropTypes.bool,
  isJsAlgoDataStructCert: PropTypes.bool,
  isFrontEndCert: PropTypes.bool,
  isFrontEndLibsCert: PropTypes.bool,
  isApisMicroservicesCert: PropTypes.bool,
  isInfosecQaCert: PropTypes.bool
};

export class Show extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      showBlockedModal: false,
      requiredCertName: null
    };
  }

  isNotTranslated({ isTranslated, params: { lang } }) {
    return lang !== 'en' && !isTranslated;
  }

  makeTranslateToast() {
    // this.props.makeToast({
    //   message: 'We haven\'t translated this challenge yet.',
    //   action: helpUsTranslate,
    //   timeout: 15000
    // });
  }

  checkCertificationAccess() {
    const { user, superBlock } = this.props;
    
    // If no user, they should be able to see the page
    // Server-side auth will handle signin redirects
    if (!user || !user.username) {
      return { allowed: true };
    }
    
    // Check certification requirements using isContentLocked helper
    const requirement = CERT_REQUIREMENTS[superBlock];
    const locked = isContentLocked(requirement, user);
    
    if (locked) {
      return { 
        allowed: false, 
        requiredCertName: requirement ? requirement.name : 'unknown certification'
      };
    }
    
    return { allowed: true };
  }

  componentDidMount() {
    const accessCheck = this.checkCertificationAccess();
    if (!accessCheck.allowed) {
      this.setState({ 
        showBlockedModal: true,
        requiredCertName: accessCheck.requiredCertName
      });
    }
    
    this.props.updateTitle(this.props.title);
    if (this.isNotTranslated(this.props)) {
      this.makeTranslateToast();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.title !== nextProps.title) {
      this.props.updateTitle(nextProps.title);
    }
    const { params: { dashedName } } = nextProps;
    if (
      this.props.params.dashedName !== dashedName &&
      this.isNotTranslated(nextProps)
    ) {
      this.makeTranslateToast();
    }
  }

  closeBlockedModal = () => {
    this.setState({ showBlockedModal: false });
  }

  renderBlockedModal() {
    const { showBlockedModal, requiredCertName } = this.state;
    if (!showBlockedModal) {
      return null;
    }
    
    return (
      <div>
        <div 
          className='modal-backdrop fade in' 
          style={{ 
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
          onClick={this.closeBlockedModal}
        />
        <div 
          className='modal fade in' 
          style={{ 
            display: 'block',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100000,
            width: '90%',
            maxWidth: '500px'
          }} 
          role='dialog'
        >
          <div className='modal-dialog' style={{ margin: 0, width: '100%' }}>
            <div className='modal-content'>
              <div className='modal-header'>
                <button 
                  type='button' 
                  className='close' 
                  onClick={this.closeBlockedModal}
                  style={{ float: 'right', fontSize: '1.5em', lineHeight: '1', opacity: 0.5 }}
                >
                  <span aria-hidden='true'>&times;</span>
                </button>
                <h4 className='modal-title'>Certification Required</h4>
              </div>
              <div className='modal-body'>
                <p>You need to obtain the <strong>{requiredCertName}</strong> certification before accessing this challenge.</p>
                <p>Advanced students can email <a href='mailto:dave@silvermedal.net'>dave@silvermedal.net</a> to request an override.</p>
              </div>
              <div className='modal-footer'>
                <Link to='/map'>
                  <button type='button' className='btn btn-primary'>Return to Map</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { viewType } = this.props;
    const { showBlockedModal } = this.state;
    
    // If blocked, show modal over the challenge
    if (showBlockedModal) {
      return (
        <div>
          <div style={{ filter: 'blur(5px)', pointerEvents: 'none' }}>
            <Classic />
          </div>
          {this.renderBlockedModal()}
        </div>
      );
    } else {
      const View = views[viewType] || Classic;
      return (
        <div>
          <View />
          <CompletionModal />
        </div>
      );
    }
  }
}

Show.displayName = 'Show(ChallengeView)';
Show.propTypes = propTypes;

export default connect(mapStateToProps, mapDispatchToProps)(Show);
