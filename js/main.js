/**
 * Dr. Ruan Cerqueira - Script Principal
 * Funcionalidades:
 * - Controle de reprodução do vídeo do Hero (pausa no último frame)
 * - Reveal suave ao scroll
 * - Header inteligente adaptativo
 * - Menu móvel hambúrguer (3 traços) e gaveta de navegação
 * - Realce hover de assinatura
 * - Rolagem suave interna
 * - Expansão/Recolhimento dos detalhes dos casos (Opção 2)
 * - Carrossel de avaliações com setas e toque fluído
 */

document.addEventListener('DOMContentLoaded', function () {
  initHeroVideo();
  initScrollReveal();
  initHeaderScroll();
  initMobileMenu();
  initSignatureHoverEffects();
  initSmoothScroll();
  initCaseDetailsToggle();
  initReviewsCarousel();
});

/**
 * Controle do Vídeo de Fundo do Hero:
 * Reproduz normalmente no carregamento da página e, assim que terminar,
 * congela/pausa exatamente no último frame. Se o usuário recarregar a página,
 * o vídeo roda novamente desde o início até o fim.
 */
function initHeroVideo() {
  var heroVideo = document.querySelector('.hero-video');
  if (!heroVideo) return;

  // Garante que o elemento esteja marcado como mudo e com reproducao em linha
  heroVideo.muted = true;
  heroVideo.defaultMuted = true;
  heroVideo.playsInline = true;

  // Tenta iniciar a reproducao imediatamente
  var playPromise = heroVideo.play();
  if (playPromise !== undefined) {
    playPromise.catch(function () {
      heroVideo.muted = true;
      heroVideo.play().catch(function () {});
    });
  }

  // Congela de forma suave no ultimo frame sem permitir que o celular
  // reinicie o ciclo ou descarregue o buffer grafico do video
  var hasFrozen = false;
  heroVideo.addEventListener('timeupdate', function () {
    if (!hasFrozen && heroVideo.duration > 0) {
      if (heroVideo.currentTime >= heroVideo.duration - 0.15) {
        hasFrozen = true;
        heroVideo.pause();
      }
    }
  });

  heroVideo.addEventListener('ended', function () {
    heroVideo.pause();
  });

  // Mantem a reproducao caso o usuario alterne de aba/aplicativo antes do termino
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && !hasFrozen && heroVideo.paused) {
      heroVideo.play().catch(function () {});
    }
  });
}

/**
 * Menu Móvel (3 traços) e Gaveta de Navegação
 */
function initMobileMenu() {
  var toggleBtn = document.getElementById('mobileMenuToggle');
  var drawer = document.getElementById('mobileNavDrawer');
  if (!toggleBtn || !drawer) return;

  var hamburgerIcon = toggleBtn.querySelector('.hamburger-icon');
  var closeIcon = toggleBtn.querySelector('.close-icon');

  function toggleMenu(forceClose) {
    var isOpen = drawer.classList.contains('is-open');
    var shouldOpen = forceClose ? false : !isOpen;

    drawer.classList.toggle('is-open', shouldOpen);
    toggleBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    drawer.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');

    if (hamburgerIcon && closeIcon) {
      hamburgerIcon.style.display = shouldOpen ? 'none' : 'block';
      closeIcon.style.display = shouldOpen ? 'block' : 'none';
    }

    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  toggleBtn.addEventListener('click', function () {
    toggleMenu();
  });

  var drawerLinks = drawer.querySelectorAll('.mobile-nav-link, .mobile-nav-cta a');
  drawerLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      toggleMenu(true);
    });
  });

  document.addEventListener('click', function (e) {
    if (drawer.classList.contains('is-open') && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleMenu(true);
    }
  });
}

/**
 * Revelação suave dos elementos ao entrar no viewport
 */
function initScrollReveal() {
  var revealElements = document.querySelectorAll('.reveal-on-scroll');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
    return;
  }

  var observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  };

  var observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(function (el) {
    observer.observe(el);
  });
}

/**
 * Adaptação do header fixo ao rolar a página
 */
function initHeaderScroll() {
  var header = document.querySelector('.site-header');
  if (!header) return;

  function handleScroll() {
    if (window.scrollY > 40) {
      header.style.backgroundColor = 'rgba(11, 14, 15, 0.96)';
      header.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
    } else {
      header.style.backgroundColor = 'rgba(11, 14, 15, 0.9)';
      header.style.boxShadow = 'none';
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Realce da assinatura autoral no hover das obras
 */
function initSignatureHoverEffects() {
  var cards = document.querySelectorAll('.transformation-card');

  cards.forEach(function (card) {
    var watermark = card.querySelector('.signed-watermark');
    if (!watermark) return;

    card.addEventListener('mouseenter', function () {
      watermark.style.transform = 'scale(1.05) translateY(-2px)';
    });

    card.addEventListener('mouseleave', function () {
      watermark.style.transform = 'none';
    });
  });
}

/**
 * Rolagem suave para links internos
 */
function initSmoothScroll() {
  var links = document.querySelectorAll('a[href^="#"]');

  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href');
      if (targetId === '#') return;

      var targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        var headerOffset = 70;
        var elementPosition = targetEl.getBoundingClientRect().top;
        var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Botão Ver Detalhes do Caso (Opção 2)
 * Alterna a exibição da explicação clínica e dos destaques sob a imagem
 */
function initCaseDetailsToggle() {
  var toggleButtons = document.querySelectorAll('.btn-toggle-details');

  toggleButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('.transformation-card');
      if (!card) return;

      var drawer = card.querySelector('.case-details-drawer');
      if (!drawer) return;

      var isExpanded = btn.getAttribute('aria-expanded') === 'true';
      var nextState = !isExpanded;

      btn.setAttribute('aria-expanded', nextState ? 'true' : 'false');
      drawer.classList.toggle('is-open', nextState);

      var label = btn.querySelector('.btn-toggle-text');
      if (label) {
        label.textContent = nextState ? 'Ocultar Detalhes' : 'Ver Detalhes do Caso';
      }
    });
  });
}

/**
 * Carrossel de Avaliações
 * Desktop: 3 por vez com setas
 * Mobile: 1 por vez com alinhamento 100% perfeito (sem cortar bordas)
 */
function initReviewsCarousel() {
  var trackContainer = document.querySelector('.reviews-carousel-track-container');
  var track = document.getElementById('reviewsTrack');
  var prevBtn = document.getElementById('reviewsPrev');
  var nextBtn = document.getElementById('reviewsNext');
  var dotsContainer = document.getElementById('reviewsDots');

  if (!trackContainer || !track || !prevBtn || !nextBtn) return;

  var cards = track.querySelectorAll('.review-card');
  if (cards.length === 0) return;

  var currentPage = 0;

  function getCardsPerPage() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function getTotalPages() {
    return Math.ceil(cards.length / getCardsPerPage());
  }

  function updateDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    var totalPages = getTotalPages();

    for (var i = 0; i < totalPages; i++) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentPage ? ' active' : '');
      dot.setAttribute('aria-label', 'Ir para a página de avaliações ' + (i + 1));
      (function (idx) {
        dot.addEventListener('click', function () {
          goToPage(idx);
        });
      })(i);
      dotsContainer.appendChild(dot);
    }
  }

  function goToPage(page) {
    var totalPages = getTotalPages();
    if (page < 0) page = 0;
    if (page >= totalPages) page = totalPages - 1;

    currentPage = page;

    var perPage = getCardsPerPage();
    var targetCardIndex = currentPage * perPage;
    if (targetCardIndex >= cards.length) targetCardIndex = cards.length - 1;

    var targetCard = cards[targetCardIndex];
    if (targetCard) {
      trackContainer.scrollTo({
        left: targetCard.offsetLeft - track.offsetLeft,
        behavior: 'smooth'
      });
    }

    prevBtn.disabled = (currentPage === 0);
    nextBtn.disabled = (currentPage >= totalPages - 1);

    var dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach(function (d, idx) {
      d.classList.toggle('active', idx === currentPage);
    });
  }

  prevBtn.addEventListener('click', function () {
    goToPage(currentPage - 1);
  });

  nextBtn.addEventListener('click', function () {
    goToPage(currentPage + 1);
  });

  // Atualiza os indicadores quando o usuário desliza com o dedo no celular
  var scrollDebounceTimer;
  trackContainer.addEventListener('scroll', function () {
    clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = setTimeout(function () {
      var scrollLeft = trackContainer.scrollLeft;
      var perPage = getCardsPerPage();
      var cardWidth = cards[0].offsetWidth;
      if (cardWidth <= 0) return;

      var newIndex = Math.round(scrollLeft / cardWidth);
      var newPage = Math.floor(newIndex / perPage);
      var totalPages = getTotalPages();

      if (newPage >= 0 && newPage < totalPages && newPage !== currentPage) {
        currentPage = newPage;
        prevBtn.disabled = (currentPage === 0);
        nextBtn.disabled = (currentPage >= totalPages - 1);

        var dots = dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach(function (d, idx) {
          d.classList.toggle('active', idx === currentPage);
        });
      }
    }, 60);
  }, { passive: true });

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      updateDots();
      goToPage(0);
    }, 150);
  });

  updateDots();
  goToPage(0);
}
