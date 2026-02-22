document.addEventListener('DOMContentLoaded', () => {
  initActiveNav();
  initReveal();
  initSmoothScroll();
});

function initActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('active');
    }
  });
}

function initReveal() {
  const revealItems = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('active'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(el => observer.observe(el));
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
