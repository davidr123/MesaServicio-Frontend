export const APP_CONSTANTS = {
  API_URL: 'http://localhost:5000/api',
  TOKEN_KEY: 'access_token',
  USER_KEY: 'user',
  APP_NAME: 'Service Desk',
  APP_VERSION: '1.0.0',

  TICKET_STATUS: {
    PENDING_ASSIGNMENT: 'PENDING_ASSIGNMENT',
    IN_PROGRESS: 'IN_PROGRESS',
    CERTIFICATION: 'CERTIFICATION',
    CLOSED: 'CLOSED'
  },

  TICKET_PRIORITY: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  },

  USER_ROLES: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    DEVELOPER: 'DEVELOPER'
  }
};
