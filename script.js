/* ==========================================
   JavaScript Functionality
   Beebash Gajurel - Portfolio Website
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initTypingEffect();
  initScrollSpy();
  initPortfolioFilters();
  initContactForm();
  initResumeModal();
});

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

    // Close menu when clicking nav links
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
      typeSpeed = 50; // speed up deletion
    } else {
      typedSpan.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true;
      typeSpeed = 1500; // pause at full word
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % toType.length;
      typeSpeed = 500; // pause before next word
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
    const scrollPos = window.scrollY + 120; // offset for nav bar

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
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
   5. Contact Form Handler (Mock Submission)
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusDiv = document.getElementById('form-status');

  if (form && statusDiv) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      statusDiv.className = 'form-status';
      statusDiv.textContent = 'Sending your message...';

      setTimeout(() => {
        statusDiv.className = 'form-status success';
        statusDiv.innerHTML = `<i class="bi bi-check-circle-fill"></i> Thank you, <strong>${name}</strong>! Your message has been sent successfully.`;
        form.reset();
      }, 1500);
    });
  }
}

/* ==========================================
   6. PDF Resume Modal & LocalStorage Uploader
   ========================================== */
const modal = document.getElementById('resumeModal');
const pdfViewer = document.getElementById('pdf-viewer');
const downloadBtn = document.getElementById('download-resume-btn');
const errorState = document.getElementById('pdf-error-state');

window.openResumeModal = function() {
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    loadStoredPDF();
  }
};

window.closeResumeModal = function() {
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
    pdfViewer.src = 'resume.pdf';
    downloadBtn.href = 'resume.pdf';
    
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
    reader.onload = function(e) {
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
