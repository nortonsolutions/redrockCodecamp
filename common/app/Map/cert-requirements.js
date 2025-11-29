// Certification requirements lookup - maps superBlock folder names to required certs
// This is the single source of truth for certification requirements across the Map components
export const CERT_REQUIREMENTS = {
  '(1010) World Wide Web Elements': { cert: null, name: 'user account' },
  '(1020) Responsive Web Design': { cert: null, name: 'user account' },
  '(2030) JavaScript Apprenticeship': { cert: 'isRespWebDesignCert', name: 'Responsive Web Design' },
  '(2040) JavaScript Standards': { cert: 'isRespWebDesignCert', name: 'Responsive Web Design' },
  '(2050) JavaScript Browser APIs': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(2060) JavaScript Web Citizenship': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(3070) Front End Frameworks': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(3080) Back End Web Tech': { cert: 'isFrontEndCert', name: 'JavaScript Front-End Web Development' },
  '(3090) Advanced Server Patterns': { cert: 'isFrontEndLibsCert', name: 'JavaScript Front-End Libraries' },
  '(4010) JavaScript for Engineers': { cert: 'isInfosecQaCert', name: 'Information Security and QA' }
};
