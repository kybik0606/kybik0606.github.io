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

  /* --- Interactive Starfield --- */
  var canvas = document.getElementById('starfield');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var stars = [];
    var shootingStars = [];
    var mouse = { x: -1000, y: -1000 };
    
    var STAR_DENSITY = 6000; 
    var CONNECTION_DIST = 100; 
    var MOUSE_RADIUS = 150; 
    
    var lastWidth = window.innerWidth;
    var lastTime = 0;
    
    // Проверяем наличие настоящей мыши (компьютеры и ноутбуки)
    var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    function animate(currentTime) {
      requestAnimationFrame(animate);
      
      // ДЕЛЬТА-ВРЕМЯ: делает движение плавным при любой частоте кадров
      if (!lastTime) lastTime = currentTime;
      var dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Ограничитель: если вкладка «спала» 5 секунд, не даём звездам скакнуть
      if (dt > 0.1) dt = 0.1;
      
      var mult = dt * 60; // Множитель скорости (1 при 60 FPS)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Рисуем линии между звездами
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

      // Двигаем и рисуем звезды
      stars.forEach(function(star) {
        star.x += star.vx * mult;
        star.y += star.vy * mult;

        star.alpha += star.twinkleSpeed * mult;
        if (star.alpha > 1 || star.alpha < 0) star.twinkleSpeed *= -1;

        // Отталкивание от мыши
        var dx = mouse.x - star.x;
        var dy = mouse.y - star.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          var force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          star.x -= dx * force * 0.05 * mult;
          star.y -= dy * force * 0.05 * mult;
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

      // Падающие звезды
      if (Math.random() < 0.005 * mult && shootingStars.length < 3) { 
        createShootingStar();
      }
      
      shootingStars.forEach(function(sStar, index) {
        sStar.x += Math.cos(sStar.angle) * sStar.speed * mult;
        sStar.y += Math.sin(sStar.angle) * sStar.speed * mult;
        sStar.alpha -= 0.01 * mult; 

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
    }

    // МЫШКА: только для устройств с настоящей мышью
    if (hasMouse) {
      window.addEventListener('pointermove', function(e) {
        if (e.pointerType !== 'mouse') return;
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      }, { passive: true });
      
      window.addEventListener('pointerleave', function() {
        mouse.x = -1000;
        mouse.y = -1000;
      });
    }

    // СБРОС при скролле (защита от «залипшей» мыши на мобилках)
    window.addEventListener('scroll', function() {
      if (!hasMouse) {
        mouse.x = -1000;
        mouse.y = -1000;
      }
    }, { passive: true });

    // Ресайз только при смене ШИРИНЫ (игнорируем скрытие адресной строки)
    window.addEventListener('resize', function() {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        resizeCanvas();
      }
    });
    
    resizeCanvas();
    requestAnimationFrame(animate);
  }
})();

/* =========================================================
   Saturn ASCII widget — декоративная анимация в #contact
   Порт C-версии raycaster'а. Не трогает глобальные объекты.
   ========================================================= */
(function () {
  'use strict';

  var pre = document.querySelector('.saturn-screen');
  if (!pre) return;

  /* Если пользователь просит меньше анимации — рисуем один статичный кадр. */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pre.textContent =
      "        .-\"\"\"\"\"-.        \n" +
      "      .'  .-\"\"\"-.  '.    \n" +
      "     /   /  (o)  \\   \\   \n" +
      "    |   |    \"    |   |  \n" +
      "     \\   \\       /   /   \n" +
      "      '.  '-...-'  .'    \n" +
      "        '-.....-'        ";
    return;
  }

  /* ---- Параметры сцены (увеличены в ~1.75× по сравнению с прошлой версией) ---- */
  var W = 56, H = 28;
  var shades  = " .:-=+*#%@";
  var NSHADE  = shades.length;
  var R_IN    = 1.30, R_OUT = 2.30;

  var tilt = 0.42;
  var ct = Math.cos(tilt), st = Math.sin(tilt);
  var lx = -0.4, ly = 0.6, lz = 0.7;
  var ll = Math.sqrt(lx*lx + ly*ly + lz*lz);
  lx /= ll; ly /= ll; lz /= ll;

  var scale = Math.min(W * 0.19, H * 0.70);
  var angle = 0;

  /* ---- Ray-caster (порт из C) ---- */
  var ca = 0, sa = 0;

  function traceRay(xv, yv) {
    var Px = xv * ca + yv * st * sa;
    var Py = yv * ct;
    var Pz = xv * sa - yv * st * ca;
    var Dx = -ct * sa;
    var Dy =  st;
    var Dz =  ct * ca;

    var bestZ  = -1e9;
    var bright = 0;

    /* Сфера */
    var P2 = Px*Px + Py*Py + Pz*Pz;
    if (P2 < 1) {
      var zs = Math.sqrt(1 - P2);
      bestZ = zs;
      var ox = Px + zs * Dx;
      var oy = Py + zs * Dy;
      var oz = Pz + zs * Dz;
      var nx =  ca * ox              + sa * oz;
      var ny =  st * sa * ox + ct * oy - st * ca * oz;
      var nz = -ct * sa * ox + st * oy + ct * ca * oz;
      var diff = nx*lx + ny*ly + nz*lz;
      if (diff < 0) diff = 0;
      var base = 0.15 + 0.85 * diff;
      var band = 0.5 + 0.5 * Math.sin(oy * 10);
      var lon  = 0.5 + 0.5 * Math.sin(Math.atan2(oz, ox) * 6 + oy * 5);
      bright = base * (0.60 + 0.25 * band + 0.15 * lon);
      if (bright > 1)    bright = 1;
      if (bright < 0.12) bright = 0.12;
    }

    /* Кольца: плоскость y=0 */
    if (Math.abs(Dy) > 1e-6) {
      var zr = -Py / Dy;
      var rx = Px + zr * Dx;
      var rz = Pz + zr * Dz;
      var r2 = rx*rx + rz*rz;
      if (r2 >= R_IN*R_IN && r2 <= R_OUT*R_OUT && zr > bestZ) {
        var r  = Math.sqrt(r2);
        var rb = 0.70;
        if (r > 1.85 && r < 1.95) rb = 0.10;   /* деление Кассини */
        if (r < 1.38) rb = 0.30;
        if (r > 2.25) rb = 0.40;
        var ang = Math.atan2(rz, rx);
        rb *= 0.90 + 0.10 * Math.sin(ang * 14);
        bright = rb;
      }
    }

    return bright;
  }

  /* ---- Планировщик кадров ---- */
  var running   = true;
  var visible   = true;
  var lastTime  = 0;
  var frameMs   = 1000 / 24;

  function render(now) {
    if (!running) return;

    if (!visible) {
      requestAnimationFrame(render);
      return;
    }
    if (now - lastTime < frameMs) {
      requestAnimationFrame(render);
      return;
    }
    lastTime = now;

    ca = Math.cos(angle);
    sa = Math.sin(angle);

    var lines = new Array(H);
    for (var py = 0; py < H; py++) {
      var row = '';
      for (var px = 0; px < W; px++) {
        var fx = px + 0.5;
        var fy = py + 0.5;
        var xv = (fx - W * 0.5) / scale;
        var yv = (H * 0.5 - fy) * 2 / scale;
        var b  = traceRay(xv, yv);
        var idx = Math.round(b * (NSHADE - 1));
        if (idx < 0) idx = 0;
        else if (idx >= NSHADE) idx = NSHADE - 1;
        row += shades.charAt(idx);
      }
      lines[py] = row;
    }
    pre.textContent = lines.join('\n');

    angle += 0.04;
    if (angle > Math.PI * 2) angle -= Math.PI * 2;

    requestAnimationFrame(render);
  }

  /* Пауза, когда секция вне экрана */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible = e.isIntersecting; });
    }, { threshold: 0 }).observe(pre);
  }

  /* Пауза, когда вкладка неактивна */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running  = true;
      lastTime = 0;
      requestAnimationFrame(render);
    }
  });

  requestAnimationFrame(render);
})();