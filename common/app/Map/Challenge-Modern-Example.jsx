/**
 * MODERN REACT EXAMPLE - Challenge Component with Hooks
 * 
 * This is a side-by-side comparison showing how the Challenge component
 * would look with modern React patterns (hooks, functional components).
 * 
 * DO NOT USE THIS FILE - it's just for reference/learning
 * To actually use this, you'd need React 16.8+ with hooks support
 * 
 * Key improvements over the class version:
 * 1. ~40% less code
 * 2. No 'this' binding confusion
 * 3. No constructor or lifecycle methods
 * 4. Hooks replace mapStateToProps/mapDispatchToProps
 * 5. Logic is more readable and reusable
 */

import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import classnames from 'classnames';

import { clickOnChallenge } from './redux';x
import { userSelector } from '../redux';
import { challengeMapSelector } from '../entities';
import { Link } from '../Router';
import { onRouteChallenges } from '../routes/Challenges/redux';
import { CERT_REQUIREMENTS, isContentLocked } from './cert-requirements';

// ============================================================================
// BEFORE (Class Component) - 300+ lines
// ============================================================================
/*
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

  renderModal(requiredCert) {
    if (!this.state.showModal) {
      return null;
    }
    return ( ... 50 lines of JSX ... );
  }

  render() {
    const {
      block,
      clickOnChallenge,
      dashedName,
      isComingSoon,
      isCompleted,
      // ... 15 more props
    } = this.props;
    
    // ... 100 lines of logic ...
  }
}

Challenge.propTypes = { ... 20 props ... };

function makeMapStateToProps(_, { dashedName }) {
  return createSelector(
    userSelector,
    challengeMapSelector,
    (user, challengeMap) => {
      // ... 30 lines of prop mapping ...
    }
  );
}

export default connect(makeMapStateToProps, mapDispatchToProps)(Challenge);
*/

// ============================================================================
// AFTER (Functional Component with Hooks) - ~180 lines
// ============================================================================

function Challenge({ dashedName, block }) {
  // STATE: useState replaces this.state and this.setState
  const [showModal, setShowModal] = useState(false);

  // REDUX: useDispatch replaces mapDispatchToProps
  const dispatch = useDispatch();
  
  // REDUX: useSelector replaces mapStateToProps
  // Select user data once
  const user = useSelector(userSelector);
  
  // Select challenge data - useMemo prevents recalculation
  const challenge = useSelector(state => {
    const challengeMap = challengeMapSelector(state);
    return challengeMap[dashedName] || {};
  });

  // Destructure what we need (cleaner than 20 individual props)
  const {
    id,
    title,
    isLocked,
    isRequired,
    isComingSoon,
    superBlock
  } = challenge;

  const {
    challengeMap: userChallengeMap,
    isRespWebDesignCert,
    isJsAlgoDataStructCert,
    isFrontEndCert,
    isFrontEndLibsCert,
    isApisMicroservicesCert,
    isInfosecQaCert
  } = user || {};

  // COMPUTED VALUES: useMemo for expensive calculations
  const isCompleted = useMemo(
    () => userChallengeMap ? !!userChallengeMap[id] : false,
    [userChallengeMap, id]
  );

  // Certification check logic using isContentLocked helper
  const { certLocked, requiredCertName } = useMemo(() => {
    const requirement = CERT_REQUIREMENTS[superBlock];
    const locked = isContentLocked(requirement, user);
    
    return {
      certLocked: locked,
      requiredCertName: locked && requirement ? requirement.name : null
    };
  }, [superBlock, user]);

  // EVENT HANDLERS: useCallback prevents recreation on every render
  const handleLockedClick = useCallback((e) => {
    e.preventDefault();
    setShowModal(true);
  }, []); // Empty deps = never changes

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleChallengeClick = useCallback(() => {
    dispatch(clickOnChallenge());
  }, [dispatch]);

  // EARLY RETURNS: Simpler than complex conditionals in render
  if (!title) {
    return null;
  }

  // CLASS NAMES: Same logic, just in a separate const
  const challengeClassName = classnames({
    'text-primary': true,
    'padded-ionic-icon': true,
    'map-challenge-title': true,
    'ion-checkmark-circled faded': !(isLocked || isComingSoon || certLocked) && isCompleted,
    'ion-ios-circle-outline': !(isLocked || isComingSoon || certLocked) && !isCompleted,
    'ion-locked': isLocked || isComingSoon || certLocked,
    disabled: isLocked || isComingSoon,
    'slightly-faded': certLocked
  });

  // RENDER HELPERS: Extract as separate functions (or inline)
  const renderRequired = () => {
    if (!isRequired) return null;
    return <span className='text-primary'><strong>*</strong></span>;
  };

  const renderModal = () => {
    if (!showModal) return null;
    
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
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={closeModal}
        />
        <div 
          className='modal fade in' 
          style={{ 
            display: 'block',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10000,
            width: '90%',
            maxWidth: '500px'
          }} 
          role='dialog'
        >
          <div className='modal-dialog' style={{ margin: 0, width: '100%' }}>
            <div className='modal-content'>
              <div className='modal-header'>
                <button type='button' className='close' onClick={closeModal}>
                  <span>&times;</span>
                </button>
                <h4 className='modal-title'>Certification Required</h4>
              </div>
              <div className='modal-body'>
                <p>
                  You need to obtain the <strong>{requiredCertName}</strong> certification 
                  before accessing this challenge.
                </p>
                <p>
                  Advanced students can email{' '}
                  <a href='mailto:dave@silvermedal.net'>dave@silvermedal.net</a> to 
                  request an override.
                </p>
              </div>
              <div className='modal-footer'>
                <button type='button' className='btn btn-primary' onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // CONDITIONAL RENDERING: Cleaner with early returns and separate sections
  if (isLocked || isComingSoon) {
    return (
      <p className={challengeClassName} key={title}>
        {title}
        {renderRequired()}
        {isComingSoon && (
          <span className='text-info small'>
            &thinsp; &thinsp;
            <strong><em>Coming Soon</em></strong>
          </span>
        )}
      </p>
    );
  }
  
  if (certLocked) {
    return (
      <div>
        <div className={challengeClassName} key={title}>
          <a
            href='#'
            onClick={handleLockedClick}
            style={{ cursor: 'pointer' }}
          >
            <span>
              {title}
              {renderRequired()}
            </span>
          </a>
        </div>
        {renderModal()}
      </div>
    );
  }
  
  // DEFAULT: Unlocked challenge
  return (
    <div className={challengeClassName} key={title}>
      <Link
        onClick={handleChallengeClick}
        to={onRouteChallenges({ dashedName, block })}
      >
        <span>
          {title}
          {isCompleted && <span className='sr-only'>completed</span>}
          {renderRequired()}
        </span>
      </Link>
    </div>
  );
}

// PropTypes still useful for documentation and runtime checking
Challenge.propTypes = {
  block: PropTypes.string,
  dashedName: PropTypes.string.isRequired
};

Challenge.displayName = 'Challenge';

export default Challenge;

// ============================================================================
// KEY DIFFERENCES SUMMARY
// ============================================================================

/*

1. STATE MANAGEMENT
   Before: constructor + this.state + this.setState
   After:  const [showModal, setShowModal] = useState(false)

2. PROPS FROM REDUX
   Before: makeMapStateToProps + connect() HOC + 20 individual props
   After:  useSelector hooks - grab exactly what you need when you need it

3. DISPATCH ACTIONS
   Before: mapDispatchToProps object + connect()
   After:  const dispatch = useDispatch(); dispatch(action())

4. EVENT HANDLERS
   Before: Arrow functions as class properties or .bind(this)
   After:  useCallback with dependency array

5. COMPUTED VALUES
   Before: Calculate in render (every time) or use class properties
   After:  useMemo with dependency array (only recalculate when deps change)

6. LIFECYCLE METHODS
   Before: componentDidMount, componentDidUpdate, componentWillUnmount
   After:  useEffect hook (not needed in this component)

7. CODE ORGANIZATION
   Before: Everything in a class, rigid structure
   After:  Small focused functions, can extract custom hooks

8. PERFORMANCE
   Before: PureComponent + manual shouldComponentUpdate
   After:  React.memo() wrapper if needed, automatic optimization

9. TESTING
   Before: Mock this, mock props, test class methods
   After:  Test pure functions, easier to mock hooks

10. REUSABILITY
    Before: HOCs and render props for logic sharing
    After:  Custom hooks - extremely clean and composable

*/

// ============================================================================
// CUSTOM HOOKS EXAMPLE (Bonus: How you'd extract reusable logic)
// ============================================================================

/*
// You could extract the certification check into a reusable hook:

function useCertificationCheck(superBlock) {
  const user = useSelector(userSelector);
  
  return useMemo(() => {
    const requirement = CERT_REQUIREMENTS[superBlock];
    if (!requirement || requirement.cert === null) {
      return { locked: false, certName: null };
    }
    
    const hasCert = user && user[requirement.cert];
    return {
      locked: !hasCert,
      certName: requirement.name
    };
  }, [superBlock, user]);
}

// Then in your component:
const { locked, certName } = useCertificationCheck(superBlock);

// This same hook could be used in Challenge.jsx, Block.jsx, Super-Block.jsx, etc.
// No more duplicate logic!
*/
