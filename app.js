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

    // ==========================================================================
    // Application State Persistence Helpers (Survives Page Reloads)
    // ==========================================================================
    function saveAppState(viewName, additionalData = {}) {
        try {
            const currentSaved = JSON.parse(sessionStorage.getItem('medicare_app_state') || '{}');
            const state = {
                ...currentSaved,
                view: viewName || 'home',
                step: typeof currentStep !== 'undefined' ? currentStep : 1,
                demoKey: typeof activeDemoKey !== 'undefined' ? activeDemoKey : 'rahul',
                isAbhaVerified: typeof isAbhaVerified !== 'undefined' ? isAbhaVerified : false,
                abhaVal: (abhaInput ? abhaInput.value.trim() : '') || currentSaved.abhaVal || '91-4820-1928-3746',
                patientName: (patientName ? patientName.textContent.trim() : '') || currentSaved.patientName || 'Rahul Verma',
                hasScannedDocs: typeof hasScannedDocs !== 'undefined' ? hasScannedDocs : false,
                scannedDocType: typeof scannedDocType !== 'undefined' ? scannedDocType : 'rx',
                patientSymptoms: (arogyaResponseText ? arogyaResponseText.value : '') || currentSaved.patientSymptoms || '',
                duration: typeof selectedDuration !== 'undefined' ? selectedDuration : '1-2 days',
                severity: typeof selectedSeverity !== 'undefined' ? selectedSeverity : 'Moderate',
                ...additionalData
            };
            sessionStorage.setItem('medicare_app_state', JSON.stringify(state));

            // Sync URL hash for bookmarks and reloads
            if (viewName && viewName !== 'home') {
                if (window.location.hash !== '#' + viewName) {
                    history.replaceState(null, '', '#' + viewName);
                }
            } else {
                if (window.location.hash) {
                    history.replaceState(null, '', window.location.pathname);
                }
            }
        } catch (e) {
            console.warn('Could not save state to sessionStorage:', e);
        }
    }

    function clearAppState() {
        try {
            sessionStorage.removeItem('medicare_app_state');
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname);
            }
        } catch (e) {}
    }

    // Modal Control Helpers for ABHA ID
    const openAbhaModal = () => {
        if (searchModal && searchModal.classList.contains('active')) closeModal(searchModal);
        openModal(abhaModal);
        saveAppState('abha-modal');
        setTimeout(() => abhaInput && abhaInput.focus(), 100);
    };

    window.openAbhaModal = openAbhaModal;

    // Attach ABHA modal to "Get Started" buttons
    if (navCtaBtn) navCtaBtn.addEventListener('click', openAbhaModal);
    if (heroGetStarted) heroGetStarted.addEventListener('click', openAbhaModal);

    if (closeAbhaModal) {
        closeAbhaModal.addEventListener('click', () => {
            closeModal(abhaModal);
            saveAppState('home');
        });
    }
    if (cancelAbha) {
        cancelAbha.addEventListener('click', () => {
            closeModal(abhaModal);
            saveAppState('home');
        });
    }

    if (abhaModal) {
        abhaModal.addEventListener('click', (e) => {
            if (e.target === abhaModal) {
                closeModal(abhaModal);
                saveAppState('home');
            }
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
    const statusNeedHelp = document.getElementById('status-need-help');

    function openStatusPage() {
        if (statusPage) {
            statusPage.classList.add('active');
            document.body.style.overflow = 'hidden';
            saveAppState('status');
        }
    }

    function closeStatusPage() {
        if (statusPage) {
            statusPage.classList.remove('active');
            document.body.style.overflow = '';
            saveAppState('home');
        }
    }

    window.openStatusPage = openStatusPage;
    window.closeStatusPage = closeStatusPage;

    if (statusGoBack) {
        statusGoBack.addEventListener('click', (e) => {
            e.preventDefault();
            closeStatusPage();
        });
    }

    // ArogyaAI Receptionist Intake View Elements
    const arogyaIntakePage = document.getElementById('arogya-intake-page');
    const btnArogyaBack = document.getElementById('btn-arogya-back');
    const btnArogyaMic = document.getElementById('btn-arogya-mic');
    const arogyaVoiceCard = document.querySelector('.arogya-voice-card');
    const arogyaMicStatus = document.getElementById('arogya-mic-status');
    const arogyaResponseText = document.getElementById('arogya-response-text');
    const btnClearResponse = document.getElementById('btn-clear-response');
    const btnArogyaContinue = document.getElementById('btn-arogya-continue');
    const btnBotTts = document.getElementById('btn-bot-tts');
    const btnMoreChips = document.getElementById('btn-more-chips');
    const suggChipsRow = document.getElementById('suggestions-chips-row');
    const btnArogyaEmergency = document.getElementById('btn-arogya-emergency');
    const arogyaSidebarHelp = document.getElementById('arogya-sidebar-help');
    const arogyaLangBtn = document.getElementById('arogya-lang-btn');
    const arogyaLangMenu = document.getElementById('arogya-lang-menu');
    const arogyaCurrentLang = document.getElementById('arogya-current-lang');

    let isRecording = false;
    let recognition = null;

    function openArogyaIntake(isRestore = false) {
        if (arogyaIntakePage) {
            if (!isRestore) {
                currentStep = 1;
                hasScannedDocs = false;
                if (typeof resetScannerState === 'function') resetScannerState();
                if (docScannerScreen) docScannerScreen.style.display = 'none';
                if (docDecisionScreen) docDecisionScreen.style.display = 'flex';
            }
            if (typeof updateArogyaStepUI === 'function') updateArogyaStepUI(currentStep || 1);
            arogyaIntakePage.classList.add('active');
            document.body.style.overflow = 'hidden';
            saveAppState('arogya-intake', { step: currentStep || 1 });
            if (!isRestore) startVoiceListening();
        }
    }

    function closeArogyaIntake() {
        if (arogyaIntakePage) {
            arogyaIntakePage.classList.remove('active');
            document.body.style.overflow = '';
            stopVoiceListening();
            saveAppState('home');
        }
    }

    window.openArogyaIntake = openArogyaIntake;
    window.closeArogyaIntake = closeArogyaIntake;

    if (btnStatusNew) {
        btnStatusNew.addEventListener('click', () => {
            closeStatusPage();
            openArogyaIntake();
            showToast('Starting ArogyaAI Intake Assessment for New Condition...');
        });
    }

    if (btnArogyaBack) {
        btnArogyaBack.addEventListener('click', () => {
            closeArogyaIntake();
            openStatusPage();
        });
    }

    // Speech recognition / listening simulation
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            try {
                recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-IN';

                recognition.onresult = (event) => {
                    let transcript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                    }
                    if (arogyaResponseText && transcript.trim()) {
                        arogyaResponseText.value = transcript;
                        if (btnClearResponse) btnClearResponse.style.display = 'block';
                    }
                };

                recognition.onerror = (err) => {
                    console.warn('Speech recognition status:', err);
                };

                recognition.onend = () => {
                    if (isRecording) {
                        try { recognition.start(); } catch (e) {}
                    }
                };
            } catch (e) {
                console.warn('Speech recognition init error:', e);
            }
        }
    }

    initSpeechRecognition();

    function startVoiceListening() {
        isRecording = true;
        if (arogyaVoiceCard) arogyaVoiceCard.classList.add('is-listening');
        if (arogyaMicStatus) arogyaMicStatus.textContent = 'Listening...';
        if (recognition) {
            try { recognition.start(); } catch(e) {}
        }
    }

    function stopVoiceListening() {
        isRecording = false;
        if (arogyaVoiceCard) arogyaVoiceCard.classList.remove('is-listening');
        if (arogyaMicStatus) arogyaMicStatus.textContent = 'Tap microphone to speak';
        if (recognition) {
            try { recognition.stop(); } catch(e) {}
        }
    }

    if (btnArogyaMic) {
        btnArogyaMic.addEventListener('click', () => {
            if (isRecording) {
                stopVoiceListening();
                showToast('Microphone paused.');
            } else {
                startVoiceListening();
                showToast('Listening... Speak your symptoms clearly.');
            }
        });
    }

    // Bot Audio TTS Reader
    if (btnBotTts) {
        btnBotTts.addEventListener('click', () => {
            const question = document.getElementById('arogya-question-text')?.textContent || "What brings you to the hospital today?";
            const hint = document.getElementById('arogya-question-hint')?.textContent || "You can speak or choose from suggestions";
            const textToSpeak = `${question}. ${hint}.`;

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.rate = 0.95;
                utterance.pitch = 1.05;
                window.speechSynthesis.speak(utterance);
                showToast('Playing audio: ' + question);
            } else {
                showToast(textToSpeak);
            }
        });
    }

    // Symptom Chips click
    document.querySelectorAll('.sugg-chip[data-symptom]').forEach(chip => {
        chip.addEventListener('click', () => {
            const symptom = chip.getAttribute('data-symptom');
            chip.classList.toggle('selected');

            const currentVal = arogyaResponseText ? arogyaResponseText.value.trim() : '';
            if (currentVal.length > 0 && !currentVal.toLowerCase().includes(symptom.toLowerCase())) {
                arogyaResponseText.value = currentVal + ', ' + symptom;
            } else if (!currentVal) {
                arogyaResponseText.value = 'I am experiencing ' + symptom.toLowerCase();
            }
            if (btnClearResponse) btnClearResponse.style.display = 'block';
            showToast(`Added symptom: ${symptom}`);
        });
    });

    // More Chips Toggle
    if (btnMoreChips && suggChipsRow) {
        btnMoreChips.addEventListener('click', () => {
            if (!extraChipsExpanded) {
                extraChipsExpanded = true;
                const extraHTML = `
                    <button type="button" class="sugg-chip extra-chip" data-symptom="Chest discomfort" style="background:#fef2f2;border-color:#fecaca;color:#991b1b;">
                        <span class="chip-icon">❤️‍🩹</span>
                        <span class="chip-text">Chest discomfort</span>
                    </button>
                    <button type="button" class="sugg-chip extra-chip" data-symptom="Sore throat" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534;">
                        <span class="chip-icon">🗣️</span>
                        <span class="chip-text">Sore throat</span>
                    </button>
                    <button type="button" class="sugg-chip extra-chip" data-symptom="Body aches" style="background:#fffbeb;border-color:#fde68a;color:#92400e;">
                        <span class="chip-icon">💪</span>
                        <span class="chip-text">Body aches</span>
                    </button>
                `;
                btnMoreChips.insertAdjacentHTML('beforebegin', extraHTML);
                const moreText = btnMoreChips.querySelector('.chip-text');
                if (moreText) moreText.textContent = 'Less';

                // Add click listener to new chips
                suggChipsRow.querySelectorAll('.extra-chip').forEach(c => {
                    c.addEventListener('click', () => {
                        const symptom = c.getAttribute('data-symptom');
                        c.classList.toggle('selected');
                        const currentVal = arogyaResponseText ? arogyaResponseText.value.trim() : '';
                        if (currentVal.length > 0 && !currentVal.toLowerCase().includes(symptom.toLowerCase())) {
                            arogyaResponseText.value = currentVal + ', ' + symptom;
                        } else if (!currentVal) {
                            arogyaResponseText.value = 'I am experiencing ' + symptom.toLowerCase();
                        }
                        if (btnClearResponse) btnClearResponse.style.display = 'block';
                    });
                });
            } else {
                extraChipsExpanded = false;
                suggChipsRow.querySelectorAll('.extra-chip').forEach(c => c.remove());
                const moreText = btnMoreChips.querySelector('.chip-text');
                if (moreText) moreText.textContent = 'More';
            }
        });
    }

    // Response text input handling
    if (arogyaResponseText) {
        arogyaResponseText.addEventListener('input', () => {
            if (btnClearResponse) {
                btnClearResponse.style.display = arogyaResponseText.value.trim().length > 0 ? 'block' : 'none';
            }
        });
    }

    if (btnClearResponse) {
        btnClearResponse.addEventListener('click', () => {
            if (arogyaResponseText) arogyaResponseText.value = '';
            btnClearResponse.style.display = 'none';
            document.querySelectorAll('.sugg-chip').forEach(c => c.classList.remove('selected'));
        });
    }

    // Intake state variables
    let currentStep = 1;
    let extraChipsExpanded = false;
    let hasScannedDocs = false;
    let scannedDocType = 'rx'; // 'rx' or 'lab'
    let selectedDuration = '1-2 days';
    let selectedSeverity = 'Moderate';
    let patientSymptoms = '';
    let isScanningInProgress = false;

    // Elements for step views
    const stepView1 = document.getElementById('step-view-1');
    const stepView2 = document.getElementById('step-view-2');
    const stepView3 = document.getElementById('step-view-3');
    const stepView4 = document.getElementById('step-view-4');
    const stepView5 = document.getElementById('step-view-5');
    const stepView6 = document.getElementById('step-view-6');

    const stepViews = [stepView1, stepView2, stepView3, stepView4, stepView5, stepView6];

    // Document Decision Elements
    const docDecisionScreen = document.getElementById('doc-decision-screen');
    const docScannerScreen = document.getElementById('doc-scanner-screen');
    const btnChoiceYes = document.getElementById('btn-choice-yes');
    const btnChoiceNo = document.getElementById('btn-choice-no');
    const cardDocYes = document.getElementById('card-doc-yes');
    const cardDocNo = document.getElementById('card-doc-no');
    const btnBackToDocChoice = document.getElementById('btn-back-to-doc-choice');

    // Document Scanner Elements
    const scannerLaser = document.getElementById('scanner-laser');
    const scannerEmptyView = document.getElementById('scanner-empty-view');
    const scannerDocPreview = document.getElementById('scanner-doc-preview');
    const previewDocType = document.getElementById('preview-doc-type');
    const previewDocBody = document.getElementById('preview-doc-body');
    const sampleRxBtn = document.getElementById('sample-rx-btn');
    const sampleLabBtn = document.getElementById('sample-lab-btn');
    const btnTriggerScan = document.getElementById('btn-trigger-scan');
    const scanBtnLabel = document.getElementById('scan-btn-label');
    const scannerProgressWrapper = document.getElementById('scanner-progress-wrapper');
    const scannerProgressBar = document.getElementById('scanner-progress-bar');
    const progressTaskLabel = document.getElementById('progress-task-label');
    const progressPercentLabel = document.getElementById('progress-percent-label');
    const extractedInsightsCard = document.getElementById('extracted-insights-card');
    const insightsGridContent = document.getElementById('insights-grid-content');
    const btnProceedScanned = document.getElementById('btn-proceed-scanned');

    // Summary Elements
    const summaryChiefComplaint = document.getElementById('summary-chief-complaint');
    const summaryDuration = document.getElementById('summary-duration');
    const summarySeverity = document.getElementById('summary-severity');
    const summaryDocStatus = document.getElementById('summary-doc-status');
    const summaryDocSection = document.getElementById('summary-doc-section');
    const summaryDocDetails = document.getElementById('summary-doc-details');
    const summaryDocPill = document.getElementById('summary-doc-pill');

    // Review & Confirm Elements
    const reviewSymptomsText = document.getElementById('review-symptoms-text');
    const reviewDocText = document.getElementById('review-doc-text');
    const reviewDocCheckIcon = document.getElementById('review-doc-check-icon');
    const intakeConsentCheck = document.getElementById('intake-consent-check');

    // Token Elements
    const finalTokenNumber = document.getElementById('final-token-number');
    const tokenDocVerifiedText = document.getElementById('token-doc-verified-text');
    const btnPrintToken = document.getElementById('btn-print-token');
    const btnSpeakToken = document.getElementById('btn-speak-token');
    const arogyaNotesText = document.getElementById('arogya-notes-text');

    // Symptom Chips click
    document.querySelectorAll('.sugg-chip[data-symptom]').forEach(chip => {
        chip.addEventListener('click', () => {
            const symptom = chip.getAttribute('data-symptom');
            chip.classList.toggle('selected');

            const currentVal = arogyaResponseText ? arogyaResponseText.value.trim() : '';
            if (currentVal.length > 0 && !currentVal.toLowerCase().includes(symptom.toLowerCase())) {
                arogyaResponseText.value = currentVal + ', ' + symptom;
            } else if (!currentVal) {
                arogyaResponseText.value = 'I am experiencing ' + symptom.toLowerCase();
            }
            if (btnClearResponse) btnClearResponse.style.display = 'block';
            saveAppState('arogya-intake', { patientSymptoms: arogyaResponseText.value });
            showToast(`Added symptom: ${symptom}`);
        });
    });

    if (arogyaResponseText) {
        arogyaResponseText.addEventListener('input', () => {
            saveAppState('arogya-intake', { patientSymptoms: arogyaResponseText.value });
        });
    }

    // More Chips Toggle
    if (btnMoreChips && suggChipsRow) {
        btnMoreChips.addEventListener('click', () => {
            if (!extraChipsExpanded) {
                extraChipsExpanded = true;
                const extraHTML = `
                    <button type="button" class="sugg-chip extra-chip" data-symptom="Chest discomfort" style="background:#fef2f2;border-color:#fecaca;color:#991b1b;">
                        <span class="chip-icon">❤️‍🩹</span>
                        <span class="chip-text">Chest discomfort</span>
                    </button>
                    <button type="button" class="sugg-chip extra-chip" data-symptom="Sore throat" style="background:#f0fdf4;border-color:#bbf7d0;color:#166534;">
                        <span class="chip-icon">🗣️</span>
                        <span class="chip-text">Sore throat</span>
                    </button>
                    <button type="button" class="sugg-chip extra-chip" data-symptom="Body aches" style="background:#fffbeb;border-color:#fde68a;color:#92400e;">
                        <span class="chip-icon">💪</span>
                        <span class="chip-text">Body aches</span>
                    </button>
                `;
                btnMoreChips.insertAdjacentHTML('beforebegin', extraHTML);
                const moreText = btnMoreChips.querySelector('.chip-text');
                if (moreText) moreText.textContent = 'Less';

                // Add click listener to new chips
                suggChipsRow.querySelectorAll('.extra-chip').forEach(c => {
                    c.addEventListener('click', () => {
                        const symptom = c.getAttribute('data-symptom');
                        c.classList.toggle('selected');
                        const currentVal = arogyaResponseText ? arogyaResponseText.value.trim() : '';
                        if (currentVal.length > 0 && !currentVal.toLowerCase().includes(symptom.toLowerCase())) {
                            arogyaResponseText.value = currentVal + ', ' + symptom;
                        } else if (!currentVal) {
                            arogyaResponseText.value = 'I am experiencing ' + symptom.toLowerCase();
                        }
                        if (btnClearResponse) btnClearResponse.style.display = 'block';
                    });
                });
            } else {
                extraChipsExpanded = false;
                suggChipsRow.querySelectorAll('.extra-chip').forEach(c => c.remove());
                const moreText = btnMoreChips.querySelector('.chip-text');
                if (moreText) moreText.textContent = 'More';
            }
        });
    }

    // Response text input handling
    if (arogyaResponseText) {
        arogyaResponseText.addEventListener('input', () => {
            if (btnClearResponse) {
                btnClearResponse.style.display = arogyaResponseText.value.trim().length > 0 ? 'block' : 'none';
            }
        });
    }

    if (btnClearResponse) {
        btnClearResponse.addEventListener('click', () => {
            if (arogyaResponseText) arogyaResponseText.value = '';
            btnClearResponse.style.display = 'none';
            document.querySelectorAll('.sugg-chip').forEach(c => c.classList.remove('selected'));
        });
    }

    // Duration and Severity Pill click listeners
    document.querySelectorAll('.choice-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.choice-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedDuration = btn.getAttribute('data-duration') || '1-2 days';
        });
    });

    document.querySelectorAll('.severity-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.severity-pill-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSeverity = btn.getAttribute('data-severity') || 'Moderate';
        });
    });

    // Voice Dictation for Additional Notes
    const btnNotesMic = document.getElementById('btn-notes-mic');
    const notesMicStatus = document.getElementById('notes-mic-status');
    let isNotesRecording = false;
    let notesRecognition = null;

    if (btnNotesMic && arogyaNotesText) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            try {
                notesRecognition = new SpeechRec();
                notesRecognition.continuous = false;
                notesRecognition.interimResults = false;
                notesRecognition.lang = document.documentElement.getAttribute('lang') === 'kn' ? 'kn-IN' : (document.documentElement.getAttribute('lang') === 'hi' ? 'hi-IN' : 'en-IN');

                notesRecognition.onresult = (e) => {
                    const transcript = e.results[0][0].transcript;
                    if (transcript) {
                        const cur = arogyaNotesText.value.trim();
                        arogyaNotesText.value = cur ? cur + ' ' + transcript : transcript;
                    }
                    stopNotesRecording();
                };

                notesRecognition.onerror = () => {
                    stopNotesRecording();
                };

                notesRecognition.onend = () => {
                    stopNotesRecording();
                };
            } catch(e) {
                console.warn('Notes speech rec error:', e);
            }
        }

        function stopNotesRecording() {
            isNotesRecording = false;
            btnNotesMic.classList.remove('recording');
            if (notesMicStatus) notesMicStatus.textContent = 'Voice Note';
        }

        btnNotesMic.addEventListener('click', () => {
            if (!isNotesRecording) {
                isNotesRecording = true;
                btnNotesMic.classList.add('recording');
                if (notesMicStatus) notesMicStatus.textContent = 'Listening...';
                if (notesRecognition) {
                    try {
                        notesRecognition.lang = document.documentElement.getAttribute('lang') === 'kn' ? 'kn-IN' : (document.documentElement.getAttribute('lang') === 'hi' ? 'hi-IN' : 'en-IN');
                        notesRecognition.start();
                    } catch(e) {
                        setTimeout(() => {
                            if (isNotesRecording) {
                                const sampleNotes = 'Mild morning dizziness and slight nausea after morning meal.';
                                const cur = arogyaNotesText.value.trim();
                                arogyaNotesText.value = cur ? cur + ' ' + sampleNotes : sampleNotes;
                                stopNotesRecording();
                            }
                        }, 2200);
                    }
                } else {
                    setTimeout(() => {
                        const sampleNotes = 'Mild morning dizziness and slight nausea after morning meal.';
                        const cur = arogyaNotesText.value.trim();
                        arogyaNotesText.value = cur ? cur + ' ' + sampleNotes : sampleNotes;
                        stopNotesRecording();
                    }, 1800);
                }
            } else {
                if (notesRecognition) {
                    try { notesRecognition.stop(); } catch(e) {}
                }
                stopNotesRecording();
            }
        });
    }

    // Step 3 Document Decision Handlers (YES / NO)
    function selectDocDecisionYes() {
        if (docDecisionScreen) docDecisionScreen.style.display = 'none';
        if (docScannerScreen) docScannerScreen.style.display = 'flex';
        loadSampleDoc('rx');
        showToast('Document Scanner active. Ready for OCR extraction.');
    }

    function selectDocDecisionNo() {
        hasScannedDocs = false;
        showToast('Generating AI Clinical Summary directly from your reported symptoms...');
        currentStep = 4;
        updateArogyaStepUI(4);
    }

    if (btnChoiceYes) btnChoiceYes.addEventListener('click', selectDocDecisionYes);
    if (btnChoiceNo) btnChoiceNo.addEventListener('click', selectDocDecisionNo);
    if (cardDocYes) cardDocYes.addEventListener('click', (e) => {
        if (!e.target.closest('#btn-choice-yes')) selectDocDecisionYes();
    });
    if (cardDocNo) cardDocNo.addEventListener('click', (e) => {
        if (!e.target.closest('#btn-choice-no')) selectDocDecisionNo();
    });

    if (btnBackToDocChoice) {
        btnBackToDocChoice.addEventListener('click', () => {
            if (docScannerScreen) docScannerScreen.style.display = 'none';
            if (docDecisionScreen) docDecisionScreen.style.display = 'flex';
            resetScannerState();
        });
    }

    // Scanner Samples & OCR logic
    function loadSampleDoc(type) {
        scannedDocType = type;
        if (scannerEmptyView) scannerEmptyView.style.display = 'none';
        if (scannerDocPreview) scannerDocPreview.style.display = 'block';

        if (sampleRxBtn) sampleRxBtn.classList.toggle('active', type === 'rx');
        if (sampleLabBtn) sampleLabBtn.classList.toggle('active', type === 'lab');

        if (type === 'rx') {
            if (previewDocType) previewDocType.textContent = 'Medical Prescription (Rx)';
            if (previewDocBody) {
                previewDocBody.innerHTML = `
                    <strong>Dr. K. Mehta, MD (General Medicine)</strong><br>
                    <span>Rx: Tab. Paracetamol 650mg TDS (3 days)</span><br>
                    <span>Rx: Tab. Amoxicillin 500mg BD (5 days)</span><br>
                    <span>Advice: High fluid intake, monitor temperature every 6 hours.</span>
                `;
            }
        } else {
            if (previewDocType) previewDocType.textContent = 'Blood Test Report (CBC & Vitals)';
            if (previewDocBody) {
                previewDocBody.innerHTML = `
                    <strong>Metropolis Diagnostic Labs • CBC Panel</strong><br>
                    <span>Hemoglobin: 13.2 g/dL (Normal)</span><br>
                    <span>Total WBC: 11,400 /mcL (Mild Leukocytosis - Reactive)</span><br>
                    <span>Platelet Count: 240,000 /mcL (Normal)</span>
                `;
            }
        }
    }

    if (sampleRxBtn) sampleRxBtn.addEventListener('click', () => loadSampleDoc('rx'));
    if (sampleLabBtn) sampleLabBtn.addEventListener('click', () => loadSampleDoc('lab'));

    function runDocumentScan() {
        if (isScanningInProgress) return;
        isScanningInProgress = true;

        if (scannerLaser) scannerLaser.classList.add('scanning');
        if (scannerProgressWrapper) scannerProgressWrapper.style.display = 'block';
        if (btnTriggerScan) btnTriggerScan.style.display = 'none';

        let progress = 0;
        scannerProgressBar.style.width = '0%';
        if (progressPercentLabel) progressPercentLabel.textContent = '0%';

        const scanInterval = setInterval(() => {
            progress += 5;
            if (progress > 100) progress = 100;

            if (scannerProgressBar) scannerProgressBar.style.width = `${progress}%`;
            if (progressPercentLabel) progressPercentLabel.textContent = `${progress}%`;

            if (progressTaskLabel) {
                if (progress < 25) {
                    progressTaskLabel.textContent = 'Capturing document frame...';
                } else if (progress < 60) {
                    progressTaskLabel.textContent = 'Extracting OCR text & clinical records...';
                } else if (progress < 90) {
                    progressTaskLabel.textContent = 'Recognizing medications, dosage & tags...';
                } else {
                    progressTaskLabel.textContent = 'Document Analysis Complete!';
                }
            }

            if (progress >= 100) {
                clearInterval(scanInterval);
                isScanningInProgress = false;
                if (scannerLaser) scannerLaser.classList.remove('scanning');
                showExtractedInsights();
            }
        }, 65);
    }

    function showExtractedInsights() {
        if (extractedInsightsCard) extractedInsightsCard.style.display = 'block';
        if (btnProceedScanned) btnProceedScanned.style.display = 'inline-flex';

        if (insightsGridContent) {
            if (scannedDocType === 'rx') {
                insightsGridContent.innerHTML = `
                    <div class="insight-item-box">
                        <span class="insight-item-lbl">Extracted Rx 1</span>
                        <div class="insight-item-val">Paracetamol 650mg TDS (Fever)</div>
                    </div>
                    <div class="insight-item-box">
                        <span class="insight-item-lbl">Extracted Rx 2</span>
                        <div class="insight-item-val">Amoxicillin 500mg BD (Infection)</div>
                    </div>
                    <div class="insight-item-box">
                        <span class="insight-item-lbl">Prescribing Physician</span>
                        <div class="insight-item-val">Dr. K. Mehta (MD Physician)</div>
                    </div>
                `;
            } else {
                insightsGridContent.innerHTML = `
                    <div class="insight-item-box">
                        <span class="insight-item-lbl">Lab Test</span>
                        <div class="insight-item-val">Complete Blood Count (CBC)</div>
                    </div>
                    <div class="insight-item-box">
                        <span class="insight-item-lbl">Clinical Finding</span>
                        <div class="insight-item-val">WBC 11,400 /mcL (Mild Leukocytosis)</div>
                    </div>
                    <div class="insight-item-box">
                        <span class="insight-item-lbl">Hemoglobin</span>
                        <div class="insight-item-val">13.2 g/dL (Normal)</div>
                    </div>
                `;
            }
        }
        showToast('✓ Medical OCR Complete: Prescription & Lab records extracted!');
    }

    function resetScannerState() {
        if (scannerLaser) scannerLaser.classList.remove('scanning');
        if (scannerProgressWrapper) scannerProgressWrapper.style.display = 'none';
        if (scannerProgressBar) scannerProgressBar.style.width = '0%';
        if (extractedInsightsCard) extractedInsightsCard.style.display = 'none';
        if (btnProceedScanned) btnProceedScanned.style.display = 'none';
        if (btnTriggerScan) btnTriggerScan.style.display = 'inline-flex';
        isScanningInProgress = false;
    }

    if (btnTriggerScan) btnTriggerScan.addEventListener('click', runDocumentScan);

    if (btnProceedScanned) {
        btnProceedScanned.addEventListener('click', () => {
            hasScannedDocs = true;
            currentStep = 4;
            updateArogyaStepUI(4);
            showToast('Scanned document records attached to AI Clinical Summary');
        });
    }

    // Step Stepper Advance Button
    if (btnArogyaContinue) {
        btnArogyaContinue.addEventListener('click', () => {
            if (currentStep === 1) {
                const resp = arogyaResponseText ? arogyaResponseText.value.trim() : '';
                patientSymptoms = resp || 'Mild fever and persistent headache since yesterday';
                if (!resp && arogyaResponseText) {
                    arogyaResponseText.value = patientSymptoms;
                }
            } else if (currentStep === 2) {
                patientNotes = arogyaNotesText ? arogyaNotesText.value.trim() : '';
            } else if (currentStep === 3) {
                // In Step 3, if continue is clicked without picking Yes/No, default to No (generate summary)
                if (docDecisionScreen && docDecisionScreen.style.display !== 'none') {
                    selectDocDecisionNo();
                    return;
                }
            } else if (currentStep === 5) {
                if (intakeConsentCheck && !intakeConsentCheck.checked) {
                    showToast('Please confirm the verification checkbox to proceed.');
                    return;
                }
            } else if (currentStep >= 6) {
                // Register real-time patient condition explanation into Doctor's queue
                if (typeof registerPatientConditionToDoctorQueue === 'function') {
                    registerPatientConditionToDoctorQueue({
                        name: 'Rahul Verma',
                        token: '#MC-8492',
                        abha: '91-4820-1928-3746',
                        ageGender: '32 Yrs • Male • O+ Positive',
                        visitType: 'AI Intake Consultation',
                        risk: selectedSeverity === 'Severe' ? 'High' : (selectedSeverity === 'Moderate' ? 'Moderate' : 'Low'),
                        reason: patientSymptoms || 'Reported symptoms during AI clinical intake',
                        symptoms: `${patientSymptoms || 'Persistent Cough & Discomfort'} (${selectedSeverity || 'Moderate'} • ${selectedDuration || '1-2 days'})`,
                        notes: patientNotes || '',
                        vitals: 'BP 132/86 mmHg • HR 78 bpm • SpO2 98% • Temp 98.6°F',
                        observations: `AI Intake Assessment: Patient reported "${patientSymptoms || 'Wheezing and cough'}". Duration: ${selectedDuration || '1-2 days'}. Severity: ${selectedSeverity || 'Moderate'}. ${patientNotes ? 'Additional note: ' + patientNotes : ''}`
                    });
                }

                // Flow finished -> Return to home
                closeArogyaIntake();
                showToast('Intake Assessment Completed. Patient Token #MC-8492 active.');
                // Reset state
                currentStep = 1;
                hasScannedDocs = false;
                resetScannerState();
                if (docScannerScreen) docScannerScreen.style.display = 'none';
                if (docDecisionScreen) docDecisionScreen.style.display = 'flex';
                updateArogyaStepUI(1);
                return;
            }

            // Advance step
            currentStep++;
            updateArogyaStepUI(currentStep);
        });
    }

    function updateArogyaStepUI(step) {
        saveAppState('arogya-intake', { step: step });

        // Update Stepper nodes in sidebar
        document.querySelectorAll('.intake-step-node').forEach((node, idx) => {
            const stepNum = idx + 1;
            if (stepNum < step) {
                node.classList.remove('active');
                node.classList.add('completed');
                const status = node.querySelector('.step-status');
                if (status) status.textContent = 'Completed';
            } else if (stepNum === step) {
                node.classList.add('active');
                node.classList.remove('completed');
                const status = node.querySelector('.step-status');
                if (status) status.textContent = 'In Progress';
            } else {
                node.classList.remove('active', 'completed');
                const status = node.querySelector('.step-status');
                if (status) status.textContent = 'Upcoming';
            }
        });

        // Hide all step views, show current
        stepViews.forEach((v, idx) => {
            if (v) v.style.display = (idx + 1 === step) ? 'flex' : 'none';
        });

        const qText = document.getElementById('arogya-question-text');
        const qHint = document.getElementById('arogya-question-hint');
        const continueBtnSpan = btnArogyaContinue ? btnArogyaContinue.querySelector('span') : null;
        const bottomActions = document.getElementById('arogya-bottom-actions');

        if (step === 1) {
            if (qText) qText.textContent = "What brings you to the hospital today?";
            if (qHint) qHint.textContent = "You can speak or choose from suggestions";
            if (continueBtnSpan) continueBtnSpan.textContent = "Continue";
            if (bottomActions) bottomActions.style.display = 'flex';
        } else if (step === 2) {
            if (qText) qText.textContent = "How many days have you had these symptoms?";
            if (qHint) qHint.textContent = "Select duration and severity of symptoms";
            if (continueBtnSpan) continueBtnSpan.textContent = "Next: Documents";
            if (bottomActions) bottomActions.style.display = 'flex';
            showToast('Step 2: Symptom Timeline & Severity');
        } else if (step === 3) {
            if (qText) qText.textContent = "Do you have any medical documents to scan?";
            if (qHint) qHint.textContent = "Physical prescriptions, lab reports, or past medical records";
            if (continueBtnSpan) continueBtnSpan.textContent = "Skip & Generate Summary";
            if (bottomActions) bottomActions.style.display = 'flex';
            showToast('Step 3: Medical Document Scan Decision');
        } else if (step === 4) {
            if (qText) qText.textContent = "AI Clinical Summary Generated";
            if (qHint) qHint.textContent = "Comprehensive clinical overview prepared for consulting doctor";
            if (continueBtnSpan) continueBtnSpan.textContent = "Review & Confirm";
            if (bottomActions) bottomActions.style.display = 'flex';

            // Populate summary data dynamically
            const symptomsDisplay = patientSymptoms || (arogyaResponseText && arogyaResponseText.value.trim()) || 'Mild fever and persistent headache';
            if (summaryChiefComplaint) summaryChiefComplaint.textContent = symptomsDisplay;
            if (summaryDuration) summaryDuration.textContent = `${selectedDuration} (Acute)`;
            if (summarySeverity) summarySeverity.textContent = `${selectedSeverity} Discomfort`;

            if (hasScannedDocs) {
                if (summaryDocStatus) {
                    summaryDocStatus.textContent = '1 Document Verified (OCR)';
                    summaryDocStatus.className = 'matrix-val text-emerald';
                }
                if (summaryDocSection) summaryDocSection.style.display = 'block';
                if (summaryDocPill) summaryDocPill.textContent = scannedDocType === 'rx' ? '1 Prescribed Rx' : '1 CBC Lab Report';
                if (summaryDocDetails) {
                    if (scannedDocType === 'rx') {
                        summaryDocDetails.innerHTML = 'Extracted: <strong>Tab. Paracetamol 650mg TDS, Tab. Amoxicillin 500mg BD</strong>. Prescribed by Dr. K. Mehta.';
                    } else {
                        summaryDocDetails.innerHTML = 'Extracted: <strong>CBC Panel (Hb: 13.2 g/dL, WBC: 11,400 /mcL - Mild Reactive Leukocytosis)</strong>.';
                    }
                }
            } else {
                if (summaryDocStatus) {
                    summaryDocStatus.textContent = 'No Docs Attached (Patient Input)';
                    summaryDocStatus.className = 'matrix-val text-blue';
                }
                if (summaryDocSection) summaryDocSection.style.display = 'none';
            }
            showToast('Step 4: AI Summary Ready for Review');
        } else if (step === 5) {
            if (qText) qText.textContent = "Please review your intake summary";
            if (qHint) qHint.textContent = "All information is verified and linked to ABHA: 91-4820-1928-3746";
            if (continueBtnSpan) continueBtnSpan.textContent = "Confirm & Issue Token";
            if (bottomActions) bottomActions.style.display = 'flex';

            const symptomsDisplay = patientSymptoms || (arogyaResponseText && arogyaResponseText.value.trim()) || 'Mild fever and persistent headache';
            if (reviewSymptomsText) reviewSymptomsText.textContent = `${symptomsDisplay} (${selectedDuration}, ${selectedSeverity})`;
            if (reviewDocText) {
                reviewDocText.textContent = hasScannedDocs
                    ? (scannedDocType === 'rx' ? '1 Medical Prescription Scanned & Verified' : '1 Lab Report Scanned & Verified')
                    : 'No documents attached (Interview summary only)';
            }
            if (reviewDocCheckIcon) {
                reviewDocCheckIcon.style.background = hasScannedDocs ? '#10b981' : '#3b82f6';
            }
            showToast('Step 5: Review & Confirm');
        } else if (step === 6) {
            if (qText) qText.textContent = "Intake Completed Successfully!";
            if (qHint) qHint.textContent = "Token #MC-8492 issued • Estimated wait time: ~3 mins";
            if (continueBtnSpan) continueBtnSpan.textContent = "Done & Return to Home";
            if (bottomActions) bottomActions.style.display = 'flex';

            if (tokenDocVerifiedText) {
                tokenDocVerifiedText.textContent = hasScannedDocs ? 'Verified (1 Document)' : 'Self Reported';
                tokenDocVerifiedText.className = hasScannedDocs ? 'meta-txt text-emerald' : 'meta-txt text-blue';
            }
            setActiveToken({
                number: '#MC-8492',
                patientName: 'Rahul Verma',
                doctorName: 'Dr. Priya Sharma',
                room: 'Room #4 • General Medicine',
                queue: '#02 (Est. ~3 mins)'
            });
            showToast('Step 6: Intake Complete! Official Token #MC-8492 issued');
        }
    }

    // Token Actions (Print & Speech TTS)
    if (btnPrintToken) {
        btnPrintToken.addEventListener('click', () => {
            showToast('🖨️ Printing official OPD Token Pass #MC-8492...');
            setTimeout(() => {
                window.print();
            }, 500);
        });
    }

    if (btnSpeakToken) {
        btnSpeakToken.addEventListener('click', () => {
            const tokenMsg = "Your hospital intake is confirmed. Patient token number MC 8492. Assigned to Dr. Priya Sharma in General Medicine, Room number 4. Estimated wait time is 3 minutes.";
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(tokenMsg);
                utterance.rate = 0.95;
                window.speechSynthesis.speak(utterance);
                showToast('🔊 Playing Token Audio');
            } else {
                showToast(tokenMsg);
            }
        });
    }

    // Emergency button
    if (btnArogyaEmergency) {
        btnArogyaEmergency.addEventListener('click', () => {
            showToast('🚨 EMERGENCY ALERT ACTIVATED! On-duty triage nurse notified immediately.');
        });
    }

    // Help assistance in sidebar
    if (arogyaSidebarHelp) {
        arogyaSidebarHelp.addEventListener('click', () => {
            showToast('Hospital Helpdesk Staff notified. Assistance on the way.');
        });
    }

    // Language Dropdown
    if (arogyaLangBtn && arogyaLangMenu) {
        arogyaLangBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            arogyaLangMenu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            arogyaLangMenu.classList.remove('show');
        });

        arogyaLangMenu.querySelectorAll('.lang-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                const lang = opt.getAttribute('data-lang');
                arogyaLangMenu.querySelectorAll('.lang-opt').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                if (arogyaCurrentLang) arogyaCurrentLang.textContent = opt.textContent.split(' ')[0];
                arogyaLangMenu.classList.remove('show');
                if (typeof setLanguage === 'function') setLanguage(lang);
                showToast(`Language switched to ${opt.textContent}`);
            });
        });
    }

    // ==========================================================================
    // Ongoing Condition & Chronic Care Management Portal Controller
    // ==========================================================================
    const ongoingCarePage = document.getElementById('ongoing-care-page');
    const btnOngoingBack = document.getElementById('btn-ongoing-back');
    const btnGenFollowupToken = document.getElementById('btn-gen-followup-token');
    const followupTokenModal = document.getElementById('followup-token-modal');
    const closeFollowupBackdrop = document.getElementById('close-followup-backdrop');
    const btnCloseFollowupModal = document.getElementById('btn-close-followup-modal');
    const btnPrintFollowup = document.getElementById('btn-print-followup');
    const btnSpeakFollowup = document.getElementById('btn-speak-followup');
    const btnRefillAll = document.getElementById('btn-refill-all');

    // Demo Accounts Data
    const ongoingDemoProfiles = {
        rahul: {
            name: "Rahul Verma",
            avatar: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            demoMeta: "32 Yrs • Male • O+ Positive",
            abha: "ABHA: 91-4820-1928-3746",
            diagnosis: "Hypertension Stage-1 & Mild Asthma",
            bannerTitle: "Managing: Essential Hypertension & Mild Asthma",
            bannerDesc: "Your clinical records and vitals history are already synchronized. Skip general registration and generate an instant follow-up token for your doctor.",
            lastVisit: "14 Days Ago (Follow-up Due)",
            streak: "14 Days Streak",
            adherenceNum: "94%",
            doctorName: "Dr. Rajesh Iyer",
            doctorDept: "MD (Cardiology & Internal Medicine)",
            doctorRoom: "Room #2",
            tokenId: "#FU-2049",
            queuePos: "#02",
            waitTime: "~2 mins",
            prescriptions: [
                { name: "Telmisartan 40mg", dosage: "1 Tablet Daily (Post Breakfast)", time: "Morning • 8:30 AM", stock: "6 Days Remaining" },
                { name: "Budecort 200mcg Inhaler", dosage: "2 Puffs Night / SOS", time: "Bedtime • 10:00 PM", stock: "18 Doses Left" },
                { name: "Amlodipine 5mg", dosage: "1 Tablet Daily (Post Dinner)", time: "Night • 9:00 PM", stock: "10 Days Remaining" }
            ],
            vitals: {
                bp: "122/82 mmHg", bpTag: "Normal (Controlled)",
                hr: "74 bpm", hrTag: "Regular Sinus",
                spo2: "99%", spo2Tag: "Room Air",
                temp: "98.4 °F", tempTag: "Afebrile"
            },
            records: [
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', title: "Cardiology Follow-up Note", meta: "Dr. Rajesh Iyer • 14 days ago" },
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.89 20.3a2 2 0 0 0 1.78 2.7h14.66a2 2 0 0 0 1.78-2.7L18 9.31V2"/></svg>', title: "Metropolis Lipid & 12-Lead ECG", meta: "Normal Sinus Rhythm • 14 days ago" },
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 12a5 5 0 0 0-5-5H7a5 5 0 0 0 0 10h5a5 5 0 0 0 5-5z"/><path d="M12 7v10"/></svg>', title: "Peak Flow Spirometry Test", meta: "480 L/min (Stable) • 1 month ago" }
            ],
            docAdvice: '"Continue daily morning walk (30 mins). Limit dietary sodium to less than 2g/day. Monitor BP once weekly in the morning before breakfast."',
            checkinFeedback: "Patient reports positive progress on Telmisartan. Blood pressure stability confirmed. Added to Dr. Rajesh Iyer's review queue."
        },
        ananya: {
            name: "Ananya Sharma",
            avatar: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            demoMeta: "28 Yrs • Female • B+ Positive",
            abha: "ABHA: 91-8392-4019-5821",
            diagnosis: "Type-2 Diabetes Mellitus & Hypothyroidism",
            bannerTitle: "Managing: Type-2 Diabetes Mellitus & Hypothyroidism",
            bannerDesc: "Quarterly glycemic evaluation and thyroid hormone levels linked. Ready for endocrinology follow-up consultation.",
            lastVisit: "28 Days Ago (Quarterly HbA1c Due)",
            streak: "21 Days Streak",
            adherenceNum: "98%",
            doctorName: "Dr. Anita Desai",
            doctorDept: "MD (Endocrinology & Diabetology)",
            doctorRoom: "Room #5",
            tokenId: "#FU-3118",
            queuePos: "#03",
            waitTime: "~4 mins",
            prescriptions: [
                { name: "Metformin 500mg SR", dosage: "1 Tablet Post Dinner", time: "Night • 8:30 PM", stock: "12 Days Remaining" },
                { name: "Thyronorm 50mcg", dosage: "1 Tablet Empty Stomach", time: "Early Morning • 6:30 AM", stock: "15 Days Remaining" },
                { name: "Methylcobalamin + D3", dosage: "1 Capsule Weekly", time: "Sunday Morning", stock: "3 Capsules Left" }
            ],
            vitals: {
                bp: "118/76 mmHg", bpTag: "Optimal",
                hr: "78 bpm", hrTag: "Normal Rhythm",
                spo2: "99%", spo2Tag: "Room Air",
                temp: "98.2 °F", tempTag: "Fasting Sugar: 108 mg/dL"
            },
            records: [
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.89 20.3a2 2 0 0 0 1.78 2.7h14.66a2 2 0 0 0 1.78-2.7L18 9.31V2"/></svg>', title: "HbA1c & Thyroid Panel (TSH: 2.8)", meta: "Thyrocare Labs • 28 days ago" },
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', title: "Endocrinology Care Summary", meta: "Dr. Anita Desai • 28 days ago" },
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/></svg>', title: "Diabetic Retinopathy Screening", meta: "Normal Eye Chart • 3 months ago" }
            ],
            docAdvice: '"Maintain low glycemic index diet. Take Thyronorm at least 30 mins before tea/breakfast. Fasting blood glucose test scheduled for next week."',
            checkinFeedback: "Glycemic control stable. No hypoglycemic episodes reported. Thyroid compliance on track."
        },
        vikram: {
            name: "Vikram Patel",
            avatar: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            demoMeta: "54 Yrs • Male • A+ Positive",
            abha: "ABHA: 91-3910-5829-1029",
            diagnosis: "Post-Orthopedic ACL Reconstruction Rehab",
            bannerTitle: "Managing: Post-Orthopedic ACL Reconstruction Recovery",
            bannerDesc: "Week 6 post-operative knee recovery chart and physical therapy mobility milestones active.",
            lastVisit: "7 Days Ago (Physiotherapy Review)",
            streak: "7 Days Streak",
            adherenceNum: "91%",
            doctorName: "Dr. Sanjay Nair",
            doctorDept: "MS (Orthopedics & Sports Medicine)",
            doctorRoom: "Room #1",
            tokenId: "#FU-1052",
            queuePos: "#01",
            waitTime: "~1 min",
            prescriptions: [
                { name: "Aceclofenac 100mg + Paracetamol", dosage: "1 Tablet SOS Pain", time: "After Food / As Needed", stock: "8 Tablets Left" },
                { name: "Calcium Citrate + Vit D3", dosage: "1 Tablet Daily Post Lunch", time: "Afternoon • 1:30 PM", stock: "20 Days Remaining" },
                { name: "Collagen Peptides Sachet", dosage: "1 Sachet Daily in Water", time: "Evening • 5:00 PM", stock: "14 Sachets Left" }
            ],
            vitals: {
                bp: "128/84 mmHg", bpTag: "Stable",
                hr: "72 bpm", hrTag: "Resting",
                spo2: "98%", spo2Tag: "Room Air",
                temp: "98.6 °F", tempTag: "Knee Flexion: 115°"
            },
            records: [
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', title: "Post-Op Knee X-Ray & MRI Review", meta: "Apollo Orthopedics • 7 days ago" },
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', title: "Physiotherapy Range of Motion Chart", meta: "Rehab Center • 7 days ago" },
                { icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15"/></svg>', title: "Surgical Discharge Summary", meta: "Dr. Sanjay Nair • 4 weeks ago" }
            ],
            docAdvice: '"Continue isometric quadriceps strengthening and hamstring curls twice daily. Wear functional knee brace when walking outdoors."',
            checkinFeedback: "Knee joint mobility progressing well (115° active flexion). Pain score low (2/10). Cleared for light cycling."
        }
    };

    let activeDemoKey = 'rahul';

    function renderOngoingProfile(key) {
        const p = ongoingDemoProfiles[key] || ongoingDemoProfiles.rahul;
        activeDemoKey = key;

        // Update tabs
        document.querySelectorAll('.demo-tab-btn').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-demo') === key);
        });

        // Header Single Account Elements
        const elHeaderAvatar = document.getElementById('ongoing-header-avatar');
        const elHeaderName = document.getElementById('ongoing-header-name');
        const elHeaderAbha = document.getElementById('ongoing-header-abha');

        if (elHeaderAvatar) elHeaderAvatar.innerHTML = p.avatar;
        if (elHeaderName) elHeaderName.textContent = `${p.name} (${p.demoMeta ? p.demoMeta.split('•')[0].trim() : '32M'})`;
        if (elHeaderAbha) elHeaderAbha.textContent = `${p.abha} • ABDM Linked`;

        // Profile Card
        const elAvatar = document.getElementById('ongoing-avatar');
        const elName = document.getElementById('ongoing-name');
        const elDemoMeta = document.getElementById('ongoing-demo-meta');
        const elDiag = document.getElementById('ongoing-diagnosis-val');
        const elLastVisit = document.getElementById('ongoing-last-visit');
        const elStreak = document.getElementById('ongoing-streak');
        const elAdherence = document.getElementById('ongoing-adherence-num');
        const elDocName = document.getElementById('ongoing-doc-name');
        const elDocDept = document.getElementById('ongoing-doc-dept');
        const elDocRoom = document.getElementById('ongoing-doc-room');

        if (elAvatar) elAvatar.innerHTML = p.avatar;
        if (elName) elName.textContent = p.name;
        if (elDemoMeta) elDemoMeta.textContent = p.demoMeta;
        if (elDiag) elDiag.textContent = p.diagnosis;
        if (elLastVisit) elLastVisit.textContent = p.lastVisit;
        if (elStreak) elStreak.textContent = p.streak;
        if (elAdherence) elAdherence.textContent = p.adherenceNum;
        if (elDocName) elDocName.textContent = p.doctorName;
        if (elDocDept) elDocDept.textContent = p.doctorDept;
        if (elDocRoom) elDocRoom.textContent = p.doctorRoom;

        // Banner
        const elBannerTitle = document.getElementById('ongoing-banner-title');
        if (elBannerTitle) elBannerTitle.textContent = p.bannerTitle;

        // Prescriptions List
        const elRxList = document.getElementById('ongoing-rx-list');
        if (elRxList) {
            elRxList.innerHTML = p.prescriptions.map((rx, idx) => `
                <div class="rx-item-card">
                    <div class="rx-item-left">
                        <div class="rx-item-top">
                            <strong class="rx-med-name">${rx.name}</strong>
                            <span class="rx-dosage-pill">${rx.dosage}</span>
                        </div>
                        <div class="rx-item-mid">⏰ Schedule: <strong>${rx.time}</strong> • <span class="text-blue">${rx.stock}</span></div>
                    </div>
                    <div class="rx-item-actions">
                        <button type="button" class="btn-take-dose" id="btn-dose-${idx}">
                            <span>Mark Taken ✓</span>
                        </button>
                        <button type="button" class="btn-refill-item" data-med="${rx.name}">
                            <span>Refill</span>
                        </button>
                    </div>
                </div>
            `).join('');

            // Attach dose listeners
            elRxList.querySelectorAll('.btn-take-dose').forEach(btn => {
                btn.addEventListener('click', () => {
                    btn.classList.toggle('taken');
                    if (btn.classList.contains('taken')) {
                        btn.innerHTML = '<span>Taken Today ✓</span>';
                        showToast('✓ Medication dose logged successfully in EHR!');
                    } else {
                        btn.innerHTML = '<span>Mark Taken ✓</span>';
                    }
                });
            });

            // Attach refill listeners
            elRxList.querySelectorAll('.btn-refill-item').forEach(btn => {
                btn.addEventListener('click', () => {
                    const med = btn.getAttribute('data-med');
                    btn.textContent = 'Refilled ✓';
                    btn.style.background = '#10b981';
                    btn.style.color = '#ffffff';
                    btn.style.borderColor = '#10b981';
                    if (typeof triggerPrescriptionRefill === 'function') {
                        triggerPrescriptionRefill([med]);
                    } else {
                        showToast(`✓ 30-Day Refill requested for ${med}! Prescription sent to Apollo Pharmacy.`);
                    }
                });
            });
        }

        // Vitals
        const elBp = document.getElementById('vital-bp');
        const elHr = document.getElementById('vital-hr');
        const elSpo2 = document.getElementById('vital-spo2');
        const elTemp = document.getElementById('vital-temp');

        if (elBp) elBp.textContent = p.vitals.bp;
        if (elHr) elHr.textContent = p.vitals.hr;
        if (elSpo2) elSpo2.textContent = p.vitals.spo2;
        if (elTemp) elTemp.textContent = p.vitals.temp;

        // Records
        const elRecords = document.getElementById('ongoing-records-list');
        if (elRecords) {
            elRecords.innerHTML = p.records.map(rec => `
                <div class="locker-record-item">
                    <span class="record-icon">${rec.icon}</span>
                    <div class="record-info">
                        <strong class="record-title">${rec.title}</strong>
                        <span class="record-meta">${rec.meta}</span>
                    </div>
                    <button type="button" class="record-action-btn" onclick="showToast('Downloading EHR Record: ${rec.title}')">View PDF</button>
                </div>
            `).join('');
        }

        // Advice
        const elAdvice = document.getElementById('ongoing-doc-advice');
        if (elAdvice) elAdvice.textContent = p.docAdvice;

        // Modal Token Info
        const elModalPname = document.getElementById('token-modal-pname');
        const elModalDname = document.getElementById('token-modal-dname');
        const elModalRoom = document.getElementById('token-modal-room');
        const elFollowupToken = document.getElementById('followup-token-number');
        const elFollowupQueue = document.getElementById('followup-queue-pos');

        if (elModalPname) elModalPname.textContent = p.name;
        if (elModalDname) elModalDname.textContent = p.doctorName;
        if (elModalRoom) elModalRoom.textContent = `${p.doctorDept} (${p.doctorRoom})`;
        if (elFollowupToken) elFollowupToken.textContent = p.tokenId;
        if (elFollowupQueue) elFollowupQueue.textContent = p.queuePos;
    }

    // ==========================================================================
    // Explain What's Happening (Voice & Text Health Notes)
    // ==========================================================================
    const ongoingExplainInput = document.getElementById('ongoing-explain-input');
    const btnVoiceExplain = document.getElementById('btn-voice-explain');
    const voiceExplainStatus = document.getElementById('voice-explain-status');
    const btnSubmitExplain = document.getElementById('btn-submit-explain');
    const aiClinicalAddendum = document.getElementById('ai-clinical-addendum');
    const addendumTextContent = document.getElementById('addendum-text-content');

    let isExplainingVoice = false;
    let explainRecognition = null;

    if (btnVoiceExplain && ongoingExplainInput) {
        btnVoiceExplain.addEventListener('click', () => {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRec) {
                showToast('Voice speech recognition not supported in this browser. Please type below.');
                ongoingExplainInput.focus();
                return;
            }

            if (!isExplainingVoice) {
                try {
                    explainRecognition = new SpeechRec();
                    explainRecognition.continuous = true;
                    explainRecognition.interimResults = true;
                    explainRecognition.lang = 'en-US';

                    explainRecognition.onstart = () => {
                        isExplainingVoice = true;
                        btnVoiceExplain.classList.add('recording');
                        if (voiceExplainStatus) voiceExplainStatus.textContent = 'Listening...';
                        showToast('🎙️ ArogyaAI is listening to your explanation. Speak clearly...');
                    };

                    explainRecognition.onresult = (event) => {
                        let finalTranscript = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                            if (event.results[i].isFinal) {
                                finalTranscript += event.results[i][0].transcript;
                            }
                        }
                        if (finalTranscript) {
                            const cur = ongoingExplainInput.value ? ongoingExplainInput.value + ' ' : '';
                            ongoingExplainInput.value = cur + finalTranscript;
                        }
                    };

                    explainRecognition.onerror = () => {
                        isExplainingVoice = false;
                        btnVoiceExplain.classList.remove('recording');
                        if (voiceExplainStatus) voiceExplainStatus.textContent = 'Voice Record';
                    };

                    explainRecognition.onend = () => {
                        isExplainingVoice = false;
                        btnVoiceExplain.classList.remove('recording');
                        if (voiceExplainStatus) voiceExplainStatus.textContent = 'Voice Record';
                    };

                    explainRecognition.start();
                } catch (e) {
                    console.warn(e);
                    showToast('Please type your symptom notes in the box below.');
                }
            } else {
                if (explainRecognition) explainRecognition.stop();
                isExplainingVoice = false;
                btnVoiceExplain.classList.remove('recording');
                if (voiceExplainStatus) voiceExplainStatus.textContent = 'Voice Record';
            }
        });
    }

    // Quick add chips
    document.querySelectorAll('.exp-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const text = chip.getAttribute('data-text');
            if (ongoingExplainInput) {
                const cur = ongoingExplainInput.value.trim();
                ongoingExplainInput.value = cur ? cur + ', ' + text : text;
                showToast(`Added note: "${text}"`);
                ongoingExplainInput.focus();
            }
        });
    });

    // ==========================================================================
    // Clinical Assessment Summary & Priority Reactivation Token Controller
    // ==========================================================================
    const reactivationSummaryModal = document.getElementById('reactivation-summary-modal');
    const closeReactSummaryBackdrop = document.getElementById('close-react-summary-backdrop');
    const btnCloseReactSummary = document.getElementById('btn-close-react-summary');
    const btnConfirmReactToken = document.getElementById('btn-confirm-react-token');
    const reactSumName = document.getElementById('react-sum-name');
    const reactSumAbha = document.getElementById('react-sum-abha');
    const reactSumComplaint = document.getElementById('react-sum-complaint');
    const reactSumStatus = document.getElementById('react-sum-status');
    const reactSumDoctor = document.getElementById('react-sum-doctor');
    const reactSumGuidance = document.getElementById('react-sum-guidance');

    function showReactivationSummary(complaintText, conditionStatus, guidanceText) {
        const p = ongoingDemoProfiles[activeDemoKey];
        if (reactSumName) reactSumName.textContent = p.name;
        if (reactSumAbha) reactSumAbha.textContent = p.abha;
        if (reactSumComplaint) reactSumComplaint.textContent = complaintText || 'Patient reported recurring health variations';
        if (reactSumStatus) reactSumStatus.textContent = conditionStatus || 'Active Hypertension + Health Update Logged';
        if (reactSumDoctor) reactSumDoctor.textContent = `${p.doctorName} (${p.doctorDept} • ${p.doctorRoom})`;
        if (reactSumGuidance) reactSumGuidance.textContent = guidanceText || 'EHR clinical note recorded. Priority token ready for doctor consultation.';

        if (reactivationSummaryModal) reactivationSummaryModal.style.display = 'flex';
    }

    if (btnCloseReactSummary) {
        btnCloseReactSummary.addEventListener('click', () => {
            if (reactivationSummaryModal) reactivationSummaryModal.style.display = 'none';
        });
    }

    if (closeReactSummaryBackdrop) {
        closeReactSummaryBackdrop.addEventListener('click', () => {
            if (reactivationSummaryModal) reactivationSummaryModal.style.display = 'none';
        });
    }

    if (btnConfirmReactToken) {
        btnConfirmReactToken.addEventListener('click', () => {
            if (reactivationSummaryModal) reactivationSummaryModal.style.display = 'none';
            const p = ongoingDemoProfiles[activeDemoKey];
            const newTok = '#REACT-' + Math.floor(1000 + Math.random() * 9000);

            // Update token modal
            const elFollowupToken = document.getElementById('followup-token-number');
            const elFollowupQueue = document.getElementById('followup-queue-pos');
            if (elFollowupToken) elFollowupToken.textContent = newTok;
            if (elFollowupQueue) elFollowupQueue.textContent = '#01 (Priority)';

            // Register into Doctor's queue
            if (typeof registerPatientConditionToDoctorQueue === 'function') {
                registerPatientConditionToDoctorQueue({
                    name: p.name,
                    token: newTok,
                    abha: p.abha,
                    ageGender: '32 Yrs • Male • O+ Positive',
                    visitType: 'Condition Flare-up / Reactivation',
                    risk: 'Moderate',
                    reason: reactSumComplaint ? reactSumComplaint.textContent : 'Reactivated condition explanation',
                    symptoms: `${reactSumComplaint ? reactSumComplaint.textContent : 'Morning dizziness and chest heaviness'} (Moderate Priority)`,
                    notes: 'Reactivation submitted from Ongoing Care health chart.',
                    vitals: 'BP 134/88 mmHg • HR 80 bpm • SpO2 98% • Temp 98.6°F',
                    observations: `EHR Reactivation: Patient reported "${reactSumComplaint ? reactSumComplaint.textContent : 'Symptom variation'}". Assigned priority OPD Token ${newTok}.`
                });
            }

            if (followupTokenModal) followupTokenModal.style.display = 'flex';
            setActiveToken({
                number: newTok,
                patientName: p.name,
                doctorName: p.doctorName,
                room: p.doctorRoom + ' • Priority OPD',
                queue: '#01 (Priority Check-in)'
            });
            showToast(`⚡ Priority Token ${newTok} Generated for ${p.doctorName}!`);

            // Voice audio reading
            const msg = `Reactivation consultation confirmed for ${p.name}. Token number ${newTok.replace('#', '')}. Queue position one, fast track. Please proceed to ${p.doctorRoom} for ${p.doctorName}.`;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(msg);
                u.rate = 0.95;
                window.speechSynthesis.speak(u);
            }
        });
    }

    // Submit explanation to Doctor
    if (btnSubmitExplain) {
        btnSubmitExplain.addEventListener('click', () => {
            const val = ongoingExplainInput ? ongoingExplainInput.value.trim() : '';
            if (!val) {
                showToast('Please describe what is happening or choose from quick chips.');
                if (ongoingExplainInput) ongoingExplainInput.focus();
                return;
            }

            if (aiClinicalAddendum && addendumTextContent) {
                addendumTextContent.textContent = `"${val}" (Reported today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
                aiClinicalAddendum.style.display = 'flex';
            }

            showToast(`✓ Clinical Note logged! Generating clinical summary...`);
            setTimeout(() => {
                showReactivationSummary(
                    val,
                    "Hypertension Maintenance + New Symptom Escalation",
                    "Patient reported new subjective symptoms. Triage classified as Moderate Priority. Priority consultation pass prepared."
                );
            }, 300);
        });
    }

    // ==========================================================================
    // Cured Disease Reactivation & Relapse System
    // ==========================================================================
    const btnReactivateAsthma = document.getElementById('btn-reactivate-asthma');
    const btnReactivateGerd = document.getElementById('btn-reactivate-gerd');

    if (btnReactivateAsthma) {
        btnReactivateAsthma.addEventListener('click', () => {
            const card = document.getElementById('disease-asthma-card');
            const pill = document.getElementById('asthma-status-pill');
            const desc = document.getElementById('asthma-desc');

            if (card && pill) {
                card.classList.add('reactivated');
                pill.className = 'disease-status-pill status-reactivated';
                pill.textContent = '🔥 Reactivated Flare-up (Doctor Alerted)';
                if (desc) desc.textContent = 'Patient reported return of wheezing/cough. Added Budecort Inhaler to active prescription hub and flagged Dr. Rajesh Iyer for pulmonary review.';
                btnReactivateAsthma.classList.add('active-btn');
                btnReactivateAsthma.innerHTML = '<span>✓ Reactivated in Care Plan</span>';

                // Add to prescriptions list if not already there
                const p = ongoingDemoProfiles[activeDemoKey];
                const hasInhaler = p.prescriptions.some(rx => rx.name.includes('Budecort'));
                if (!hasInhaler) {
                    p.prescriptions.push({
                        name: "Budecort 200mcg Inhaler",
                        dosage: "2 Puffs Night / SOS (Reactivated)",
                        time: "Bedtime • 10:00 PM",
                        stock: "30 Doses Approved"
                    });
                }
                renderOngoingProfile(activeDemoKey);

                // Update banner
                const elBannerTitle = document.getElementById('ongoing-banner-title');
                if (elBannerTitle) elBannerTitle.textContent = "Managing: Hypertension & Allergic Bronchitis (Reactivated Flare-up)";

                showToast('🔄 Bronchitis Reactivated! Opening clinical summary...');
                setTimeout(() => {
                    showReactivationSummary(
                        "Returning symptoms of allergic bronchitis, wheezing, and nocturnal cough after 3 months remission.",
                        "🔥 Reactivated Condition: Seasonal Allergic Bronchitis & Wheezing",
                        "Bronchodilator therapy reinstated in EHR chart. Priority Doctor Token prepared for Room #2."
                    );
                }, 350);
            }
        });
    }

    if (btnReactivateGerd) {
        btnReactivateGerd.addEventListener('click', () => {
            const card = document.getElementById('disease-gerd-card');
            const pill = document.getElementById('gerd-status-pill');
            const desc = document.getElementById('gerd-desc');

            if (card && pill) {
                card.classList.add('reactivated');
                pill.className = 'disease-status-pill status-reactivated';
                pill.textContent = '🔥 Reactivated Flare-up (Doctor Alerted)';
                if (desc) desc.textContent = 'Patient reported return of acid reflux / gastric discomfort. Added Pantoprazole 40mg to active prescriptions.';
                btnReactivateGerd.classList.add('active-btn');
                btnReactivateGerd.innerHTML = '<span>✓ Reactivated in Care Plan</span>';

                // Add to prescriptions list if not already there
                const p = ongoingDemoProfiles[activeDemoKey];
                const hasPanto = p.prescriptions.some(rx => rx.name.includes('Pantoprazole'));
                if (!hasPanto) {
                    p.prescriptions.push({
                        name: "Pantoprazole 40mg (Gastro-Resistant)",
                        dosage: "1 Tab Early Morning (Empty Stomach)",
                        time: "Morning • 7:00 AM",
                        stock: "15 Days Remaining"
                    });
                }
                renderOngoingProfile(activeDemoKey);

                showToast('🔄 Acid Reflux (GERD) Reactivated! Opening clinical summary...');
                setTimeout(() => {
                    showReactivationSummary(
                        "Returning heartburn, upper epigastric burning, and acid regurgitation after meals.",
                        "🔥 Reactivated Condition: Acid Reflux & Gastritis (GERD)",
                        "Proton pump inhibitor course reinstated. Priority Doctor Token prepared for Room #2."
                    );
                }, 350);
            }
        });
    }

    // Open/Close Ongoing Care Page
    function openOngoingCarePage() {
        if (ongoingCarePage) {
            renderOngoingProfile(activeDemoKey);
            ongoingCarePage.classList.add('active');
            document.body.style.overflow = 'hidden';
            saveAppState('ongoing-care', { demoKey: activeDemoKey });
            showToast(`Opening Ongoing Treatment Portal for ${ongoingDemoProfiles[activeDemoKey].name}`);
        }
    }

    function closeOngoingCarePage() {
        if (ongoingCarePage) {
            ongoingCarePage.classList.remove('active');
            document.body.style.overflow = '';
            saveAppState('home');
        }
    }

    window.openOngoingCarePage = openOngoingCarePage;
    window.closeOngoingCarePage = closeOngoingCarePage;

    if (btnStatusOngoing) {
        btnStatusOngoing.addEventListener('click', () => {
            closeStatusPage();
            openOngoingCarePage();
        });
    }

    if (btnOngoingBack) {
        btnOngoingBack.addEventListener('click', () => {
            closeOngoingCarePage();
            openStatusPage();
        });
    }

    // Follow-up Token Modal Handlers
    if (btnGenFollowupToken) {
        btnGenFollowupToken.addEventListener('click', () => {
            if (followupTokenModal) {
                followupTokenModal.style.display = 'flex';
                const p = ongoingDemoProfiles[activeDemoKey];
                const tokNum = document.getElementById('followup-token-number') ? document.getElementById('followup-token-number').textContent : '#FLW-9204';
                setActiveToken({
                    number: tokNum,
                    patientName: p.name,
                    doctorName: p.doctorName,
                    room: p.doctorRoom + ' • Follow-up Kiosk',
                    queue: '#02 (Est. ~6 mins)'
                });
                showToast(`🎟️ Follow-up Token ${tokNum} Ready!`);
            }
        });
    }

    if (btnCloseFollowupModal) {
        btnCloseFollowupModal.addEventListener('click', () => {
            if (followupTokenModal) followupTokenModal.style.display = 'none';
        });
    }

    if (closeFollowupBackdrop) {
        closeFollowupBackdrop.addEventListener('click', () => {
            if (followupTokenModal) followupTokenModal.style.display = 'none';
        });
    }

    if (btnPrintFollowup) {
        btnPrintFollowup.addEventListener('click', () => {
            const p = ongoingDemoProfiles[activeDemoKey];
            showToast(`🖨️ Printing Priority Follow-up Pass ${p.tokenId}...`);
            setTimeout(() => window.print(), 400);
        });
    }

    if (btnSpeakFollowup) {
        btnSpeakFollowup.addEventListener('click', () => {
            const p = ongoingDemoProfiles[activeDemoKey];
            const msg = `Follow up confirmed for ${p.name}. Token number ${p.tokenId.replace('#', '')}. Queue position ${p.queuePos}. Please proceed to ${p.doctorRoom} for ${p.doctorName}.`;
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(msg);
                u.rate = 0.95;
                window.speechSynthesis.speak(u);
                showToast('🔊 Playing Follow-up Audio');
            } else {
                showToast(msg);
            }
        });
    }

    // Refill Modal Elements
    const prescriptionRefillModal = document.getElementById('prescription-refill-modal');
    const closeRefillBackdrop = document.getElementById('close-refill-backdrop');
    const btnCloseRefillModal = document.getElementById('btn-close-refill-modal');
    const btnDoneRefill = document.getElementById('btn-done-refill');
    const btnPrintRefill = document.getElementById('btn-print-refill');
    const refillOrderId = document.getElementById('refill-order-id');
    const refillMedsSummary = document.getElementById('refill-meds-summary');

    function triggerPrescriptionRefill(medList) {
        const randId = '#RX-' + Math.floor(1000 + Math.random() * 9000);
        if (refillOrderId) refillOrderId.textContent = randId;

        if (refillMedsSummary) {
            refillMedsSummary.innerHTML = medList.map(med => `
                <div class="refill-med-row">
                    <strong class="refill-med-name">${med}</strong>
                    <span class="refill-med-qty">30 Days Supply (1 Pack)</span>
                </div>
            `).join('');
        }

        if (prescriptionRefillModal) prescriptionRefillModal.style.display = 'flex';
        showToast(`✓ Prescription Refill order ${randId} created & sent to Apollo Pharmacy!`);
    }

    if (btnCloseRefillModal) {
        btnCloseRefillModal.addEventListener('click', () => {
            if (prescriptionRefillModal) prescriptionRefillModal.style.display = 'none';
        });
    }

    if (closeRefillBackdrop) {
        closeRefillBackdrop.addEventListener('click', () => {
            if (prescriptionRefillModal) prescriptionRefillModal.style.display = 'none';
        });
    }

    if (btnDoneRefill) {
        btnDoneRefill.addEventListener('click', () => {
            if (prescriptionRefillModal) prescriptionRefillModal.style.display = 'none';
            showToast('✓ Refill order confirmed. You will receive an SMS upon pharmacy dispatch.');
        });
    }

    if (btnPrintRefill) {
        btnPrintRefill.addEventListener('click', () => {
            showToast('🖨️ Printing Pharmacy Refill Slip...');
            setTimeout(() => window.print(), 350);
        });
    }

    if (btnRefillAll) {
        btnRefillAll.addEventListener('click', () => {
            const p = ongoingDemoProfiles[activeDemoKey];
            const allMeds = p.prescriptions.map(r => r.name);
            triggerPrescriptionRefill(allMeds);

            // Update UI buttons on active screen
            const elRxList = document.getElementById('ongoing-rx-list');
            if (elRxList) {
                elRxList.querySelectorAll('.btn-refill-item').forEach(btn => {
                    btn.textContent = 'Refilled ✓';
                    btn.style.background = '#10b981';
                    btn.style.color = '#ffffff';
                    btn.style.borderColor = '#10b981';
                });
            }
        });
    }

    if (btnStatusSos) {
        btnStatusSos.addEventListener('click', () => {
            showToast('🚨 SOS Emergency Alert! Connecting to MediCare Emergency Response Team...');
        });
    }

    if (statusNeedHelp) {
        statusNeedHelp.addEventListener('click', (e) => {
            e.preventDefault();
            closeStatusPage();
            if (typeof openContactPage === 'function') openContactPage();
        });
    }

    // Services Page View Elements
    const servicesPage = document.getElementById('services-page');
    const servicesGoBack = document.getElementById('services-go-back');
    const navServicesBtn = document.getElementById('nav-services-btn');

    function openServicesPage() {
        if (servicesPage) {
            servicesPage.classList.add('active');
            document.body.style.overflow = 'hidden';
            saveAppState('services');
        }
    }

    function closeServicesPage() {
        if (servicesPage) {
            servicesPage.classList.remove('active');
            document.body.style.overflow = '';
            saveAppState('home');
        }
    }

    window.openServicesPage = openServicesPage;
    window.closeServicesPage = closeServicesPage;

    if (navServicesBtn) {
        navServicesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openServicesPage();
        });
    }

    document.querySelectorAll('a[href="#services"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openServicesPage();
        });
    });

    if (servicesGoBack) {
        servicesGoBack.addEventListener('click', closeServicesPage);
    }

    // About Us Page View Elements
    const aboutPage = document.getElementById('about-page');
    const aboutGoBack = document.getElementById('about-go-back');
    const navAboutBtn = document.getElementById('nav-about-btn');

    function openAboutPage() {
        if (aboutPage) {
            aboutPage.classList.add('active');
            document.body.style.overflow = 'hidden';
            saveAppState('about');
        }
    }

    function closeAboutPage() {
        if (aboutPage) {
            aboutPage.classList.remove('active');
            document.body.style.overflow = '';
            saveAppState('home');
        }
    }

    window.openAboutPage = openAboutPage;
    window.closeAboutPage = closeAboutPage;

    if (navAboutBtn) {
        navAboutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAboutPage();
        });
    }

    document.querySelectorAll('a[href="#about"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openAboutPage();
        });
    });

    if (aboutGoBack) {
        aboutGoBack.addEventListener('click', closeAboutPage);
    }

    // Contact Us Page View Elements
    const contactPage = document.getElementById('contact-page');
    const contactGoBack = document.getElementById('contact-go-back');
    const navContactBtn = document.getElementById('nav-contact-btn');
    const contactForm = document.getElementById('contact-form');

    function openContactPage() {
        if (contactPage) {
            contactPage.classList.add('active');
            document.body.style.overflow = 'hidden';
            saveAppState('contact');
        }
    }

    function closeContactPage() {
        if (contactPage) {
            contactPage.classList.remove('active');
            document.body.style.overflow = '';
            saveAppState('home');
        }
    }

    window.openContactPage = openContactPage;
    window.closeContactPage = closeContactPage;

    if (navContactBtn) {
        navContactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openContactPage();
        });
    }

    document.querySelectorAll('a[href="#contact"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            openContactPage();
        });
    });

    if (contactGoBack) {
        contactGoBack.addEventListener('click', closeContactPage);
    }

    // Contact Form Functional Processing
    const contactFormBlock = document.getElementById('contact-form-block');
    const contactSuccessView = document.getElementById('contact-success-view');
    const btnContactNewMsg = document.getElementById('btn-contact-new-msg');
    const btnContactGmailDirect = document.getElementById('btn-contact-gmail-direct');
    const btnContactMailtoFallback = document.getElementById('btn-contact-mailto-fallback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name')?.value.trim() || '';
            const email = document.getElementById('contact-email')?.value.trim() || '';
            const org = document.getElementById('contact-org')?.value.trim() || 'Individual';
            const inquiryType = document.getElementById('contact-inquiry')?.value || 'General Inquiry';
            const message = document.getElementById('contact-message')?.value.trim() || '';

            if (!name || !email || !message) {
                showToast('⚠️ Please fill in all required fields.');
                return;
            }

            const submitBtn = document.getElementById('btn-submit-contact');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span>Dispatching Inquiry...</span>`;
            }

            // Generate realistic ticket ID
            const ticketNumber = Math.floor(10000 + Math.random() * 90000);
            const ticketId = `#MCA-${ticketNumber}`;
            const timestamp = new Date().toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Store inquiry in localStorage
            const inquiryRecord = {
                ticketId,
                name,
                email,
                org,
                inquiryType,
                message,
                timestamp,
                status: 'Active in Clinical Queue'
            };

            try {
                const existing = JSON.parse(localStorage.getItem('medicare_inquiries') || '[]');
                existing.unshift(inquiryRecord);
                localStorage.setItem('medicare_inquiries', JSON.stringify(existing));
            } catch (err) {
                console.error('LocalStorage write error:', err);
            }

            // Dispatch to all 3 team emails via FormSubmit API
            const adminEmails = [
                'rajivgowdayc541@gmail.com',
                'syashas150506@gmail.com',
                'sankethmanomay@gmail.com'
            ];
            
            fetch(`https://formsubmit.co/ajax/${adminEmails[0]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `[MediCare AI ${ticketId}] Issue/Inquiry: ${inquiryType} from ${name}`,
                    _cc: `${adminEmails[1]},${adminEmails[2]}`,
                    _captcha: 'false',
                    ticket_id: ticketId,
                    full_name: name,
                    sender_email: email,
                    organization: org,
                    inquiry_type: inquiryType,
                    patient_issue_message: message,
                    submitted_at: timestamp
                })
            }).catch(err => {
                console.log('Background dispatch notice:', err);
            });

            setTimeout(() => {
                // Populate Confirmation Receipt
                const elTicketId = document.getElementById('receipt-ticket-id');
                const elContact = document.getElementById('receipt-name-email');
                const elInquiry = document.getElementById('receipt-inquiry-type');

                if (elTicketId) elTicketId.textContent = ticketId;
                if (elContact) elContact.textContent = `${name} (${email})`;
                if (elInquiry) elInquiry.textContent = inquiryType;

                const subject = `[MediCare AI ${ticketId}] Issue: ${inquiryType} - ${name}`;
                const bodyText = `Ticket ID: ${ticketId}\nFrom: ${name} (${email})\nOrganization: ${org}\nInquiry Type: ${inquiryType}\nDate: ${timestamp}\n\nIssue Details / Message:\n${message}\n\n--\nSent via MediCare AI Intake Platform to Support Team`;

                // 1. Direct Web Gmail Compose URL
                if (btnContactGmailDirect) {
                    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(adminEmails.join(','))}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
                    btnContactGmailDirect.href = gmailUrl;
                }

                // 2. Standard System Mail Client URL
                if (btnContactMailtoFallback) {
                    const mailtoUrl = `mailto:${adminEmails.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
                    btnContactMailtoFallback.href = mailtoUrl;
                    btnContactMailtoFallback.onclick = (event) => {
                        event.preventDefault();
                        window.location.href = mailtoUrl;
                    };
                }

                // Show confirmation state and hide form block
                if (contactFormBlock) {
                    contactFormBlock.style.display = 'none';
                }
                if (contactSuccessView) {
                    contactSuccessView.style.display = 'flex';
                }

                showToast(`✓ Ticket ${ticketId} dispatched to team inbox!`);

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `<span>Send Message</span><span class="submit-arrow">&rarr;</span>`;
                }
            }, 500);
        });
    }

    if (btnContactNewMsg) {
        btnContactNewMsg.addEventListener('click', () => {
            if (contactForm) {
                contactForm.reset();
            }
            if (contactFormBlock) {
                contactFormBlock.style.display = 'block';
            }
            if (contactSuccessView) {
                contactSuccessView.style.display = 'none';
            }
        });
    }

    // Global ESC key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (contactPage && contactPage.classList.contains('active')) {
                closeContactPage();
            } else if (aboutPage && aboutPage.classList.contains('active')) {
                closeAboutPage();
            } else if (servicesPage && servicesPage.classList.contains('active')) {
                closeServicesPage();
            } else if (statusPage && statusPage.classList.contains('active')) {
                closeStatusPage();
            }
        }
    });


    // ==========================================================================
    // Patient Intake Console - Real-Time Date & Clock
    // ==========================================================================
    function updateConsoleDateTime() {
        const dateElem = document.getElementById('live-date-val');
        const dayElem = document.getElementById('live-day-val');
        const timeElem = document.getElementById('live-time-val');
        if (!dateElem && !timeElem) return;

        const now = new Date();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        if (dateElem) dateElem.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        if (dayElem) dayElem.textContent = days[now.getDay()];
        if (timeElem) {
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            timeElem.textContent = `${hours}:${minutes} ${ampm}`;
        }
    }
    updateConsoleDateTime();
    setInterval(updateConsoleDateTime, 1000);

    // ==========================================================================
    // Patient Intake Console - Multi-Step Stepper & Views Controller
    // ==========================================================================
    const stepItem1 = document.getElementById('step-item-1');
    const stepItem2 = document.getElementById('step-item-2');
    const stepItem3 = document.getElementById('step-item-3');

    const abhaStep1View = document.getElementById('abha-step1-view');
    const abhaStep2View = document.getElementById('abha-step2-view');
    const abhaStep3View = document.getElementById('abha-step3-view');

    const btnBackStep1 = document.getElementById('btn-back-step1');
    const btnConfirmIntake = document.getElementById('btn-confirm-intake');

    const btnScanQr = document.getElementById('btn-scan-qr');
    const consoleQrOverlay = document.getElementById('console-qr-overlay');
    const btnCloseScanner = document.getElementById('btn-close-scanner');
    const btnScanSimulate = document.getElementById('btn-scan-simulate');

    const btnNoAbha = document.getElementById('btn-no-abha');
    const consoleNoAbhaOverlay = document.getElementById('console-no-abha-overlay');
    const btnCloseNoAbha = document.getElementById('btn-close-no-abha');
    const btnGenTempAbha = document.getElementById('btn-gen-temp-abha');
    const btnGuestIntake = document.getElementById('btn-guest-intake');

    const btnIntakeStatus = document.getElementById('btn-intake-status');
    const btnIntakeSymptom = document.getElementById('btn-intake-symptom');
    const btnIntakeDoctor = document.getElementById('btn-intake-doctor');
    const btnIntakeFinish = document.getElementById('btn-intake-finish');

    const consoleNeedHelp = document.getElementById('console-need-help');
    const btnLangToggle = document.getElementById('btn-lang-toggle');
    const consoleLangDropdown = document.getElementById('console-lang-dropdown');
    const currentLangName = document.getElementById('current-lang-name');

    function setConsoleStep(stepNum) {
        // Stepper Navigation
        if (stepItem1) {
            stepItem1.classList.remove('active', 'done');
            if (stepNum === 1) stepItem1.classList.add('active');
            if (stepNum > 1) stepItem1.classList.add('done');
        }
        if (stepItem2) {
            stepItem2.classList.remove('active', 'done');
            if (stepNum === 2) stepItem2.classList.add('active');
            if (stepNum > 2) stepItem2.classList.add('done');
        }
        if (stepItem3) {
            stepItem3.classList.remove('active', 'done');
            if (stepNum === 3) stepItem3.classList.add('active');
        }

        // View Visibility
        if (abhaStep1View) abhaStep1View.style.display = stepNum === 1 ? 'flex' : 'none';
        if (abhaStep2View) abhaStep2View.style.display = stepNum === 2 ? 'flex' : 'none';
        if (abhaStep3View) abhaStep3View.style.display = stepNum === 3 ? 'flex' : 'none';
    }

    // Auto-Format 14-Digit ABHA with Hyphens as user types
    if (abhaInput) {
        abhaInput.addEventListener('input', (e) => {
            let val = e.target.value;
            // Only auto-format if user is typing numeric characters
            if (/^[\d-]+$/.test(val)) {
                let cleaned = val.replace(/\D/g, '').substring(0, 14);
                let formatted = '';
                if (cleaned.length > 0) formatted += cleaned.substring(0, 2);
                if (cleaned.length > 2) formatted += '-' + cleaned.substring(2, 6);
                if (cleaned.length > 6) formatted += '-' + cleaned.substring(6, 10);
                if (cleaned.length > 10) formatted += '-' + cleaned.substring(10, 14);
                e.target.value = formatted;
            }
        });

        abhaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (verifyAbhaBtn) verifyAbhaBtn.click();
            }
        });
    }

    // Step 1: Verification Action
    function processAbhaVerification(inputId) {
        const idVal = inputId || (abhaInput ? abhaInput.value.trim() : '');
        if (!idVal) {
            showToast('Please enter your 14-digit ABHA Code or select a profile.');
            if (abhaInput) abhaInput.focus();
            return;
        }

        if (verifyBtnText) verifyBtnText.textContent = 'Verifying ABDM...';

        setTimeout(() => {
            if (verifyBtnText) verifyBtnText.textContent = 'Continue';
            isAbhaVerified = true;

            // Populate Patient Record & Bind to Ongoing Care Session
            if (idVal.toLowerCase().includes('priya')) {
                activeDemoKey = 'ananya';
                ongoingDemoProfiles.ananya.name = 'Priya Sharma';
                ongoingDemoProfiles.ananya.abha = 'ABHA: 82-9912-4410-1829';
                if (patientName) patientName.textContent = 'Priya Sharma';
                if (patientAbhaNum) patientAbhaNum.textContent = '82-9912-4410-1829';
                if (patientDemo) patientDemo.textContent = 'Female, 28 Yrs (B+ Rh+)';
                if (patientRecords) patientRecords.textContent = '2 Synced Encounters';
            } else if (idVal.toLowerCase().includes('vikram') || idVal.includes('3910')) {
                activeDemoKey = 'vikram';
                if (patientName) patientName.textContent = 'Vikram Patel';
                if (patientAbhaNum) patientAbhaNum.textContent = '91-3910-5829-1029';
                if (patientDemo) patientDemo.textContent = 'Male, 54 Yrs (A+ Rh+)';
                if (patientRecords) patientRecords.textContent = '3 Synced Encounters';
            } else if (idVal.toLowerCase().includes('guest')) {
                activeDemoKey = 'rahul';
                ongoingDemoProfiles.rahul.name = 'Guest Patient';
                ongoingDemoProfiles.rahul.abha = 'ABHA: GUEST-INTAKE-2026';
                if (patientName) patientName.textContent = 'Guest Patient (Walk-in)';
                if (patientAbhaNum) patientAbhaNum.textContent = 'GUEST-INTAKE-2026';
                if (patientDemo) patientDemo.textContent = 'Adult Patient (Rapid Pass)';
                if (patientRecords) patientRecords.textContent = 'Temporary Chart Created';
            } else if (idVal.toLowerCase().includes('temp')) {
                activeDemoKey = 'rahul';
                ongoingDemoProfiles.rahul.name = 'Verified Patient';
                ongoingDemoProfiles.rahul.abha = 'ABHA: ' + idVal;
                if (patientName) patientName.textContent = 'Verified Patient (Instant ABHA)';
                if (patientAbhaNum) patientAbhaNum.textContent = idVal;
                if (patientDemo) patientDemo.textContent = 'Adult (Verified ABDM)';
                if (patientRecords) patientRecords.textContent = '1 Linked Record';
            } else {
                activeDemoKey = 'rahul';
                const formattedAbha = idVal.length >= 10 ? idVal : '91-4820-1928-3746';
                ongoingDemoProfiles.rahul.name = 'Rahul Verma';
                ongoingDemoProfiles.rahul.abha = 'ABHA: ' + formattedAbha;
                if (patientName) patientName.textContent = 'Rahul Verma';
                if (patientAbhaNum) patientAbhaNum.textContent = formattedAbha;
                if (patientDemo) patientDemo.textContent = 'Male, 32 Yrs (O+ Rh+)';
                if (patientRecords) patientRecords.textContent = '4 Synced Records';
            }

            // Sync verified ABHA badge across views
            const arogyaAbhaBadge = document.querySelector('.abha-badge-id');
            if (arogyaAbhaBadge && patientAbhaNum) {
                arogyaAbhaBadge.textContent = 'ABHA: ' + patientAbhaNum.textContent;
            }

            setConsoleStep(2);
            showToast('✓ Ayushman Bharat Identity Verified: ' + (patientName ? patientName.textContent : ''));
        }, 350);
    }

    if (verifyAbhaBtn) {
        verifyAbhaBtn.addEventListener('click', () => {
            processAbhaVerification();
        });
    }

    // Step 2 Action Buttons
    if (btnBackStep1) {
        btnBackStep1.addEventListener('click', () => {
            setConsoleStep(1);
            if (abhaInput) abhaInput.focus();
        });
    }

    if (btnConfirmIntake) {
        btnConfirmIntake.addEventListener('click', () => {
            setConsoleStep(3);
            showToast('✓ Patient Intake Confirmed & Token Generated!');
        });
    }

    // Step 3 Action Buttons
    if (btnIntakeStatus) {
        btnIntakeStatus.addEventListener('click', () => {
            closeModal(abhaModal);
            openStatusPage();
            showToast('Select your current visit status.');
        });
    }

    if (btnIntakeFinish) {
        btnIntakeFinish.addEventListener('click', () => {
            closeModal(abhaModal);
            showToast('Intake process complete. Have a great consultation!');
        });
    }

    // QR Code Scanner Overlay Handling
    if (btnScanQr && consoleQrOverlay) {
        btnScanQr.addEventListener('click', () => {
            consoleQrOverlay.style.display = 'flex';
        });
    }

    if (btnCloseScanner && consoleQrOverlay) {
        btnCloseScanner.addEventListener('click', () => {
            consoleQrOverlay.style.display = 'none';
        });
    }

    if (btnScanSimulate && consoleQrOverlay) {
        btnScanSimulate.addEventListener('click', () => {
            consoleQrOverlay.style.display = 'none';
            if (abhaInput) abhaInput.value = '91-4820-1928-3746';
            processAbhaVerification('91-4820-1928-3746');
        });
    }

    // "I don't have an ABHA Code" Overlay Handling
    if (btnNoAbha && consoleNoAbhaOverlay) {
        btnNoAbha.addEventListener('click', () => {
            consoleNoAbhaOverlay.style.display = 'flex';
        });
    }

    if (btnCloseNoAbha && consoleNoAbhaOverlay) {
        btnCloseNoAbha.addEventListener('click', () => {
            consoleNoAbhaOverlay.style.display = 'none';
        });
    }

    if (btnGenTempAbha && consoleNoAbhaOverlay) {
        btnGenTempAbha.addEventListener('click', () => {
            consoleNoAbhaOverlay.style.display = 'none';
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            const tempAbha = `91-TEMP-${randomNum}-2026`;
            if (abhaInput) abhaInput.value = tempAbha;
            processAbhaVerification(tempAbha);
        });
    }

    if (btnGuestIntake && consoleNoAbhaOverlay) {
        btnGuestIntake.addEventListener('click', () => {
            consoleNoAbhaOverlay.style.display = 'none';
            if (abhaInput) abhaInput.value = 'GUEST-INTAKE-2026';
            processAbhaVerification('GUEST-INTAKE-2026');
        });
    }

    // Console Footer: Need Help & Language Switcher
    if (consoleNeedHelp) {
        consoleNeedHelp.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(abhaModal);
            if (typeof openContactPage === 'function') openContactPage();
        });
    }

    if (btnLangToggle && consoleLangDropdown) {
        btnLangToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = consoleLangDropdown.style.display === 'flex';
            consoleLangDropdown.style.display = isOpen ? 'none' : 'flex';
        });

        document.querySelectorAll('.lang-opt-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.lang-opt-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                if (currentLangName) currentLangName.textContent = item.textContent.split(' ')[0];
                consoleLangDropdown.style.display = 'none';
                showToast(`Language set to ${item.textContent}`);
            });
        });

        document.addEventListener('click', (e) => {
            if (!btnLangToggle.contains(e.target) && !consoleLangDropdown.contains(e.target)) {
                consoleLangDropdown.style.display = 'none';
            }
        });
    }

    // Reset console steps whenever modal is opened
    const originalOpenAbha = window.openAbhaModal;
    window.openAbhaModal = () => {
        setConsoleStep(1);
        if (abhaInput) abhaInput.value = '';
        if (originalOpenAbha) originalOpenAbha();
    };

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

    // ==========================================================================
    // Comprehensive Multilingual Translation Engine (Kannada, Hindi, English)
    // ==========================================================================
    const translations = {
        kn: {
            langName: 'ಕನ್ನಡ',
            langShort: 'ಕನ್ನಡ',
            navHome: 'ಮುಖಪುಟ',
            navServices: 'ಸೇವೆಗಳು',
            navAbout: 'ನಮ್ಮ ಬಗ್ಗೆ',
            navContact: 'ಸಂಪರ್ಕಿಸಿ',
            aiBadge: 'AI ಚಾಲಿತ ಆರೋಗ್ಯ ರಕ್ಷಣೆ',
            heroTitle: 'ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಇನ್ನಷ್ಟು <br><span class="highlight-blue">ಸ್ಮಾರ್ಟ್</span> <span class="highlight-cyan">AI</span> ಜೊತೆ',
            heroDesc: 'ಮೆಡಿಕೇರ್ AI ಒಂದು ಸುಲಭ ಮತ್ತು ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಲಭ್ಯವಾಗುವ ಸ್ಮಾರ್ಟ್ ಆರೋಗ್ಯ ಸೇವಾ ವೇದಿಕೆಯಾಗಿದೆ.<br>ಸುಧಾರಿತ AI ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ವೈದ್ಯಕೀಯ ಆರೈಕೆಯ ಸಮ್ಮಿಲನ.',
            heroGetStarted: 'ಪ್ರಾರಂಭಿಸಿ',
            heroLearnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
            cardReliabilityTitle: 'ವಿಶ್ವಾಸಾರ್ಹತೆ',
            cardReliabilitySub: 'ಸುರಕ್ಷಿತ & ನಿಖರ AI ಒಳನೋಟಗಳು',
            cardExpTitle: 'ಅನುಭವಿ ತಜ್ಞರು',
            cardExpSub: 'ತಜ್ಞರ ಬೆಂಬಲದ ಸುಧಾರಿತ ತಂತ್ರಜ್ಞಾನ',
            cardProfTitle: 'ವೃತ್ತಿಪರತೆ',
            cardProfSub: 'ಪ್ರತಿಯೊಂದು ಹಂತದಲ್ಲೂ ನಂಬಿಕಸ್ಥ ಆರೈಕೆ',
            dock1Title: 'ಸ್ಮಾರ್ಟ್ ಲಕ್ಷಣ ಪರೀಕ್ಷೆ',
            dock1Sub: 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಿ, AI ವಿಶ್ಲೇಷಣೆ ಪಡೆಯಿರಿ.',
            dock2Title: 'ಆರೋಗ್ಯ ಮೌಲ್ಯಮಾಪನ',
            dock2Sub: 'ಸಮಗ್ರ ಬುದ್ಧಿವಂತ ಮೌಲ್ಯಮಾಪನ ವರದಿ.',
            dock3Title: 'ತಜ್ಞರ ಸಮಾಲೋಚನೆ',
            dock3Sub: 'ಅನುಭವಿ ವೈದ್ಯಕೀಯ ತಜ್ಞರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.',
            dock4Title: 'ವಿಶೇಷ ಚಿಕಿತ್ಸೆ ಪಡೆಯಿರಿ',
            // Console ABHA
            consoleBrandTitle: 'ರೋಗಿ ನೋಂದಣಿ',
            consoleBrandSub: 'ಕನ್ಸೋಲ್',
            step1Title: 'ABHA ಕೋಡ್',
            step1Sub: 'ಕೋಡ್ ನಮೂದಿಸಿ',
            step2Title: 'ರೋಗಿಯ ವಿವರ',
            step2Sub: 'ಮಾಹಿತಿ ಪರಿಶೀಲಿಸಿ',
            step3Title: 'ನೋಂದಣಿ ಪೂರ್ಣ',
            step3Sub: 'ಸಮಾಲೋಚನೆಗೆ ಸಿದ್ಧ',
            trustText: 'ನಿಮ್ಮ ಡೇಟಾ ನಮ್ಮೊಂದಿಗೆ ಸಂಪೂರ್ಣ ಸುರಕ್ಷಿತವಾಗಿದೆ.',
            secTagTitle: 'ಸುರಕ್ಷಿತ & HIPAA ಕಂಪ್ಲೈಂಟ್',
            secTagSub: 'ನಿಮ್ಮ ಗೌಪ್ಯತೆಗೆ ನಮ್ಮ ಮೊದಲ ಆದ್ಯತೆ',
            mainHeadline: 'ರೋಗಿಯ ABHA ಕೋಡ್ ನಮೂದಿಸಿ',
            mainSubtext: 'ABHA (ಆಯುಷ್ಮಾನ್ ಭಾರತ್ ಹೆಲ್ತ್ ಅಕೌಂಟ್) ಕೋಡ್ ನಿಮ್ಮ ಆರೋಗ್ಯ ದಾಖಲೆಯನ್ನು ಅನನ್ಯವಾಗಿ ಗುರುತಿಸುತ್ತದೆ.',
            abhaPlaceholder: '14-ಅಂಕಿಯ ABHA ಕೋಡ್ ನಮೂದಿಸಿ',
            btnScan: 'ಸ್ಕ್ಯಾನ್',
            btnContinue: 'ಮುಂದುವರಿಸಿ',
            btnNoAbha: 'ನನ್ನ ಬಳಿ ABHA ಕೋಡ್ ಇಲ್ಲ',
            demoLabel: 'ಪರೀಕ್ಷಾರ್ಥ ಪ್ರೊಫೈಲ್‌ಗಳು:',
            needHelp: 'ಸಹಾಯ ಬೇಕೇ?',
            staffHelp: 'ನಮ್ಮ ಸಿಬ್ಬಂದಿಯಿಂದ ನೆರವು ಪಡೆಯಿರಿ.',
            btnChangeCode: '← ಕೋಡ್ ಬದಲಾಯಿಸಿ',
            btnConfirmIntake: 'ದೃಢೀಕರಿಸಿ & ನೋಂದಣಿ ಮುಂದುವರಿಸಿ',
            completeHeadline: 'ರೋಗಿ ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ!',
            completeSubtext: 'ABHA ಗುರುತನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಲಿಂಕ್ ಮಾಡಲಾಗಿದೆ. ವೈದ್ಯರ ಸಮಾಲೋಚನೆಗೆ ಸಿದ್ಧ.',
            tokenLabel: 'ನೋಂದಣಿ ಟೋಕನ್:',
            tokenQueue: 'ಅಂದಾಜು ಕಾಯುವ ಸಮಯ: ~3 ನಿಮಿಷಗಳು',
            optStatusTitle: 'ಆರೋಗ್ಯ ಸ್ಥಿತಿ ಆಯ್ಕೆಮಾಡಿ',
            optStatusSub: 'ಹೊಸ ಸಮಸ್ಯೆ, ಮುಂದುವರಿಯುತ್ತಿರುವ ಚಿಕಿತ್ಸೆ, ಅಥವಾ ತುರ್ತು',
            optSymptomTitle: 'AI ಲಕ್ಷಣ ತಪಾಸಕ',
            optSymptomSub: 'ಕ್ಲಿನಿಕಲ್ AI ಮೂಲಕ ಲಕ್ಷಣ ಪರೀಕ್ಷಿಸಿ',
            optDoctorTitle: 'ತಜ್ಞ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
            optDoctorSub: 'ಪರಿಣಿತ ತಜ್ಞ ವೈದ್ಯರೊಂದಿಗೆ ನೇರ ಸಮಾಲೋಚನೆ',
            btnDone: 'ಪೂರ್ಣಗೊಳಿಸಿ & ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
            // Status Page
            statusTitle: 'ನಿಮ್ಮ ಆರೋಗ್ಯ <br><span class="highlight-status-cyan">ಸ್ಥಿತಿ ಏನು?</span>',
            statusHelpHeading: 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು <br><span class="highlight-blue-text">ನಾವು ಇಲ್ಲಿದ್ದೇವೆ</span>',
            btnStatusNew: 'ಹೊಸ ಸಮಸ್ಯೆ (New condition)',
            btnStatusOngoing: 'ಮುಂದುವರಿಯುತ್ತಿರುವ ಚಿಕಿತ್ಸೆ (On-going)',
            btnStatusSos: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿ (SOS-Emergency)',
            statusGoBack: '← ಹಿಂದೆ ಹೋಗಿ',
            statusNeedHelp: 'ಸಹಾಯ ಬೇಕೇ...',
            // Gateway
            gatewayProceed: 'ಮೆಡಿಕೇರ್ AI ಗೆ ಮುಂದುವರಿಯಿರಿ'
        },
        hi: {
            langName: 'हिन्दी',
            langShort: 'हिन्दी',
            navHome: 'मुख्य पृष्ठ',
            navServices: 'सेवाएं',
            navAbout: 'हमारे बारे में',
            navContact: 'संपर्क करें',
            aiBadge: 'AI संचालित स्वास्थ्य सेवा',
            heroTitle: 'स्वास्थ्य सेवा बनी <br><span class="highlight-blue">स्मार्ट</span> <span class="highlight-cyan">AI</span> के साथ',
            heroDesc: 'मेडीकेयर AI एक स्मार्ट स्वास्थ्य सेवा मंच है जिसे स्वास्थ्य सेवा को सरल और सुलभ बनाने के लिए बनाया गया है।<br>उन्नत AI तकनीक और विश्वसनीय चिकित्सा देखभाल का संगम।',
            heroGetStarted: 'शुरू करें',
            heroLearnMore: 'और जानें',
            cardReliabilityTitle: 'विश्वसनीयता',
            cardReliabilitySub: 'सुरक्षित और सटीक AI अंतर्दृष्टि',
            cardExpTitle: 'अनुभवी विशेषज्ञ',
            cardExpSub: 'विशेषज्ञों द्वारा समर्थित उन्नत तकनीक',
            cardProfTitle: 'पेशेवर सेवा',
            cardProfSub: 'हर कदम पर विश्वसनीय देखभाल',
            dock1Title: 'स्मार्ट लक्षण जांच',
            dock1Sub: 'अपने लक्षण बताएं और AI अंतर्दृष्टि प्राप्त करें।',
            dock2Title: 'स्वास्थ्य मूल्यांकन',
            dock2Sub: 'संपूर्ण एवं सटीक स्मार्ट स्वास्थ्य रिपोर्ट।',
            dock3Title: 'विशेषज्ञ परामर्श',
            dock3Sub: 'सही स्वास्थ्य विशेषज्ञों से सीधे जुड़ें।',
            dock4Title: 'विशेष देखभाल प्राप्त करें',
            // Console ABHA
            consoleBrandTitle: 'मरीज प्रवेश',
            consoleBrandSub: 'कंसोल',
            step1Title: 'ABHA कोड',
            step1Sub: 'कोड दर्ज करें',
            step2Title: 'मरीज का विवरण',
            step2Sub: 'जानकारी जांचें',
            step3Title: 'प्रवेश पूर्ण',
            step3Sub: 'परामर्श के लिए तैयार',
            trustText: 'आपका डेटा हमारे साथ पूरी तरह सुरक्षित है।',
            secTagTitle: 'सुरक्षित और HIPAA अनुपालन',
            secTagSub: 'हम आपकी गोपनीयता को प्राथमिकता देते हैं',
            mainHeadline: 'मरीज का ABHA कोड दर्ज करें',
            mainSubtext: 'ABHA (आयुष्मान भारत स्वास्थ्य खाता) कोड आपके स्वास्थ्य रिकॉर्ड की विशिष्ट पहचान करता है।',
            abhaPlaceholder: '14-अंकीय ABHA कोड दर्ज करें',
            btnScan: 'स्कैन',
            btnContinue: 'आगे बढ़ें',
            btnNoAbha: 'मेरे पास ABHA कोड नहीं है',
            demoLabel: 'टेस्ट प्रोफाइल चुनें:',
            needHelp: 'मदद चाहिए?',
            staffHelp: 'हमारे कर्मचारियों से सहायता प्राप्त करें।',
            btnChangeCode: '← कोड बदलें',
            btnConfirmIntake: 'सत्यापित करें और आगे बढ़ें',
            completeHeadline: 'मरीज प्रवेश सफलतापूर्वक सत्यापित!',
            completeSubtext: 'ABHA पहचान को रोगी चार्ट से सफलतापूर्वक जोड़ा गया। परामर्श के लिए तैयार।',
            tokenLabel: 'प्रवेश टोकन:',
            tokenQueue: 'अनुमानित प्रतीक्षा समय: ~3 मिनट',
            optStatusTitle: 'अपनी स्थिति चुनें',
            optStatusSub: 'नई स्थिति, जारी उपचार, या आपातकालीन',
            optSymptomTitle: 'AI लक्षण जांचकर्ता',
            optSymptomSub: 'AI के साथ लक्षणों का आकलन करें',
            optDoctorTitle: 'विशेषज्ञ डॉक्टर बुक करें',
            optDoctorSub: 'प्रमाणित विशेषज्ञ डॉक्टरों से परामर्श लें',
            btnDone: 'पूर्ण करें और होमपेज पर लौटें',
            // Status Page
            statusTitle: 'आपकी स्वास्थ्य <br><span class="highlight-status-cyan">स्थिति क्या है?</span>',
            statusHelpHeading: 'हम आपकी मदद के लिए <br><span class="highlight-blue-text">यहां मौजूद हैं</span>',
            btnStatusNew: 'नई समस्या (New condition)',
            btnStatusOngoing: 'जारी स्थिति (On-going)',
            btnStatusSos: 'आपातकालीन सहायता (SOS)',
            statusGoBack: '← वापस जाएं',
            statusNeedHelp: 'मदद चाहिए...',
            // Gateway
            gatewayProceed: 'मेडीकेयर AI में आगे बढ़ें'
        },
        en: {
            langName: 'English',
            langShort: 'EN',
            navHome: 'Home',
            navServices: 'Services',
            navAbout: 'About Us',
            navContact: 'Contact',
            aiBadge: 'AI Powered Health Care',
            heroTitle: 'Health Care Made<br><span class="highlight-blue">Smarter</span> With <span class="highlight-cyan">AI</span>',
            heroDesc: 'MediCare AI is a smart healthcare platform designed to make healthcare simple and accessible.<br>Its clean, modern interface combines AI technology with trusted medical care.',
            heroGetStarted: 'Get Started',
            heroLearnMore: 'Learn More',
            cardReliabilityTitle: 'Reliability',
            cardReliabilitySub: 'secured & accurate AI-Powered insights',
            cardExpTitle: 'Experienced',
            cardExpSub: 'Advance Technology Backed by Experts',
            cardProfTitle: 'Professional',
            cardProfSub: 'Trusted Care every step of the way',
            dock1Title: 'Smart Symptom Check',
            dock1Sub: 'Describe you symptom and get AI insights.',
            dock2Title: 'Health Assessment',
            dock2Sub: 'Complete intelligent assessment.',
            dock3Title: 'Connect & Consult',
            dock3Sub: 'Get connected with the right healthcare specialists',
            dock4Title: 'Get specialized care',
            // Console ABHA
            consoleBrandTitle: 'Patient Intake',
            consoleBrandSub: 'CONSOLE',
            step1Title: 'ABHA Code',
            step1Sub: 'Enter Code',
            step2Title: 'Patient Details',
            step2Sub: 'Verify Information',
            step3Title: 'Intake Complete',
            step3Sub: 'Ready for Consultation',
            trustText: 'Your data is safe and secure with us.',
            secTagTitle: 'Secure & HIPAA Compliant',
            secTagSub: 'We prioritize your privacy',
            mainHeadline: 'Enter Patient ABHA Code',
            mainSubtext: 'The ABHA (Ayushman Bharat Health Account) code uniquely identifies your health record.',
            abhaPlaceholder: 'Enter 14-digit ABHA Code',
            btnScan: 'Scan',
            btnContinue: 'Continue',
            btnNoAbha: 'I don’t have an ABHA Code',
            demoLabel: 'Quick Demo Profiles:',
            needHelp: 'Need help?',
            staffHelp: 'Ask our staff for assistance.',
            btnChangeCode: '← Change ABHA Code',
            btnConfirmIntake: 'Confirm & Proceed to Intake',
            completeHeadline: 'Patient Intake Verified!',
            completeSubtext: 'ABHA Identity successfully linked to patient chart. Ready for consultation.',
            tokenLabel: 'Intake Token:',
            tokenQueue: 'Estimated Wait: ~3 mins',
            optStatusTitle: 'Select Visit Status',
            optStatusSub: 'New condition, On-going, or SOS',
            optSymptomTitle: 'AI Symptom Checker',
            optSymptomSub: 'Assess symptoms with clinical AI',
            optDoctorTitle: 'Book Specialist Doctor',
            optDoctorSub: 'Direct consult with verified MDs',
            btnDone: 'Done & Return to Home',
            // Status Page
            statusTitle: 'What’s your<br><span class="highlight-status-cyan">Status?</span>',
            statusHelpHeading: 'WE ARE HERE TO <br><span class="highlight-blue-text">HELP YOU</span>',
            btnStatusNew: 'New condition',
            btnStatusOngoing: 'On-going',
            btnStatusSos: 'SOS-Emergency',
            statusGoBack: '← Go back',
            statusNeedHelp: 'Need help...',
            // Gateway
            gatewayProceed: 'Continue to MediCare AI'
        }
    };

    let currentAppLanguage = 'kn'; // Default to Kannada as requested

    function applyLanguage(lang) {
        if (!translations[lang]) lang = 'kn';
        currentAppLanguage = lang;
        const dict = translations[lang];

        // Set document language attributes for typography alignment
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('data-lang', lang);
        if (document.body) {
            document.body.setAttribute('data-lang', lang);
        }

        try {
            localStorage.setItem('medicare_lang', lang);
        } catch (e) {}

        // 1. Navigation
        const navHome = document.getElementById('nav-link-home');
        if (navHome) navHome.textContent = dict.navHome;
        if (navServicesBtn) navServicesBtn.textContent = dict.navServices;
        if (navAboutBtn) navAboutBtn.textContent = dict.navAbout;
        if (navContactBtn) navContactBtn.textContent = dict.navContact;

        const navCurrentLangTxt = document.getElementById('nav-current-lang-txt');
        if (navCurrentLangTxt) navCurrentLangTxt.textContent = dict.langName;

        // 2. Hero Section
        const aiBadge = document.querySelector('.ai-badge span');
        if (aiBadge) aiBadge.textContent = dict.aiBadge;

        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.innerHTML = dict.heroTitle;

        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription) heroDescription.innerHTML = dict.heroDesc;

        if (heroGetStarted) {
            heroGetStarted.innerHTML = `${dict.heroGetStarted} <svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
        }

        if (heroLearnMore) {
            heroLearnMore.innerHTML = `${dict.heroLearnMore} <div class="play-icon-circle"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3L19 12L5 21V3Z"/></svg></div>`;
        }

        // 3. Hero Feature Cards
        const cardRelTitle = document.querySelector('.card-reliability .card-title');
        const cardRelSub = document.querySelector('.card-reliability .card-subtitle');
        if (cardRelTitle) cardRelTitle.textContent = dict.cardReliabilityTitle;
        if (cardRelSub) cardRelSub.textContent = dict.cardReliabilitySub;

        const cardExpTitle = document.querySelector('.card-experienced .card-title');
        const cardExpSub = document.querySelector('.card-experienced .card-subtitle');
        if (cardExpTitle) cardExpTitle.textContent = dict.cardExpTitle;
        if (cardExpSub) cardExpSub.textContent = dict.cardExpSub;

        const cardProfTitle = document.querySelector('.card-professional .card-title');
        const cardProfSub = document.querySelector('.card-professional .card-subtitle');
        if (cardProfTitle) cardProfTitle.textContent = dict.cardProfTitle;
        if (cardProfSub) cardProfSub.textContent = dict.cardProfSub;

        // 4. Feature Dock
        const dock1H = document.querySelector('#dock-symptom-check h4');
        const dock1P = document.querySelector('#dock-symptom-check p');
        if (dock1H) dock1H.textContent = dict.dock1Title;
        if (dock1P) dock1P.textContent = dict.dock1Sub;

        const dock2H = document.querySelector('#dock-assessment h4');
        const dock2P = document.querySelector('#dock-assessment p');
        if (dock2H) dock2H.textContent = dict.dock2Title;
        if (dock2P) dock2P.textContent = dict.dock2Sub;

        const dock3H = document.querySelector('#dock-consult h4');
        const dock3P = document.querySelector('#dock-consult p');
        if (dock3H) dock3H.textContent = dict.dock3Title;
        if (dock3P) dock3P.textContent = dict.dock3Sub;

        const dock4H = document.querySelector('#dock-specialized h4');
        if (dock4H) dock4H.textContent = dict.dock4Title;

        // 5. Patient Intake Console
        const consoleBrandTitle = document.querySelector('.console-brand-title');
        const consoleBrandSub = document.querySelector('.console-brand-sub');
        if (consoleBrandTitle) consoleBrandTitle.textContent = dict.consoleBrandTitle;
        if (consoleBrandSub) consoleBrandSub.textContent = dict.consoleBrandSub;

        const step1T = document.querySelector('#step-item-1 .step-title');
        const step1S = document.querySelector('#step-item-1 .step-sub');
        if (step1T) step1T.textContent = dict.step1Title;
        if (step1S) step1S.textContent = dict.step1Sub;

        const step2T = document.querySelector('#step-item-2 .step-title');
        const step2S = document.querySelector('#step-item-2 .step-sub');
        if (step2T) step2T.textContent = dict.step2Title;
        if (step2S) step2S.textContent = dict.step2Sub;

        const step3T = document.querySelector('#step-item-3 .step-title');
        const step3S = document.querySelector('#step-item-3 .step-sub');
        if (step3T) step3T.textContent = dict.step3Title;
        if (step3S) step3S.textContent = dict.step3Sub;

        const trustText = document.querySelector('.trust-text');
        if (trustText) trustText.textContent = dict.trustText;

        const secTagTitle = document.querySelector('.sec-tag-title');
        const secTagSub = document.querySelector('.sec-tag-sub');
        if (secTagTitle) secTagTitle.textContent = dict.secTagTitle;
        if (secTagSub) secTagSub.textContent = dict.secTagSub;

        const mainHeadline = document.querySelector('.console-main-headline');
        const mainSubtext = document.querySelector('.console-main-subtext');
        if (mainHeadline) mainHeadline.textContent = dict.mainHeadline;
        if (mainSubtext) mainSubtext.textContent = dict.mainSubtext;

        if (abhaInput) abhaInput.placeholder = dict.abhaPlaceholder;

        const btnScanTxt = document.querySelector('#btn-scan-qr span');
        if (btnScanTxt) btnScanTxt.textContent = dict.btnScan;

        if (verifyBtnText) verifyBtnText.textContent = dict.btnContinue;

        const btnNoAbhaSpan = document.querySelector('#btn-no-abha span:last-child');
        if (btnNoAbhaSpan) btnNoAbhaSpan.textContent = dict.btnNoAbha;

        const demoPillsLabel = document.querySelector('.demo-pills-label');
        if (demoPillsLabel) demoPillsLabel.textContent = dict.demoLabel;

        const needHelpLink = document.querySelector('#console-need-help');
        if (needHelpLink) needHelpLink.textContent = dict.needHelp;

        const staffHelpTxt = document.querySelector('.console-staff-help span');
        if (staffHelpTxt) staffHelpTxt.textContent = dict.staffHelp;

        if (btnBackStep1) btnBackStep1.textContent = dict.btnChangeCode;
        const btnConfirmSpan = document.querySelector('#btn-confirm-intake span');
        if (btnConfirmSpan) btnConfirmSpan.textContent = dict.btnConfirmIntake;

        const completeHeadline = document.querySelector('.complete-headline');
        const completeSubtext = document.querySelector('.complete-subtext');
        if (completeHeadline) completeHeadline.textContent = dict.completeHeadline;
        if (completeSubtext) completeSubtext.textContent = dict.completeSubtext;

        const ticketLabel = document.querySelector('.ticket-label');
        const ticketQueue = document.querySelector('.ticket-queue');
        if (ticketLabel) ticketLabel.textContent = dict.tokenLabel;
        if (ticketQueue) ticketQueue.textContent = dict.tokenQueue;

        const optStatusStrong = document.querySelector('.main-status-title');
        const optStatusSpan = document.querySelector('.main-status-sub');
        if (optStatusStrong) optStatusStrong.textContent = dict.optStatusTitle;
        if (optStatusSpan) optStatusSpan.textContent = dict.optStatusSub;

        if (btnIntakeFinish) btnIntakeFinish.textContent = dict.btnDone;

        // 6. Status Page
        const statusTitle = document.querySelector('.status-title');
        if (statusTitle) statusTitle.innerHTML = dict.statusTitle;

        const statusFloatingHeading = document.querySelector('.status-floating-heading');
        if (statusFloatingHeading) statusFloatingHeading.innerHTML = dict.statusHelpHeading;

        if (btnStatusNew) btnStatusNew.textContent = dict.btnStatusNew;
        if (btnStatusOngoing) btnStatusOngoing.textContent = dict.btnStatusOngoing;
        if (btnStatusSos) btnStatusSos.textContent = dict.btnStatusSos;
        if (statusGoBack) statusGoBack.innerHTML = dict.statusGoBack;
        if (statusNeedHelp) statusNeedHelp.textContent = dict.statusNeedHelp;

        // 7. Update Console Lang Picker Label
        if (currentLangName) currentLangName.textContent = dict.langName;
        const langProceedText = document.getElementById('lang-proceed-text');
        if (langProceedText) langProceedText.textContent = dict.gatewayProceed;
    }

    // ==========================================================================
    // Language Selection Gateway Controller
    // ==========================================================================
    const langGatewayOverlay = document.getElementById('lang-gateway-overlay');
    const langSelectCards = document.querySelectorAll('.lang-select-card');
    const btnLangProceed = document.getElementById('btn-lang-proceed');
    const navLangSwitcher = document.getElementById('nav-lang-switcher');

    let tempSelectedLang = 'kn'; // Pre-select Kannada

    langSelectCards.forEach(card => {
        card.addEventListener('click', () => {
            langSelectCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            tempSelectedLang = card.getAttribute('data-lang') || 'kn';
            applyLanguage(tempSelectedLang);
        });

        // Double click or fast choice to enter
        card.addEventListener('dblclick', () => {
            enterWebsiteWithLanguage(tempSelectedLang);
        });
    });

    function enterWebsiteWithLanguage(lang) {
        applyLanguage(lang);
        if (langGatewayOverlay) {
            langGatewayOverlay.classList.add('hidden');
        }
        showToast(`✓ ${translations[lang].langName} ಭಾಷೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ`);
    }

    if (btnLangProceed) {
        btnLangProceed.addEventListener('click', () => {
            enterWebsiteWithLanguage(tempSelectedLang);
        });
    }

    // Navbar Language Switcher Quick Cycle
    if (navLangSwitcher) {
        navLangSwitcher.addEventListener('click', () => {
            const langOrder = ['kn', 'hi', 'en'];
            const nextIdx = (langOrder.indexOf(currentAppLanguage) + 1) % langOrder.length;
            const nextLang = langOrder[nextIdx];
            applyLanguage(nextLang);
            showToast(`ಭಾಷೆ: ${translations[nextLang].langName}`);
        });
    }

    // Expose language switcher globally
    window.setLanguage = (lang) => {
        applyLanguage(lang);
    };

    // Apply default language on initialization
    applyLanguage('kn');

    // Active Navigation Highlight on Scroll
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // ==========================================================================
    // Page Reload & State Restoration Handler
    // ==========================================================================
    function restoreAppState() {
        try {
            const raw = sessionStorage.getItem('medicare_app_state');
            const savedState = raw ? JSON.parse(raw) : null;
            const hash = window.location.hash.replace('#', '').trim();
            const targetView = (savedState && savedState.view && savedState.view !== 'home') ? savedState.view : (hash || 'home');

            if (!targetView || targetView === 'home') return;

            // Automatically hide language gateway if user was already interacting with a portal
            if (langGatewayOverlay) {
                langGatewayOverlay.classList.add('hidden');
            }

            // Restore ABHA verification if previously recorded
            if (savedState && savedState.abhaVal) {
                if (abhaInput) abhaInput.value = savedState.abhaVal;
                if (typeof processAbhaVerification === 'function') {
                    processAbhaVerification(savedState.abhaVal);
                }
            }

            if (targetView === 'ongoing-care') {
                if (savedState && savedState.demoKey) {
                    activeDemoKey = savedState.demoKey;
                }
                openOngoingCarePage();
            } else if (targetView === 'arogya-intake' || targetView === 'intake') {
                if (savedState) {
                    currentStep = savedState.step || 1;
                    hasScannedDocs = savedState.hasScannedDocs || false;
                    scannedDocType = savedState.scannedDocType || 'rx';
                    selectedDuration = savedState.duration || '1-2 days';
                    selectedSeverity = savedState.severity || 'Moderate';
                    patientSymptoms = savedState.patientSymptoms || '';
                    if (arogyaResponseText && patientSymptoms) {
                        arogyaResponseText.value = patientSymptoms;
                    }
                }
                openArogyaIntake(true);
            } else if (targetView === 'status') {
                openStatusPage();
            } else if (targetView === 'services') {
                openServicesPage();
            } else if (targetView === 'about') {
                openAboutPage();
            } else if (targetView === 'contact') {
                openContactPage();
            } else if (targetView === 'abha-modal') {
                openAbhaModal();
            }
        } catch (e) {
            console.warn('Error restoring app state on reload:', e);
        }
    }

    // Call restore after initialization
    setTimeout(restoreAppState, 60);

    // Support browser back/forward buttons (hashchange)
    window.addEventListener('hashchange', () => {
        const h = window.location.hash.replace('#', '').trim();
        if (!h || h === 'home') {
            closeArogyaIntake();
            closeOngoingCarePage();
            closeStatusPage();
            closeServicesPage();
            closeAboutPage();
            closeContactPage();
            if (abhaModal) closeModal(abhaModal);
        } else if (h === 'ongoing-care') {
            openOngoingCarePage();
        } else if (h === 'arogya-intake' || h === 'intake') {
            openArogyaIntake(true);
        } else if (h === 'status') {
            openStatusPage();
        } else if (h === 'services') {
            openServicesPage();
        } else if (h === 'about') {
            openAboutPage();
        } else if (h === 'contact') {
            openContactPage();
        } else if (h === 'doctor') {
            openDoctorDashboard();
        } else if (h === 'pharmacy') {
            openPharmacyDashboard();
        } else if (h === 'my-medicines') {
            openPatientMedsModal();
        }
    });

    // ==========================================================================
    // Global Active OPD Token Manager (Home Page Check / View / Cancel)
    // ==========================================================================
    const navTokenBtn = document.getElementById('nav-token-btn');
    const navTokenBadgeTxt = document.getElementById('nav-token-badge-txt');
    const navTokenStatusDot = document.getElementById('nav-token-status-dot');
    const myTokenModal = document.getElementById('my-token-modal');
    const closeMyTokenModal = document.getElementById('close-my-token-modal');
    const myTokenActiveView = document.getElementById('my-token-active-view');
    const myTokenEmptyView = document.getElementById('my-token-empty-view');
    const myTokenNumberDisplay = document.getElementById('my-token-number-display');
    const myTokenPatientName = document.getElementById('my-token-patient-name');
    const myTokenDoctorName = document.getElementById('my-token-doctor-name');
    const myTokenRoomNumber = document.getElementById('my-token-room-number');
    const myTokenQueuePos = document.getElementById('my-token-queue-pos');
    const btnMyTokenCancel = document.getElementById('btn-my-token-cancel');
    const btnMyTokenPrint = document.getElementById('btn-my-token-print');
    const btnBookNewToken = document.getElementById('btn-book-new-token');

    function getActiveToken() {
        try {
            const raw = sessionStorage.getItem('medicare_active_token');
            return raw ? JSON.parse(raw) : null;
        } catch(e) {
            return null;
        }
    }

    function setActiveToken(tokenData) {
        try {
            sessionStorage.setItem('medicare_active_token', JSON.stringify(tokenData));
        } catch(e) {}
        updateNavTokenBadge();
    }

    function clearActiveToken() {
        try {
            sessionStorage.removeItem('medicare_active_token');
        } catch(e) {}
        updateNavTokenBadge();
    }

    function updateNavTokenBadge() {
        const tok = getActiveToken();
        if (tok && tok.number) {
            if (navTokenBadgeTxt) navTokenBadgeTxt.textContent = tok.number;
            if (navTokenBtn) navTokenBtn.classList.add('has-token');
            if (navTokenStatusDot) navTokenStatusDot.style.display = 'inline-block';
        } else {
            if (navTokenBadgeTxt) navTokenBadgeTxt.textContent = 'My Token';
            if (navTokenBtn) navTokenBtn.classList.remove('has-token');
            if (navTokenStatusDot) navTokenStatusDot.style.display = 'none';
        }
    }

    function renderMyTokenModal() {
        const tok = getActiveToken();
        if (tok && tok.number) {
            if (myTokenActiveView) myTokenActiveView.style.display = 'block';
            if (myTokenEmptyView) myTokenEmptyView.style.display = 'none';

            if (myTokenNumberDisplay) myTokenNumberDisplay.textContent = tok.number;
            if (myTokenPatientName) myTokenPatientName.textContent = tok.patientName || 'Rahul Verma';
            if (myTokenDoctorName) myTokenDoctorName.textContent = tok.doctorName || 'Dr. Priya Sharma';
            if (myTokenRoomNumber) myTokenRoomNumber.textContent = tok.room || 'Room #4 • General OPD';
            if (myTokenQueuePos) myTokenQueuePos.textContent = tok.queue || '#02 (Est. ~5 mins)';
        } else {
            if (myTokenActiveView) myTokenActiveView.style.display = 'none';
            if (myTokenEmptyView) myTokenEmptyView.style.display = 'block';
        }
    }

    if (navTokenBtn) {
        navTokenBtn.addEventListener('click', () => {
            renderMyTokenModal();
            if (myTokenModal) myTokenModal.classList.add('active');
        });
    }

    if (closeMyTokenModal) {
        closeMyTokenModal.addEventListener('click', () => {
            if (myTokenModal) myTokenModal.classList.remove('active');
        });
    }

    if (myTokenModal) {
        myTokenModal.addEventListener('click', (e) => {
            if (e.target === myTokenModal) {
                myTokenModal.classList.remove('active');
            }
        });
    }

    if (btnMyTokenCancel) {
        btnMyTokenCancel.addEventListener('click', () => {
            const tok = getActiveToken();
            const tokNum = tok ? tok.number : 'OPD';
            if (confirm(`Are you sure you want to cancel your active consultation token ${tokNum}?`)) {
                clearActiveToken();
                renderMyTokenModal();
                showToast(`✓ Consultation Token ${tokNum} has been cancelled.`);
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(`Consultation Token ${tokNum.replace('#', '')} has been cancelled.`);
                    u.rate = 0.95;
                    window.speechSynthesis.speak(u);
                }
            }
        });
    }

    if (btnMyTokenPrint) {
        btnMyTokenPrint.addEventListener('click', () => {
            const tok = getActiveToken();
            const tokNum = tok ? tok.number : 'OPD';
            showToast(`🖨️ Printing official OPD Token Pass ${tokNum}...`);
            setTimeout(() => {
                window.print();
            }, 400);
        });
    }

    if (btnBookNewToken) {
        btnBookNewToken.addEventListener('click', () => {
            if (myTokenModal) myTokenModal.classList.remove('active');
            openStatusPage();
        });
    }

    // Call updateNavTokenBadge on startup
    updateNavTokenBadge();

    // ==========================================================================
    // DOCTOR CONSULTATION & DIGITAL PRESCRIPTION SYSTEM
    // ==========================================================================
    const doctorDashboardPage = document.getElementById('doctor-dashboard-page');
    const navDoctorBtn = document.getElementById('nav-doctor-btn');
    const docDashGoBack = document.getElementById('doc-dash-go-back');
    const docPatientQueueList = document.getElementById('doc-patient-queue-list');
    const countAll = document.getElementById('count-all');
    const countWait = document.getElementById('count-wait');
    const countDone = document.getElementById('count-done');
    const docQueueCounterTxt = document.getElementById('doc-queue-counter-txt');

    // Doctor Patient State Data
    let activeDoctorPatientId = 'p1';
    let doctorQueueData = [
        {
            id: 'p1',
            name: 'Rahul Verma',
            token: '#MC-8492',
            abha: '91-4820-1928-3746',
            ageGender: '32 Yrs • Male • O+ Positive',
            visitType: 'Follow-up & Flare-up',
            risk: 'Moderate',
            status: 'In Consultation',
            reason: 'Returning wheezing, nocturnal cough & morning dizziness',
            symptoms: 'Persistent Cough, Chest tightness (Moderate • 2-3 Days)',
            vitals: 'BP 132/86 mmHg • HR 78 bpm • SpO2 98% • Temp 98.6°F',
            history: 'Essential Hypertension (1 Yr) • Allergic Bronchitis (Resolved 3 mos ago)',
            observations: 'Symptom pattern suggests mild bronchospasm flare-up secondary to seasonal allergen exposure. Blood pressure shows mild elevation from baseline. Medication adherence to Telmisartan is high (94%).',
            defaultAssessment: 'Patient alert and oriented. Bilateral mild expiratory wheezing noted on auscultation. Heart sounds regular. Blood pressure slightly elevated at 132/86 mmHg.',
            defaultDiagnosis: 'Essential Hypertension with Seasonal Bronchitis Flare-up',
            defaultNotes: 'Avoid cold beverages and dust exposure. Follow up in 7 days for pulmonary review.',
            defaultTests: 'Peak Flow Spirometry, Serum Potassium',
            defaultFollowup: '7 Days (1 Week)',
            prescriptions: [
                {
                    name: 'Telmisartan Tablets',
                    strength: '40 mg',
                    dosage: '1 Tablet',
                    frequency: 'Once Daily',
                    duration: '30 Days',
                    timings: ['morning'],
                    instructions: 'Take after breakfast with water. Do not skip doses.'
                },
                {
                    name: 'Budecort 200 Rotacaps / Inhaler',
                    strength: '200 mcg',
                    dosage: '2 Puffs',
                    frequency: 'Twice Daily',
                    duration: '14 Days',
                    timings: ['morning', 'night'],
                    instructions: 'Inhale 2 puffs morning and night. Rinse mouth with water after inhalation.'
                }
            ]
        },
        {
            id: 'p2',
            name: 'Sunita Sharma',
            token: '#OPD-3041',
            abha: '45-1029-3847-5612',
            ageGender: '48 Yrs • Female • B+ Positive',
            visitType: 'New Consultation',
            risk: 'High',
            status: 'Waiting',
            reason: 'Severe acid reflux and retrosternal burning sensation after meals',
            symptoms: 'Acid regurgitation, epigastric burning (Severe • 4 Days)',
            vitals: 'BP 124/80 mmHg • HR 72 bpm • SpO2 99% • Temp 98.4°F',
            history: 'No known prior chronic diseases. Occasional NSAID analgesic use for knee pain.',
            observations: 'Classic presentation of acute GERD flare. Epigastric tenderness on palpation. Advise PPI therapy and dietary modifications.',
            defaultAssessment: 'Epigastric tenderness present without rebound. Bowel sounds normal. ECG within normal limits.',
            defaultDiagnosis: 'Gastroesophageal Reflux Disease (GERD)',
            defaultNotes: 'Avoid spicy and oily food. Elevate head of bed during sleep.',
            defaultTests: 'Upper GI Endoscopy if symptoms persist > 2 weeks',
            defaultFollowup: '14 Days (2 Weeks)',
            prescriptions: [
                {
                    name: 'Pantoprazole Gastro-Resistant',
                    strength: '40 mg',
                    dosage: '1 Tablet',
                    frequency: 'Once Daily',
                    duration: '14 Days',
                    timings: ['morning'],
                    instructions: 'Take 30 minutes before breakfast on empty stomach.'
                },
                {
                    name: 'Sucralfate Oral Suspension',
                    strength: '1000 mg / 10ml',
                    dosage: '10 ml',
                    frequency: 'Twice Daily',
                    duration: '7 Days',
                    timings: ['lunch', 'night'],
                    instructions: 'Take 1 hour before lunch and dinner for mucosal coating.'
                }
            ]
        },
        {
            id: 'p3',
            name: 'Amit Kumar',
            token: '#OPD-5519',
            abha: '78-9921-4456-1123',
            ageGender: '27 Yrs • Male • A+ Positive',
            visitType: 'New Consultation',
            risk: 'Low',
            status: 'Waiting',
            reason: 'Frontal headache and body aches following seasonal change',
            symptoms: 'Throbbing headache, mild feverish feeling (1-2 Days)',
            vitals: 'BP 118/76 mmHg • HR 82 bpm • SpO2 99% • Temp 99.2°F',
            history: 'Occasional tension headache. Non-smoker.',
            observations: 'Mild viral prodrome with tension headache. Advise oral hydration and symptomatic analgesic.',
            defaultAssessment: 'General examination normal. Pharynx mildly congested. No neck stiffness.',
            defaultDiagnosis: 'Tension Headache & Mild Viral Pyrexia',
            defaultNotes: 'Adequate hydration (3L/day). Rest in dark quiet room during acute headache.',
            defaultTests: 'Complete Blood Count (CBC) if fever exceeds 101°F',
            defaultFollowup: 'No Follow-up Required',
            prescriptions: [
                {
                    name: 'Paracetamol Tablets IP',
                    strength: '650 mg',
                    dosage: '1 Tablet',
                    frequency: 'SOS / Thrice Daily',
                    duration: '3 Days',
                    timings: ['morning', 'lunch', 'night'],
                    instructions: 'Take after meals for fever or severe headache. Max 3 tabs/day.'
                }
            ]
        }
    ];

    // ==========================================================================
    // Dynamic Synchronization: Patient Condition Explanation -> Doctor's Queue
    // ==========================================================================
    function registerPatientConditionToDoctorQueue(data) {
        const patId = 'pat-' + Date.now();
        const newPat = {
            id: patId,
            name: data.name || 'Rahul Verma',
            token: data.token || '#MC-8492',
            abha: data.abha || '91-4820-1928-3746',
            ageGender: data.ageGender || '32 Yrs • Male • O+ Positive',
            visitType: data.visitType || 'AI Intake Consultation',
            risk: data.risk || 'Moderate',
            status: 'Waiting',
            reason: data.reason || data.symptoms || 'Patient reported acute symptoms during AI intake',
            symptoms: data.symptoms || 'Reported symptoms during AI intake',
            vitals: data.vitals || 'BP 132/86 mmHg • HR 78 bpm • SpO2 98% • Temp 98.6°F',
            history: data.history || 'EHR linked via ABHA (Essential Hypertension & Bronchitis History)',
            observations: data.observations || `AI Patient Explanation: "${data.notes || data.symptoms}". Ready for physician assessment.`,
            defaultAssessment: `Patient attended AI Intake desk. Reported complaint: ${data.reason || data.symptoms}.`,
            defaultDiagnosis: data.diagnosis || 'Essential Hypertension with Seasonal Bronchitis Flare-up',
            defaultNotes: data.notes ? `Patient notes: ${data.notes}` : 'Advised clinical examination.',
            defaultTests: 'Peak Flow Spirometry, Serum Potassium',
            defaultFollowup: '7 Days (1 Week)',
            prescriptions: [
                {
                    name: 'Telmisartan Tablets',
                    strength: '40 mg',
                    dosage: '1 Tablet',
                    frequency: 'Once Daily',
                    duration: '30 Days',
                    timings: ['morning'],
                    instructions: 'Take after breakfast with water.'
                },
                {
                    name: 'Budecort 200 Rotacaps / Inhaler',
                    strength: '200 mcg',
                    dosage: '2 Puffs',
                    frequency: 'Twice Daily',
                    duration: '14 Days',
                    timings: ['morning', 'night'],
                    instructions: 'Inhale 2 puffs morning & night.'
                }
            ]
        };

        // Check if patient with same ABHA exists; update or insert at top
        const existingIdx = doctorQueueData.findIndex(p => p.abha === newPat.abha);
        if (existingIdx !== -1) {
            doctorQueueData[existingIdx] = {
                ...doctorQueueData[existingIdx],
                ...newPat,
                id: doctorQueueData[existingIdx].id,
                status: 'Waiting'
            };
            activeDoctorPatientId = doctorQueueData[existingIdx].id;
        } else {
            doctorQueueData.unshift(newPat);
            activeDoctorPatientId = newPat.id;
        }

        renderDoctorQueue('all');
    }

    // ==========================================================================
    // Doctor Portal Authentication & Station Access
    // ==========================================================================
    const doctorLoginModal = document.getElementById('doctor-login-modal');
    const closeDocLoginModal = document.getElementById('close-doc-login-modal');
    const btnCancelDocLogin = document.getElementById('btn-cancel-doc-login');
    const docLoginForm = document.getElementById('doc-login-form');
    const docLoginUsername = document.getElementById('doc-login-username');
    const docLoginPassword = document.getElementById('doc-login-password');
    const docLoginErr = document.getElementById('doc-login-err');
    const btnDocLogout = document.getElementById('btn-doc-logout');

    function isDoctorAuthenticated() {
        return sessionStorage.getItem('medicare_doctor_auth') === 'true';
    }

    function openDoctorDashboard(force = false) {
        if (!isDoctorAuthenticated() && !force) {
            // Require login first
            if (docLoginErr) docLoginErr.style.display = 'none';
            if (doctorLoginModal) doctorLoginModal.classList.add('active');
            if (docLoginUsername) docLoginUsername.focus();
            return;
        }

        closeArogyaIntake();
        closeOngoingCarePage();
        closeStatusPage();
        closeServicesPage();
        closeAboutPage();
        closeContactPage();
        closePharmacyDashboard();
        if (doctorDashboardPage) doctorDashboardPage.style.display = 'block';
        saveAppState('doctor');
        renderDoctorQueue('all');
        loadPatientIntoConsultation(activeDoctorPatientId);
    }

    function closeDoctorDashboard() {
        if (doctorDashboardPage) doctorDashboardPage.style.display = 'none';
        saveAppState('home');
    }

    // Login Form Handler
    if (docLoginForm) {
        docLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const u = docLoginUsername ? docLoginUsername.value.trim().toLowerCase() : '';
            const p = docLoginPassword ? docLoginPassword.value.trim() : '';

            // Allow "Dr. Rajesh Iyer" or "doctor" or valid demo credentials
            if ((u.includes('rajesh') || u.includes('iyer') || u.includes('doctor') || u.length > 2) && (p === 'doc123' || p === 'admin123' || p === '123456' || p.length >= 4)) {
                sessionStorage.setItem('medicare_doctor_auth', 'true');
                if (doctorLoginModal) doctorLoginModal.classList.remove('active');
                if (docLoginErr) docLoginErr.style.display = 'none';
                showToast('✓ Doctor credentials verified. Live OPD Station Unlocked.');

                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const ut = new SpeechSynthesisUtterance('Welcome Dr. Rajesh Iyer. OPD Clinical Station unlocked.');
                    ut.rate = 0.95;
                    window.speechSynthesis.speak(ut);
                }

                openDoctorDashboard(true);
            } else {
                if (docLoginErr) docLoginErr.style.display = 'block';
                showToast('Authentication failed. Please check your Doctor ID and password.');
            }
        });
    }

    if (closeDocLoginModal) {
        closeDocLoginModal.addEventListener('click', () => {
            if (doctorLoginModal) doctorLoginModal.classList.remove('active');
        });
    }

    if (btnCancelDocLogin) {
        btnCancelDocLogin.addEventListener('click', () => {
            if (doctorLoginModal) doctorLoginModal.classList.remove('active');
        });
    }

    if (doctorLoginModal) {
        doctorLoginModal.addEventListener('click', (e) => {
            if (e.target === doctorLoginModal) {
                doctorLoginModal.classList.remove('active');
            }
        });
    }

    if (btnDocLogout) {
        btnDocLogout.addEventListener('click', () => {
            sessionStorage.removeItem('medicare_doctor_auth');
            closeDoctorDashboard();
            showToast('🔒 Doctor Station locked and signed out.');
        });
    }

    if (navDoctorBtn) navDoctorBtn.addEventListener('click', () => openDoctorDashboard());
    if (docDashGoBack) docDashGoBack.addEventListener('click', closeDoctorDashboard);

    // Queue Filter Tabs
    document.querySelectorAll('.queue-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.queue-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const filter = tab.getAttribute('data-filter') || 'all';
            renderDoctorQueue(filter);
        });
    });

    function renderDoctorQueue(filter = 'all') {
        if (!docPatientQueueList) return;
        docPatientQueueList.innerHTML = '';

        let filtered = doctorQueueData;
        if (filter === 'waiting') {
            filtered = doctorQueueData.filter(p => p.status === 'Waiting');
        } else if (filter === 'completed') {
            filtered = doctorQueueData.filter(p => p.status === 'Completed');
        }

        // Update counts
        const allC = doctorQueueData.length;
        const waitC = doctorQueueData.filter(p => p.status === 'Waiting').length;
        const doneC = doctorQueueData.filter(p => p.status === 'Completed').length;
        if (countAll) countAll.textContent = allC;
        if (countWait) countWait.textContent = waitC;
        if (countDone) countDone.textContent = doneC;
        if (docQueueCounterTxt) docQueueCounterTxt.textContent = `${waitC + (doctorQueueData.find(p => p.status === 'In Consultation') ? 1 : 0)} Patients in Queue`;

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = `queue-patient-card ${p.id === activeDoctorPatientId ? 'active' : ''}`;
            const riskClass = p.risk === 'High' ? 'risk-high' : (p.risk === 'Moderate' ? 'risk-moderate' : 'risk-low');
            card.innerHTML = `
                <div class="q-pat-top">
                    <strong class="q-pat-name">${p.name}</strong>
                    <span class="q-pat-token">${p.token}</span>
                </div>
                <div class="q-pat-meta">ABHA: ${p.abha} • ${p.ageGender.split('•')[0]}</div>
                <div class="q-pat-badges">
                    <span class="q-risk-pill ${riskClass}">⚡ ${p.risk} Risk</span>
                    <span class="pat-status-pill ${p.status === 'Completed' ? 'status-active' : (p.status === 'In Consultation' ? 'status-in-consult' : 'status-cured')}">${p.status}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                activeDoctorPatientId = p.id;
                document.querySelectorAll('.queue-patient-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                loadPatientIntoConsultation(p.id);
            });

            docPatientQueueList.appendChild(card);
        });
    }

    function loadPatientIntoConsultation(patientId) {
        const p = doctorQueueData.find(item => item.id === patientId) || doctorQueueData[0];
        if (!p) return;

        // Set banner
        const elName = document.getElementById('doc-pat-name');
        const elToken = document.getElementById('doc-pat-token');
        const elAbha = document.getElementById('doc-pat-abha');
        const elDemo = document.getElementById('doc-pat-demographics');
        const elVisit = document.getElementById('doc-pat-visittype');
        const elRisk = document.getElementById('doc-pat-riskbadge');
        const elStatus = document.getElementById('doc-pat-status-pill');

        if (elName) elName.textContent = p.name;
        if (elToken) elToken.textContent = p.token;
        if (elAbha) elAbha.textContent = p.abha;
        if (elDemo) elDemo.textContent = p.ageGender;
        if (elVisit) elVisit.textContent = p.visitType;
        if (elRisk) {
            elRisk.className = `ai-risk-badge ${p.risk === 'High' ? 'risk-high' : (p.risk === 'Moderate' ? 'risk-moderate' : 'risk-low')}`;
            elRisk.textContent = `⚡ ${p.risk} Risk`;
        }
        if (elStatus) {
            elStatus.textContent = p.status;
            elStatus.className = `pat-status-pill ${p.status === 'Completed' ? 'status-active' : 'status-in-consult'}`;
        }

        // Set AI summary fields
        const elReason = document.getElementById('doc-ai-reason');
        const elSymptoms = document.getElementById('doc-ai-symptoms');
        const elVitals = document.getElementById('doc-ai-vitals');
        const elHistory = document.getElementById('doc-ai-history');
        const elObs = document.getElementById('doc-ai-observations');

        if (elReason) elReason.textContent = p.reason;
        if (elSymptoms) elSymptoms.textContent = p.symptoms;
        if (elVitals) elVitals.textContent = p.vitals;
        if (elHistory) elHistory.textContent = p.history;
        if (elObs) elObs.textContent = p.observations;

        // Set form defaults
        const elAssess = document.getElementById('doc-clinical-assessment');
        const elDiag = document.getElementById('doc-diagnosis-select');
        const elNotes = document.getElementById('doc-consult-notes');
        const elTests = document.getElementById('doc-tests-input');
        const elFollowup = document.getElementById('doc-followup-select');

        if (elAssess) elAssess.value = p.defaultAssessment || '';
        if (elDiag) elDiag.value = p.defaultDiagnosis || elDiag.options[0].value;
        if (elNotes) elNotes.value = p.defaultNotes || '';
        if (elTests) elTests.value = p.defaultTests || '';
        if (elFollowup) elFollowup.value = p.defaultFollowup || '7 Days (1 Week)';

        // Render Prescription Builder rows
        renderRxBuilderRows(p.prescriptions);
    }

    // Prescription Builder Rows
    let activeBuilderRx = [];
    const rxMedicinesBuilderList = document.getElementById('rx-medicines-builder-list');
    const btnAddMedicineRow = document.getElementById('btn-add-medicine-row');

    function renderRxBuilderRows(medsArray) {
        if (!rxMedicinesBuilderList) return;
        activeBuilderRx = medsArray ? JSON.parse(JSON.stringify(medsArray)) : [];
        rxMedicinesBuilderList.innerHTML = '';

        activeBuilderRx.forEach((med, idx) => {
            const row = document.createElement('div');
            row.className = 'rx-builder-row';
            row.innerHTML = `
                <div class="rx-row-top">
                    <div>
                        <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Medicine Name</label>
                        <input type="text" class="consult-input rx-field-name" value="${med.name}" placeholder="Medicine Name (e.g. Telmisartan)">
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Strength</label>
                        <input type="text" class="consult-input rx-field-strength" value="${med.strength}" placeholder="e.g. 40 mg">
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Dosage</label>
                        <input type="text" class="consult-input rx-field-dosage" value="${med.dosage}" placeholder="e.g. 1 Tab / 2 Puffs">
                    </div>
                    <div>
                        <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Duration</label>
                        <input type="text" class="consult-input rx-field-duration" value="${med.duration}" placeholder="e.g. 14 Days">
                    </div>
                    <div style="padding-top:16px;">
                        <button type="button" class="btn-remove-med" data-idx="${idx}" title="Remove Medicine">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                <div class="rx-row-timing-box">
                    <span class="timing-label">Intake Timing:</span>
                    <div class="timing-checkbox-group">
                        <label class="timing-opt">
                            <input type="checkbox" class="rx-timing-chk" value="morning" ${med.timings && med.timings.includes('morning') ? 'checked' : ''}>
                            <span>🌅 After Breakfast</span>
                        </label>
                        <label class="timing-opt">
                            <input type="checkbox" class="rx-timing-chk" value="lunch" ${med.timings && med.timings.includes('lunch') ? 'checked' : ''}>
                            <span>☀️ After Lunch</span>
                        </label>
                        <label class="timing-opt">
                            <input type="checkbox" class="rx-timing-chk" value="night" ${med.timings && med.timings.includes('night') ? 'checked' : ''}>
                            <span>🌙 After Dinner</span>
                        </label>
                        <label class="timing-opt">
                            <input type="checkbox" class="rx-timing-chk" value="bedtime" ${med.timings && med.timings.includes('bedtime') ? 'checked' : ''}>
                            <span>💤 Before Sleep</span>
                        </label>
                    </div>
                </div>

                <div>
                    <input type="text" class="consult-input rx-field-inst" value="${med.instructions || ''}" placeholder="Patient instructions (e.g. Take with warm water / Rinse mouth after inhalation)">
                </div>
            `;

            // Attach Remove listener
            const removeBtn = row.querySelector('.btn-remove-med');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    activeBuilderRx.splice(idx, 1);
                    renderRxBuilderRows(activeBuilderRx);
                });
            }

            rxMedicinesBuilderList.appendChild(row);
        });
    }

    if (btnAddMedicineRow) {
        btnAddMedicineRow.addEventListener('click', () => {
            activeBuilderRx.push({
                name: 'Pantoprazole Gastro-Resistant',
                strength: '40 mg',
                dosage: '1 Tablet',
                frequency: 'Once Daily',
                duration: '7 Days',
                timings: ['morning'],
                instructions: 'Take 30 mins before breakfast.'
            });
            renderRxBuilderRows(activeBuilderRx);
            showToast('Added new medicine entry');
        });
    }

    // Toggle Medical History Timeline
    const btnToggleHistory = document.getElementById('btn-toggle-history');
    const historyTimelineBody = document.getElementById('history-timeline-body');
    const historyToggleTxt = document.getElementById('history-toggle-txt');

    if (btnToggleHistory && historyTimelineBody) {
        btnToggleHistory.addEventListener('click', () => {
            const isHidden = historyTimelineBody.style.display === 'none';
            historyTimelineBody.style.display = isHidden ? 'block' : 'none';
            if (historyToggleTxt) historyToggleTxt.textContent = isHidden ? 'Collapse Timeline ▲' : 'Expand Timeline ▼';
        });
    }

    // Save Consultation Draft
    const btnDocSaveDraft = document.getElementById('btn-doc-save-draft');
    if (btnDocSaveDraft) {
        btnDocSaveDraft.addEventListener('click', () => {
            const p = doctorQueueData.find(item => item.id === activeDoctorPatientId);
            showToast(`✓ Consultation notes draft saved for ${p ? p.name : 'Patient'}.`);
        });
    }

    // ==========================================================================
    // PRESCRIPTION REVIEW & CONFIRMATION MODAL
    // ==========================================================================
    const btnDocReviewRx = document.getElementById('btn-doc-review-rx');
    const prescriptionReviewModal = document.getElementById('prescription-review-modal');
    const closeRxReviewModal = document.getElementById('close-rx-review-modal');
    const btnEditRxBack = document.getElementById('btn-edit-rx-back');
    const btnConfirmSendPharmacy = document.getElementById('btn-confirm-send-pharmacy');

    let currentReviewPrescription = null;

    if (btnDocReviewRx) {
        btnDocReviewRx.addEventListener('click', () => {
            const p = doctorQueueData.find(item => item.id === activeDoctorPatientId);
            if (!p) return;

            // Collect active rows from DOM
            const compiledMeds = [];
            const rowElements = document.querySelectorAll('.rx-builder-row');
            rowElements.forEach(row => {
                const name = row.querySelector('.rx-field-name')?.value.trim();
                const strength = row.querySelector('.rx-field-strength')?.value.trim();
                const dosage = row.querySelector('.rx-field-dosage')?.value.trim();
                const duration = row.querySelector('.rx-field-duration')?.value.trim();
                const inst = row.querySelector('.rx-field-inst')?.value.trim();
                const timings = [];
                row.querySelectorAll('.rx-timing-chk:checked').forEach(c => timings.push(c.value));

                if (name) {
                    compiledMeds.push({
                        name,
                        strength: strength || 'Standard',
                        dosage: dosage || '1 Unit',
                        duration: duration || '5 Days',
                        instructions: inst || 'Take as directed.',
                        timings
                    });
                }
            });

            if (compiledMeds.length === 0) {
                showToast('Please add at least one prescribed medicine.');
                return;
            }

            const diagVal = document.getElementById('doc-diagnosis-select')?.value || p.defaultDiagnosis;
            const followupVal = document.getElementById('doc-followup-select')?.value || '7 Days';

            currentReviewPrescription = {
                rxId: 'RX-2026-00' + Math.floor(100 + Math.random() * 900),
                patientId: p.id,
                patientName: p.name,
                abha: p.abha,
                ageGender: p.ageGender,
                diagnosis: diagVal,
                doctor: 'Dr. Rajesh Iyer, MD',
                followup: followupVal,
                date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                medicines: compiledMeds
            };

            // Populate Review Modal
            const elRxId = document.getElementById('review-rx-id');
            const elPat = document.getElementById('review-rx-patient');
            const elAbha = document.getElementById('review-rx-abha');
            const elDiag = document.getElementById('review-rx-diag');
            const elCount = document.getElementById('review-rx-count');
            const elFollowup = document.getElementById('review-rx-followup');
            const elMedsList = document.getElementById('review-rx-meds-list');

            if (elRxId) elRxId.textContent = currentReviewPrescription.rxId;
            if (elPat) elPat.textContent = `${p.name} (${p.ageGender.split('•')[0]})`;
            if (elAbha) elAbha.textContent = p.abha;
            if (elDiag) elDiag.textContent = currentReviewPrescription.diagnosis;
            if (elCount) elCount.textContent = compiledMeds.length;
            if (elFollowup) elFollowup.textContent = followupVal;

            if (elMedsList) {
                elMedsList.innerHTML = compiledMeds.map((m, i) => `
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <strong style="font-size:13px; color:#0f172a;">${i + 1}. ${m.name} (${m.strength})</strong>
                            <div style="font-size:11.5px; color:#2563eb; margin-top:2px;">
                                ${m.dosage} • ${m.timings.map(t => t === 'morning' ? '🌅 Morning' : (t === 'lunch' ? '☀️ Lunch' : '🌙 Night')).join(' + ') || 'Daily'} • ${m.duration}
                            </div>
                            <span style="font-size:11px; color:#64748b; font-style:italic;">${m.instructions}</span>
                        </div>
                        <span style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-size:11px; font-weight:700; padding:2px 8px; border-radius:6px;">Approved</span>
                    </div>
                `).join('');
            }

            if (prescriptionReviewModal) prescriptionReviewModal.classList.add('active');
        });
    }

    if (closeRxReviewModal) {
        closeRxReviewModal.addEventListener('click', () => {
            if (prescriptionReviewModal) prescriptionReviewModal.classList.remove('active');
        });
    }

    if (btnEditRxBack) {
        btnEditRxBack.addEventListener('click', () => {
            if (prescriptionReviewModal) prescriptionReviewModal.classList.remove('active');
        });
    }

    if (btnConfirmSendPharmacy) {
        btnConfirmSendPharmacy.addEventListener('click', () => {
            if (!currentReviewPrescription) return;

            // 1. Add order to Pharmacy queue
            pharmacyOrdersData.unshift({
                rxId: currentReviewPrescription.rxId,
                patientName: currentReviewPrescription.patientName,
                abha: currentReviewPrescription.abha,
                doctor: currentReviewPrescription.doctor,
                date: `Today • ${currentReviewPrescription.date}`,
                status: 'Ready',
                medicines: currentReviewPrescription.medicines
            });

            // 2. Mark doctor patient status completed
            const p = doctorQueueData.find(item => item.id === currentReviewPrescription.patientId);
            if (p) {
                p.status = 'Completed';
                p.prescriptions = currentReviewPrescription.medicines;
            }

            // 3. Update Patient Ongoing Care prescriptions
            if (ongoingDemoProfiles[activeDemoKey]) {
                ongoingDemoProfiles[activeDemoKey].prescriptions = currentReviewPrescription.medicines.map(m => ({
                    name: `${m.name} ${m.strength}`,
                    dosage: `${m.dosage} (${m.timings.join('+')})`,
                    time: m.timings.includes('night') ? 'Bedtime • 10:00 PM' : 'Morning • 8:30 AM',
                    stock: 'Dispatched to Pharmacy'
                }));
            }

            // 4. Update live tracker
            updatePatientMedsSchedule(currentReviewPrescription);

            if (prescriptionReviewModal) prescriptionReviewModal.classList.remove('active');
            renderDoctorQueue('all');
            loadPatientIntoConsultation(activeDoctorPatientId);

            showToast(`🚀 Prescription ${currentReviewPrescription.rxId} dispatched to Hospital Pharmacy!`);

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const u = new SpeechSynthesisUtterance(`Prescription ${currentReviewPrescription.rxId.replace('-', ' ')} confirmed and sent to Hospital Pharmacy for dispensing.`);
                u.rate = 0.95;
                window.speechSynthesis.speak(u);
            }
        });
    }

    // ==========================================================================
    // HOSPITAL PHARMACY PORTAL CONTROLLER
    // ==========================================================================
    const pharmacyDashboardPage = document.getElementById('pharmacy-dashboard-page');
    const navPharmacyBtn = document.getElementById('nav-pharmacy-btn');
    const pharmacyGoBack = document.getElementById('pharmacy-go-back');
    const pharmacyOrdersGrid = document.getElementById('pharmacy-orders-grid');
    const pharmacyAbhaSearch = document.getElementById('pharmacy-abha-search');
    const btnPharmVerifyAbha = document.getElementById('btn-pharm-verify-abha');
    const pharmPendingCounterTxt = document.getElementById('pharm-pending-counter-txt');

    let pharmacyFilter = 'all';
    let pharmacyOrdersData = [
        {
            rxId: 'RX-2026-00124',
            patientName: 'Rahul Verma',
            abha: '91-4820-1928-3746',
            doctor: 'Dr. Rajesh Iyer',
            date: 'Today • 11:20 AM',
            status: 'Ready',
            medicines: [
                {
                    name: 'Telmisartan Tablets',
                    strength: '40 mg',
                    dosage: '1 Tablet',
                    duration: '30 Days',
                    timings: ['morning'],
                    instructions: 'Take after breakfast.'
                },
                {
                    name: 'Budecort 200 Rotacaps Inhaler',
                    strength: '200 mcg',
                    dosage: '2 Puffs',
                    duration: '14 Days',
                    timings: ['morning', 'night'],
                    instructions: 'Inhale 2 puffs morning & night.'
                }
            ]
        },
        {
            rxId: 'RX-2026-00120',
            patientName: 'Sunita Sharma',
            abha: '45-1029-3847-5612',
            doctor: 'Dr. Priya Sharma',
            date: 'Today • 10:45 AM',
            status: 'Pending',
            medicines: [
                {
                    name: 'Pantoprazole Gastro-Resistant',
                    strength: '40 mg',
                    dosage: '1 Tablet',
                    duration: '14 Days',
                    timings: ['morning'],
                    instructions: 'Take 30 mins before breakfast.'
                }
            ]
        }
    ];

    function openPharmacyDashboard() {
        closeArogyaIntake();
        closeOngoingCarePage();
        closeStatusPage();
        closeServicesPage();
        closeAboutPage();
        closeContactPage();
        closeDoctorDashboard();
        if (pharmacyDashboardPage) pharmacyDashboardPage.style.display = 'block';
        saveAppState('pharmacy');
        renderPharmacyOrders(pharmacyFilter, '');
    }

    function closePharmacyDashboard() {
        if (pharmacyDashboardPage) pharmacyDashboardPage.style.display = 'none';
        saveAppState('home');
    }

    if (navPharmacyBtn) navPharmacyBtn.addEventListener('click', openPharmacyDashboard);
    if (pharmacyGoBack) pharmacyGoBack.addEventListener('click', closePharmacyDashboard);

    // Filter tabs
    document.querySelectorAll('.pharm-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.pharm-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            pharmacyFilter = tab.getAttribute('data-filter') || 'all';
            const query = pharmacyAbhaSearch ? pharmacyAbhaSearch.value.trim() : '';
            renderPharmacyOrders(pharmacyFilter, query);
        });
    });

    // ABHA Search & Instant Retrieval
    if (pharmacyAbhaSearch) {
        pharmacyAbhaSearch.addEventListener('input', () => {
            const query = pharmacyAbhaSearch.value.trim();
            renderPharmacyOrders(pharmacyFilter, query);
        });
    }

    if (btnPharmVerifyAbha) {
        btnPharmVerifyAbha.addEventListener('click', () => {
            const query = pharmacyAbhaSearch ? pharmacyAbhaSearch.value.trim() : '';
            if (!query) {
                showToast('Please enter an ABHA ID or patient name to verify.');
                return;
            }
            renderPharmacyOrders('all', query);
            const found = pharmacyOrdersData.find(o => o.abha.includes(query) || o.patientName.toLowerCase().includes(query.toLowerCase()));
            if (found) {
                showToast(`✓ ABHA Verified: Active prescription found for ${found.patientName}!`);
            } else {
                showToast(`No active prescription found matching "${query}".`);
            }
        });
    }

    function renderPharmacyOrders(filter = 'all', searchQuery = '') {
        if (!pharmacyOrdersGrid) return;
        pharmacyOrdersGrid.innerHTML = '';

        let list = pharmacyOrdersData;
        if (filter !== 'all') {
            list = list.filter(o => o.status.toLowerCase() === filter.toLowerCase());
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(o => o.abha.toLowerCase().includes(q) || o.patientName.toLowerCase().includes(q) || o.rxId.toLowerCase().includes(q));
        }

        const pendingC = pharmacyOrdersData.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
        if (pharmPendingCounterTxt) pharmPendingCounterTxt.textContent = `${pendingC} Orders Pending`;

        if (list.length === 0) {
            pharmacyOrdersGrid.innerHTML = `
                <div style="grid-column:1 / -1; background:#ffffff; border:1.5px solid #e2e8f0; border-radius:18px; padding:36px; text-align:center;">
                    <div style="font-size:32px; margin-bottom:10px;">📦</div>
                    <strong style="font-size:16px; color:#0f172a; display:block;">No Prescriptions Found</strong>
                    <p style="font-size:12.5px; color:#64748b; margin-top:4px;">No active pharmacy orders matching the selected filter or ABHA lookup.</p>
                </div>
            `;
            return;
        }

        list.forEach((order, idx) => {
            const card = document.createElement('div');
            card.className = 'order-item-card';

            const statusClass = order.status === 'Dispensed' ? 'badge-dispensed' : (order.status === 'Ready' ? 'badge-ready' : 'badge-pending');

            card.innerHTML = `
                <div class="order-card-header">
                    <div>
                        <div class="ord-id">${order.rxId}</div>
                        <div class="ord-timestamp">${order.date} • Prescribed by ${order.doctor}</div>
                    </div>
                    <span class="ord-status-badge ${statusClass}">${order.status}</span>
                </div>

                <div class="ord-pat-info">
                    <div><span style="color:#64748b;">Patient:</span> <strong>${order.patientName}</strong></div>
                    <div><span style="color:#64748b;">ABHA ID:</span> <strong class="text-blue">${order.abha}</strong></div>
                </div>

                <div class="ord-meds-list">
                    ${order.medicines.map(m => `
                        <div class="ord-med-item">
                            <div class="ord-med-main">
                                <span class="ord-med-title">${m.name} (${m.strength})</span>
                                <span class="ord-med-timing">⏰ ${m.timings ? m.timings.map(t => t === 'morning' ? '🌅 Morning' : (t === 'lunch' ? '☀️ Lunch' : '🌙 Night')).join(' • ') : 'Daily'} (${m.duration})</span>
                            </div>
                            <span class="ord-med-qty">${m.dosage}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="ord-actions-bar">
                    ${order.status === 'Pending' ? `
                        <button type="button" class="btn btn-secondary btn-pharm-prep" data-rx="${order.rxId}" style="font-size:12px; padding:6px 12px;">
                            Mark as Preparing
                        </button>
                    ` : ''}
                    ${order.status !== 'Dispensed' ? `
                        <button type="button" class="btn btn-primary btn-pharm-dispense" data-rx="${order.rxId}" style="background:#059669; border-color:#059669; font-size:12px; padding:6px 14px;">
                            ✓ Mark as Dispensed
                        </button>
                    ` : `
                        <span style="font-size:12px; color:#059669; font-weight:700;">✓ Sealed & Dispensed to Patient</span>
                    `}
                </div>
            `;

            // Attach Dispense listeners
            const prepBtn = card.querySelector('.btn-pharm-prep');
            if (prepBtn) {
                prepBtn.addEventListener('click', () => {
                    order.status = 'Preparing';
                    renderPharmacyOrders(pharmacyFilter, searchQuery);
                    showToast(`Order ${order.rxId} marked as Preparing in dispensary`);
                });
            }

            const dispenseBtn = card.querySelector('.btn-pharm-dispense');
            if (dispenseBtn) {
                dispenseBtn.addEventListener('click', () => {
                    if (confirm(`Confirm medicine packet collection & dispense for ${order.patientName} (ABHA: ${order.abha})?`)) {
                        order.status = 'Dispensed';
                        order.dispensedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        renderPharmacyOrders(pharmacyFilter, searchQuery);
                        updatePatientMedsDispensed(order.rxId);
                        showToast(`✓ Prescription ${order.rxId} successfully dispensed to ${order.patientName}!`);

                        if ('speechSynthesis' in window) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(`Prescription ${order.rxId.replace('-', ' ')} verified and dispensed for ${order.patientName}.`);
                            u.rate = 0.95;
                            window.speechSynthesis.speak(u);
                        }
                    }
                });
            }

            pharmacyOrdersGrid.appendChild(card);
        });
    }

    // ==========================================================================
    // PATIENT "MY MEDICINES" & 5-STAGE TRACKER CONTROLLER
    // ==========================================================================
    const patientMedicinesModal = document.getElementById('patient-medicines-modal');
    const navMedicinesBtn = document.getElementById('nav-medicines-btn');
    const btnClosePatientMedsModal = document.getElementById('close-patient-meds-modal');
    const trackerRxId = document.getElementById('tracker-rx-id');
    const trackerOverallStatusPill = document.getElementById('tracker-overall-status-pill');
    const patientScheduleList = document.getElementById('patient-schedule-list');

    let patientMedsScheduleData = {
        rxId: 'RX-2026-00124',
        patientName: 'Rahul Verma',
        abha: '91-4820-1928-3746',
        status: 'Ready', // 'Pending', 'Ready', 'Dispensed'
        medicines: [
            {
                name: 'Telmisartan Tablets',
                strength: '40 mg',
                dosage: '1 Tablet',
                duration: '30 Days Remaining',
                timings: ['morning'],
                timeLabel: '🌅 Morning (After Breakfast • 8:30 AM)',
                instructions: 'Take after breakfast with water.'
            },
            {
                name: 'Budecort 200 Rotacaps Inhaler',
                strength: '200 mcg',
                dosage: '2 Puffs',
                duration: '14 Days Remaining',
                timings: ['morning', 'night'],
                timeLabel: '🌅 Morning (8:30 AM) & 🌙 Night (9:00 PM)',
                instructions: 'Inhale 2 puffs. Rinse mouth after use.'
            }
        ]
    };

    function openPatientMedsModal() {
        renderPatientMedsModal();
        if (patientMedicinesModal) patientMedicinesModal.classList.add('active');
    }

    function closePatientMedsModal() {
        if (patientMedicinesModal) patientMedicinesModal.classList.remove('active');
    }

    if (navMedicinesBtn) navMedicinesBtn.addEventListener('click', openPatientMedsModal);
    if (btnClosePatientMedsModal) btnClosePatientMedsModal.addEventListener('click', closePatientMedsModal);

    if (patientMedicinesModal) {
        patientMedicinesModal.addEventListener('click', (e) => {
            if (e.target === patientMedicinesModal) {
                patientMedicinesModal.classList.remove('active');
            }
        });
    }

    function updatePatientMedsSchedule(rxData) {
        patientMedsScheduleData = {
            rxId: rxData.rxId,
            patientName: rxData.patientName,
            abha: rxData.abha,
            status: 'Ready',
            medicines: rxData.medicines.map(m => ({
                name: m.name,
                strength: m.strength,
                dosage: m.dosage,
                duration: `${m.duration} Remaining`,
                timings: m.timings,
                timeLabel: m.timings.map(t => t === 'morning' ? '🌅 Morning (8:30 AM)' : (t === 'lunch' ? '☀️ Lunch (1:30 PM)' : '🌙 Night (9:00 PM)')).join(' • ') || 'Daily',
                instructions: m.instructions
            }))
        };
    }

    function updatePatientMedsDispensed(rxId) {
        if (patientMedsScheduleData && patientMedsScheduleData.rxId === rxId) {
            patientMedsScheduleData.status = 'Dispensed';
        }
    }

    function renderPatientMedsModal() {
        const data = patientMedsScheduleData;
        if (!data) return;

        if (trackerRxId) trackerRxId.textContent = data.rxId;
        if (trackerOverallStatusPill) {
            trackerOverallStatusPill.textContent = data.status === 'Dispensed' ? '✓ Dispensed from Pharmacy' : (data.status === 'Ready' ? 'Ready for Pickup' : 'Sent to Pharmacy');
            trackerOverallStatusPill.className = `rx-stage-pill ${data.status === 'Dispensed' ? 'stage-dispensed' : 'stage-ready'}`;
        }

        // Update 5-stage nodes
        const node4 = document.getElementById('step-node-4');
        const node5 = document.getElementById('step-node-5');
        const bar3 = document.getElementById('bar-3');
        const bar4 = document.getElementById('bar-4');
        const circle4 = document.getElementById('circle-node-4');
        const circle5 = document.getElementById('circle-node-5');

        if (data.status === 'Dispensed') {
            if (node4) { node4.className = 'tracker-step-node completed'; }
            if (circle4) { circle4.textContent = '✓'; }
            if (bar3) { bar3.className = 'tracker-connect-bar completed'; }
            if (bar4) { bar4.className = 'tracker-connect-bar completed'; }
            if (node5) { node5.className = 'tracker-step-node completed'; }
            if (circle5) { circle5.textContent = '✓'; }
        } else if (data.status === 'Ready') {
            if (node4) { node4.className = 'tracker-step-node active'; }
            if (circle4) { circle4.textContent = '4'; }
            if (bar3) { bar3.className = 'tracker-connect-bar active'; }
            if (bar4) { bar4.className = 'tracker-connect-bar'; }
            if (node5) { node5.className = 'tracker-step-node'; }
            if (circle5) { circle5.textContent = '5'; }
        }

        // Render schedule list
        if (patientScheduleList) {
            patientScheduleList.innerHTML = data.medicines.map(m => `
                <div class="patient-schedule-item">
                    <div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <strong style="font-size:14px; color:#0f172a;">${m.name}</strong>
                            <span style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:2px 7px; border-radius:6px; font-size:11px; font-weight:700;">${m.strength}</span>
                        </div>
                        <div style="margin-top:4px;">
                            <span class="sched-timing-badge">${m.timeLabel}</span>
                        </div>
                        <p style="font-size:11.5px; color:#64748b; margin-top:4px;">${m.instructions}</p>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:11px; color:#059669; font-weight:700; display:block;">${m.duration}</span>
                        <span style="font-size:12px; color:#334155; font-weight:600;">${m.dosage}</span>
                    </div>
                </div>
            `).join('');
        }
    }
});
