export type Language = 'en' | 'hi' | 'mr';

export interface TranslationKeys {
  // Application Branding
  appName: string;
  appDescription: string;
  
  // Common UI Elements
  common: {
    login: string;
    logout: string;
    welcome: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    view: string;
    search: string;
    filter: string;
    refresh: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    close: string;
    confirm: string;
    yes: string;
    no: string;
    active: string;
    inactive: string;
    blocked: string;
    online: string;
    offline: string;
    connected: string;
    running: string;
    secure: string;
    total: string;
    today: string;
    thisMonth: string;
    thisYear: string;
  };

  // Navigation
  navigation: {
    dashboard: string;
    overview: string;
    systemOverview: string;
    voterManagement: string;
    electionOfficers: string;
    officerManagement: string;
    systemSettings: string;
    securityLogs: string;
    reports: string;
    analytics: string;
    locationTracking: string;
    dataManagement: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    subtitle: string;
    masterAdminTitle: string;
    masterAdminSubtitle: string;
    totalRevenue: string;
    totalVoters: string;
    registeredVoters: string;
    pendingRegistrations: string;
    activeOfficers: string;
    totalRegistrations: string;
    registrationSuccessRate: string;
    systemUptime: string;
    officerActivity: string;
  };

  // Voter Management
  voters: {
    title: string;
    totalVoters: string;
    registeredVoters: string;
    pendingRegistrations: string;
    voterDetails: string;
    voterId: string;
    firstName: string;
    lastName: string;
    address: string;
    phone: string;
    registrationDate: string;
    registeredBy: string;
    amount: string;
    status: string;
    registered: string;
    pending: string;
    constituency: string;
    pollingStation: string;
  };

  // Election Officers
  officers: {
    title: string;
    officerManagement: string;
    totalOfficers: string;
    activeOfficers: string;
    officerId: string;
    firstName: string;
    lastName: string;
    mobile: string;
    username: string;
    password: string;
    status: string;
    lastLocation: string;
    registrationsToday: string;
    totalRegistrations: string;
    location: string;
    pollingStation: string;
    constituency: string;
    addOfficer: string;
    editOfficer: string;
    blockOfficer: string;
    unblockOfficer: string;
  };

  // System
  system: {
    systemHealth: string;
    performanceMetrics: string;
    databaseStatus: string;
    apiServices: string;
    paymentGateway: string;
    securityStatus: string;
    systemAnalytics: string;
    recentActivity: string;
    officerLocations: string;
    systemPerformance: string;
    userStatistics: string;
    registrationTimeline: string;
    noRegistrationsYet: string;
    noTransactionsYet: string;
    recentTransactionActivity: string;
  };

  // Authentication
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    username: string;
    password: string;
    role: string;
    admin: string;
    masterAdmin: string;
    supervisor: string;
    electionOfficer: string;
    loginButton: string;
    invalidCredentials: string;
    selectRole: string;
  };

  // Settings
  settings: {
    title: string;
    language: string;
    theme: string;
    lightMode: string;
    darkMode: string;
    defaultRegistrationAmount: string;
    sessionTimeout: string;
    notifications: string;
    systemConfiguration: string;
  };

  // Time and Date
  time: {
    minutes: string;
    hours: string;
    days: string;
    weeks: string;
    months: string;
    years: string;
    ago: string;
    now: string;
  };

  // Status Messages
  messages: {
    success: string;
    error: string;
    warning: string;
    info: string;
    dataLoaded: string;
    dataSaved: string;
    dataDeleted: string;
    noDataFound: string;
    operationSuccessful: string;
    operationFailed: string;
  };

  // Data Management
  dataManagement: {
    title: string;
    subtitle: string;
    dataExport: string;
    exportUsers: string;
    exportAgents: string;
    exportAllData: string;
    exportTransactions: string;
    searchTransactions: string;
    transactionId: string;
    user: string;
    agent: string;
    amount: string;
    location: string;
    timestamp: string;
    noDataAvailable: string;
  };

  // User Management
  userManagement: {
    title: string;
    userDatabase: string;
    agentDatabase: string;
    searchUsers: string;
    searchOfficers: string;
    totalPayments: string;
  };
}
