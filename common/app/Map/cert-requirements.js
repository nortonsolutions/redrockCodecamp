// Certification requirements lookup - maps superBlock names to required certs
// Keys use lowercase for case-insensitive matching across different data sources
// This is the single source of truth for certification requirements across the Map components
export const CERT_REQUIREMENTS = {
  '(1010) world wide web elements': { cert: null, name: 'user account' },
  '(1020) responsive web design': { cert: null, name: 'user account' },
  '(2030) javascript apprenticeship': { cert: 'isRespWebDesignCert', name: 'Responsive Web Design' },
  '(2040) javascript standards': { cert: 'isRespWebDesignCert', name: 'Responsive Web Design' },
  '(2050) javascript browser apis': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(2060) javascript web citizenship': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(3070) front end frameworks': { cert: 'isJsAlgoDataStructCert', name: 'JS Algorithms and Data Structures' },
  '(3080) back end web tech': { cert: 'isFrontEndCert', name: 'JavaScript Front-End Web Development' },
  '(3090) advanced server patterns': { cert: 'isFrontEndLibsCert', name: 'JavaScript Front-End Libraries' },
  '(4010) javascript for engineers': { cert: 'isInfosecQaCert', name: 'Information Security and QA' }
};
