/**
 * MW Tecnologia Estratégica — Scripts
 * Menu mobile, header no scroll, ano no footer, formulário
 */

(function () {
  'use strict';

  const HEADER = document.getElementById('header');
  const NAV_TOGGLE = document.querySelector('.nav__toggle');
  const NAV_MENU = document.getElementById('nav-menu');
  const NAV_LINKS = document.querySelectorAll('.nav__menu a');
  const YEAR_EL = document.querySelector('[data-year]');
  const FORM = document.querySelector('.contact-form');

  /**
   * Alterna menu mobile (abrir/fechar)
   */
  function toggleMenu() {
    if (!NAV_TOGGLE || !NAV_MENU) return;
    const isOpen = NAV_TOGGLE.getAttribute('aria-expanded') === 'true';
    NAV_TOGGLE.setAttribute('aria-expanded', !isOpen);
    NAV_MENU.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  /**
   * Fecha o menu ao clicar em um link (navegação interna)
   */
  function closeMenuOnLinkClick() {
    NAV_LINKS.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 767px)').matches) {
          NAV_TOGGLE.setAttribute('aria-expanded', 'false');
          NAV_MENU.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  /**
   * Adiciona classe no header quando a página é rolada
   */
  function initHeaderScroll() {
    if (!HEADER) return;
    function onScroll() {
      HEADER.classList.toggle('scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /**
   * Preenche o ano atual no footer
   */
  function setFooterYear() {
    if (YEAR_EL) YEAR_EL.textContent = new Date().getFullYear();
  }

  /**
   * Trata envio do formulário (evita submit real; em produção usar backend)
   */
  function initForm() {
    if (!FORM) return;
    FORM.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = FORM.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Enviando...';
      }
      
      var formData = new FormData(FORM);
      fetch('/', {
        method: 'POST',
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(function(res) {
        if (!res.ok) throw new Error('Network response was not ok');
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
        alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
        FORM.reset();
      })
      .catch(function() {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
        alert('Erro ao enviar mensagem. Por favor, tente pelos canais diretos.');
      });
    });
  }

  /**
   * Inicialização
   */
  if (NAV_TOGGLE && NAV_MENU) {
    NAV_TOGGLE.addEventListener('click', toggleMenu);
    closeMenuOnLinkClick();
  }
  initHeaderScroll();
  setFooterYear();
  initForm();
})();
