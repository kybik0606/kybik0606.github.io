(function () {
  'use strict';

  /* --- Sticky header background --- */
  var header = document.getElementById('site-header');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Mobile menu --- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* --- Active nav link --- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        links.forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --- Reveal on scroll --- */
  if ('IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {

    var targets = document.querySelectorAll(
      '.section-head, .prose, .gallery, .media-block, .split, .card'
    );

    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    targets.forEach(function (el) {
      el.classList.add('reveal');
      revealer.observe(el);
    });
  }

  /* --- Interactive Starfield (Active Version) --- */
  var canvas = document.getElementById('starfield');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var shootingStars = [];
    var mouse = { x: -1000, y: -1000 };
    
    // Настройки (можно менять)
    var STAR_DENSITY = 6000; 
    var CONNECTION_DIST = 100; 
    var MOUSE_RADIUS = 150; 
    
    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars();
    }

    function initStars() {
      stars = [];
      var numStars = Math.min(400, Math.floor((canvas.width * canvas.height) / STAR_DENSITY));
      for (var i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.4, 
          vy: (Math.random() - 0.5) * 0.4, 
          alpha: Math.random(),
          twinkleSpeed: Math.random() * 0.03 + 0.01
        });
      }
    }

    // Создание падающей звезды
    function createShootingStar() {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - 200,
        len: Math.random() * 80 + 50,
        speed: Math.random() * 8 + 6,
        alpha: 1,
        angle: Math.PI / 4 
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем линии между близкими звездами
      for (var i = 0; i < stars.length; i++) {
        for (var j = i + 1; j < stars.length; j++) {
          var dx = stars[i].x - stars[j].x;
          var dy = stars[i].y - stars[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = 'rgba(34, 197, 94, ' + (1 - dist / CONNECTION_DIST) * 0.3 + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Двигаем и рисуем обычные звезды
      stars.forEach(function(star) {
        star.x += star.vx;
        star.y += star.vy;

        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0) star.twinkleSpeed *= -1;

        // Взаимодействие с мышкой (отталкивание)
        var dx = mouse.x - star.x;
        var dy = mouse.y - star.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          star.x -= dx * force * 0.05;
          star.y -= dy * force * 0.05;
        }

        // Зацикливание
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.abs(star.alpha) + ')';
        ctx.fill();
      });

      // Рисуем падающие звезды
      if (Math.random() < 0.005 && shootingStars.length < 3) { 
        createShootingStar();
      }
      
      shootingStars.forEach(function(sStar, index) {
        sStar.x += Math.cos(sStar.angle) * sStar.speed;
        sStar.y += Math.sin(sStar.angle) * sStar.speed;
        sStar.alpha -= 0.01; 

        if (sStar.alpha <= 0 || sStar.x > canvas.width || sStar.y > canvas.height) {
          shootingStars.splice(index, 1); 
        } else {
          ctx.beginPath();
          ctx.moveTo(sStar.x, sStar.y);
          ctx.lineTo(sStar.x - Math.cos(sStar.angle) * sStar.len, sStar.y - Math.sin(sStar.angle) * sStar.len);
          ctx.strokeStyle = 'rgba(255, 255, 255, ' + sStar.alpha + ')';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
      
      requestAnimationFrame(animate);
    }

    // ТОЛЬКО МЫШКА (без touchmove, чтобы не ломать скролл на телефоне)
    window.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    
    window.addEventListener('mouseout', function() {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener('resize', resizeCanvas);
    
    resizeCanvas();
    animate();
  }
})();