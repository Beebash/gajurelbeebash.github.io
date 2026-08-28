/* ==========================================
   JavaScript Functionality
   Beebash Gajurel - Portfolio Website
   ========================================== */

/* ==========================================
   EmailJS Configuration
   Replace the three placeholder values below with your real credentials
   from the EmailJS dashboard (https://dashboard.emailjs.com):
     - publicKey:  Account → API Keys → Public Key
     - serviceId:  Email Services → your service → Service ID
     - templateId: Email Templates → your template → Template ID
   ========================================== */
const EMAILJS_CONFIG = {
  publicKey: '_wogmpbbb4uea1R1k',   // EmailJS Public Key
  serviceId: 'service_42vl0tl',     // EmailJS Service ID
  templateId: 'template_8nj6gd1'     // EmailJS Template ID
};

/* Rate-limit: minimum milliseconds between allowed submissions */
const EMAILJS_RATE_LIMIT_MS = 10000;
let _lastSubmitTime = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize EmailJS once with the public key
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
  } else {
    console.warn('[EmailJS] SDK not loaded. Contact form will not send emails.');
  }

  initMobileMenu();
  initTypingEffect();
  initScrollSpy();
  initPortfolioFilters();
  initContactForm();
  initResumeModal();
  initNavbarScroll();
  initTestimonialsSlider();
});

/* ==========================================
   Navbar Scroll Styling Transition
   ========================================== */
function initNavbarScroll() {
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

/* ==========================================
   1. Mobile Navigation Menu
   ========================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('navmenu');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = toggleBtn.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.className = 'bi bi-x';
      } else {
        icon.className = 'bi bi-list';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        toggleBtn.querySelector('i').className = 'bi bi-list';
      });
    });
  }
}

/* ==========================================
   2. Typing Effect (Hero Section)
   ========================================== */
function initTypingEffect() {
  const typedSpan = document.getElementById('typed-text');
  if (!typedSpan) return;

  const toType = [
    "Customer Service Specialist",
    "Operations Manager",
    "API Troubleshooter",
    "Transaction Reconciliation Expert"
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentWord = toType[wordIndex];

    if (isDeleting) {
      typedSpan.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      typedSpan.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      typeSpeed = 1500;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % toType.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 800);
}

/* ==========================================
   3. ScrollSpy (Active nav link on scroll)
   ========================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================
   4. Portfolio Filtering
   ========================================== */
function initPortfolioFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================
   5. Contact Form Handler (EmailJS)
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusDiv = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (!form || !statusDiv || !submitBtn) return;

  /** Helper: safely set status text without XSS risk */
  function setStatus(text, cssClass) {
    statusDiv.className = 'form-status' + (cssClass ? ' ' + cssClass : '');
    statusDiv.textContent = text;
  }

  /** Helper: safely set status with a link node (for error fallback) */
  function setStatusWithLink(messageText, linkHref, linkText, cssClass) {
    statusDiv.className = 'form-status' + (cssClass ? ' ' + cssClass : '');
    statusDiv.textContent = '';
    const span = document.createElement('span');
    span.textContent = messageText + ' ';
    const a = document.createElement('a');
    a.href = linkHref;
    a.textContent = linkText;
    statusDiv.appendChild(span);
    statusDiv.appendChild(a);
  }

  /** Helper: restore button to its default enabled state */
  function resetButton() {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // --- Honeypot check: bots fill hidden fields, real users don't ---
    const honeypot = document.getElementById('_honeypot');
    if (honeypot && honeypot.value.trim() !== '') {
      // Silently reject bot submission
      return;
    }

    // --- Guard: prevent duplicate submissions while one is in flight ---
    if (submitBtn.disabled) return;

    // --- Rate-limit: prevent rapid repeated clicking ---
    const now = Date.now();
    if (now - _lastSubmitTime < EMAILJS_RATE_LIMIT_MS) {
      setStatus('Please wait a moment before sending another message.', 'error');
      return;
    }

    // --- Read and trim field values ---
    const nameVal = document.getElementById('form-name').value.trim();
    const emailVal = document.getElementById('form-email').value.trim();
    const subjectVal = document.getElementById('form-subject').value.trim();
    const messageVal = document.getElementById('form-message').value.trim();

    // --- Client-side validation ---
    if (!nameVal) {
      setStatus('Please enter your name.', 'error');
      document.getElementById('form-name').focus();
      return;
    }
    if (!emailVal) {
      setStatus('Please enter your email address.', 'error');
      document.getElementById('form-email').focus();
      return;
    }
    // Basic email pattern check
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailVal)) {
      setStatus('Please enter a valid email address.', 'error');
      document.getElementById('form-email').focus();
      return;
    }
    if (!subjectVal) {
      setStatus('Please enter a subject.', 'error');
      document.getElementById('form-subject').focus();
      return;
    }
    if (!messageVal) {
      setStatus('Please enter your message.', 'error');
      document.getElementById('form-message').focus();
      return;
    }

    // --- Guard: check that EmailJS SDK is loaded ---
    if (typeof emailjs === 'undefined') {
      console.error('[EmailJS] SDK failed to load. Cannot send form.');
      setStatusWithLink(
        'The contact form is temporarily unavailable. Please email me directly at',
        'mailto:gajurelbeebash@gmail.com',
        'gajurelbeebash@gmail.com',
        'error'
      );
      return;
    }

    // --- Guard: check for unconfigured placeholder credentials ---
    const placeholders = ['YOUR_PUBLIC_KEY', 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID'];
    if (
      placeholders.includes(EMAILJS_CONFIG.publicKey) ||
      placeholders.includes(EMAILJS_CONFIG.serviceId) ||
      placeholders.includes(EMAILJS_CONFIG.templateId)
    ) {
      console.error(
        '[EmailJS] Configuration incomplete. ' +
        'Replace EMAILJS_CONFIG values in script.js with your real credentials.'
      );
      setStatusWithLink(
        'The contact form is temporarily unavailable. Please email me directly at',
        'mailto:gajurelbeebash@gmail.com',
        'gajurelbeebash@gmail.com',
        'error'
      );
      return;
    }

    // --- Disable button & show sending state ---
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    setStatus('Sending your message...', '');

    try {
      // --- Send form via EmailJS (uses name attributes on form fields) ---
      await emailjs.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        form
      );

      // --- Success ---
      _lastSubmitTime = Date.now();
      form.reset();

      // Build success message using textContent (XSS-safe)
      const firstName = nameVal.split(' ')[0];
      statusDiv.className = 'form-status success';
      statusDiv.textContent = '';

      const icon = document.createElement('i');
      icon.className = 'bi bi-check-circle-fill';
      icon.setAttribute('aria-hidden', 'true');

      const msgSpan = document.createElement('span');
      msgSpan.textContent =
        ' Thank you, ' + firstName + '! Your message has been sent successfully.';

      statusDiv.appendChild(icon);
      statusDiv.appendChild(msgSpan);

      // Auto-clear success message after 7 seconds
      setTimeout(() => {
        if (statusDiv.classList.contains('success')) {
          statusDiv.className = 'form-status';
          statusDiv.textContent = '';
        }
      }, 7000);

    } catch (error) {
      // --- Failure: do NOT reset the form so visitor keeps their text ---
      console.error('[EmailJS] Send failed:', error);
      setStatusWithLink(
        'Sorry, your message could not be sent. Please try again or email me directly at',
        'mailto:gajurelbeebash@gmail.com',
        'gajurelbeebash@gmail.com',
        'error'
      );
    } finally {
      // Always restore the button regardless of outcome
      resetButton();
    }
  });
}

/* ==========================================
   6. Accordion Toggle Logic
   ========================================== */
window.toggleAccordion = function (headerElement) {
  const item = headerElement.parentElement;
  const list = item.parentElement;
  const items = list.querySelectorAll('.accordion-item');
  const isActive = item.classList.contains('active');

  items.forEach(i => {
    i.classList.remove('active');
  });

  if (!isActive) {
    item.classList.add('active');
  }
};

/* ==========================================
   7. Testimonials Slider Carousel
   ========================================== */
let slideIndex = 1;
let slideInterval;

function initTestimonialsSlider() {
  showSlides(slideIndex);
  slideInterval = setInterval(() => {
    plusSlides(1);
  }, 6000);
}

window.plusSlides = function (n) {
  clearInterval(slideInterval);
  showSlides(slideIndex += n);
  slideInterval = setInterval(() => {
    plusSlides(1);
  }, 6000);
};

window.currentSlide = function (n) {
  clearInterval(slideInterval);
  showSlides(slideIndex = n);
  slideInterval = setInterval(() => {
    plusSlides(1);
  }, 6000);
};

function showSlides(n) {
  let i;
  const slides = document.getElementsByClassName("testimonial-slide");
  const dots = document.getElementsByClassName("slider-dot");

  if (slides.length === 0) return;

  if (n > slides.length) { slideIndex = 1; }
  if (n < 1) { slideIndex = slides.length; }

  for (i = 0; i < slides.length; i++) {
    slides[i].classList.remove("active");
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }

  slides[slideIndex - 1].classList.add("active");
  if (dots.length >= slideIndex) {
    dots[slideIndex - 1].classList.add("active");
  }
}

/* ==========================================
   8. PDF Resume Modal & LocalStorage Uploader
   ========================================== */
const modal = document.getElementById('resumeModal');
const pdfViewer = document.getElementById('pdf-viewer');
const downloadBtn = document.getElementById('download-resume-btn');
const errorState = document.getElementById('pdf-error-state');

window.openResumeModal = function () {
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadStoredPDF();
  }
};

window.closeResumeModal = function () {
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeResumeModal();
    }
  });
}

function loadStoredPDF() {
  const storedPdf = localStorage.getItem('beebash_resume_pdf');

  if (storedPdf) {
    pdfViewer.src = storedPdf;
    pdfViewer.classList.remove('hidden');
    errorState.classList.add('hidden');
    downloadBtn.href = storedPdf;
  } else {
    pdfViewer.src = 'Beebash-Gajurel-Resume.pdf';
    downloadBtn.href = 'Beebash-Gajurel-Resume.pdf';

    pdfViewer.onerror = () => {
      pdfViewer.classList.add('hidden');
      errorState.classList.remove('hidden');
    };
  }
}

function initResumeModal() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('pdf-file-input');
  const uploadStatus = document.getElementById('upload-status');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => {
    fileInput.click();
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    }, false);
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handlePDFUpload(files[0]);
  });

  fileInput.addEventListener('change', (e) => {
    handlePDFUpload(e.target.files[0]);
  });

  function handlePDFUpload(file) {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      showUploadStatus('Please select a valid PDF document.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showUploadStatus('File is too large. Max limit is 5MB.', 'error');
      return;
    }

    showUploadStatus('Uploading and encoding file...', '');

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const base64Data = e.target.result;
        localStorage.setItem('beebash_resume_pdf', base64Data);
        loadStoredPDF();
        showUploadStatus('Resume PDF updated successfully in your local browser cache!', 'success');
      } catch (err) {
        showUploadStatus('Failed to save to local cache. Storage space might be full.', 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  function showUploadStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `upload-status ${type}`;
  }
}
