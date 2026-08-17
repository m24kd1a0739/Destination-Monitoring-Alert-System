import { Language } from '../types';

export interface TranslationSchema {
  appName: string;
  appSubtitle: string;
  tagline: string;
  
  // Auth & Profile
  welcomeTitle: string;
  welcomeSubtitle: string;
  fullName: string;
  phoneNumber: string;
  enterFullName: string;
  enterPhoneNumber: string;
  continueBtn: string;
  editProfile: string;
  logout: string;
  logoutConfirm: string;
  profileUpdated: string;
  nameRequired: string;
  phoneRequired: string;

  // Onboarding
  onboardingStep1Title: string;
  onboardingStep1Desc: string;
  onboardingStep2Title: string;
  onboardingStep2Desc: string;
  onboardingStep3Title: string;
  onboardingStep3Desc: string;
  onboardingStep4Title: string;
  onboardingStep4Desc: string;
  skip: string;
  next: string;
  getStarted: string;

  // Dashboard
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  readyStatus: string;
  monitoringStatus: string;
  pausedStatus: string;
  reachedStatus: string;
  cancelledStatus: string;
  planJourney: string;
  startMonitoring: string;
  shareJourney: string;
  journeyHistory: string;
  favouriteRoutes: string;
  safetySOS: string;
  settings: string;
  currentJourneyCardTitle: string;
  noActiveJourney: string;

  // Location Permission
  locationPermissionTitle: string;
  locationPermissionDesc: string;
  allowLocationBtn: string;
  locationAccessEnabled: string;
  locationPermissionRequired: string;
  retryPermission: string;
  accuracy: string;

  // Plan Journey
  source: string;
  destination: string;
  useCurrentLocation: string;
  searchSource: string;
  searchDestination: string;
  selectOnMap: string;
  calculatingRoute: string;
  noRouteFound: string;
  selectTravelMode: string;
  travelMode: string;
  fastest: string;
  shortest: string;
  alternative: string;
  distance: string;
  duration: string;
  eta: string;
  startJourneyBtn: string;
  saveFavourite: string;
  transitUnavailableNotice: string;
  roadNetworkEstimated: string;

  // Travel Modes
  modeWalk: string;
  modeBike: string;
  modeCar: string;
  modeBus: string;
  modeTrain: string;

  // Live Journey & Alerts
  liveLocation: string;
  nextStop: string;
  destinationReached: string;
  distanceRemaining: string;
  timeRemaining: string;
  journeyProgress: string;
  stopJourney: string;
  pauseJourney: string;
  resumeJourney: string;
  stopJourneyConfirm: string;
  recalculating: string;

  // Alert Messages
  alert10MinMsg: string;
  alert5MinMsg: string;
  alert2MinMsg: string;
  destinationReachedMsg: string;
  offRouteWarning: string;
  recalculateRouteBtn: string;
  journeyDelayedMsg: string;
  originalEta: string;
  updatedEta: string;
  delayAmount: string;
  shareDelayBtn: string;

  // Nap Mode
  napModeTitle: string;
  napModeActive: string;
  napModeWakeUp: string;
  dismissNapAlert: string;
  napModeDesc: string;

  // Safety & SOS
  sosTitle: string;
  sosConfirmTitle: string;
  sosConfirmDesc: string;
  callPriority1: string;
  sendEmergencyAlert: string;
  emergencyContacts: string;
  addContact: string;
  editContact: string;
  deleteContact: string;
  contactName: string;
  contactPhone: string;
  contactPriority: string;
  noContactsYet: string;
  confirmDeleteContact: string;
  sosSentSuccess: string;

  // Share
  shareLiveJourneyTitle: string;
  shareArrivalTitle: string;
  shareViaWhatsApp: string;
  shareViaWebShare: string;
  copyLink: string;
  linkCopied: string;
  shareArrivalBtn: string;

  // Sharing Text Templates (Function generators)
  shareLiveMessage: (name: string, dest: string, eta: string, mode: string, status: string, mapUrl: string) => string;
  shareArrivalMessage: (name: string, dest: string, time: string) => string;
  shareDelayMessage: (name: string, dest: string, originalEta: string, newEta: string, delayMin: number) => string;
  shareEmergencyMessage: (name: string, lat: number, lng: number, mapUrl: string) => string;

  // History & Favourites
  noJourneysYet: string;
  clearHistory: string;
  clearHistoryConfirm: string;
  noFavouritesYet: string;
  savedRoutes: string;
  routeName: string;
  saveThisRoute: string;

  // Settings
  language: string;
  voiceLanguage: string;
  testVoice: string;
  voiceTesting: string;
  voiceUnavailableNotice: (langName: string) => string;
  vibration: string;
  notifications: string;
  napMode: string;
  darkMode: string;
  alertTiming: string;
  tenMinAlert: string;
  fiveMinAlert: string;
  twoMinAlert: string;
  privacyTitle: string;
  privacyDesc: string;
  clearData: string;

  // Network & System
  online: string;
  offline: string;
  offlineNotice: string;
  gpsUnavailable: string;
  gpsTimeout: string;
  unknownPlace: string;
  meters: string;
  kilometers: string;
  minutes: string;
  hours: string;
  save: string;
  cancel: string;
  close: string;
  delete: string;
  confirm: string;
  back: string;
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    appName: "DESTINATION MONITOR",
    appSubtitle: "Monitoring & Alert System for Bus Passengers",
    tagline: "Never miss your bus stop again with intelligent location tracking & multilingual alarms.",
    
    welcomeTitle: "Welcome Passenger",
    welcomeSubtitle: "Enter your details to begin monitoring your journeys with personalized alerts.",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    enterFullName: "e.g. Rahul Sharma",
    enterPhoneNumber: "e.g. 9876543210",
    continueBtn: "Continue to Dashboard",
    editProfile: "Edit Profile",
    logout: "Logout",
    logoutConfirm: "Are you sure you want to log out from this device?",
    profileUpdated: "Profile updated successfully.",
    nameRequired: "Please enter your full name.",
    phoneRequired: "Please enter a valid phone number.",

    onboardingStep1Title: "1. Select Your Destination",
    onboardingStep1Desc: "Pick your source and destination or search for specific bus stops, stations, and landmarks.",
    onboardingStep2Title: "2. Real-Time Tracking",
    onboardingStep2Desc: "Our GPS engine continuously calculates live distance, dynamic ETA, and upcoming stops.",
    onboardingStep3Title: "3. Wake-Up & Distance Alerts",
    onboardingStep3Desc: "Receive 5-minute and 2-minute voice alarms, notifications, and vibration before your stop.",
    onboardingStep4Title: "4. Live Journey Sharing",
    onboardingStep4Desc: "Share your live tracking link or automatic arrival message with family on WhatsApp in your native language.",
    skip: "Skip",
    next: "Next",
    getStarted: "Get Started",

    greetingMorning: "Good Morning",
    greetingAfternoon: "Good Afternoon",
    greetingEvening: "Good Evening",
    readyStatus: "READY",
    monitoringStatus: "LIVE MONITORING",
    pausedStatus: "PAUSED",
    reachedStatus: "DESTINATION REACHED",
    cancelledStatus: "CANCELLED",
    planJourney: "Plan Journey",
    startMonitoring: "Start Journey",
    shareJourney: "Share Journey",
    journeyHistory: "Journey History",
    favouriteRoutes: "Favourite Routes",
    safetySOS: "Safety / SOS",
    settings: "Settings",
    currentJourneyCardTitle: "Active Journey Monitoring",
    noActiveJourney: "No active journey. Plan your route to start destination monitoring.",

    locationPermissionTitle: "Location Permission Required",
    locationPermissionDesc: "High-accuracy live GPS is required to monitor your bus journey and trigger audio wake-up alerts before your stop.",
    allowLocationBtn: "ALLOW LOCATION",
    locationAccessEnabled: "Location Access Enabled",
    locationPermissionRequired: "Location permission is required for live journey monitoring.",
    retryPermission: "Check / Retry Location Permission",
    accuracy: "GPS Accuracy",

    source: "SOURCE / START POINT",
    destination: "DESTINATION / BUS STOP",
    useCurrentLocation: "Use Current GPS Location",
    searchSource: "Search start location or bus stop...",
    searchDestination: "Search destination bus stop or landmark...",
    selectOnMap: "Select on Map",
    calculatingRoute: "Calculating real route & live ETA...",
    noRouteFound: "No navigable route found between these locations.",
    selectTravelMode: "Select Travel Mode",
    travelMode: "Travel Mode",
    fastest: "Fastest Route",
    shortest: "Shortest Route",
    alternative: "Alternative Route",
    distance: "Distance",
    duration: "Est. Duration",
    eta: "Estimated Arrival (ETA)",
    startJourneyBtn: "START LIVE JOURNEY",
    saveFavourite: "Save to Favourites",
    transitUnavailableNotice: "Direct scheduled bus/train timetables are unavailable via public routing. Road network routing is applied.",
    roadNetworkEstimated: "Road network transit calculated.",

    modeWalk: "WALK",
    modeBike: "BIKE",
    modeCar: "CAR",
    modeBus: "BUS",
    modeTrain: "TRAIN",

    liveLocation: "LIVE LOCATION",
    nextStop: "NEXT STOP / LANDMARK",
    destinationReached: "DESTINATION REACHED",
    distanceRemaining: "DISTANCE REMAINING",
    timeRemaining: "TIME REMAINING",
    journeyProgress: "JOURNEY PROGRESS",
    stopJourney: "STOP JOURNEY",
    pauseJourney: "Pause Tracking",
    resumeJourney: "Resume Tracking",
    stopJourneyConfirm: "Are you sure you want to stop monitoring this journey?",
    recalculating: "Recalculating route from current position...",

    alert10MinMsg: "Your destination is about 10 minutes away. Please prepare to disembark.",
    alert5MinMsg: "Your destination is about 5 minutes away. Please get ready.",
    alert2MinMsg: "Attention! Your destination is approximately 2 minutes away. Move towards the exit now.",
    destinationReachedMsg: "You have arrived at your destination! Have a safe journey.",
    offRouteWarning: "Warning: You appear to be moving away from the planned route.",
    recalculateRouteBtn: "Recalculate Route",
    journeyDelayedMsg: "Journey Delayed due to traffic or route variation.",
    originalEta: "Original ETA",
    updatedEta: "Updated ETA",
    delayAmount: "Delay",
    shareDelayBtn: "Share Delay Update",

    napModeTitle: "Nap Mode Active",
    napModeActive: "Nap Mode is ON",
    napModeWakeUp: "WAKE UP! YOUR BUS STOP IS APPROACHING!",
    dismissNapAlert: "I Am Awake / Dismiss Alarm",
    napModeDesc: "Intense high-visibility alarm and repeated voice prompts to wake you up before your destination.",

    sosTitle: "Emergency Safety Circle",
    sosConfirmTitle: "Trigger Emergency SOS?",
    sosConfirmDesc: "This will initiate a direct phone call to your Priority 1 emergency contact and prepare a live GPS SOS location message.",
    callPriority1: "Call Primary Contact",
    sendEmergencyAlert: "Send Emergency SMS / WhatsApp",
    emergencyContacts: "Emergency Contacts",
    addContact: "Add Emergency Contact",
    editContact: "Edit Contact",
    deleteContact: "Delete Contact",
    contactName: "Contact Full Name",
    contactPhone: "Mobile Number",
    contactPriority: "Priority (1 = Primary, 2 = Secondary, 3 = Backup)",
    noContactsYet: "No emergency contacts configured yet. Add at least 3 trusted family members or friends.",
    confirmDeleteContact: "Are you sure you want to remove this contact?",
    sosSentSuccess: "Emergency SOS dispatch prepared.",

    shareLiveJourneyTitle: "Share Live Journey",
    shareArrivalTitle: "Share Safe Arrival",
    shareViaWhatsApp: "Share on WhatsApp",
    shareViaWebShare: "Share via Apps",
    copyLink: "Copy Journey Link",
    linkCopied: "Tracking link copied to clipboard!",
    shareArrivalBtn: "SHARE ARRIVAL ON WHATSAPP",

    shareLiveMessage: (name, dest, eta, mode, status, mapUrl) => 
      `🚍 *DESTINATION MONITOR - LIVE JOURNEY*\n\n` +
      `Passenger: *${name}*\n` +
      `Heading to: *${dest}*\n` +
      `Travel Mode: *${mode.toUpperCase()}*\n` +
      `Estimated Arrival: *${eta}*\n` +
      `Status: *${status}*\n\n` +
      `📍 Live Location & Map:\n${mapUrl}`,

    shareArrivalMessage: (name, dest, time) =>
      `✅ *SAFE ARRIVAL NOTIFICATION*\n\n` +
      `Passenger *${name}* has safely reached *${dest}* at *${time}*.\n\n` +
      `Sent via Destination Monitor System.`,

    shareDelayMessage: (name, dest, originalEta, newEta, delayMin) =>
      `⚠️ *JOURNEY DELAY UPDATE*\n\n` +
      `Passenger: *${name}*\n` +
      `Heading to: *${dest}*\n` +
      `Expected Arrival: *${newEta}* (Delayed by ~${delayMin} mins)\n` +
      `Original ETA was: *${originalEta}*`,

    shareEmergencyMessage: (name, lat, lng, mapUrl) =>
      `🚨 *EMERGENCY SOS ALERT!*\n\n` +
      `Passenger *${name}* triggered an emergency alert during their transit.\n` +
      `Current GPS Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n\n` +
      `📍 Direct Emergency Location Map:\n${mapUrl}`,

    noJourneysYet: "No journeys recorded yet. Start a journey to maintain your travel log.",
    clearHistory: "Clear All History",
    clearHistoryConfirm: "Are you sure you want to delete all past journey records?",
    noFavouritesYet: "No favourite routes saved yet. Save frequent commutes for one-tap planning.",
    savedRoutes: "Saved Routes",
    routeName: "Route Nickname (e.g. Daily Office Commute)",
    saveThisRoute: "Save as Favourite Route",

    language: "App Display Language",
    voiceLanguage: "Voice Alert Language",
    testVoice: "TEST VOICE ANNOUNCEMENT",
    voiceTesting: "Speaking announcement test...",
    voiceUnavailableNotice: (lang) => `${lang} speech voice is not installed on this device/browser. Synthetic alert chimes will sound.`,
    vibration: "Device Vibration Alerts",
    notifications: "Browser Web Notifications",
    napMode: "Nap Mode (Enhanced Wake-Up Alarm)",
    darkMode: "Dark Theme",
    alertTiming: "Alert Timings",
    tenMinAlert: "10-Minute Advance Alert",
    fiveMinAlert: "5-Minute Advance Alert (Recommended)",
    twoMinAlert: "2-Minute Urgent Alert (Recommended)",
    privacyTitle: "Location & Data Privacy",
    privacyDesc: "Your GPS coordinates are processed exclusively on your device during an active journey. No trip or personal data is transmitted to external servers.",
    clearData: "Reset All Local Data",

    online: "ONLINE",
    offline: "OFFLINE (Using Cached Route Data)",
    offlineNotice: "Internet disconnected. Live GPS tracking continues using cached route information.",
    gpsUnavailable: "GPS service is currently unavailable on your device.",
    gpsTimeout: "GPS request timed out. Please verify location settings.",
    unknownPlace: "Current Location",
    meters: "m",
    kilometers: "km",
    minutes: "mins",
    hours: "hrs",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back"
  },

  te: {
    appName: "గమ్యస్థాన పర్యవేక్షణ",
    appSubtitle: "బస్సు ప్రయాణికుల గమ్యస్థాన పర్యవేక్షణ & హెచ్చరిక వ్యవస్థ",
    tagline: "నిద్రపోయినా, శబ్దాలు ఉన్నా మీ బస్సు స్టాప్ మిస్ అవ్వకుండా ముందస్తు వాయిస్ హెచ్చరికలు పొందండి.",
    
    welcomeTitle: "స్వాగతం ప్రయాణికురా/ప్రయాణికుడా",
    welcomeSubtitle: "మీ బస్సు ప్రయాణాన్ని పర్యవేక్షించడానికి మరియు ముందస్తు అలారాలు పొందడానికి మీ వివరాలు నమోదు చేయండి.",
    fullName: "పూర్తి పేరు",
    phoneNumber: "ఫోన్ నంబర్",
    enterFullName: "ఉదా: రమేష్ రావు",
    enterPhoneNumber: "ఉదా: 9876543210",
    continueBtn: "డాష్‌బోర్డ్‌కు వెళ్లండి",
    editProfile: "ప్రొఫైల్ సవరించు",
    logout: "లాగ్ అవుట్",
    logoutConfirm: "మీరు ఖచ్చితంగా లాగ్ అవుట్ చేయాలనుకుంటున్నారా?",
    profileUpdated: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది.",
    nameRequired: "దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.",
    phoneRequired: "దయచేసి సరైన ఫోన్ నంబర్ నమోదు చేయండి.",

    onboardingStep1Title: "1. మీ గమ్యాన్ని ఎంచుకోండి",
    onboardingStep1Desc: "మీ ప్రారంభ స్థలం మరియు చేరుకోవాల్సిన బస్సు స్టాప్ లేదా ల్యాండ్‌మార్క్‌ను ఎంచుకోండి.",
    onboardingStep2Title: "2. ప్రత్యక్ష GPS ట్రాకింగ్",
    onboardingStep2Desc: "మా సిస్టమ్ నిరంతరం మీ మిగిలిన దూరం, సమయం మరియు రాబోయే స్టాప్‌లను లెక్కిస్తుంది.",
    onboardingStep3Title: "3. వాయిస్ & వైబ్రేషన్ అలారాలు",
    onboardingStep3Desc: "మీ గమ్యం చేరే 5 నిమిషాలు మరియు 2 నిమిషాల ముందే తెలుగులో వాయిస్ మరియు వైబ్రేషన్ హెచ్చరికలు అందుతాయి.",
    onboardingStep4Title: "4. ప్రయాణాన్ని షేర్ చేయండి",
    onboardingStep4Desc: "మీ ప్రత్యక్ష లొకేషన్ మరియు సురక్షితంగా చేరుకున్న సమాచారాన్ని కుటుంబ సభ్యులకు వాట్సాప్‌లో పంపండి.",
    skip: "దాటవేయి",
    next: "తరువాత",
    getStarted: "ప్రారంభించండి",

    greetingMorning: "శుభోదయం",
    greetingAfternoon: "శుభ మధ్యాహ్నం",
    greetingEvening: "శుభ సాయంత్రం",
    readyStatus: "సిద్ధంగా ఉంది",
    monitoringStatus: "ప్రత్యక్ష పర్యవేక్షణ",
    pausedStatus: "తాత్కాలికంగా ఆపబడింది",
    reachedStatus: "గమ్యస్థానం చేరుకుంది",
    cancelledStatus: "రద్దు చేయబడింది",
    planJourney: "ప్రయాణాన్ని ప్లాన్ చేయండి",
    startMonitoring: "ప్రయాణం ప్రారంభించండి",
    shareJourney: "ప్రయాణాన్ని షేర్ చేయండి",
    journeyHistory: "ప్రయాణ చరిత్ర",
    favouriteRoutes: "ఇష్టమైన రూట్లు",
    safetySOS: "రక్షణ / SOS",
    settings: "సెట్టింగులు",
    currentJourneyCardTitle: "ప్రస్తుత ప్రయాణ పర్యవేక్షణ",
    noActiveJourney: "ప్రస్తుతం ఏ ప్రయాణం లేదు. కొత్త రూట్ ప్లాన్ చేసుకోండి.",

    locationPermissionTitle: "లొకేషన్ అనుమతి అవసరం",
    locationPermissionDesc: "బస్సు ప్రయాణాన్ని ట్రాక్ చేయడానికి మరియు సమయానికి వాయిస్ అలారాలు మోగించడానికి లొకేషన్ అనుమతి తప్పనిసరి.",
    allowLocationBtn: "లొకేషన్ అనుమతించండి",
    locationAccessEnabled: "లొకేషన్ యాక్సెస్ ప్రారంభించబడింది",
    locationPermissionRequired: "ప్రత్యక్ష పర్యవేక్షణ కోసం లొకేషన్ అనుమతి అవసరం.",
    retryPermission: "లొకేషన్ అనుమతిని మళ్లీ తనిఖీ చేయండి",
    accuracy: "GPS ఖచ్చితత్వం",

    source: "ప్రారంభ స్థలం",
    destination: "గమ్యస్థానం / బస్సు స్టాప్",
    useCurrentLocation: "ప్రస్తుత GPS లొకేషన్ ఉపయోగించండి",
    searchSource: "ప్రారంభ స్థలాన్ని వెతకండి...",
    searchDestination: "గమ్యస్థానం బస్సు స్టాప్‌ను వెతకండి...",
    selectOnMap: "మ్యాప్‌లో ఎంచుకోండి",
    calculatingRoute: "రూట్ మరియు రాక సమయం లెక్కిస్తోంది...",
    noRouteFound: "ఈ మార్గంలో అనుకూలమైన రూట్ లభించలేదు.",
    selectTravelMode: "ప్రయాణ విధానం ఎంచుకోండి",
    travelMode: "ప్రయాణ విధానం",
    fastest: "వేగవంతమైన మార్గం",
    shortest: "తక్కువ దూర మార్గం",
    alternative: "ప్రత్యామ్నాయ మార్గం",
    distance: "మొత్తం దూరం",
    duration: "అంచనా సమయం",
    eta: "చేరుకునే సమయం (ETA)",
    startJourneyBtn: "ప్రయాణాన్ని ప్రారంభించండి",
    saveFavourite: "ఇష్టమైన రూట్లలో దాచండి",
    transitUnavailableNotice: "ప్రస్తుత రూటింగ్ ప్రొవైడర్‌లో పబ్లిక్ బస్సు సమయపట్టికలు అందుబాటులో లేవు. రోడ్డు మార్గ అంచనా లెక్కించబడింది.",
    roadNetworkEstimated: "రోడ్డు నెట్‌వర్క్ ప్రయాణం లెక్కించబడింది.",

    modeWalk: "నడక",
    modeBike: "బైక్",
    modeCar: "కార్",
    modeBus: "బస్సు",
    modeTrain: "రైలు",

    liveLocation: "ప్రస్తుత లొకేషన్",
    nextStop: "తదుపరి స్టాప్",
    destinationReached: "గమ్యస్థానం చేరుకుంది",
    distanceRemaining: "మిగిలిన దూరం",
    timeRemaining: "మిగిలిన సమయం",
    journeyProgress: "ప్రయాణ పురోగతి",
    stopJourney: "ప్రయాణాన్ని ఆపండి",
    pauseJourney: "తాత్కాలికంగా ఆపండి",
    resumeJourney: "మళ్లీ కొనసాగించండి",
    stopJourneyConfirm: "మీరు ఖచ్చితంగా ప్రయాణ పర్యవేక్షణను ఆపాలనుకుంటున్నారా?",
    recalculating: "ప్రస్తుత స్థానం నుండి రూట్ మళ్లీ లెక్కిస్తోంది...",

    alert10MinMsg: "మీ గమ్యస్థానం ఇంకా 10 నిమిషాల్లో వస్తుంది. దిగడానికి సిద్ధంగా ఉండండి.",
    alert5MinMsg: "మీ గమ్యస్థానం సుమారు 5 నిమిషాల్లో రాబోతోంది. దయచేసి సిద్ధం కండి.",
    alert2MinMsg: "హెచ్చరిక! మీ గమ్యస్థానం సుమారు 2 నిమిషాల్లో రాబోతోంది. తలుపు వద్దకు వెళ్లండి.",
    destinationReachedMsg: "మీరు మీ గమ్యస్థానానికి చేరుకున్నారు! మీ ప్రయాణం సురక్షితంగా ముగిసింది.",
    offRouteWarning: "హెచ్చరిక: మీరు నిర్ణయించిన మార్గం నుండి వేరే వైపు వెళ్తున్నారు.",
    recalculateRouteBtn: "రూట్‌ను సరిచేయండి",
    journeyDelayedMsg: "ట్రాఫిక్ వల్ల ప్రయాణం ఆలస్యం అవుతోంది.",
    originalEta: "మునుపటి సమయం",
    updatedEta: "కొత్త అంచనా సమయం",
    delayAmount: "ఆలస్యం",
    shareDelayBtn: "ఆలస్య సమాచారం షేర్ చేయండి",

    napModeTitle: "కునుకు మోడ్ (Nap Mode)",
    napModeActive: "కునుకు మోడ్ ఆన్‌లో ఉంది",
    napModeWakeUp: "మేల్కొనండి! మీ బస్సు స్టాప్ రాబోతోంది!",
    dismissNapAlert: "నేను మేల్కొన్నాను / అలారం ఆపండి",
    napModeDesc: "మీరు బస్సులో నిద్రపోయినా ఖచ్చితంగా మేల్కొల్పడానికి అధిక శబ్దంతో కూడిన అలారాలు.",

    sosTitle: "అత్యవసర రక్షణ వలయం",
    sosConfirmTitle: "అత్యవసర SOS పంపాలా?",
    sosConfirmDesc: "ఇది మీ ప్రాధాన్యత 1 నంబర్‌కు నేరుగా కాల్ చేస్తుంది మరియు ప్రస్తుత లొకేషన్‌తో అత్యవసర సందేశం సిద్ధం చేస్తుంది.",
    callPriority1: "ముఖ్య సంప్రదింపుదారునికి కాల్ చేయండి",
    sendEmergencyAlert: "అత్యవసర SMS / WhatsApp పంపండి",
    emergencyContacts: "అత్యవసర సంప్రదింపు నంబర్లు",
    addContact: "నంబర్‌ను జోడించండి",
    editContact: "నంబర్‌ను సవరించండి",
    deleteContact: "నంబర్‌ను తొలగించండి",
    contactName: "వ్యక్తి పేరు",
    contactPhone: "మొబైల్ నంబర్",
    contactPriority: "ప్రాధాన్యత (1, 2, 3)",
    noContactsYet: "ఇంకా ఎటువంటి అత్యవసర నంబర్లు జోడించలేదు. కనీసం 3 నంబర్లు నమోదు చేయండి.",
    confirmDeleteContact: "మీరు ఖచ్చితంగా ఈ నంబర్‌ను తొలగించాలనుకుంటున్నారా?",
    sosSentSuccess: "అత్యవసర సందేశం సిద్ధం చేయబడింది.",

    shareLiveJourneyTitle: "లైవ్ ప్రయాణాన్ని షేర్ చేయండి",
    shareArrivalTitle: "గమ్యం చేరిన సమాచారం షేర్ చేయండి",
    shareViaWhatsApp: "వాట్సాప్‌లో షేర్ చేయండి",
    shareViaWebShare: "ఇతర యాప్స్‌లో షేర్ చేయండి",
    copyLink: "లింక్ కాపీ చేయండి",
    linkCopied: "లింక్ కాపీ చేయబడింది!",
    shareArrivalBtn: "వాట్సాప్‌లో గమ్యం చేరినట్లు చెప్పండి",

    shareLiveMessage: (name, dest, eta, mode, status, mapUrl) =>
      `🚍 *గమ్యస్థాన పర్యవేక్షణ - లైవ్ ప్రయాణం*\n\n` +
      `ప్రయాణికుడు: *${name}*\n` +
      `వెళ్తున్న ప్రదేశం: *${dest}*\n` +
      `ప్రయాణ విధానం: *${mode.toUpperCase()}*\n` +
      `చేరుకునే సమయం: *${eta}*\n` +
      `స్థితి: *${status}*\n\n` +
      `📍 లైవ్ లొకేషన్ & మ్యాప్:\n${mapUrl}`,

    shareArrivalMessage: (name, dest, time) =>
      `✅ *సురక్షితంగా చేరుకున్న సమాచారం*\n\n` +
      `ప్రయాణికుడు *${name}* సురక్షితంగా *${dest}* వద్దకు *${time}* గంటలకు చేరుకున్నారు.\n\n` +
      `గమ్యస్థాన పర్యవేక్షణ వ్యవస్థ ద్వారా పంపబడింది.`,

    shareDelayMessage: (name, dest, originalEta, newEta, delayMin) =>
      `⚠️ *ప్రయాణ ఆలస్య సమాచారం*\n\n` +
      `ప్రయాణికుడు: *${name}*\n` +
      `గమ్యస్థానం: *${dest}*\n` +
      `చేరుకునే అంచనా సమయం: *${newEta}* (~${delayMin} నిమిషాలు ఆలస్యం)\n` +
      `మునుపటి సమయం: *${originalEta}*`,

    shareEmergencyMessage: (name, lat, lng, mapUrl) =>
      `🚨 *అత్యవసర SOS అలర్ట్!*\n\n` +
      `ప్రయాణికుడు *${name}* ప్రయాణంలో అత్యవసర అలర్ట్‌ను పంపారు.\n` +
      `ప్రస్తుత GPS లొకేషన్: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n\n` +
      `📍 అత్యవసర లొకేషన్ మ్యాప్:\n${mapUrl}`,

    noJourneysYet: "ఇంకా ఎటువంటి ప్రయాణాలు నమోదు కాలేదు.",
    clearHistory: "చరిత్రను తొలగించండి",
    clearHistoryConfirm: "మీరు ఖచ్చితంగా మీ ప్రయాణాల చరిత్రను తొలగించాలనుకుంటున్నారా?",
    noFavouritesYet: "ఇష్టమైన రూట్లు ఏవీ లేవు.",
    savedRoutes: "దాచిన రూట్లు",
    routeName: "రూట్ పేరు (ఉదా: ఆఫీస్ బస్సు మార్గం)",
    saveThisRoute: "ఇష్టమైన రూట్‌గా సేవ్ చేయండి",

    language: "యాప్ భాష",
    voiceLanguage: "వాయిస్ అలర్ట్ భాష",
    testVoice: "వాయిస్ అలర్ట్ పరీక్షించండి",
    voiceTesting: "వాయిస్ అలర్ట్ మాట్లాడుతోంది...",
    voiceUnavailableNotice: (lang) => `ఈ డివైజ్/బ్రౌజర్‌లో ${lang} వాయిస్ అందుబాటులో లేదు. సింథటిక్ అలారం సౌండ్ వస్తుంది.`,
    vibration: "డివైజ్ వైబ్రేషన్ అలారాలు",
    notifications: "బ్రౌజర్ నోటిఫికేషన్లు",
    napMode: "కునుకు మోడ్ (Nap Mode)",
    darkMode: "డార్క్ థీమ్",
    alertTiming: "అలర్ట్ సమయాలు",
    tenMinAlert: "10 నిమిషాల ముందస్తు అలర్ట్",
    fiveMinAlert: "5 నిమిషాల ముందస్తు అలర్ట్ (సిఫార్సు చేయబడింది)",
    twoMinAlert: "2 నిమిషాల అత్యవసర అలర్ట్ (సిఫార్సు చేయబడింది)",
    privacyTitle: "లొకేషన్ మరియు డేటా గోప్యత",
    privacyDesc: "మీ GPS వివరాలు ప్రయాణ సమయంలో మాత్రమే మీ డివైజ్‌లో ప్రాసెస్ చేయబడతాయి. బయటి సర్వర్లకు పంపబడవు.",
    clearData: "మొత్తం డేటా క్లియర్ చేయండి",

    online: "ఆన్‌లైన్",
    offline: "ఆఫ్‌లైన్ (సేవ్ చేసిన డేటా వాడుతోంది)",
    offlineNotice: "ఇంటర్నెట్ కనెక్షన్ లేదు. సేవ్ చేసిన సమాచారంతో GPS పనిచేస్తుంది.",
    gpsUnavailable: "GPS సేవలు అందుబాటులో లేవు.",
    gpsTimeout: "GPS సమయం మించిపోయింది.",
    unknownPlace: "ప్రస్తుత లొకేషన్",
    meters: "మీటర్లు",
    kilometers: "కి.మీ",
    minutes: "నిమిషాలు",
    hours: "గంటలు",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు",
    close: "మూసివేయి",
    delete: "తొలగించు",
    confirm: "నిర్ధారించండి",
    back: "వెనుకకు"
  },

  hi: {
    appName: "डेस्टिनेशन मॉनिटर",
    appSubtitle: "बस यात्रियों के लिए गंतव्य निगरानी एवं अलर्ट प्रणाली",
    tagline: "नींद में हों या शोरगुल में, अपनी बस स्टॉप कभी न चूकें। समय पर वॉइस अलर्ट पाएं।",
    
    welcomeTitle: "नमस्ते यात्री",
    welcomeSubtitle: "अपनी बस यात्रा की निगरानी और समय पर अलर्ट पाने के लिए अपना विवरण दर्ज करें।",
    fullName: "पूरा नाम",
    phoneNumber: "फ़ोन नंबर",
    enterFullName: "उदा. राहुल शर्मा",
    enterPhoneNumber: "उदा. 9876543210",
    continueBtn: "डैशबोर्ड पर जाएं",
    editProfile: "प्रोफ़ाइल संपादित करें",
    logout: "लॉग आउट",
    logoutConfirm: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।",
    nameRequired: "कृपया अपना पूरा नाम दर्ज करें।",
    phoneRequired: "कृपया वैध फ़ोन नंबर दर्ज करें।",

    onboardingStep1Title: "1. अपना गंतव्य चुनें",
    onboardingStep1Desc: "अपना शुरुआती स्थान और गंतव्य बस स्टॉप या लैंडमार्क खोजें।",
    onboardingStep2Title: "2. लाइव GPS ट्रैकिंग",
    onboardingStep2Desc: "हमारा सिस्टम आपकी दूरी, आगमन समय और आने वाले स्टॉप की लगातार गणना करता है।",
    onboardingStep3Title: "3. वॉइस और वाइब्रेशन अलर्ट",
    onboardingStep3Desc: "गंतव्य से 5 मिनट और 2 मिनट पहले अपनी भाषा में वॉइस घोषणा और वाइब्रेशन प्राप्त करें।",
    onboardingStep4Title: "4. यात्रा साझा करें",
    onboardingStep4Desc: "अपनी लाइव लोकेशन और सुरक्षित आगमन की सूचना व्हाट्सएप पर परिवार के साथ साझा करें।",
    skip: "छोड़ें",
    next: "आगे बढ़ें",
    getStarted: "शुरू करें",

    greetingMorning: "शुभ प्रभात",
    greetingAfternoon: "शुभ दोपहर",
    greetingEvening: "शुभ संध्या",
    readyStatus: "तैयार",
    monitoringStatus: "लाइव निगरानी",
    pausedStatus: "रुका हुआ",
    reachedStatus: "गंतव्य पर पहुंचे",
    cancelledStatus: "रद्द किया गया",
    planJourney: "यात्रा की योजना बनाएं",
    startMonitoring: "यात्रा शुरू करें",
    shareJourney: "यात्रा साझा करें",
    journeyHistory: "यात्रा का इतिहास",
    favouriteRoutes: "पसंदीदा मार्ग",
    safetySOS: "सुरक्षा / SOS",
    settings: "सेटिंग्स",
    currentJourneyCardTitle: "सक्रिय यात्रा निगरानी",
    noActiveJourney: "कोई सक्रिय यात्रा नहीं है। निगरानी शुरू करने के लिए यात्रा प्लान करें।",

    locationPermissionTitle: "लोकेशन अनुमति आवश्यक है",
    locationPermissionDesc: "बस यात्रा की सटीक निगरानी और स्टॉप से पहले वॉइस अलार्म के लिए GPS अनुमति आवश्यक है।",
    allowLocationBtn: "लोकेशन की अनुमति दें",
    locationAccessEnabled: "लोकेशन एक्सेस सक्षम है",
    locationPermissionRequired: "लाइव निगरानी के लिए लोकेशन अनुमति अनिवार्य है।",
    retryPermission: "लोकेशन अनुमति पुनः जांचें",
    accuracy: "GPS सटीकता",

    source: "प्रारंभिक स्थान",
    destination: "गंतव्य / बस स्टॉप",
    useCurrentLocation: "वर्तमान GPS लोकेशन का उपयोग करें",
    searchSource: "प्रारंभिक स्थान या स्टॉप खोजें...",
    searchDestination: "गंतव्य बस स्टॉप या लैंडमार्क खोजें...",
    selectOnMap: "मानचित्र पर चुनें",
    calculatingRoute: "मार्ग और समय की गणना की जा रही है...",
    noRouteFound: "इन स्थानों के बीच कोई उपयुक्त मार्ग नहीं मिला।",
    selectTravelMode: "यात्रा साधन चुनें",
    travelMode: "यात्रा साधन",
    fastest: "सबसे तेज़ मार्ग",
    shortest: "सबसे छोटा मार्ग",
    alternative: "वैकल्पिक मार्ग",
    distance: "दूरी",
    duration: "अनुमानित समय",
    eta: "पहुंचने का समय (ETA)",
    startJourneyBtn: "लाइव यात्रा शुरू करें",
    saveFavourite: "पसंदीदा में सहेजें",
    transitUnavailableNotice: "सार्वजनिक बस समय-सारणी सीधे उपलब्ध नहीं है। सड़क मार्ग से अनुमान लगाया गया है।",
    roadNetworkEstimated: "सड़क नेटवर्क अनुमान लागू।",

    modeWalk: "पैदल",
    modeBike: "बाइक",
    modeCar: "कार",
    modeBus: "बस",
    modeTrain: "ट्रेन",

    liveLocation: "लाइव लोकेशन",
    nextStop: "अगला स्टॉप / लैंडमार्क",
    destinationReached: "गंतव्य पर पहुंचे",
    distanceRemaining: "शेष दूरी",
    timeRemaining: "शेष समय",
    journeyProgress: "यात्रा प्रगति",
    stopJourney: "यात्रा समाप्त करें",
    pauseJourney: "रोकें",
    resumeJourney: "पुनः शुरू करें",
    stopJourneyConfirm: "क्या आप वाकई यात्रा निगरानी रोकना चाहते हैं?",
    recalculating: "वर्तमान स्थिति से नया मार्ग खोजा जा रहा है...",

    alert10MinMsg: "आपका गंतव्य लगभग 10 मिनट दूर है। कृपया उतरने के लिए तैयार रहें।",
    alert5MinMsg: "आपका गंतव्य लगभग 5 मिनट दूर है। कृपया तैयार हो जाएं।",
    alert2MinMsg: "ध्यान दें! आपका गंतव्य लगभग 2 मिनट दूर है। कृपया दरवाजे की ओर बढ़ें।",
    destinationReachedMsg: "आप अपने गंतव्य पर पहुंच गए हैं! आपकी यात्रा सुखद रही।",
    offRouteWarning: "चेतावनी: आप निर्धारित मार्ग से अलग जा रहे हैं।",
    recalculateRouteBtn: "मार्ग पुनः निर्धारित करें",
    journeyDelayedMsg: "यातायात के कारण यात्रा में देरी हो रही है।",
    originalEta: "मूल समय",
    updatedEta: "संशोधित समय",
    delayAmount: "देरी",
    shareDelayBtn: "देरी की सूचना साझा करें",

    napModeTitle: "नेप मोड (Nap Mode)",
    napModeActive: "नेप मोड चालू है",
    napModeWakeUp: "जागिए! आपका बस स्टॉप आने वाला है!",
    dismissNapAlert: "मैं जाग गया हूँ / अलार्म बंद करें",
    napModeDesc: "यदि आप बस में सो जाएं, तो तेज अलार्म और निरंतर वॉइस अलर्ट आपको जगाएंगे।",

    sosTitle: "आपातकालीन सुरक्षा चक्र",
    sosConfirmTitle: "आपातकालीन SOS भेजें?",
    sosConfirmDesc: "यह आपके प्राथमिक संपर्क को तुरंत कॉल करेगा और लाइव GPS लोकेशन के साथ आपातकालीन संदेश तैयार करेगा।",
    callPriority1: "प्राथमिक संपर्क को कॉल करें",
    sendEmergencyAlert: "आपातकालीन SMS / WhatsApp भेजें",
    emergencyContacts: "आपातकालीन संपर्क",
    addContact: "संपर्क जोड़ें",
    editContact: "संपादित करें",
    deleteContact: "हटाएं",
    contactName: "संपर्क का नाम",
    contactPhone: "मोबाइल नंबर",
    contactPriority: "प्राथमिकता (1, 2, 3)",
    noContactsYet: "कोई आपातकालीन संपर्क नहीं जुड़ा है। कम से कम 3 नंबर जोड़ें।",
    confirmDeleteContact: "क्या आप वाकई इस संपर्क को हटाना चाहते हैं?",
    sosSentSuccess: "आपातकालीन SOS संदेश तैयार है।",

    shareLiveJourneyTitle: "लाइव यात्रा साझा करें",
    shareArrivalTitle: "सुरक्षित आगमन साझा करें",
    shareViaWhatsApp: "व्हाट्सएप पर साझा करें",
    shareViaWebShare: "अन्य ऐप्स पर साझा करें",
    copyLink: "लिंक कॉपी करें",
    linkCopied: "लिंक कॉपी हो गया!",
    shareArrivalBtn: "व्हाट्सएप पर आगमन साझा करें",

    shareLiveMessage: (name, dest, eta, mode, status, mapUrl) =>
      `🚍 *डेस्टिनेशन मॉनिटर - लाइव यात्रा*\n\n` +
      `यात्री: *${name}*\n` +
      `गंतव्य: *${dest}*\n` +
      `साधन: *${mode.toUpperCase()}*\n` +
      `पहुंचने का समय: *${eta}*\n` +
      `स्थिति: *${status}*\n\n` +
      `📍 लाइव लोकेशन और मैप:\n${mapUrl}`,

    shareArrivalMessage: (name, dest, time) =>
      `✅ *सुरक्षित आगमन सूचना*\n\n` +
      `यात्री *${name}* सुरक्षित रूप से *${dest}* पर *${time}* बजे पहुंच गए हैं।\n\n` +
      `डेस्टिनेशन मॉनिटर सिस्टम द्वारा भेजा गया।`,

    shareDelayMessage: (name, dest, originalEta, newEta, delayMin) =>
      `⚠️ *यात्रा में देरी की सूचना*\n\n` +
      `यात्री: *${name}*\n` +
      `गंतव्य: *${dest}*\n` +
      `नया अनुमानित समय: *${newEta}* (~${delayMin} मिनट देरी)\n` +
      `मूल समय था: *${originalEta}*`,

    shareEmergencyMessage: (name, lat, lng, mapUrl) =>
      `🚨 *आपातकालीन SOS अलर्ट!*\n\n` +
      `यात्री *${name}* ने यात्रा के दौरान आपातकालीन अलर्ट भेजा है।\n` +
      `वर्तमान GPS स्थिति: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n\n` +
      `📍 आपातकालीन लोकेशन मैप:\n${mapUrl}`,

    noJourneysYet: "अभी तक कोई यात्रा दर्ज नहीं हुई है।",
    clearHistory: "इतिहास साफ़ करें",
    clearHistoryConfirm: "क्या आप सभी यात्रा इतिहास हटाना चाहते हैं?",
    noFavouritesYet: "कोई पसंदीदा मार्ग सहेजा नहीं गया है।",
    savedRoutes: "सहेजे गए मार्ग",
    routeName: "मार्ग का नाम (उदा. दैनिक ऑफिस यात्रा)",
    saveThisRoute: "पसंदीदा में सहेजें",

    language: "ऐप की भाषा",
    voiceLanguage: "वॉइस अलर्ट की भाषा",
    testVoice: "वॉइस अलर्ट का परीक्षण करें",
    voiceTesting: "वॉइस का परीक्षण हो रहा है...",
    voiceUnavailableNotice: (lang) => `इस डिवाइस पर ${lang} वॉइस उपलब्ध नहीं है। सिंथेटिक टोन बजाई जाएगी।`,
    vibration: "वाइब्रेशन अलर्ट",
    notifications: "वेब सूचनाएं",
    napMode: "नेप मोड (उन्नत वेक-अप)",
    darkMode: "डार्क मोड",
    alertTiming: "अलर्ट का समय",
    tenMinAlert: "10 मिनट पूर्व अलर्ट",
    fiveMinAlert: "5 मिनट पूर्व अलर्ट (अनुशंसित)",
    twoMinAlert: "2 मिनट पूर्व आवश्यक अलर्ट (अनुशंसित)",
    privacyTitle: "लोकेशन और डेटा गोपनीयता",
    privacyDesc: "आपकी GPS लोकेशन केवल सक्रिय यात्रा के दौरान आपके डिवाइस पर प्रोसेस होती है।",
    clearData: "सारा डेटा रीसेट करें",

    online: "ऑनलाइन",
    offline: "ऑफ़लाइन (सहेजे डेटा का उपयोग)",
    offlineNotice: "इंटरनेट कनेक्ट नहीं है। सहेजे गए मार्ग पर GPS ट्रैकिंग जारी है।",
    gpsUnavailable: "GPS सेवा उपलब्ध नहीं है।",
    gpsTimeout: "GPS समय समाप्त हो गया।",
    unknownPlace: "वर्तमान स्थान",
    meters: "मीटर",
    kilometers: "कि.मी.",
    minutes: "मिनट",
    hours: "घंटे",
    save: "सहेजें",
    cancel: "रद्द करें",
    close: "बंद करें",
    delete: "हटाएं",
    confirm: "पुष्टि करें",
    back: "पीछे"
  },

  ta: {
    appName: "இலக்கு கண்காணிப்பாளர்",
    appSubtitle: "பேருந்து பயணிகளுக்கான இலக்கு கண்காணிப்பு மற்றும் எச்சரிக்கை அமைப்பு",
    tagline: "பேருந்தில் தூங்கினாலும் உங்கள் பேருந்து நிறுத்தத்தை தவறவிடாதீர்கள். சரியான நேரத்தில் குரல் எச்சரிக்கை பெறுங்கள்.",
    
    welcomeTitle: "வணக்கம் பயணி",
    welcomeSubtitle: "உங்கள் பேருந்து பயணத்தை கண்காணிக்கவும் முன்னெச்சரிக்கை பெறவும் உங்கள் விவரங்களை உள்ளிடவும்.",
    fullName: "முழு பெயர்",
    phoneNumber: "தொலைபேசி எண்",
    enterFullName: "எ.கா: கார்த்திக் ராஜா",
    enterPhoneNumber: "எ.கா: 9876543210",
    continueBtn: "டாஷ்போர்டுக்கு செல்லவும்",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    logout: "வெளியேறு",
    logoutConfirm: "நிச்சயமாக வெளியேற விரும்புகிறீர்களா?",
    profileUpdated: "சுயவிவரம் புதுப்பிக்கப்பட்டது.",
    nameRequired: "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.",
    phoneRequired: "சரியான தொலைபேசி எண்ணை உள்ளிடவும்.",

    onboardingStep1Title: "1. உங்கள் இலக்கைத் தேர்ந்தெடுக்கவும்",
    onboardingStep1Desc: "தொடக்க இடம் மற்றும் சென்றடைய வேண்டிய பேருந்து நிறுத்தம் அல்லது இடத்தை தேர்ந்தெடுக்கவும்.",
    onboardingStep2Title: "2. நேரடி GPS கண்காணிப்பு",
    onboardingStep2Desc: "மீதமுள்ள தூரம், வருகை நேரம் மற்றும் அடுத்த நிறுத்தங்களை உடனுக்குடன் கணக்கிடுகிறது.",
    onboardingStep3Title: "3. குரல் மற்றும் அதிர்வு எச்சரிக்கைகள்",
    onboardingStep3Desc: "இலக்கை அடைவதற்கு 5 நிமிடங்கள் மற்றும் 2 நிமிடங்களுக்கு முன்பே தமிழில் குரல் மற்றும் அதிர்வு எச்சரிக்கை வரும்.",
    onboardingStep4Title: "4. பயணத்தைப் பகிரவும்",
    onboardingStep4Desc: "உங்கள் நேரடி இருப்பிடம் மற்றும் பாதுகாப்பான வருகையை வாட்ஸ்அப்பில் குடும்பத்தினருடன் பகிரலாம்.",
    skip: "தவிர்",
    next: "அடுத்து",
    getStarted: "தொடங்குங்கள்",

    greetingMorning: "காலை வணக்கம்",
    greetingAfternoon: "மதிய வணக்கம்",
    greetingEvening: "மாலை வணக்கம்",
    readyStatus: "தயார்",
    monitoringStatus: "நேரடி கண்காணிப்பு",
    pausedStatus: "நிறுத்தப்பட்டது",
    reachedStatus: "இலக்கை அடைந்தது",
    cancelledStatus: "ரத்து செய்யப்பட்டது",
    planJourney: "பயணத்தைத் திட்டமிடுங்கள்",
    startMonitoring: "பயணத்தைத் தொடங்குங்கள்",
    shareJourney: "பயணத்தைப் பகிருங்கள்",
    journeyHistory: "பயண வரலாறு",
    favouriteRoutes: "விருப்பமான வழிகள்",
    safetySOS: "பாதுகாப்பு / SOS",
    settings: "அமைப்புகள்",
    currentJourneyCardTitle: "செயலில் உள்ள பயணக் கண்காணிப்பு",
    noActiveJourney: "செயலில் உள்ள பயணம் எதுவுமில்லை. புதிய பயணத்தைத் திட்டமிடுங்கள்.",

    locationPermissionTitle: "இருப்பிட அனுமதி தேவை",
    locationPermissionDesc: "நேரடி பேருந்து பயணத்தை கண்காணிக்கவும் சரியான நேரத்தில் குரல் எச்சரிக்கை தரவும் GPS அனுமதி தேவை.",
    allowLocationBtn: "இருப்பிடத்தை அனுமதிக்கவும்",
    locationAccessEnabled: "இருப்பிட அணுகல் இயக்கப்பட்டது",
    locationPermissionRequired: "கண்காணிப்புக்கு இருப்பிட அனுமதி கட்டாயம்.",
    retryPermission: "அனுமதியை மீண்டும் சரிபார்க்கவும்",
    accuracy: "GPS துல்லியம்",

    source: "தொடக்க இடம்",
    destination: "இலக்கு / பேருந்து நிறுத்தம்",
    useCurrentLocation: "தற்போதைய GPS இருப்பிடத்தைப் பயன்படுத்து",
    searchSource: "தொடக்க இடத்தை தேடுங்கள்...",
    searchDestination: "இலக்கு பேருந்து நிறுத்தத்தை தேடுங்கள்...",
    selectOnMap: "வரைபடத்தில் தேர்ந்தெடுக்கவும்",
    calculatingRoute: "வழிப்பாதை மற்றும் நேரம் கணக்கிடப்படுகிறது...",
    noRouteFound: "இந்த இடங்களுக்கு இடையே சரியான பாதை கிடைக்கவில்லை.",
    selectTravelMode: "பயண முறையைத் தேர்ந்தெடுக்கவும்",
    travelMode: "பயண முறை",
    fastest: "வேகமான பாதை",
    shortest: "குறுகிய பாதை",
    alternative: "மாற்றுப் பாதை",
    distance: "தூரம்",
    duration: "மதிப்பிடப்பட்ட நேரம்",
    eta: "வருகை நேரம் (ETA)",
    startJourneyBtn: "நேரடிப் பயணத்தைத் தொடங்கு",
    saveFavourite: "விருப்பத்தில் சேமிக்கவும்",
    transitUnavailableNotice: "நேரடி பேருந்து அட்டவணை கிடைக்கவில்லை. சாலை வழிப்பாதை கணக்கிடப்பட்டுள்ளது.",
    roadNetworkEstimated: "சாலை நெட்வொர்க் மதிப்பீடு.",

    modeWalk: "நடப்பது",
    modeBike: "பைக்",
    modeCar: "கார்",
    modeBus: "பேருந்து",
    modeTrain: "ரயில்",

    liveLocation: "நேரடி இருப்பிடம்",
    nextStop: "அடுத்த நிறுத்தம்",
    destinationReached: "இலக்கை அடைந்தது",
    distanceRemaining: "மீதமுள்ள தூரம்",
    timeRemaining: "மீதமுள்ள நேரம்",
    journeyProgress: "பயண முன்னேற்றம்",
    stopJourney: "பயணத்தை நிறுத்து",
    pauseJourney: "இடைநிறுத்து",
    resumeJourney: "மீண்டும் தொடர்",
    stopJourneyConfirm: "பயணக் கண்காணிப்பை நிறுத்த விரும்புகிறீர்களா?",
    recalculating: "தற்போதைய இடத்திலிருந்து புதிய பாதை கணக்கிடப்படுகிறது...",

    alert10MinMsg: "உங்கள் இலக்கு சுமார் 10 நிமிடங்களில் வரவுள்ளது. இறங்க தயாராகுங்கள்.",
    alert5MinMsg: "உங்கள் இலக்கு இன்னும் 5 நிமிடங்களில் வரவுள்ளது. தயவுசெய்து தயாராகுங்கள்.",
    alert2MinMsg: "கவனம்! உங்கள் இலக்கு இன்னும் 2 நிமிடங்களில் வந்துவிடும். கதவு அருகே செல்லுங்கள்.",
    destinationReachedMsg: "நீங்கள் உங்கள் இலக்கை அடைந்துவிட்டீர்கள்! உங்கள் பயணம் இனிதாக அமைந்தது.",
    offRouteWarning: "எச்சரிக்கை: நீங்கள் திட்டமிட்ட பாதையிலிருந்து விலகிச் செல்கிறீர்கள்.",
    recalculateRouteBtn: "பாதையை மாற்றவும்",
    journeyDelayedMsg: "போக்குவரத்து நெரிசலால் பயணம் தாமதமாகிறது.",
    originalEta: "முந்தைய நேரம்",
    updatedEta: "புதிய வருகை நேரம்",
    delayAmount: "தாமதம்",
    shareDelayBtn: "தாமதத்தைப் பகிருங்கள்",

    napModeTitle: "தூக்கப் பயன்முறை (Nap Mode)",
    napModeActive: "தூக்கப் பயன்முறை செயலில் உள்ளது",
    napModeWakeUp: "எழுந்திருங்கள்! உங்கள் பேருந்து நிறுத்தம் நெருங்கிவிட்டது!",
    dismissNapAlert: "விழித்துக் கொண்டேன் / அலாரத்தை அணைக்கவும்",
    napModeDesc: "பேருந்தில் தூங்கினாலும் உங்களை எழுப்ப தீவிர எச்சரிக்கை மற்றும் குரல் ஒலிகள்.",

    sosTitle: "அவசர பாதுகாப்பு வட்டம்",
    sosConfirmTitle: "அவசர SOS அனுப்பவா?",
    sosConfirmDesc: "இது உங்கள் முதன்மை தொடர்பாளருக்கு அழைப்பு விடுக்கும் மற்றும் GPS இருப்பிட செய்தியைத் தயார் செய்யும்.",
    callPriority1: "முதன்மை தொடர்பாளரை அழைக்கவும்",
    sendEmergencyAlert: "அவசர SMS / WhatsApp அனுப்பவும்",
    emergencyContacts: "அவசர தொடர்புகள்",
    addContact: "தொடர்பைச் சேர்க்கவும்",
    editContact: "திருத்தவும்",
    deleteContact: "நீக்கவும்",
    contactName: "பெயர்",
    contactPhone: "மொபைல் எண்",
    contactPriority: "முன்னுரிமை (1, 2, 3)",
    noContactsYet: "அவசர தொடர்புகள் எதுவும் சேர்க்கப்படவில்லை. குறைந்தபட்சம் 3 எண்களைச் சேர்க்கவும்.",
    confirmDeleteContact: "இந்த தொடர்பை நீக்க விரும்புகிறீர்களா?",
    sosSentSuccess: "அவசர SOS தயார் செய்யப்பட்டுள்ளது.",

    shareLiveJourneyTitle: "நேரடி பயணத்தைப் பகிரவும்",
    shareArrivalTitle: "பாதுகாப்பான வருகையைப் பகிரவும்",
    shareViaWhatsApp: "வாட்ஸ்அப்பில் பகிரவும்",
    shareViaWebShare: "பிற செயலிகளில் பகிரவும்",
    copyLink: "இணைப்பை நகலெடுக்கவும்",
    linkCopied: "இணைப்பு நகலெடுக்கப்பட்டது!",
    shareArrivalBtn: "வருகையை வாட்ஸ்அப்பில் பகிரவும்",

    shareLiveMessage: (name, dest, eta, mode, status, mapUrl) =>
      `🚍 *இலக்கு கண்காணிப்பாளர் - நேரடி பயணம்*\n\n` +
      `பயணி: *${name}*\n` +
      `செல்லும் இடம்: *${dest}*\n` +
      `பயண முறை: *${mode.toUpperCase()}*\n` +
      `வருகை நேரம்: *${eta}*\n` +
      `நிலை: *${status}*\n\n` +
      `📍 நேரடி வரைபடம்:\n${mapUrl}`,

    shareArrivalMessage: (name, dest, time) =>
      `✅ *பாதுகாப்பான வருகை தகவல்*\n\n` +
      `பயணி *${name}* பாதுகாப்பாக *${dest}* இடத்தை *${time}* மணிக்கு அடைந்துவிட்டார்.\n\n` +
      `டெஸ்டினேஷன் மானிட்டர் மூலம் அனுப்பப்பட்டது.`,

    shareDelayMessage: (name, dest, originalEta, newEta, delayMin) =>
      `⚠️ *பயண தாமத தகவல்*\n\n` +
      `பயணி: *${name}*\n` +
      `இலக்கு: *${dest}*\n` +
      `புதிய நேரம்: *${newEta}* (~${delayMin} நிமிடம் தாமதம்)\n` +
      `முந்தைய நேரம்: *${originalEta}*`,

    shareEmergencyMessage: (name, lat, lng, mapUrl) =>
      `🚨 *அவசர SOS எச்சரிக்கை!*\n\n` +
      `பயணி *${name}* பயணத்தின் போது அவசர எச்சரிக்கை விடுத்துள்ளார்.\n` +
      `தற்போதைய GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n\n` +
      `📍 அவசர வரைபடம்:\n${mapUrl}`,

    noJourneysYet: "பயணங்கள் எதுவும் பதிவு செய்யப்படவில்லை.",
    clearHistory: "வரலாற்றை அழிக்கவும்",
    clearHistoryConfirm: "அனைத்து வரலாற்றுப் பதிவுகளையும் அழிக்க விரும்புகிறீர்களா?",
    noFavouritesYet: "விருப்பமான வழிகள் எதுவும் இல்லை.",
    savedRoutes: "சேமிக்கப்பட்ட வழிகள்",
    routeName: "வழியின் பெயர் (எ.கா: அலுவலக பேருந்து பாதை)",
    saveThisRoute: "விருப்பப் பாதையாக சேமிக்கவும்",

    language: "செயலியின் மொழி",
    voiceLanguage: "குரல் எச்சரிக்கை மொழி",
    testVoice: "குரல் எச்சரிக்கையை சோதிக்கவும்",
    voiceTesting: "குரல் ஒலிக்கிறது...",
    voiceUnavailableNotice: (lang) => `இந்த சாதனத்தில் ${lang} குரல் கிடைக்கவில்லை. அலாரம் ஒலி மட்டுமே ஒலிக்கும்.`,
    vibration: "அதிர்வு எச்சரிக்கை",
    notifications: "வலை அறிவிப்புகள்",
    napMode: "தூக்கப் பயன்முறை (Nap Mode)",
    darkMode: "டார்க் பயன்முறை",
    alertTiming: "எச்சரிக்கை நேரங்கள்",
    tenMinAlert: "10 நிமிட முன்கூட்டிய எச்சரிக்கை",
    fiveMinAlert: "5 நிமிட முன்கூட்டிய எச்சரிக்கை (பரிந்துரைக்கப்படுகிறது)",
    twoMinAlert: "2 நிமிட அவசர எச்சரிக்கை (பரிந்துரைக்கப்படுகிறது)",
    privacyTitle: "இருப்பிடம் மற்றும் தனியுரிமை",
    privacyDesc: "உங்கள் GPS தகவல் உங்கள் சாதனத்தில் மட்டுமே செயலாக்கப்படுகிறது.",
    clearData: "அனைத்து தரவையும் அழிக்கவும்",

    online: "ஆன்லைன்",
    offline: "ஆஃப்லைன் (சேமித்த தரவு)",
    offlineNotice: "இணைய இணைப்பு இல்லை. GPS தொடர்ந்து இயங்குகிறது.",
    gpsUnavailable: "GPS சேவை கிடைக்கவில்லை.",
    gpsTimeout: "GPS நேரம் கடந்துவிட்டது.",
    unknownPlace: "தற்போதைய இடம்",
    meters: "மீட்டர்",
    kilometers: "கி.மீ",
    minutes: "நிமிடங்கள்",
    hours: "மணி",
    save: "சேமி",
    cancel: "ரத்து",
    close: "மூடு",
    delete: "நீக்கு",
    confirm: "உறுதிப்படுத்து",
    back: "பின்னால்"
  },

  kn: {
    appName: "ಗಮ್ಯಸ್ಥಾನ ಮಾನಿಟರ್",
    appSubtitle: "ಬಸ್ ಪ್ರಯಾಣಿಕರಿಗಾಗಿ ಗಮ್ಯಸ್ಥಾನ ಮೇಲ್ವಿಚಾರಣೆ ಮತ್ತು ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ",
    tagline: "ಬಸ್‌ನಲ್ಲಿ ನಿದ್ದೆ ಮಾಡಿದರೂ ನಿಮ್ಮ ಸ್ಟಾಪ್ ತಪ್ಪಿಹೋಗದಂತೆ ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
    
    welcomeTitle: "ಸ್ವಾಗತ ಪ್ರಯಾಣಿಕರೇ",
    welcomeSubtitle: "ನಿಮ್ಮ ಬಸ್ ಪ್ರಯಾಣವನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಲು ಮತ್ತು ಎಚ್ಚರಿಕೆ ಪಡೆಯಲು ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    phoneNumber: "ಫೋನ್ ಸಂಖ್ಯೆ",
    enterFullName: "ಉದಾ: ಪ್ರಕಾಶ್ ಹೆಗಡೆ",
    enterPhoneNumber: "ಉದಾ: 9876543210",
    continueBtn: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹೋಗಿ",
    editProfile: "ಪ್ರೊಫೈಲ್ ತಿದ್ದುಪಡಿ",
    logout: "ಲಾಗ್ ಔಟ್",
    logoutConfirm: "ನೀವು ಖಚಿತವಾಗಿ ಲಾಗ್ ಔಟ್ ಮಾಡಲು ಬಯಸುವಿರಾ?",
    profileUpdated: "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಲಾಗಿದೆ.",
    nameRequired: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    phoneRequired: "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಫೋನ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",

    onboardingStep1Title: "1. ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನವನ್ನು ಆರಿಸಿ",
    onboardingStep1Desc: "ನಿಮ್ಮ ಪ್ರಾರಂಭದ ಸ್ಥಳ ಮತ್ತು ತಲುಪಬೇಕಾದ ಬಸ್ ನಿಲ್ದಾಣ ಅಥವಾ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    onboardingStep2Title: "2. ಲೈವ್ GPS ಟ್ರ್ಯಾಕಿಂಗ್",
    onboardingStep2Desc: "ಉಳಿದಿರುವ ದೂರ, ಆಗಮನದ ಸಮಯ ಮತ್ತು ಮುಂದಿನ ನಿಲ್ದಾಣಗಳನ್ನು ಸತತವಾಗಿ ಲೆಕ್ಕಾಚಾರ ಮಾಡುತ್ತದೆ.",
    onboardingStep3Title: "3. ಧ್ವನಿ ಮತ್ತು ವೈಬ್ರೇಶನ್ ಎಚ್ಚರಿಕೆ",
    onboardingStep3Desc: "ಗಮ್ಯಸ್ಥಾನ ತಲುಪುವ 5 ನಿಮಿಷ ಮತ್ತು 2 ನಿಮಿಷಗಳ ಮೊದಲು ಕನ್ನಡದಲ್ಲಿ ಧ್ವನಿ ಮತ್ತು ಕಂಪನ ಎಚ್ಚರಿಕೆ ಬರುತ್ತದೆ.",
    onboardingStep4Title: "4. ಪ್ರಯಾಣವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ",
    onboardingStep4Desc: "ನಿಮ್ಮ ಲೈವ್ ಸ್ಥಳ ಮತ್ತು ಸುರಕ್ಷಿತವಾಗಿ ತಲುಪಿದ ಸಂದೇಶವನ್ನು ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಕುಟುಂಬದೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.",
    skip: "ಸ್ಕಿಪ್ ಮಾಡಿ",
    next: "ಮುಂದೆ",
    getStarted: "ಪ್ರಾರಂಭಿಸಿ",

    greetingMorning: "ಶುಭೋದಯ",
    greetingAfternoon: "ಶುಭ ಮಧ್ಯಾಹ್ನ",
    greetingEvening: "ಶುಭ ಸಂಜೆ",
    readyStatus: "ಸಿದ್ಧವಾಗಿದೆ",
    monitoringStatus: "ಲೈವ್ ಮೇಲ್ವಿಚಾರಣೆ",
    pausedStatus: "ವಿರಾಮಗೊಳಿಸಲಾಗಿದೆ",
    reachedStatus: "ಗಮ್ಯಸ್ಥಾನ ತಲುಪಿದೆ",
    cancelledStatus: "ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ",
    planJourney: "ಪ್ರಯಾಣ ಯೋಜಿಸಿ",
    startMonitoring: "ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
    shareJourney: "ಪ್ರಯಾಣ ಹಂಚಿಕೊಳ್ಳಿ",
    journeyHistory: "ಪ್ರಯಾಣ ಇತಿಹಾಸ",
    favouriteRoutes: "ನೆಚ್ಚಿನ ಮಾರ್ಗಗಳು",
    safetySOS: "ಸುರಕ್ಷತೆ / SOS",
    settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
    currentJourneyCardTitle: "ಸಕ್ರಿಯ ಪ್ರಯಾಣ ಮೇಲ್ವಿಚಾರಣೆ",
    noActiveJourney: "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರಯಾಣವಿಲ್ಲ. ಹೊಸ ಮಾರ್ಗವನ್ನು ಯೋಜಿಸಿ.",

    locationPermissionTitle: "ಸ್ಥಳ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ",
    locationPermissionDesc: "ಬಸ್ ಪ್ರಯಾಣವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮತ್ತು ಸರಿಯಾದ ಸಮಯಕ್ಕೆ ಧ್ವನಿ ಅಲಾರಾಂ ನೀಡಲು GPS ಅನುಮತಿ ಅಗತ್ಯ.",
    allowLocationBtn: "ಸ್ಥಳ ಅನುಮತಿಸಿ",
    locationAccessEnabled: "ಸ್ಥಳ ಪ್ರವೇಶವನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ",
    locationPermissionRequired: "ಮೇಲ್ವಿಚಾರಣೆಗೆ ಸ್ಥಳ ಅನುಮತಿ ಕಡ್ಡಾಯವಾಗಿದೆ.",
    retryPermission: "ಅನುಮತಿಯನ್ನು ಪುನಃ ಪರಿಶೀಲಿಸಿ",
    accuracy: "GPS ನಿಖರತೆ",

    source: "ಪ್ರಾರಂಭದ ಸ್ಥಳ",
    destination: "ಗಮ್ಯಸ್ಥಾನ / ಬಸ್ ನಿಲ್ದಾಣ",
    useCurrentLocation: "ಪ್ರಸ್ತುತ GPS ಸ್ಥಳ ಬಳಸಿ",
    searchSource: "ಪ್ರಾರಂಭ ಸ್ಥಳ ಹುಡುಕಿ...",
    searchDestination: "ಗಮ್ಯಸ್ಥಾನ ಬಸ್ ನಿಲ್ದಾಣ ಹುಡುಕಿ...",
    selectOnMap: "ನಕ್ಷೆಯಲ್ಲಿ ಆಯ್ಕೆಮಾಡಿ",
    calculatingRoute: "ಮಾರ್ಗ ಮತ್ತು ಸಮಯ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...",
    noRouteFound: "ಈ ಸ್ಥಳಗಳ ನಡುವೆ ಯಾವುದೇ ಸೂಕ್ತ ಮಾರ್ಗ ಕಂಡುಬಂದಿಲ್ಲ.",
    selectTravelMode: "ಪ್ರಯಾಣದ ವಿಧಾನ ಆರಿಸಿ",
    travelMode: "ಪ್ರಯಾಣ ವಿಧಾನ",
    fastest: "ವೇಗದ ಮಾರ್ಗ",
    shortest: "ಹತ್ತಿರದ ಮಾರ್ಗ",
    alternative: "ಪರ್ಯಾಯ ಮಾರ್ಗ",
    distance: "ಒಟ್ಟು ದೂರ",
    duration: "ಅಂದಾಜು ಸಮಯ",
    eta: "ಆಗಮನದ ಸಮಯ (ETA)",
    startJourneyBtn: "ಲೈವ್ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ",
    saveFavourite: "ಮೆಚ್ಚಿನವುಗಳಲ್ಲಿ ಉಳಿಸಿ",
    transitUnavailableNotice: "ನೇರ ಬಸ್ ವೇಳಾಪಟ್ಟಿ ಲಭ್ಯವಿಲ್ಲ. ರಸ್ತೆ ಮಾರ್ಗದ ಅಂದಾಜು ಅನ್ವಯಿಸಲಾಗಿದೆ.",
    roadNetworkEstimated: "ರಸ್ತೆ ನೆಟ್‌ವರ್ಕ್ ಅಂದಾಜು.",

    modeWalk: "ನಡಿಗೆ",
    modeBike: "ಬೈಕ್",
    modeCar: "ಕಾರು",
    modeBus: "ಬಸ್ಸು",
    modeTrain: "ರೈಲು",

    liveLocation: "ಲೈವ್ ಸ್ಥಳ",
    nextStop: "ಮುಂದಿನ ನಿಲ್ದಾಣ",
    destinationReached: "ಗಮ್ಯಸ್ಥಾನ ತಲುಪಿದೆ",
    distanceRemaining: "ಉಳಿದಿರುವ ದೂರ",
    timeRemaining: "ಉಳಿದಿರುವ ಸಮಯ",
    journeyProgress: "ಪ್ರಯಾಣದ ಪ್ರಗತಿ",
    stopJourney: "ಪ್ರಯಾಣ ನಿಲ್ಲಿಸಿ",
    pauseJourney: "ವಿರಾಮಗೊಳಿಸಿ",
    resumeJourney: "ಮುಂದುವರಿಸಿ",
    stopJourneyConfirm: "ನೀವು ಖಚಿತವಾಗಿ ಪ್ರಯಾಣ ಮೇಲ್ವಿಚಾರಣೆಯನ್ನು ನಿಲ್ಲಿಸಲು ಬಯಸುವಿರಾ?",
    recalculating: "ಪ್ರಸ್ತುತ ಸ್ಥಳದಿಂದ ಹೊಸ ಮಾರ್ಗ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...",

    alert10MinMsg: "ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ಸುಮಾರು 10 ನಿಮಿಷಗಳಲ್ಲಿ ಬರಲಿದೆ. ಇಳಿಯಲು ಸಿದ್ಧರಾಗಿ.",
    alert5MinMsg: "ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ಸುಮಾರು 5 ನಿಮಿಷಗಳಲ್ಲಿ ಬರಲಿದೆ. ದಯವಿಟ್ಟು ಸಿದ್ಧರಾಗಿ.",
    alert2MinMsg: "ಗಮನಿಸಿ! ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನ ಸುಮಾರು 2 ನಿಮಿಷಗಳ ದೂರದಲ್ಲಿದೆ. ಬಾಗಿಲ ಬಳಿ ತೆರಳಿ.",
    destinationReachedMsg: "ನೀವು ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನವನ್ನು ತಲುಪಿದ್ದೀರಿ! ನಿಮ್ಮ ಪ್ರಯಾಣ ಶುಭವಾಗಿರಲಿ.",
    offRouteWarning: "ಎಚ್ಚರಿಕೆ: ನೀವು ಯೋಜಿತ ಮಾರ್ಗದಿಂದ ಬೇರೆಡೆ ಚಲಿಸುತ್ತಿದ್ದೀರಿ.",
    recalculateRouteBtn: "ಮಾರ್ಗವನ್ನು ಮರುಹೊಂದಿಸಿ",
    journeyDelayedMsg: "ಟ್ರಾಫಿಕ್‌ನಿಂದಾಗಿ ಪ್ರಯಾಣ ವಿಳಂಬವಾಗುತ್ತಿದೆ.",
    originalEta: "ಹಿಂದಿನ ಸಮಯ",
    updatedEta: "ಹೊಸ ಅಂದಾಜು ಸಮಯ",
    delayAmount: "ವಿಳಂಬ",
    shareDelayBtn: "ವಿಳಂಬ ಮಾಹಿತಿ ಹಂಚಿಕೊಳ್ಳಿ",

    napModeTitle: "ಕುನುಕು ಮೋಡ್ (Nap Mode)",
    napModeActive: "ಕುನುಕು ಮೋಡ್ ಚಾಲನೆಯಲ್ಲಿದೆ",
    napModeWakeUp: "ಎದ್ದೇಳಿ! ನಿಮ್ಮ ಬಸ್ ನಿಲ್ದಾಣ ಸಮೀಪಿಸುತ್ತಿದೆ!",
    dismissNapAlert: "ನಾನು ಎಚ್ಚರಗೊಂಡಿದ್ದೇನೆ / ಅಲಾರಾಂ ಆಫ್ ಮಾಡಿ",
    napModeDesc: "ಬಸ್‌ನಲ್ಲಿ ನಿದ್ದೆ ಮಾಡಿದರೂ ನಿಮ್ಮನ್ನು ಎಚ್ಚರಗೊಳಿಸಲು ಜೋರಾದ ಅಲಾರಾಂ ಮತ್ತು ಧ್ವನಿ ಎಚ್ಚರಿಕೆಗಳು.",

    sosTitle: "ತುರ್ತು ಸುರಕ್ಷತಾ ವಲಯ",
    sosConfirmTitle: "ತುರ್ತು SOS ಕಳುಹಿಸಬೇಕೆ?",
    sosConfirmDesc: "ಇದು ನಿಮ್ಮ ಆದ್ಯತೆ 1 ಸಂಪರ್ಕಕ್ಕೆ ಕರೆ ಮಾಡುತ್ತದೆ ಮತ್ತು GPS ಸ್ಥಳದೊಂದಿಗೆ ತುರ್ತು ಸಂದೇಶವನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.",
    callPriority1: "ಪ್ರಾಥಮಿಕ ಸಂಪರ್ಕಕ್ಕೆ ಕರೆ ಮಾಡಿ",
    sendEmergencyAlert: "ತುರ್ತು SMS / WhatsApp ಕಳುಹಿಸಿ",
    emergencyContacts: "ತುರ್ತು ಸಂಪರ್ಕಗಳು",
    addContact: "ಸಂಪರ್ಕ ಸೇರಿಸಿ",
    editContact: "ತಿದ್ದುಪಡಿ ಮಾಡಿ",
    deleteContact: "ತೆಗೆದುಹಾಕಿ",
    contactName: "ಹೆಸರು",
    contactPhone: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
    contactPriority: "ಆದ್ಯತೆ (1, 2, 3)",
    noContactsYet: "ಯಾವುದೇ ತುರ್ತು ಸಂಪರ್ಕಗಳನ್ನು ಸೇರಿಸಲಾಗಿಲ್ಲ. ಕನಿಷ್ಠ 3 ಸಂಖ್ಯೆಗಳನ್ನು ಸೇರಿಸಿ.",
    confirmDeleteContact: "ನೀವು ಖಚಿತವಾಗಿ ಈ ಸಂಪರ್ಕವನ್ನು ತೆಗೆದುಹಾಕಲು ಬಯಸುವಿರಾ?",
    sosSentSuccess: "ತುರ್ತು SOS ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ.",

    shareLiveJourneyTitle: "ಲೈವ್ ಪ್ರಯಾಣ ಹಂಚಿಕೊಳ್ಳಿ",
    shareArrivalTitle: "ಸುರಕ್ಷಿತ ಆಗಮನ ಹಂಚಿಕೊಳ್ಳಿ",
    shareViaWhatsApp: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
    shareViaWebShare: "ಇತರ ಆಪ್ಸ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
    copyLink: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ",
    linkCopied: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಲಾಗಿದೆ!",
    shareArrivalBtn: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಆಗಮನ ಹಂಚಿಕೊಳ್ಳಿ",

    shareLiveMessage: (name, dest, eta, mode, status, mapUrl) =>
      `🚍 *ಗಮ್ಯಸ್ಥಾನ ಮಾನಿಟರ್ - ಲೈವ್ ಪ್ರಯಾಣ*\n\n` +
      `ಪ್ರಯಾಣಿಕರು: *${name}*\n` +
      `ಹೋಗುವ ಸ್ಥಳ: *${dest}*\n` +
      `ಪ್ರಯಾಣ ವಿಧಾನ: *${mode.toUpperCase()}*\n` +
      `ಆಗಮನದ ಸಮಯ: *${eta}*\n` +
      `ಸ್ಥಿತಿ: *${status}*\n\n` +
      `📍 ಲೈವ್ ಮ್ಯಾಪ್:\n${mapUrl}`,

    shareArrivalMessage: (name, dest, time) =>
      `✅ *ಸುರಕ್ಷಿತ ಆಗಮನದ ಮಾಹಿತಿ*\n\n` +
      `ಪ್ರಯಾಣಿಕ *${name}* ಅವರು ಸುರಕ್ಷಿತವಾಗಿ *${dest}* ತಲುಪಿದ್ದಾರೆ (*${time}* ಕ್ಕೆ).\n\n` +
      `ಡೆಸ್ಟಿನೇಷನ್ ಮಾನಿಟರ್ ಮೂಲಕ ಕಳುಹಿಸಲಾಗಿದೆ.`,

    shareDelayMessage: (name, dest, originalEta, newEta, delayMin) =>
      `⚠️ *ಪ್ರಯಾಣ ವಿಳಂಬ ಮಾಹಿತಿ*\n\n` +
      `ಪ್ರಯಾಣಿಕರು: *${name}*\n` +
      `ಗಮ್ಯಸ್ಥಾನ: *${dest}*\n` +
      `ಹೊಸ ಸಮಯ: *${newEta}* (~${delayMin} ನಿಮಿಷ ವಿಳಂಬ)\n` +
      `ಹಿಂದಿನ ಸಮಯ: *${originalEta}*`,

    shareEmergencyMessage: (name, lat, lng, mapUrl) =>
      `🚨 *ತುರ್ತು SOS ಎಚ್ಚರಿಕೆ!*\n\n` +
      `ಪ್ರಯಾಣಿಕ *${name}* ಅವರು ಪ್ರಯಾಣದ ವೇಳೆ ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿದ್ದಾರೆ.\n` +
      `ಪ್ರಸ್ತುತ GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}\n\n` +
      `📍 ತುರ್ತು ಲೊಕೇಶನ್ ಮ್ಯಾಪ್:\n${mapUrl}`,

    noJourneysYet: "ಯಾವುದೇ ಪ್ರಯಾಣ ದಾಖಲಾಗಿಲ್ಲ.",
    clearHistory: "ಇತಿಹಾಸ ಅಳಿಸಿ",
    clearHistoryConfirm: "ಎಲ್ಲಾ ಪ್ರಯಾಣದ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
    noFavouritesYet: "ನೆಚ್ಚಿನ ಮಾರ್ಗಗಳು ಯಾವುದೂ ಇಲ್ಲ.",
    savedRoutes: "ಉಳಿಸಲಾದ ಮಾರ್ಗಗಳು",
    routeName: "ಮಾರ್ಗದ ಹೆಸರು (ಉದಾ: ಕಚೇರಿ ಬಸ್ ಮಾರ್ಗ)",
    saveThisRoute: "ಮೆಚ್ಚಿನ ಮಾರ್ಗವಾಗಿ ಉಳಿಸಿ",

    language: "ಆಪ್ ಭಾಷೆ",
    voiceLanguage: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆ ಭಾಷೆ",
    testVoice: "ಧ್ವನಿ ಎಚ್ಚರಿಕೆ ಪರೀಕ್ಷಿಸಿ",
    voiceTesting: "ಧ್ವನಿ ಪರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ...",
    voiceUnavailableNotice: (lang) => `ಈ ಸಾಧನದಲ್ಲಿ ${lang} ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ. ಸಿಂಥೆಟಿಕ್ ಸೌಂಡ್ ಪ್ಲೇ ಆಗುತ್ತದೆ.`,
    vibration: "ಕಂಪನ ಎಚ್ಚರಿಕೆ",
    notifications: "ವೆಬ್ ಅಧಿಸೂಚನೆಗಳು",
    napMode: "ಕುನುಕು ಮೋಡ್ (Nap Mode)",
    darkMode: "ಡಾರ್ಕ್ ಮೋಡ್",
    alertTiming: "ಎಚ್ಚರಿಕೆ ಸಮಯಗಳು",
    tenMinAlert: "10 ನಿಮಿಷ ಮುಂಚಿತ ಎಚ್ಚರಿಕೆ",
    fiveMinAlert: "5 ನಿಮಿಷ ಮುಂಚಿತ ಎಚ್ಚರಿಕೆ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
    twoMinAlert: "2 ನಿಮಿಷ ತುರ್ತು ಎಚ್ಚರಿಕೆ (ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ)",
    privacyTitle: "ಸ್ಥಳ ಮತ್ತು ಗೌಪ್ಯತೆ",
    privacyDesc: "ನಿಮ್ಮ GPS ಮಾಹಿತಿ ನಿಮ್ಮ ಸಾಧನದಲ್ಲೇ ಪ್ರಕ್ರಿಯೆಗೊಳ್ಳುತ್ತದೆ.",
    clearData: "ಎಲ್ಲಾ ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ",

    online: "ಆನ್‌ಲೈನ್",
    offline: "ಆಫ್‌ಲೈನ್ (ಉಳಿಸಿದ ಡೇಟಾ ಬಳಕೆ)",
    offlineNotice: "ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲ. GPS ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.",
    gpsUnavailable: "GPS ಸೇವೆ ಲಭ್ಯವಿಲ್ಲ.",
    gpsTimeout: "GPS ಸಮಯ ಮೀರಿದೆ.",
    unknownPlace: "ಪ್ರಸ್ತುತ ಸ್ಥಳ",
    meters: "ಮೀಟರ್",
    kilometers: "ಕಿ.ಮೀ",
    minutes: "ನಿಮಿಷ",
    hours: "ಗಂಟೆ",
    save: "ಉಳಿಸಿ",
    cancel: "ರದ್ದುಮಾಡಿ",
    close: "ಮುಚ್ಚಿ",
    delete: "ಅಳಿಸಿ",
    confirm: "ಖಚಿತಪಡಿಸಿ",
    back: "ಹಿಂದೆ"
  }
};
