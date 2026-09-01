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
    const statusNeedHelp = document.getElementById('status-need-help');

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

    window.openStatusPage = openStatusPage;
    window.closeStatusPage = closeStatusPage;

    if (statusGoBack) {
        statusGoBack.addEventListener('click', (e) => {
            e.preventDefault();
            closeStatusPage();
        });
    }

    if (btnStatusNew) {
        btnStatusNew.addEventListener('click', () => {
            closeStatusPage();
            if (typeof openSymptomChecker === 'function') openSymptomChecker();
            showToast('Starting Intake Assessment for New Condition...');
        });
    }

    if (btnStatusOngoing) {
        btnStatusOngoing.addEventListener('click', () => {
            closeStatusPage();
            if (typeof openConsultModal === 'function') openConsultModal();
            showToast('Fetching On-going Medical Records & Prescriptions...');
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
        }
    }

    function closeServicesPage() {
        if (servicesPage) {
            servicesPage.classList.remove('active');
            document.body.style.overflow = '';
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
        }
    }

    function closeAboutPage() {
        if (aboutPage) {
            aboutPage.classList.remove('active');
            document.body.style.overflow = '';
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
        }
    }

    function closeContactPage() {
        if (contactPage) {
            contactPage.classList.remove('active');
            document.body.style.overflow = '';
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

            // Populate Patient Record
            if (idVal.toLowerCase().includes('priya')) {
                if (patientName) patientName.textContent = 'Priya Sharma';
                if (patientAbhaNum) patientAbhaNum.textContent = '82-9912-4410-1829';
                if (patientDemo) patientDemo.textContent = 'Female, 28 Yrs (B+ Rh+)';
                if (patientRecords) patientRecords.textContent = '2 Synced Encounters';
            } else if (idVal.toLowerCase().includes('guest')) {
                if (patientName) patientName.textContent = 'Guest Patient (Walk-in)';
                if (patientAbhaNum) patientAbhaNum.textContent = 'GUEST-INTAKE-2026';
                if (patientDemo) patientDemo.textContent = 'Adult Patient (Rapid Pass)';
                if (patientRecords) patientRecords.textContent = 'Temporary Chart Created';
            } else if (idVal.toLowerCase().includes('temp')) {
                if (patientName) patientName.textContent = 'Verified Patient (Instant ABHA)';
                if (patientAbhaNum) patientAbhaNum.textContent = idVal;
                if (patientDemo) patientDemo.textContent = 'Adult (Verified ABDM)';
                if (patientRecords) patientRecords.textContent = '1 Linked Record';
            } else {
                if (patientName) patientName.textContent = 'Rahul Verma';
                if (patientAbhaNum) patientAbhaNum.textContent = idVal.length >= 10 ? idVal : '91-4820-1928-3746';
                if (patientDemo) patientDemo.textContent = 'Male, 32 Yrs (O+ Rh+)';
                if (patientRecords) patientRecords.textContent = '4 Synced Records';
            }

            setConsoleStep(2);
            showToast('✓ Ayushman Bharat Identity Verified!');
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

    if (btnIntakeSymptom) {
        btnIntakeSymptom.addEventListener('click', () => {
            closeModal(abhaModal);
            openSymptomChecker();
            showToast('Launching AI Symptom Assessment...');
        });
    }

    if (btnIntakeDoctor) {
        btnIntakeDoctor.addEventListener('click', () => {
            closeModal(abhaModal);
            openConsultModal();
            showToast('Connecting with Specialist Doctor...');
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

        const optStatusStrong = document.querySelector('#btn-intake-status strong');
        const optStatusSpan = document.querySelector('#btn-intake-status span');
        if (optStatusStrong) optStatusStrong.textContent = dict.optStatusTitle;
        if (optStatusSpan) optStatusSpan.textContent = dict.optStatusSub;

        const optSymptomStrong = document.querySelector('#btn-intake-symptom strong');
        const optSymptomSpan = document.querySelector('#btn-intake-symptom span');
        if (optSymptomStrong) optSymptomStrong.textContent = dict.optSymptomTitle;
        if (optSymptomSpan) optSymptomSpan.textContent = dict.optSymptomSub;

        const optDoctorStrong = document.querySelector('#btn-intake-doctor strong');
        const optDoctorSpan = document.querySelector('#btn-intake-doctor span');
        if (optDoctorStrong) optDoctorStrong.textContent = dict.optDoctorTitle;
        if (optDoctorSpan) optDoctorSpan.textContent = dict.optDoctorSub;

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
});
