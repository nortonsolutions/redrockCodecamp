import debug from 'debug';
import { Observable } from 'rx';
import _ from 'lodash';

const log = debug('rrcc:auto-certification');

// Maps certification types to their challenge IDs and the certificate property name
export const CERT_CONFIG = {
  'isRespWebDesignCert': {
    challengeId: '587d78aa367417b2b2512aee', // Responsive Web Design cert challenge
    requiredChallenges: [
      '587d78af367417b2b2512b03', // Build a Survey Form
      'bd7158d8c442eddfaeb5bd18', // Build a Tribute Page
      '587d78af367417b2b2512b04', // Build a Product Landing Page
      '587d78b0367417b2b2512b05', // Build a Technical Documentation Page
      'bd7158d8c242eddfaeb5bd13', // Build a Personal Portfolio Webpage
      'bc79461067801f01f86a2cf7', // HTML and CSS Workout #1
      'e0cdf4a067969ddee1a3f21f', // HTML and CSS Workout #2
      '8b9f8e90e6bc19dfbda33527', // Interphase Webpage
      'ba0020c0e6c0c545d5663755', // Visualize Webpage
      '0ccecd00e6c7a3b64486ddc4', // Epilogue Webpage
      '723dd530e6c955ed5a82073e'  // Industrious Webpage
    ]
  },
  'isJsAlgoDataStructCert': {
    challengeId: '5a34371eb8853b934b0d9803', // JS Algorithms and Data Structures cert challenge
    requiredChallenges: [
      'aaa48de84e1ecc7c742e1124', // Palindrome Checker
      'a7f4d8f2483413a6ce226cac', // Roman Numeral Converter
      'aff0395860f5d3034dc0bfc9', // Telephone Number Validator
      'aa2e6f85cab2ab736c9a9b24', // Cash Register
      '4ceff2f015ade7754d1e5c40', // Virtual Life App with Animate Text
      'b76579a015dc81c4130c6dba', // Virtual Life App with Animate Icons
      'c9a5d2e015e615ab4534e331', // Virtual Life App with Health
      '7827c550180b1983f7d686bb'  // Virtual Life App with Statistics
    ]
  },
  'isFrontEndCert': {
    challengeId: '561add10cb82ac38a17513be', // Front End cert challenge
    requiredChallenges: [
      '74c80400ecd32f9f26dfed57', // User Management Page
      'ea31b1a0ecd3fdfa707d31a3', // User Management Page with MVC
      '0e749670f18bfbc0ce1ab47f', // User Management Page with Templates
      'efd58d40fc85274deed8d559', // User Management Page with Router
      'a5649440fcc17faeab614b31', // User Management Page with Bookmarkable
      '36a8b4d0fda447acb4971b9d'  // Bluesky Website
    ]
  },
  'isFrontEndLibsCert': {
    challengeId: '587d7dbb367417b2b2512bad', // Front End Libraries cert challenge
    requiredChallenges: [
      'bd7158d8c442eddfaeb5bd0f', // Build a Pomodoro Clock
      'bd7158d8c442eddfaeb5bd17', // Build a JavaScript Calculator
      '587d7dbc367417b2b2512bae', // Build a Drum Machine
      'bd7157d8c242eddfaeb5bd13', // Build a Markdown Previewer
      'bd7158d8c442eddfaeb5bd13'  // Build a Random Quote Machine
    ]
  },
  'isDataVisCert': {
    challengeId: '587d7fa5367417b2b2512bbe', // Data Visualization cert challenge
    requiredChallenges: [
      '587d7fa6367417b2b2512bc0', // Visualize Data with a Treemap Diagram
      '587d7fa6367417b2b2512bbf', // Visualize Data with a Choropleth Map
      'bd7188d8c242eddfaeb5bd13', // Visualize Data with a Heat Map
      'bd7178d8c242eddfaeb5bd13', // Visualize Data with a Scatterplot Graph
      'bd7168d8c242eddfaeb5bd13'  // Visualize Data with a Bar Chart
    ]
  },
  'isApisMicroservicesCert': {
    challengeId: '587d7fb3367417b2b2512bf9', // APIs and Microservices cert challenge
    requiredChallenges: [
      'bd7158d8c443edefaeb5bdef', // Timestamp Microservice
      'bd7158d8c443edefaeb5bdff', // Request Header Parser Microservice
      'bd7158d8c443edefaeb5bd0e', // URL Shortener Microservice
      'bd7158d8c443edefaeb5bd0f', // File Metadata Microservice
      'bd7158d8c443edefaeb5bdee'  // Exercise Tracker
    ]
  },
  'isInfosecQaCert': {
    challengeId: '587d8247367417b2b2512c35', // Information Security and QA cert challenge
    requiredChallenges: [
      '587d8249367417b2b2512c42', // Issue Tracker
      '587d8249367417b2b2512c41', // Metric-Imperial Converter
      '587d824a367417b2b2512c43', // Personal Library
      '587d824a367417b2b2512c44', // Stock Price Checker
      '587d824a367417b2b2512c45'  // Anonymous Message Board
    ]
  }
};

/**
 * Check if a user has completed all required challenges for a certification
 * @param {Object} user - The user object with challengeMap
 * @param {String} certType - The certification type (e.g., 'isRespWebDesignCert')
 * @returns {Boolean} - True if all required challenges are completed
 */
export function hasCompletedCertRequirements(user, certType) {
  const certConfig = CERT_CONFIG[certType];
  
  if (!certConfig) {
    log(`Unknown cert type: ${certType}`);
    return false;
  }
  
  const { requiredChallenges } = certConfig;
  const { challengeMap = {} } = user;
  
  // Check if all required challenges are in the challengeMap
  const allCompleted = requiredChallenges.every(challengeId => {
    return challengeMap[challengeId] !== undefined;
  });
  
  return allCompleted;
}

/**
 * Auto-grant certifications to a user based on their completed challenges
 * This should be called after a challenge completion
 * @param {Object} user - The user object
 * @returns {Observable} - Observable that updates user with new certifications
 */
export function autoGrantCertifications$(user) {
  if (!user) {
    return Observable.just(null);
  }
  
  const updates = {};
  let hasUpdates = false;
  
  // Check each certification type
  Object.keys(CERT_CONFIG).forEach(certType => {
    // Skip if user already has this cert
    if (user[certType]) {
      return;
    }
    
    // Check if user has completed all requirements
    if (hasCompletedCertRequirements(user, certType)) {
      const certConfig = CERT_CONFIG[certType];
      const certChallengeId = certConfig.challengeId;
      
      log(`Auto-granting ${certType} to user ${user.username || user.email}`);
      
      // Add the certification to the update
      updates[certType] = true;
      
      // Also add the cert challenge to the challengeMap
      if (!user.challengeMap[certChallengeId]) {
        updates[`challengeMap.${certChallengeId}`] = {
          id: certChallengeId,
          completedDate: new Date(),
          challengeType: 7 // Waypoint challenge type
        };
      }
      
      hasUpdates = true;
    }
  });
  
  // If no updates needed, return early
  if (!hasUpdates) {
    return Observable.just(null);
  }
  
  // Update the user with new certifications
  const updateData = { $set: updates };
  
  return user.update$(updateData)
    .doOnNext(() => {
      log(`Successfully auto-granted certifications: ${Object.keys(updates).filter(k => !k.startsWith('challengeMap')).join(', ')}`);
    })
    .map(() => updates);
}
