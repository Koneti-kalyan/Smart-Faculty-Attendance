// Safe wrapper for Lucide Icons
function safeCreateIcons() {
    if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
        try {
            lucide.createIcons();
        } catch (e) {
            console.error('Failed to create Lucide icons:', e);
        }
    } else {
        console.warn('Lucide library is not loaded');
    }
}

// DOM Elements
const screenContainer = document.getElementById('screen-container');
const screens = document.querySelectorAll('.screen');
const ctrlButtons = document.querySelectorAll('.ctrl-btn');
const deviceTime = document.getElementById('device-time');
const calendarDaysContainer = document.getElementById('calendar-days-container');
const historyLogsContainer = document.getElementById('history-logs-container');
const faceLiveStatusMessage = document.getElementById('face-live-status-message');
const statusDisplayBubble = document.getElementById('status-display-bubble');
const statusStringDetail = document.getElementById('status-string-detail');
const successTimestamp = document.getElementById('success-timestamp');
const dashboardDate = document.getElementById('dashboard-date');
const dashboardDay = document.getElementById('dashboard-day');
const trackingPointsLayer = document.getElementById('tracking-points-layer');
const percentageRing = document.getElementById('percentage-ring');

// GPS Elements
const gpsCard = document.getElementById('gps-card');
const gpsStatusPill = document.getElementById('gps-status-pill');
const gpsStatusText = document.getElementById('gps-status-text');
const gpsCoordinatesText = document.getElementById('gps-coordinates-text');
const gpsDetailsPlace = document.getElementById('gps-details-place');
const gpsDetailsDistance = document.getElementById('gps-details-distance');
const btnRefreshGps = document.getElementById('btn-refresh-gps');
const dashboardLocationBadge = document.getElementById('dashboard-location-badge');
const facescanGpsText = document.getElementById('facescan-gps-text');
const fsGpsDot = document.getElementById('fs-gps-dot');
const successVerifiedLocation = document.getElementById('success-verified-location');

// GPS Simulation Controls
const simGpsCampus = document.getElementById('sim-gps-campus');
const simGpsRemote = document.getElementById('sim-gps-remote');
const simGpsReal = document.getElementById('sim-gps-real');

// Buttons / Controls
const btnLoginManual = document.getElementById('btn-login-manual');
const btnCancelScan = document.getElementById('btn-cancel-scan');
const btnTriggerMockRecon = document.getElementById('btn-trigger-mock-recon');
const btnSuccessOk = document.getElementById('btn-success-ok');
const btnHistoryBottomBack = document.getElementById('btn-history-bottom-back');
const btnBackHistory = document.getElementById('btn-back-history');
const actionCheckin = document.getElementById('action-checkin');
const actionCheckout = document.getElementById('action-checkout');
const btnGotoHistory = document.getElementById('btn-goto-history');
const btnDeviceHomePill = document.getElementById('btn-device-home-pill');

// Bottom Nav
const navDash = document.getElementById('nav-dash');
const navHistory = document.getElementById('nav-history');
const navScan = document.getElementById('nav-scan');
const navProfile = document.getElementById('nav-profile');

// Password Visibility Variables
const btnTogglePassword = document.querySelector('.btn-toggle-password');
const indexPasswordField = document.getElementById('faculty-password');

// Video Element for Real Webcam
const cameraStreamVideo = document.getElementById('camera-stream');
const webcamFallback = document.getElementById('webcam-fallback');
const toggleCameraBtn = document.getElementById('sim-camera-toggle');

// Simulator Variables
let isUserLoggedIn = localStorage.getItem('is_logged_in') === 'true';
let attendanceStatus = 'Not Checked In'; // 'Not Checked In', 'Checked In', 'Checked Out'
let checkinTimeStr = '--:--';
let checkoutTimeStr = '--:--';
let isCameraStreamActive = true;
let currentBiometricFlowMode = 'Check-In'; // 'Check-In' or 'Check-Out'
let activeWebcamStream = null;
let simulatedScanInterval = null;

// Biometric Matching States
let registeredSelfie = localStorage.getItem('registered_selfie') || null;
let forceMismatch = false;
let currentCapturedSelfie = null;

// GPS Variables & Constants
let gpsSource = 'mock-campus'; // 'mock-campus', 'mock-remote', 'real'
let currentCoords = { lat: 13.433369, lon: 79.509354 };
let gpsAccuracy = 8.5;
let gpsPlaceName = "SVPCET Main Campus, Puttur";
let isInsideGeofence = false;
let gpsMap = null;
let gpsMarker = null;
let geofenceCircle = null;
let campusCenter = { lat: 13.433369, lon: 79.509354 };
let GEOFENCE_RADIUS_METERS = 50;

// Mock Data
let facultyMember = {
    name: 'Dr. Sarah Jenkins',
    department: 'CS Department',
    facultyId: 'SVPCET-CS-1049',
    password: 'password123',
    baseConfidence: 99.82
};

const savedFaculty = localStorage.getItem('faculty_member');
if (savedFaculty) {
    try {
        facultyMember = JSON.parse(savedFaculty);
    } catch (e) {
        console.error('Failed to parse faculty member profile', e);
    }
}

// Attendance logs data for July 2026 (Starts clean before registration)
const mockLogs = {
    23: { status: 'pending', checkin: '--:--', checkout: '--:--', confidence: '--' }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Replace Lucide Icons safely
    safeCreateIcons();

    // Start Device Clock
    updateDeviceClock();
    setInterval(updateDeviceClock, 1000);

    // Splash screen automatic transition to login after progress finishes
    const loadingProgress = document.querySelector('.loading-progress');
    const scanningStatus = document.querySelector('.scanning-status');

    if (loadingProgress) {
        let progress = 0;
        const statusSteps = [
            { limit: 25, text: 'Initializing Neural Engines...' },
            { limit: 55, text: 'Connecting to Biometric Database...' },
            { limit: 85, text: 'Verifying GPS Geolocation...' },
            { limit: 100, text: 'System Ready!' }
        ];

        const progressInterval = setInterval(() => {
            progress += 1.5;
            if (progress > 100) progress = 100;

            loadingProgress.style.width = `${progress}%`;

            // Update status text based on progress
            const step = statusSteps.find(s => progress <= s.limit);
            if (step && scanningStatus) {
                scanningStatus.textContent = step.text;
            }

            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    const activeScreen = document.querySelector('.screen.active');
                    if (activeScreen && activeScreen.id === 'screen-splash') {
                        if (isUserLoggedIn) {
                            switchScreen('dashboard');
                        } else {
                            switchScreen('login');
                        }
                    }
                }, 300);
            }
        }, 50); // Will animate smoothly over ~3.3 seconds.
    } else {
        // Fallback static timeout
        setTimeout(() => {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen && activeScreen.id === 'screen-splash') {
                if (isUserLoggedIn) {
                    switchScreen('dashboard');
                } else {
                    switchScreen('login');
                }
            }
        }, 3800);
    }

    // Bind Screen Switchers from side panel controls
    if (ctrlButtons) {
        ctrlButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screenId = btn.getAttribute('data-screen');
                switchScreen(screenId);
            });
        });
    }

    // Toggle Password eye button
    if (btnTogglePassword && indexPasswordField) {
        btnTogglePassword.addEventListener('click', () => {
            const currentType = indexPasswordField.getAttribute('type');
            const eyeIconVal = btnTogglePassword.querySelector('i');
            if (currentType === 'password') {
                indexPasswordField.setAttribute('type', 'text');
                if (eyeIconVal) eyeIconVal.setAttribute('data-lucide', 'eye-off');
            } else {
                indexPasswordField.setAttribute('type', 'password');
                if (eyeIconVal) eyeIconVal.setAttribute('data-lucide', 'eye');
            }
            safeCreateIcons();
        });
    }

    // Login Action Handlers
    if (btnLoginManual) btnLoginManual.addEventListener('click', handleManualLogin);
    // Toggle login/registration view cards
    const linkShowRegister = document.getElementById('link-show-register');
    const linkShowLogin = document.getElementById('link-show-login');
    const loginCardView = document.getElementById('login-card-view');
    const registerCardView = document.getElementById('register-card-view');
    const btnRegisterSubmit = document.getElementById('btn-register-submit');

    if (linkShowRegister) {
        linkShowRegister.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginCardView) loginCardView.style.display = 'none';
            if (registerCardView) registerCardView.style.display = 'block';
        });
    }

    if (linkShowLogin) {
        linkShowLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerCardView) registerCardView.style.display = 'none';
            if (loginCardView) loginCardView.style.display = 'block';
        });
    }

    if (btnRegisterSubmit) {
        btnRegisterSubmit.addEventListener('click', () => {
            const regName = document.getElementById('reg-faculty-name').value.trim();
            const regId = document.getElementById('reg-faculty-id').value.trim();
            const regDept = document.getElementById('reg-faculty-dept').value;
            const regPass = document.getElementById('reg-faculty-password').value.trim();

            if (!regName || !regId || !regPass) {
                alert('Please fill in all base registration details: Name, Faculty ID, and Password.');
                return;
            }

            // Update faculty details session in memory
            facultyMember.name = regName;
            facultyMember.facultyId = regId;
            facultyMember.department = regDept;
            facultyMember.password = regPass;

            // Clear any previously saved selfie so it starts with a clean slate
            registeredSelfie = null;
            localStorage.removeItem('registered_selfie');
            updateAvatarUI();

            // Clear logs database for previous days (and keep July 23 check-in pending)
            for (const key in mockLogs) {
                delete mockLogs[key];
            }
            mockLogs[23] = { status: 'pending', checkin: '--:--', checkout: '--:--', confidence: '--' };

            // Log user in
            isUserLoggedIn = true;
            localStorage.setItem('is_logged_in', 'true');
            localStorage.setItem('faculty_member', JSON.stringify(facultyMember));
            attendanceStatus = 'Not Checked In';
            checkinTimeStr = '--:--';
            checkoutTimeStr = '--:--';

            // Refresh dashboards and calendars
            const facultyDeptMain = document.getElementById('faculty-dept-main');
            if (facultyDeptMain) facultyDeptMain.textContent = regDept;

            renderCalendar(23);
            updateDashboardScreenInfo();
            safeCreateIcons();

            alert(`Faculty Registration Complete!\n\nWelcome ${regName} (${regId}). Click "Start Check-In" on your dashboard to capture your biometric face profile.`);

            // Redirect to dashboard
            switchScreen('dashboard');
        });
    }

    // Face Scanner screen trigger button
    if (btnTriggerMockRecon) btnTriggerMockRecon.addEventListener('click', triggerBiometricVerification);
    if (btnCancelScan) {
        btnCancelScan.addEventListener('click', () => {
            stopWebcamStream();
            if (isUserLoggedIn) {
                switchScreen('dashboard');
            } else {
                switchScreen('login');
            }
        });
    }

    // Success Screen Back Button
    if (btnSuccessOk) {
        btnSuccessOk.addEventListener('click', () => {
            switchScreen('dashboard');
        });
    }

    // Dashboard Actions
    if (actionCheckin) {
        actionCheckin.addEventListener('click', () => {
            if (actionCheckin.classList.contains('disabled-state')) {
                alert(`Access Denied: Geofence Lock\n\nYou cannot check in from your current location ("${gpsPlaceName.split(',')[0]}"). Please enter the campus geofence range.`);
                return;
            }
            if (attendanceStatus !== 'Checked In') {
                currentBiometricFlowMode = 'Check-In';
                const bioLabel = document.getElementById('biometric-flow-label');
                if (bioLabel) bioLabel.innerText = 'Shift Check-In';
                switchScreen('facescan');
            }
        });
    }

    if (actionCheckout) {
        actionCheckout.addEventListener('click', () => {
            if (actionCheckout.classList.contains('disabled-state')) {
                alert(`Access Denied: Geofence Lock\n\nYou cannot check out from your current location ("${gpsPlaceName.split(',')[0]}"). Please enter the campus geofence range.`);
                return;
            }
            if (attendanceStatus === 'Checked In') {
                currentBiometricFlowMode = 'Check-Out';
                const bioLabel = document.getElementById('biometric-flow-label');
                if (bioLabel) bioLabel.innerText = 'Shift Check-Out';
                switchScreen('facescan');
            }
        });
    }

    if (btnGotoHistory) {
        btnGotoHistory.addEventListener('click', () => {
            switchScreen('history');
        });
    }
    if (btnBackHistory) {
        btnBackHistory.addEventListener('click', () => {
            switchScreen('dashboard');
        });
    }
    if (btnHistoryBottomBack) {
        btnHistoryBottomBack.addEventListener('click', () => {
            switchScreen('dashboard');
        });
    }

    // Bottom Navigation Handlers
    if (navDash) navDash.addEventListener('click', () => switchScreen('dashboard'));
    if (navHistory) navHistory.addEventListener('click', () => switchScreen('history'));
    if (navScan) {
        navScan.addEventListener('click', () => {
            currentBiometricFlowMode = (attendanceStatus === 'Checked In') ? 'Check-Out' : 'Check-In';
            const bioLabel = document.getElementById('biometric-flow-label');
            if (bioLabel) bioLabel.innerText = currentBiometricFlowMode === 'Check-In' ? 'Shift Check-In' : 'Shift Check-Out';
            switchScreen('facescan');
        });
    }
    if (navProfile) navProfile.addEventListener('click', () => switchScreen('profile'));

    // Profile Logout Handler
    const btnProfileLogout = document.getElementById('btn-profile-logout');
    if (btnProfileLogout) btnProfileLogout.addEventListener('click', logoutFaculty);

    // Device home pill handler (Soft reset)
    if (btnDeviceHomePill) {
        btnDeviceHomePill.addEventListener('click', () => {
            if (isUserLoggedIn) {
                switchScreen('dashboard');
            } else {
                switchScreen('login');
            }
        });
    }

    // Web camera toggle side controller panel
    if (toggleCameraBtn) toggleCameraBtn.addEventListener('click', toggleRealCameraStream);

    // Sidebar simulation control triggers
    const simFaceDetected = document.getElementById('sim-face-detected');
    if (simFaceDetected) {
        simFaceDetected.addEventListener('click', () => {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen && activeScreen.id === 'screen-facescan') {
                triggerStatusEvent('Face Detected', 'detected');
                generateSimulatedLandmarks(25);
            }
        });
    }

    const simFaceFar = document.getElementById('sim-face-far');
    if (simFaceFar) {
        simFaceFar.addEventListener('click', () => {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen && activeScreen.id === 'screen-facescan') {
                triggerStatusEvent('Move Closer to Camera', 'detected');
            }
        });
    }

    const simFaceLighting = document.getElementById('sim-face-lighting');
    if (simFaceLighting) {
        simFaceLighting.addEventListener('click', () => {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen && activeScreen.id === 'screen-facescan') {
                triggerStatusEvent('Improve Lighting Conditions', 'detected');
            }
        });
    }

    // Initial setup for date strings
    setDatesInDashboard();

    // Render Calendar for July 2026
    renderCalendar(23); // Day 23 is selected by default

    // Set SVG Gauges and Percentage Ring
    setAttendancePercentageRing(0);

    // Initialize GPS parameters and triggers
    if (btnRefreshGps) {
        btnRefreshGps.addEventListener('click', () => syncGPSLocation(true));
    }
    if (simGpsCampus) {
        simGpsCampus.addEventListener('click', () => setGpsSource('mock-campus'));
    }
    if (simGpsRemote) {
        simGpsRemote.addEventListener('click', () => setGpsSource('mock-remote'));
    }
    if (simGpsReal) {
        simGpsReal.addEventListener('click', () => setGpsSource('real'));
    }

    // Initialize Avatar images if already registered
    updateAvatarUI();

    // Selfie action button event bindings
    const btnSelfieRetake = document.getElementById('btn-selfie-retake');
    if (btnSelfieRetake) {
        btnSelfieRetake.addEventListener('click', () => {
            const previewContainer = document.getElementById('selfie-preview-container');
            if (previewContainer) previewContainer.style.display = 'none';
            // Resume scanning animation
            startFaceScanInitiation();
        });
    }

    const btnSelfieSave = document.getElementById('btn-selfie-save');
    if (btnSelfieSave) {
        btnSelfieSave.addEventListener('click', () => {
            if (currentCapturedSelfie) {
                registeredSelfie = currentCapturedSelfie;
                localStorage.setItem('registered_selfie', registeredSelfie);
                updateAvatarUI();

                // Hide preview
                const previewContainer = document.getElementById('selfie-preview-container');
                if (previewContainer) previewContainer.style.display = 'none';

                alert("Biometric Face Registration Complete!\n\nYour face profile photo has been saved to the database. You can now perform attendance check-ins.");

                // Switch back to dashboard
                switchScreen('dashboard');
            }
        });
    }

    // Biometric match outcomes test buttons
    const simFaceMatch = document.getElementById('sim-face-match');
    const simFaceMismatch = document.getElementById('sim-face-mismatch');

    if (simFaceMatch) {
        simFaceMatch.addEventListener('click', () => {
            forceMismatch = false;
            simFaceMatch.classList.add('highlight');
            if (simFaceMismatch) simFaceMismatch.classList.remove('highlight');
        });
    }

    if (simFaceMismatch) {
        simFaceMismatch.addEventListener('click', () => {
            forceMismatch = true;
            simFaceMismatch.classList.add('highlight');
            if (simFaceMatch) simFaceMatch.classList.remove('highlight');
        });
    }

    // Initial GPS Sync
    syncGPSLocation(false);
});

// Update Simulated Android Clock
function updateDeviceClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    if (deviceTime) {
        deviceTime.textContent = `${hours}:${minutes}`;
    }
}

// Switch Screens inside Phone Container
function switchScreen(screenName) {
    // Clear scanning timers if leaving scan screen
    if (screenName !== 'facescan') {
        stopWebcamStream();
        if (simulatedScanInterval) {
            clearInterval(simulatedScanInterval);
            simulatedScanInterval = null;
        }
    }

    screens.forEach(screen => {
        screen.classList.remove('active');
        if (screen.id === `screen-${screenName}`) {
            screen.classList.add('active');

            // Screen specific load events
            if (screenName === 'facescan') {
                startFaceScanInitiation();
            } else if (screenName === 'dashboard') {
                updateDashboardScreenInfo();
                // Ensure leaflet map adjusts size when dashboard opens
                setTimeout(() => {
                    updateGPSMap();
                }, 100);
            } else if (screenName === 'history') {
                // Refresh calendar view
                const activeDayCell = document.querySelector('.cal-day-cell.selected');
                const selectedDay = activeDayCell ? parseInt(activeDayCell.dataset.day) : 23;
                showDayDetails(selectedDay);
            } else if (screenName === 'profile') {
                // Populate profile details from facultyMember
                const profName = document.getElementById('profile-full-name');
                const profId = document.getElementById('profile-faculty-id');
                const profDept = document.getElementById('profile-department');
                const profAvatar = document.getElementById('profile-avatar-img');
                const profBioBadge = document.getElementById('profile-bio-status-badge');

                if (profName) profName.textContent = facultyMember.name;
                if (profId) profId.textContent = facultyMember.facultyId;
                if (profDept) profDept.textContent = facultyMember.department;

                if (profAvatar && profBioBadge) {
                    if (registeredSelfie) {
                        profAvatar.src = registeredSelfie;
                        profBioBadge.innerHTML = `<i data-lucide="check-circle" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px; stroke: #10B981;"></i>Biometric Locked`;
                        profBioBadge.style.color = 'var(--color-success)';
                        profBioBadge.style.background = 'rgba(16, 185, 129, 0.1)';
                        profBioBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
                    } else {
                        // Offline-safe SVG fallback for avatar placeholder
                        profAvatar.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2364748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
                        profBioBadge.innerHTML = `<i data-lucide="alert-circle" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; margin-right: 4px; stroke: #EF4444;"></i>Biometrics Missing`;
                        profBioBadge.style.color = 'var(--color-danger)';
                        profBioBadge.style.background = 'rgba(239, 68, 68, 0.1)';
                        profBioBadge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
                    }
                }
                safeCreateIcons();
            }
        }
    });

    // Update highlights in bottom navigation buttons
    const bottomNavItems = document.querySelectorAll('.bottom-navbar .nav-item');
    bottomNavItems.forEach(item => {
        let expectedId = '';
        if (screenName === 'dashboard') expectedId = 'nav-dash';
        else if (screenName === 'history') expectedId = 'nav-history';
        else if (screenName === 'facescan') expectedId = 'nav-scan';
        else if (screenName === 'profile') expectedId = 'nav-profile';

        if (item.id === expectedId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update highlights in sidebar control buttons
    ctrlButtons.forEach(btn => {
        if (btn.getAttribute('data-screen') === screenName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Set up dates
function setDatesInDashboard() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // July 23, 2026 (According to current metadata clock time)
    const targetDate = new Date(2026, 6, 23); // July is index 6

    if (dashboardDay && dashboardDate) {
        dashboardDay.textContent = days[targetDate.getDay()];
        dashboardDate.textContent = `${months[targetDate.getMonth()]} ${targetDate.getDate()}, ${targetDate.getFullYear()}`;
    }
}

// Faculty Authentication
function handleManualLogin() {
    const facultyIdEl = document.getElementById('faculty-id');
    const facultyPasswordEl = document.getElementById('faculty-password');
    const loginErrorMessage = document.getElementById('login-error-message');

    const facultyIdVal = facultyIdEl ? facultyIdEl.value.trim() : '';
    const facultyPasswordVal = facultyPasswordEl ? facultyPasswordEl.value.trim() : '';

    if (!facultyIdVal) {
        alert('Please fill in your Faculty ID.');
        return;
    }
    if (!facultyPasswordVal) {
        alert('Please fill in your Password.');
        return;
    }

    // Attach real-time clear triggers
    if (facultyIdEl && !facultyIdEl.dataset.listenerBound) {
        facultyIdEl.dataset.listenerBound = 'true';
        facultyIdEl.addEventListener('input', () => {
            if (loginErrorMessage) loginErrorMessage.style.display = 'none';
            if (facultyPasswordEl) {
                facultyPasswordEl.style.borderColor = '';
                facultyPasswordEl.style.boxShadow = '';
            }
        });
    }
    if (facultyPasswordEl && !facultyPasswordEl.dataset.listenerBound) {
        facultyPasswordEl.dataset.listenerBound = 'true';
        facultyPasswordEl.addEventListener('input', () => {
            if (loginErrorMessage) loginErrorMessage.style.display = 'none';
            if (facultyPasswordEl) {
                facultyPasswordEl.style.borderColor = '';
                facultyPasswordEl.style.boxShadow = '';
            }
        });
    }

    // Check credentials match (case-insensitive for ID comparison)
    const isIdCorrect = (facultyIdVal.toLowerCase() === facultyMember.facultyId.toLowerCase());
    const isPasswordCorrect = (facultyPasswordVal === facultyMember.password);

    if (isIdCorrect && isPasswordCorrect) {
        isUserLoggedIn = true;
        localStorage.setItem('is_logged_in', 'true');
        localStorage.setItem('faculty_member', JSON.stringify(facultyMember));

        // Hide potential error state
        if (loginErrorMessage) loginErrorMessage.style.display = 'none';
        if (facultyPasswordEl) {
            facultyPasswordEl.style.borderColor = '';
            facultyPasswordEl.style.boxShadow = '';
        }

        updateDashboardScreenInfo();
        switchScreen('dashboard');
    } else {
        // Mark as incorrect
        if (loginErrorMessage) {
            loginErrorMessage.style.display = 'block';
            safeCreateIcons();
        }
        if (facultyPasswordEl) {
            facultyPasswordEl.style.borderColor = 'var(--color-danger)';
            facultyPasswordEl.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
        }
    }
}

function logoutFaculty() {
    isUserLoggedIn = false;
    localStorage.setItem('is_logged_in', 'false');
    attendanceStatus = 'Not Checked In';
    checkinTimeStr = '--:--';
    checkoutTimeStr = '--:--';

    // Reset GPS source to default on logout
    gpsSource = 'mock-campus';
    updateGPSControlsUI();
    syncGPSLocation(false);

    // Reset calendars & grids
    mockLogs[23] = { status: 'pending', checkin: '--:--', checkout: '--:--', confidence: '--' };

    // Reset Buttons
    actionCheckin.classList.remove('disabled');
    actionCheckout.classList.add('disabled');

    renderCalendar(23);
    updateDashboardScreenInfo();
    switchScreen('login');
}

// Dashboard Information Renderer
function updateDashboardScreenInfo() {
    if (!isUserLoggedIn) return;

    // Update profile block
    document.getElementById('faculty-name-main').textContent = facultyMember.name;
    document.getElementById('success-fac-name').textContent = facultyMember.name;

    // Dynamic stats computation from mockLogs
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let totalLogged = 0;

    for (const day in mockLogs) {
        const log = mockLogs[day];
        if (log && log.status !== 'pending') {
            totalLogged++;
            if (log.status === 'present') {
                presentCount++;
            } else if (log.status === 'late') {
                lateCount++;
            } else if (log.status === 'absent') {
                absentCount++;
            }
        }
    }

    const attendanceRate = totalLogged > 0 ? Math.round(((presentCount + lateCount) / totalLogged) * 100) : 0;

    // Update UI Stats elements
    const greenStat = document.querySelector('.quick-stats-grid .text-green');
    const orangeStat = document.querySelector('.quick-stats-grid .text-orange');
    const redStat = document.querySelector('.quick-stats-grid .text-red');

    if (greenStat) greenStat.textContent = presentCount;
    if (orangeStat) orangeStat.textContent = lateCount;
    if (redStat) redStat.textContent = absentCount;

    setAttendancePercentageRing(attendanceRate);

    // Status bubble presentation logic
    const statusBubble = document.getElementById('status-display-bubble');
    const statusTextDetail = document.getElementById('status-string-detail');

    if (attendanceStatus === 'Not Checked In') {
        statusBubble.className = 'status-alert-card status-out';
        statusTextDetail.textContent = 'Not checked in yet. Please log your presence.';
        actionCheckin.classList.remove('disabled');
        actionCheckout.classList.add('disabled');
    } else if (attendanceStatus === 'Checked In') {
        statusBubble.className = 'status-alert-card status-in';
        statusTextDetail.textContent = `Present • Checked In at ${checkinTimeStr}`;
        actionCheckin.classList.add('disabled');
        actionCheckout.classList.remove('disabled');
        actionCheckout.classList.remove('disabled-state');
    } else if (attendanceStatus === 'Checked Out') {
        statusBubble.className = 'status-alert-card status-out';
        statusTextDetail.textContent = `Shift Ended • Checked Out at ${checkoutTimeStr}`;
        actionCheckin.classList.add('disabled');
        actionCheckout.classList.add('disabled');
    }
}

// Real User Webcam Streams handling
async function startWebcamStream() {
    if (!isCameraStreamActive) return;

    try {
        const constraints = {
            video: {
                width: 300,
                height: 300,
                facingMode: 'user'
            },
            audio: false
        };

        activeWebcamStream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraStreamVideo.srcObject = activeWebcamStream;
        cameraStreamVideo.classList.add('active');
        webcamFallback.style.display = 'none';
    } catch (err) {
        console.warn('Real Camera Access Failed, fallback to simulated cyber mesh: ', err);
        stopWebcamStream();
    }
}

function stopWebcamStream() {
    if (activeWebcamStream) {
        activeWebcamStream.getTracks().forEach(track => track.stop());
        activeWebcamStream = null;
    }
    cameraStreamVideo.srcObject = null;
    cameraStreamVideo.classList.remove('active');
    webcamFallback.style.display = 'flex';
}

function toggleRealCameraStream() {
    isCameraStreamActive = !isCameraStreamActive;
    if (isCameraStreamActive) {
        toggleCameraBtn.classList.add('highlight');
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'screen-facescan') {
            startWebcamStream();
        }
    } else {
        toggleCameraBtn.classList.remove('highlight');
        stopWebcamStream();
    }
}

// Biometric Simulation Sequence
function startFaceScanInitiation() {
    // Hide selfie preview container overlay
    const previewContainer = document.getElementById('selfie-preview-container');
    if (previewContainer) previewContainer.style.display = 'none';

    // Clear laser scanner animations state
    const detectorBox = document.getElementById('scanning-detector-box');
    const laserScanner = document.getElementById('cam-laser-scanner');
    if (detectorBox) detectorBox.className = 'face-detection-overlay-box';
    if (laserScanner) laserScanner.className = 'laser-scanner-line';

    // Check registration state
    if (registeredSelfie) {
        const bioLabel = document.getElementById('biometric-flow-label');
        if (bioLabel) bioLabel.innerText = currentBiometricFlowMode === 'Check-In' ? 'Shift Check-In (Verify)' : 'Shift Check-Out (Verify)';
        const startHint = document.querySelector('.trigger-hint');
        if (startHint) startHint.innerText = 'Tap to Verify Biometrics';
        if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = 'Position your face inside the frame to verify';
    } else {
        const bioLabel = document.getElementById('biometric-flow-label');
        if (bioLabel) bioLabel.innerText = 'Register Profile Photo';
        const startHint = document.querySelector('.trigger-hint');
        if (startHint) startHint.innerText = 'Tap to Register Face';
        if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = 'Position your face inside the frame to register';
    }

    updateAvatarUI();
    if (trackingPointsLayer) trackingPointsLayer.innerHTML = '';

    if (isCameraStreamActive) {
        startWebcamStream();
    }

    // Auto trigger landmarks grid representation
    setTimeout(() => {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'screen-facescan') {
            if (detectorBox) detectorBox.classList.add('detected');
            if (laserScanner) laserScanner.classList.add('scanning');
            if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = 'Face Detected. Aligning...';
            generateSimulatedLandmarks(12);
        }
    }, 1200);

    // Auto advanced status transitions
    setTimeout(() => {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'screen-facescan') {
            if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = registeredSelfie ? 'Hold still. Matching biometric signature...' : 'Hold still. Generating face profile...';
            generateSimulatedLandmarks(25);
        }
    }, 2800);
}

// Helper to draw simulated tracking particles on face frame
function generateSimulatedLandmarks(count) {
    trackingPointsLayer.innerHTML = '';
    const frameRect = { w: 220, h: 250 };

    // Create random facial marker nodes mapped within screen box boundaries
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'cyan-tracker-landmark';

        // Relative spacing resembling cheeks, forehead, brows
        let relativeX, relativeY;
        if (i < count * 0.3) { // Center nose and brows
            relativeX = 110 + (Math.random() - 0.5) * 60;
            relativeY = 110 + (Math.random() - 0.5) * 60;
        } else if (i < count * 0.7) { // Eye regions
            relativeX = (i % 2 === 0 ? 70 : 150) + (Math.random() - 0.5) * 20;
            relativeY = 85 + (Math.random() - 0.5) * 20;
        } else { // Jaw contours
            relativeX = 110 + Math.sin(i) * 80;
            relativeY = 160 + Math.cos(i) * 50;
        }

        dot.style.left = `${relativeX}px`;
        dot.style.top = `${relativeY}px`;

        // Stagger animations scale
        dot.style.animationDelay = `${Math.random() * 1.5}s`;
        trackingPointsLayer.appendChild(dot);
    }
}

// Trigger state messages from testing dashboard
function triggerStatusEvent(msg, boxClass) {
    faceLiveStatusMessage.textContent = msg;
    const detectorBox = document.getElementById('scanning-detector-box');

    if (boxClass === 'detected') {
        detectorBox.className = 'face-detection-overlay-box detected';
    } else {
        detectorBox.className = 'face-detection-overlay-box';
    }
}

// Avatar UI Updater based on registered state
function updateAvatarUI() {
    const dashboardAvatarImg = document.getElementById('dashboard-avatar-img');
    const dashboardAvatarSvg = document.getElementById('dashboard-avatar-svg');
    const registeredBadge = document.getElementById('registered-badge');
    const registeredThumbImg = document.getElementById('registered-thumb-img');

    if (registeredSelfie) {
        if (dashboardAvatarImg) {
            dashboardAvatarImg.src = registeredSelfie;
            dashboardAvatarImg.style.display = 'block';
        }
        if (dashboardAvatarSvg) {
            dashboardAvatarSvg.style.display = 'none';
        }
        if (registeredBadge) {
            registeredBadge.style.display = 'flex';
        }
        if (registeredThumbImg) {
            registeredThumbImg.src = registeredSelfie;
        }
    } else {
        if (dashboardAvatarImg) {
            dashboardAvatarImg.style.display = 'none';
        }
        if (dashboardAvatarSvg) {
            dashboardAvatarSvg.style.display = 'block';
        }
        if (registeredBadge) {
            registeredBadge.style.display = 'none';
        }
    }
}

// Generate stylized simulated database selfie
function generateMockSelfieDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Draw background gradient
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(1, '#1A2F50');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    // Draw cyber grid
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 20; i < 300; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0); ctx.lineTo(i, 300);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i); ctx.lineTo(300, i);
        ctx.stroke();
    }

    // Draw scanning helper target
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(150, 150, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Draw head contour outline
    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(150, 150, 60, 80, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Draw face nodes (Eyes, Smile)
    ctx.fillStyle = '#00F2FE';
    ctx.beginPath();
    ctx.arc(125, 130, 6, 0, Math.PI * 2);
    ctx.arc(175, 130, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#00F2FE';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(150, 170, 30, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Tech watermark label
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BIOMETRIC MODEL REGISTERED', 150, 50);
    ctx.fillText('MATCH SCORE: 99.8%', 150, 250);

    return canvas.toDataURL('image/png');
}

// Captures video frame or generates mock selfie
function captureCameraSelfie() {
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('selfie-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');

    // Check if webcam stream is loaded and playing
    if (isCameraStreamActive && video && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        // Mirror the view on canvas
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        return canvas.toDataURL('image/png');
    } else {
        return generateMockSelfieDataURL();
    }
}

// Calculate average pixel difference between two base64 images (structural check)
function compareSelfieImages(imgDataURL1, imgDataURL2) {
    return new Promise((resolve) => {
        const img1 = new Image();
        const img2 = new Image();
        let loadedCount = 0;

        const onImageLoaded = () => {
            loadedCount++;
            if (loadedCount === 2) {
                const canvas1 = document.createElement('canvas');
                const canvas2 = document.createElement('canvas');
                canvas1.width = 32;
                canvas1.height = 32;
                canvas2.width = 32;
                canvas2.height = 32;

                const ctx1 = canvas1.getContext('2d');
                const ctx2 = canvas2.getContext('2d');

                ctx1.drawImage(img1, 0, 0, 32, 32);
                ctx2.drawImage(img2, 0, 0, 32, 32);

                const pixels1 = ctx1.getImageData(0, 0, 32, 32).data;
                const pixels2 = ctx2.getImageData(0, 0, 32, 32).data;

                let diffSum = 0;
                for (let i = 0; i < pixels1.length; i += 4) {
                    const dR = Math.abs(pixels1[i] - pixels2[i]);
                    const dG = Math.abs(pixels1[i + 1] - pixels2[i + 1]);
                    const dB = Math.abs(pixels1[i + 2] - pixels2[i + 2]);
                    diffSum += (dR + dG + dB) / 3;
                }

                const avgDiff = diffSum / 1024; // 32 * 32
                const diffPercentage = (avgDiff / 255) * 100;

                console.log(`Selfie structural difference calculated: ${diffPercentage.toFixed(2)}%`);
                resolve(diffPercentage);
            }
        };

        img1.onload = onImageLoaded;
        img2.onload = onImageLoaded;
        img1.onerror = () => resolve(100);
        img2.onerror = () => resolve(100);

        img1.src = imgDataURL1;
        img2.src = imgDataURL2;
    });
}

// Successful Face Verification Sequence
function triggerBiometricVerification() {
    const detectorBox = document.getElementById('scanning-detector-box');
    const laserScanner = document.getElementById('cam-laser-scanner');

    // Geo-Fence validation Gate Check
    if (!isInsideGeofence) {
        if (detectorBox) {
            detectorBox.className = 'face-detection-overlay-box';
            detectorBox.style.borderColor = 'var(--color-danger)';
            detectorBox.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.6)';
        }
        if (faceLiveStatusMessage) {
            faceLiveStatusMessage.innerHTML = `<span style="color: var(--color-danger); font-weight: 800;"><i data-lucide="shield-alert" style="width:12px; height:12px; display:inline-block; vertical-align:middle;"></i> GEOFENCE OUT OF RANGE</span>`;
        }
        safeCreateIcons();

        alert(`Biometric Check-In Failed!\n\nGPS location verification failed. You are currently located at:\n"${gpsPlaceName}"\n\nThis is outside the authorized campus zone. Distance: ${gpsDetailsDistance ? gpsDetailsDistance.textContent : 'Out of bounds'}.\n\nPlease ensure you are physically present on campus inside the ${GEOFENCE_RADIUS_METERS}m geofence area to register.`);

        setTimeout(() => {
            if (detectorBox) {
                detectorBox.style.borderColor = '';
                detectorBox.style.boxShadow = '';
            }
            if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = 'Position your face inside the frame';
        }, 4000);
        return;
    }

    // 1. First-time registration flow
    if (!registeredSelfie) {
        // Capture photo snapshot
        currentCapturedSelfie = captureCameraSelfie();

        // Pause and display selfie preview confirmation
        const previewContainer = document.getElementById('selfie-preview-container');
        const previewImg = document.getElementById('selfie-preview-img');

        if (previewContainer && previewImg) {
            previewImg.src = currentCapturedSelfie;
            previewContainer.style.display = 'flex';

            // Stop scanning and webcam
            stopWebcamStream();
            if (detectorBox) detectorBox.className = 'face-detection-overlay-box';
            if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = 'Confirm your face profile photo';
        }
        return;
    }

    // 2. Subsequent day verification flow (registeredSelfie is not null)
    const liveCapturedSelfie = captureCameraSelfie();

    // Compare live selfie with the registered reference picture
    compareSelfieImages(registeredSelfie, liveCapturedSelfie).then((diffPercentage) => {
        const isMismatch = forceMismatch || (diffPercentage > 18.0);

        if (isMismatch) {
            // Mismatch Detected
            if (detectorBox) detectorBox.className = 'face-detection-overlay-box error_boundary';
            if (detectorBox) {
                detectorBox.style.borderColor = '#EF4444';
                detectorBox.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.5), 0 0 0 9999px rgba(3, 7, 18, 0.6)';
            }
            if (faceLiveStatusMessage) {
                faceLiveStatusMessage.innerHTML = `<span style="color: var(--color-danger); font-weight: 800;"><i data-lucide="x-circle" style="width:12px; height:12px; display:inline-block; vertical-align:middle; stroke: #EF4444;"></i> FACE VERIFIED UNSUCCESSFULLY</span>`;
            }
            safeCreateIcons();

            alert(`Biometric Verification Failed!\n\nFace verification unsuccessful. The captured biometric profile does not match the registered user signature in the database.\n\nVariance: ${diffPercentage.toFixed(1)}% (Threshold: 18%)`);

            setTimeout(() => {
                if (detectorBox) {
                    detectorBox.className = 'face-detection-overlay-box';
                    detectorBox.style.borderColor = '';
                    detectorBox.style.boxShadow = '';
                }
                if (faceLiveStatusMessage) faceLiveStatusMessage.textContent = 'Position your face inside the frame';
            }, 3000);
            return;
        }

        // Match Simulation (Success)
        if (detectorBox) {
            detectorBox.className = 'face-detection-overlay-box success';
            detectorBox.style.borderColor = '';
            detectorBox.style.boxShadow = '';
        }
        if (faceLiveStatusMessage) {
            faceLiveStatusMessage.innerHTML = `<span style="color: var(--color-success); font-weight: 800;"><i data-lucide="check-circle" style="width:12px; height:12px; display:inline-block; vertical-align:middle; stroke: #10B981;"></i> FACE VERIFIED SUCCESSFULLY</span>`;
        }
        safeCreateIcons();

        // Stop camera streams
        stopWebcamStream();

        setTimeout(() => {
            // Log in user if login process
            isUserLoggedIn = true;

            const now = new Date();
            let hour = now.getHours();
            let minutes = now.getMinutes();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12;
            hour = hour ? hour : 12; // zero hour is 12
            minutes = minutes < 10 ? '0' + minutes : minutes;
            const scanTimestamp = `July 23, 2026 • ${hour}:${minutes} ${ampm}`;

            if (currentBiometricFlowMode === 'Check-In') {
                attendanceStatus = 'Checked In';
                checkinTimeStr = `${hour}:${minutes} ${ampm}`;

                // Update July 23 Mock Log in real time
                mockLogs[23] = {
                    status: 'present',
                    checkin: checkinTimeStr,
                    checkout: '--:--',
                    confidence: '99.8%'
                };
            } else {
                attendanceStatus = 'Checked Out';
                checkoutTimeStr = `${hour}:${minutes} ${ampm}`;

                // Update July 23 Mock Log in real time
                mockLogs[23].checkout = checkoutTimeStr;
            }

            // Write to success screen elements
            if (successTimestamp) {
                successTimestamp.innerHTML = `<i data-lucide="clock" style="width: 12px; height: 12px; display: inline-block; vertical-align: middle; stroke: #3B82F6;"></i> ${scanTimestamp}`;
            }

            // Write dynamic location data
            if (successVerifiedLocation) {
                successVerifiedLocation.innerHTML = `<i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline; vertical-align: middle; stroke: #10B981;"></i> ${gpsPlaceName.split(',')[0]} (GPS Verified)`;
            }

            // Refresh calendars and update
            renderCalendar(23);
            updateDashboardScreenInfo();
            safeCreateIcons();

            // Switch to success screen
            switchScreen('success');
        }, 1800);
    });
}

// Render clean Interactive Calendar Grid
function renderCalendar(selectedDay) {
    if (!calendarDaysContainer) return;
    calendarDaysContainer.innerHTML = '';

    // July 2026 starts on Wednesday (Index 3: S(0), M(1), T(2), W(3))
    const totalDays = 31;
    const startOffset = 3;

    // Render preceding days offsets (blank/inactive cells)
    for (let i = 0; i < startOffset; i++) {
        const blankCell = document.createElement('div');
        blankCell.className = 'cal-day-cell inactive';
        calendarDaysContainer.appendChild(blankCell);
    }

    // Render actual month days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'cal-day-cell';
        dayCell.textContent = dayNum;
        dayCell.dataset.day = dayNum;

        // Custom Class Decorators based on log status
        const log = mockLogs[dayNum];

        // Weekends check (Saturdays & Sundays)
        // Offset + dayNum gives positioning. If pos % 7 is 0 (Sat) or 1 (Sun)
        const cellPosition = startOffset + dayNum;
        const isWeekend = (cellPosition % 7 === 4) || (cellPosition % 7 === 5); // 0 corresponds to Sat in offset grid starting Wed
        // Wait, cellPosition index is 4: Saturday, 5: Sunday. Let's calculate exactly:
        // Wed is cellPosition 4 (3 offset + 1 day). 
        // Sunday: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6.
        // If (startOffset + dayNum - 1) % 7 is 0 (Sun) or 6 (Sat)
        const weekdayIndex = (startOffset + dayNum - 1) % 7;
        const dayIsWeekend = (weekdayIndex === 0 || weekdayIndex === 6);

        if (dayNum > 23) {
            dayCell.classList.add('inactive'); // Future Days
        } else if (dayNum === 23) {
            dayCell.classList.add('today');
            if (attendanceStatus === 'Checked In' || attendanceStatus === 'Checked Out') {
                dayCell.classList.add('present');
            } else {
                dayCell.classList.add('late'); // Fallback style
            }
        } else if (dayIsWeekend) {
            dayCell.classList.add('inactive'); // Weekend Off
        } else if (log) {
            if (log.status === 'present') {
                dayCell.classList.add('present');
            } else if (log.status === 'late') {
                dayCell.classList.add('late');
            } else if (log.status === 'absent') {
                dayCell.classList.add('absent');
            }
        }

        // Draw dot indicators
        if (dayNum <= 23 && !dayIsWeekend) {
            const dot = document.createElement('span');
            dot.className = 'day-status-dot';
            dayCell.appendChild(dot);
        }

        if (dayNum === selectedDay) {
            dayCell.classList.add('selected');
        }

        // Cell Tap event handler
        if (dayNum <= 23 && !dayIsWeekend) {
            dayCell.addEventListener('click', () => {
                document.querySelectorAll('.cal-day-cell').forEach(cell => cell.classList.remove('selected'));
                dayCell.classList.add('selected');
                showDayDetails(dayNum);
            });
        }

        calendarDaysContainer.appendChild(dayCell);
    }
}

// Show detailed stats of selected day below calendar
function showDayDetails(day) {
    if (!historyLogsContainer) return;
    historyLogsContainer.innerHTML = '';

    const weekdayIndex = (3 + day - 1) % 7; // startOffset = 3 (Wednesday)
    const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const selectedDayName = daysArr[weekdayIndex];

    const log = mockLogs[day];

    if (day === 23 && attendanceStatus === 'Not Checked In') {
        historyLogsContainer.innerHTML = `
            <div class="status-alert-card status-out" style="margin: 0; width: 100%;">
                <i data-lucide="circle-alert" style="stroke: var(--color-warning);"></i>
                <div class="status-bubble-text">
                    <span class="status-title-tag">July 23, 2026 (${selectedDayName})</span>
                    <p style="font-size: 11px; margin-top:2px;">No attendance logged for today yet.</p>
                </div>
            </div>
        `;
        safeCreateIcons();
        return;
    }

    if (log) {
        const cardColorLabel = log.status === 'present' ? 'badge-present' : (log.status === 'late' ? 'badge-late' : 'badge-absent');
        const statusText = log.status.charAt(0).toUpperCase() + log.status.slice(1);
        const statusColor = log.status === 'present' ? 'text-green' : 'text-orange';

        historyLogsContainer.innerHTML = `
            <div class="log-item-card">
                <div class="log-left-block">
                    <span class="log-indicator-badge ${cardColorLabel}"></span>
                    <div class="log-details">
                        <h5>July ${day}, 2026 (${selectedDayName})</h5>
                        <p><i data-lucide="shield" style="width: 10px; height: 10px; display:inline; vertical-align: middle; stroke: #94A3B8;"></i> Match Confidence: ${log.confidence}</p>
                    </div>
                </div>
                <div class="log-right-block">
                    <span class="log-checkin-time">${log.checkin}</span>
                    <p class="log-status-lbl ${statusColor}">${statusText}</p>
                </div>
            </div>
            ${log.checkout !== '--:--' ? `
            <div class="log-item-card" style="margin-top: -4px;">
                <div class="log-left-block" style="opacity: 0.85;">
                    <span class="log-indicator-badge" style="background: #64748B;"></span>
                    <div class="log-details">
                        <h5>Shift Checkout Registered</h5>
                        <p><i data-lucide="map-pin" style="width: 10px; height: 10px; display:inline; vertical-align: middle;"></i> SVPCET main office</p>
                    </div>
                </div>
                <div class="log-right-block">
                    <span class="log-checkin-time">${log.checkout}</span>
                    <p class="log-status-lbl" style="color: #64748B;">Closed</p>
                </div>
            </div>` : ''}
        `;
    }

    safeCreateIcons();
}

// Adjust Gauge ring properties
function setAttendancePercentageRing(percent) {
    if (!percentageRing) return;
    const radius = 42;
    const circumference = 2 * Math.PI * radius; // 263.89
    const offset = circumference - (percent / 100) * circumference;
    percentageRing.style.strokeDasharray = `${circumference}`;
    percentageRing.style.strokeDashoffset = `${offset}`;
    document.getElementById('attendance-percent-val').textContent = `${percent}%`;
}

// Calculate distance between two coordinates using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // distance in meters
}

// Update GPS location source and synchronize UI
function setGpsSource(source) {
    gpsSource = source;
    updateGPSControlsUI();
    syncGPSLocation(true);
}

// Update desktop CSS button highlighting for GPS simulation
function updateGPSControlsUI() {
    if (simGpsCampus) simGpsCampus.classList.remove('highlight');
    if (simGpsRemote) simGpsRemote.classList.remove('highlight');
    if (simGpsReal) simGpsReal.classList.remove('highlight');

    if (gpsSource === 'mock-campus' && simGpsCampus) {
        simGpsCampus.classList.add('highlight');
    } else if (gpsSource === 'mock-remote' && simGpsRemote) {
        simGpsRemote.classList.add('highlight');
    } else if (gpsSource === 'real' && simGpsReal) {
        simGpsReal.classList.add('highlight');
    }
}

// Refresh, geocode and check Geofencing zone status
function syncGPSLocation(showSpinner = true) {
    if (showSpinner && btnRefreshGps) {
        btnRefreshGps.classList.add('spinning');
        btnRefreshGps.querySelector('span').textContent = 'Syncing...';
    }
    if (gpsStatusPill) {
        gpsStatusPill.className = 'gps-status-pill checking';
        gpsStatusText.textContent = 'Syncing...';
    }

    const applyGPSStatus = () => {
        const dist = getDistance(currentCoords.lat, currentCoords.lon, campusCenter.lat, campusCenter.lon);
        isInsideGeofence = dist <= GEOFENCE_RADIUS_METERS;

        // Update coordinate printout
        if (gpsCoordinatesText) {
            gpsCoordinatesText.textContent = `Lat: ${currentCoords.lat.toFixed(6)}, Lon: ${currentCoords.lon.toFixed(6)}`;
        }

        // Update place name description
        if (gpsDetailsPlace) {
            gpsDetailsPlace.textContent = gpsPlaceName;
        }

        // Update distance reading
        if (gpsDetailsDistance) {
            if (dist < 10) {
                gpsDetailsDistance.textContent = `${dist.toFixed(1)}m (Campus Center)`;
            } else if (dist < 1000) {
                gpsDetailsDistance.textContent = `${dist.toFixed(0)}m from Center`;
            } else {
                gpsDetailsDistance.textContent = `${(dist / 1000).toFixed(2)} km away`;
            }
        }

        // Update pill state
        if (gpsStatusPill) {
            if (isInsideGeofence) {
                gpsStatusPill.className = 'gps-status-pill in-zone';
                gpsStatusText.textContent = 'In Zone';
            } else {
                gpsStatusPill.className = 'gps-status-pill out-zone';
                gpsStatusText.textContent = 'Out of Zone';
            }
        }

        // Update header campus location badge dynamically
        if (dashboardLocationBadge) {
            const shortPlaceName = gpsPlaceName.split(',')[0];
            dashboardLocationBadge.innerHTML = `<i data-lucide="${isInsideGeofence ? 'map-pin' : 'alert-circle'}"></i> <span>${shortPlaceName}</span>`;
            dashboardLocationBadge.style.color = isInsideGeofence ? 'var(--color-success)' : 'var(--color-danger)';
            dashboardLocationBadge.style.background = isInsideGeofence ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';
            dashboardLocationBadge.style.borderColor = isInsideGeofence ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
            safeCreateIcons();
        }

        // Update Facescan page lock status
        if (facescanGpsText) {
            const shortName = gpsPlaceName.split(',')[0];
            facescanGpsText.innerHTML = `<i data-lucide="map-pinned"></i> GPS: ${shortName} (${isInsideGeofence ? 'In-Zone' : 'Out-of-Zone'})`;
            safeCreateIcons();
        }
        if (fsGpsDot) {
            fsGpsDot.style.background = isInsideGeofence ? 'var(--color-success)' : 'var(--color-danger)';
        }

        // Apply visual button disabled state for Attendance buttons
        if (actionCheckin && actionCheckout) {
            if (!isInsideGeofence) {
                actionCheckin.classList.add('disabled-state');
                // Don't disable checkout if they are already checked in?
                // Actually, typically they must check out in campus too, but let's disable both as standard check requirements.
                actionCheckout.classList.add('disabled-state');
            } else {
                if (attendanceStatus !== 'Checked In' && attendanceStatus !== 'Checked Out') {
                    actionCheckin.classList.remove('disabled-state');
                    actionCheckout.classList.add('disabled-state');
                } else if (attendanceStatus === 'Checked In') {
                    actionCheckin.classList.add('disabled-state');
                    actionCheckout.classList.remove('disabled-state');
                } else {
                    actionCheckin.classList.add('disabled-state');
                    actionCheckout.classList.add('disabled-state');
                }
            }
        }

        // Render map view
        updateGPSMap();

        // Clear refresh button spinner
        if (showSpinner && btnRefreshGps) {
            setTimeout(() => {
                btnRefreshGps.classList.remove('spinning');
                btnRefreshGps.querySelector('span').textContent = 'Sync Coordinates';
            }, 600);
        }
    };

    if (gpsSource === 'mock-campus') {
        const jitterLat = (Math.random() - 0.5) * 0.0000005;
        const jitterLon = (Math.random() - 0.5) * 0.0000005;
        currentCoords.lat = campusCenter.lat + jitterLat;
        currentCoords.lon = campusCenter.lon + jitterLon;
        gpsAccuracy = 1.0;
        gpsPlaceName = "Your Exact Physical Spot (SVPCET Puttur)";
        setTimeout(applyGPSStatus, showSpinner ? 800 : 50);
    } else if (gpsSource === 'mock-remote') {
        const jitterLat = (Math.random() - 0.5) * 0.0004;
        const jitterLon = (Math.random() - 0.5) * 0.0004;
        currentCoords.lat = 13.6288 + jitterLat;
        currentCoords.lon = 79.4192 + jitterLon;
        gpsAccuracy = 21.3;
        gpsPlaceName = "Tirupati Junction Railway Station, Tirupati, Andhra Pradesh, India";
        setTimeout(applyGPSStatus, showSpinner ? 800 : 50);
    } else if (gpsSource === 'real') {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser status.");
            gpsSource = 'mock-campus';
            updateGPSControlsUI();
            syncGPSLocation(showSpinner);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentCoords.lat = position.coords.latitude;
                currentCoords.lon = position.coords.longitude;
                gpsAccuracy = position.coords.accuracy;
                gpsPlaceName = `Coordinates (${currentCoords.lat.toFixed(4)}, ${currentCoords.lon.toFixed(4)})`;

                // Fetch real location details from OpenStreetMap reverse geocoding API
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentCoords.lat}&lon=${currentCoords.lon}&zoom=18`, {
                    headers: { 'Accept-Language': 'en' }
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.display_name) {
                            gpsPlaceName = data.display_name;
                        } else if (data && data.address) {
                            const parts = [];
                            if (data.address.road) parts.push(data.address.road);
                            if (data.address.suburb) parts.push(data.address.suburb);
                            if (data.address.city) parts.push(data.address.city);
                            if (data.address.state) parts.push(data.address.state);
                            if (parts.length > 0) gpsPlaceName = parts.join(', ');
                        }
                        applyGPSStatus();
                    })
                    .catch(err => {
                        console.warn("Reverse Geocoding Search Failed:", err);
                        applyGPSStatus();
                    });
            },
            (error) => {
                console.error("GPS API Error:", error);
                let message = "Position Unavailable.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Location permission denied. Reverting to campus mock mode.";
                } else if (error.code === error.TIMEOUT) {
                    message = "Location request timed out. Reverting to campus mock mode.";
                }
                alert(`Device GPS Error: ${message}`);
                gpsSource = 'mock-campus';
                updateGPSControlsUI();
                syncGPSLocation(showSpinner);
            },
            { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
        );
    }
}

// Create or update Leaflet map wrapper
function updateGPSMap() {
    if (typeof L === 'undefined') return;

    if (!gpsMap) {
        try {
            gpsMap = L.map('dashboard-gps-map', {
                zoomControl: false,
                attributionControl: false
            }).setView([currentCoords.lat, currentCoords.lon], 18);

            // Add Dark Matter theme cartodb tile layers
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 20
            }).addTo(gpsMap);

            // Geofence Circle overlay around Puttur Campus
            geofenceCircle = L.circle([campusCenter.lat, campusCenter.lon], {
                color: '#4F46E5',
                fillColor: '#00F2FE',
                fillOpacity: 0.1,
                radius: GEOFENCE_RADIUS_METERS,
                weight: 1.5,
                dashArray: '3, 6'
            }).addTo(gpsMap);

            // User pin
            const pulseClass = isInsideGeofence ? 'gps-pulse-marker' : 'gps-pulse-marker-out';
            const pulseIcon = L.divIcon({
                className: pulseClass,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            gpsMarker = L.marker([currentCoords.lat, currentCoords.lon], { icon: pulseIcon }).addTo(gpsMap);
        } catch (e) {
            console.error("Map rendering error: ", e);
        }
    } else {
        try {
            gpsMap.setView([currentCoords.lat, currentCoords.lon], 18);
            gpsMarker.setLatLng([currentCoords.lat, currentCoords.lon]);
            if (geofenceCircle) {
                geofenceCircle.setLatLng([campusCenter.lat, campusCenter.lon]);
                geofenceCircle.setRadius(GEOFENCE_RADIUS_METERS);
            }

            const pulseClass = isInsideGeofence ? 'gps-pulse-marker' : 'gps-pulse-marker-out';
            const pulseIcon = L.divIcon({
                className: pulseClass,
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            gpsMarker.setIcon(pulseIcon);
        } catch (e) {
            console.warn("Map update error: ", e);
        }
    }

    // Invalidate size to trigger redraw inside hidden container
    setTimeout(() => {
        if (gpsMap) {
            try {
                gpsMap.invalidateSize();
            } catch (err) { }
        }
    }, 100);
}

