/* ==========================================================================
   MediCare AI - Interactive Application Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const searchTrigger = document.getElementById('search-trigger');
    const searchModal = document.getElementById('search-modal');
    const closeSearchModal = document.getElementById('close-search-modal');
    const searchInput = document.getElementById('search-input');

    const symptomModal = document.getElementById('symptom-modal');
    const closeSymptomModal = document.getElementById('close-symptom-modal');
    const cancelSymptom = document.getElementById('cancel-symptom');
    const analyzeBtn = document.getElementById('analyze-symptom-btn');
    const symptomInput = document.getElementById('symptom-input');
    const aiResponseBox = document.getElementById('ai-response-box');
    const aiAnalyzing = document.getElementById('ai-analyzing');
    const aiResult = document.getElementById('ai-result');

    const navCtaBtn = document.getElementById('nav-cta-btn');
    const heroGetStarted = document.getElementById('hero-get-started');
    const heroLearnMore = document.getElementById('hero-learn-more');

    const dockSymptom = document.getElementById('dock-symptom-check');
    const dockAssessment = document.getElementById('dock-assessment');
    const dockConsult = document.getElementById('dock-consult');
    const dockSpecialized = document.getElementById('dock-specialized');

    const toast = document.getElementById('toast-notif');

    // Helper: Show Toast
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    // Modal Control Helpers
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event Listeners for Search
    if (searchTrigger) {
        searchTrigger.addEventListener('click', () => {
            openModal(searchModal);
            setTimeout(() => searchInput && searchInput.focus(), 100);
        });
    }

    if (closeSearchModal) {
        closeSearchModal.addEventListener('click', () => closeModal(searchModal));
    }

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) closeModal(searchModal);
    });

    const abhaModal = document.getElementById('abha-modal');
    const closeAbhaModal = document.getElementById('close-abha-modal');
    const cancelAbha = document.getElementById('cancel-abha');
    const verifyAbhaBtn = document.getElementById('verify-abha-btn');
    const verifyBtnText = document.getElementById('verify-btn-text');
    const abhaInput = document.getElementById('abha-input');
    const abhaResponseBox = document.getElementById('abha-response-box');
    const abhaVerifying = document.getElementById('abha-verifying');
    const abhaResult = document.getElementById('abha-result');
    const patientName = document.getElementById('patient-name');
    const patientAbhaNum = document.getElementById('patient-abha-num');
    const patientDemo = document.getElementById('patient-demo');
    const patientRecords = document.getElementById('patient-records');

    let isAbhaVerified = false;

    // Modal Control Helpers for ABHA ID
    const openAbhaModal = () => {
        if (searchModal && searchModal.classList.contains('active')) closeModal(searchModal);
        openModal(abhaModal);
        setTimeout(() => abhaInput && abhaInput.focus(), 100);
    };

    window.openAbhaModal = openAbhaModal;

    // Attach ABHA modal to "Get Started" buttons
    if (navCtaBtn) navCtaBtn.addEventListener('click', openAbhaModal);
    if (heroGetStarted) heroGetStarted.addEventListener('click', openAbhaModal);

    if (closeAbhaModal) closeAbhaModal.addEventListener('click', () => closeModal(abhaModal));
    if (cancelAbha) cancelAbha.addEventListener('click', () => closeModal(abhaModal));

    if (abhaModal) {
        abhaModal.addEventListener('click', (e) => {
            if (e.target === abhaModal) closeModal(abhaModal);
        });
    }

    // Quick tag filler for ABHA
    window.fillAbha = (text) => {
        if (abhaInput) {
            abhaInput.value = text;
            abhaInput.focus();
        }
    };

    // Status Page View Elements
    const statusPage = document.getElementById('status-page');
    const statusGoBack = document.getElementById('status-go-back');
    const btnStatusNew = document.getElementById('btn-status-new');
    const btnStatusOngoing = document.getElementById('btn-status-ongoing');
    const btnStatusSos = document.getElementById('btn-status-sos');

    function openStatusPage() {
        if (statusPage) {
            statusPage.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeStatusPage() {
        if (statusPage) {
            statusPage.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (statusGoBack) {
        statusGoBack.addEventListener('click', closeStatusPage);
    }


    if (btnStatusOngoing) {
        btnStatusOngoing.addEventListener('click', () => {
            showToast('Fetching On-going Medical Records & Prescriptions...');
        });
    }

    if (btnStatusSos) {
        btnStatusSos.addEventListener('click', () => {
            showToast('🚨 SOS Emergency Alert! Connecting to MediCare Emergency Response...');
        });
    }

    // ABHA Auth Tabs Handling
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const mode = tab.getAttribute('data-tab');
            if (abhaInput) {
                if (mode === 'number') {
                    abhaInput.placeholder = 'e.g. 91-4820-1928-3746 (14-Digit ABHA)';
                } else if (mode === 'address') {
                    abhaInput.placeholder = 'e.g. rahul.verma@abdm or priya@abdm';
                } else if (mode === 'aadhaar') {
                    abhaInput.placeholder = 'e.g. 7482-9182-4019 (Aadhaar Linked)';
                }
                abhaInput.focus();
            }
        });
    });

    // ABHA Verification Trigger with 10X Telemetry Pipeline
    if (verifyAbhaBtn) {
        verifyAbhaBtn.addEventListener('click', () => {
            if (isAbhaVerified) {
                closeModal(abhaModal);
                openStatusPage();
                showToast(`Welcome, ${patientName ? patientName.textContent : 'Patient'}! Select your status.`);
                return;
            }

            const idVal = abhaInput ? abhaInput.value.trim() : '';
            if (!idVal) {
                showToast('Please enter a valid Patient ABHA ID or ABHA Address.');
                return;
            }

            const stageTitle = document.getElementById('extraction-stage-title');
            const stageSub = document.getElementById('extraction-stage-sub');
            const progressFill = document.getElementById('extraction-progress-fill');
            const tel1 = document.getElementById('tel-step-1');
            const tel2 = document.getElementById('tel-step-2');
            const tel3 = document.getElementById('tel-step-3');

            abhaResponseBox.style.display = 'block';
            abhaVerifying.style.display = 'flex';
            abhaResult.style.display = 'none';

            if (progressFill) progressFill.style.width = '15%';
            if (tel1) { tel1.className = 'telemetry-item active'; }
            if (tel2) { tel2.className = 'telemetry-item'; }
            if (tel3) { tel3.className = 'telemetry-item'; }

            if (stageTitle) stageTitle.textContent = 'Connecting to Ayushman Bharat Gateway...';
            if (stageSub) stageSub.textContent = 'Validating NDHM digital certificate & token...';

            setTimeout(() => {
                if (progressFill) progressFill.style.width = '55%';
                if (tel1) { tel1.className = 'telemetry-item done'; }
                if (tel2) { tel2.className = 'telemetry-item active'; }
                if (stageTitle) stageTitle.textContent = 'Decrypting FHIR Electronic Health Records...';
                if (stageSub) stageSub.textContent = 'Retrieving encrypted HL7 diagnostic encounters & lab panels...';
            }, 500);

            setTimeout(() => {
                if (progressFill) progressFill.style.width = '85%';
                if (tel2) { tel2.className = 'telemetry-item done'; }
                if (tel3) { tel3.className = 'telemetry-item active'; }
                if (stageTitle) stageTitle.textContent = 'Synchronizing Health Locker & Consent Layer...';
                if (stageSub) stageSub.textContent = 'Tier-1 Patient Consent validated. Compiling clinical summary.';
            }, 1000);

            setTimeout(() => {
                if (progressFill) progressFill.style.width = '100%';
                if (tel3) { tel3.className = 'telemetry-item done'; }

                setTimeout(() => {
                    abhaVerifying.style.display = 'none';
                    abhaResult.style.display = 'block';
                    isAbhaVerified = true;

                    if (idVal.toLowerCase().includes('priya')) {
                        if (patientName) patientName.textContent = 'Priya Sharma';
                        if (patientAbhaNum) patientAbhaNum.textContent = '72-9104-8372-1092';
                        if (patientDemo) patientDemo.textContent = 'Female, 28 Yrs (B+ Rh+)';
                        if (patientRecords) patientRecords.textContent = '2 Hospital Encounters';
                    } else if (idVal.toLowerCase().includes('rahul') || idVal.includes('4820')) {
                        if (patientName) patientName.textContent = 'Rahul Verma';
                        if (patientAbhaNum) patientAbhaNum.textContent = '91-4820-1928-3746';
                        if (patientDemo) patientDemo.textContent = 'Male, 32 Yrs (O+ Rh+)';
                        if (patientRecords) patientRecords.textContent = '4 Hospital Encounters';
                    } else {
                        if (patientName) patientName.textContent = 'Verified Patient';
                        if (patientAbhaNum) patientAbhaNum.textContent = idVal;
                        if (patientDemo) patientDemo.textContent = 'Adult Patient (Verified)';
                        if (patientRecords) patientRecords.textContent = '1 Linked Record';
                    }

                    if (verifyBtnText) verifyBtnText.textContent = 'Proceed to Consultation';
                    showToast('✓ ABHA Identity Verified & 4 Encounters Synced!');
                }, 300);
            }, 1500);
        });
    }

    // Event Listeners for Symptom Checker Modal
    const openSymptomChecker = () => {
        if (searchModal.classList.contains('active')) closeModal(searchModal);
        openModal(symptomModal);
    };

    window.openSymptomChecker = openSymptomChecker;

    if (dockSymptom) dockSymptom.addEventListener('click', openSymptomChecker);

    if (closeSymptomModal) closeSymptomModal.addEventListener('click', () => closeModal(symptomModal));
    if (cancelSymptom) cancelSymptom.addEventListener('click', () => closeModal(symptomModal));

    symptomModal.addEventListener('click', (e) => {
        if (e.target === symptomModal) closeModal(symptomModal);
    });

    // Quick tag filler for Symptoms
    window.fillSymptom = (text) => {
        if (symptomInput) {
            symptomInput.value = text;
            symptomInput.focus();
        }
    };

    // AI Symptom Analysis Trigger
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const query = symptomInput ? symptomInput.value.trim() : '';
            if (!query) {
                showToast('Please describe your symptoms first.');
                return;
            }

            aiResponseBox.style.display = 'block';
            aiAnalyzing.style.display = 'flex';
            aiResult.style.display = 'none';

            setTimeout(() => {
                aiAnalyzing.style.display = 'none';
                aiResult.style.display = 'block';
                showToast('AI Assessment Generated');
            }, 1600);
        });
    }

    // Other Dock Actions
    if (dockAssessment) {
        dockAssessment.addEventListener('click', () => {
            showToast('Launching Full Health Assessment Engine...');
            openSymptomChecker();
        });
    }

    if (dockConsult) {
        dockConsult.addEventListener('click', () => {
            showToast('Connecting with AI Healthcare Specialist...');
        });
    }

    window.openConsultModal = () => {
        showToast('Opening Specialist Consultation Scheduler');
    };

    if (dockSpecialized) {
        dockSpecialized.addEventListener('click', () => {
            showToast('Accessing Specialized Care Network...');
        });
    }

    if (heroLearnMore) {
        heroLearnMore.addEventListener('click', () => {
            showToast('MediCare AI Platform Tour Starting...');
        });
    }

    // Active Navigation Highlight on Scroll
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
