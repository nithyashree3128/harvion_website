/* ============================================================
   HARVION — script.js
   Animations, nav, lightbox, contact form, canvas particles
   ============================================================ */
(function() {
    'use strict';

    /* ---------- DOM Ready ---------- */
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        initNavbar();
        initMobileMenu();
        initScrollAnimations();
        initCountUp();
        initLightbox();
        initContactForm();
        initBackToTop();
        initHeroCanvas();
        initSmoothScroll();
    }

    /* ---------- Navbar scroll ---------- */
    function initNavbar() {
        var navbar = document.getElementById('navbar');
        var links = document.querySelectorAll('.nav-links a');
        var sections = document.querySelectorAll('section[id]');

        function onScroll() {
            navbar.classList.toggle('scrolled', window.scrollY > 60);

            var scrollY = window.scrollY + 120;
            sections.forEach(function(sec) {
                var top = sec.offsetTop;
                var height = sec.offsetHeight;
                var id = sec.getAttribute('id');
                links.forEach(function(a) {
                    a.classList.toggle('active',
                        a.getAttribute('href') === '#' + id &&
                        scrollY >= top && scrollY < top + height
                    );
                });
            });
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ---------- Mobile menu ---------- */
    function initMobileMenu() {
        var toggle = document.getElementById('navToggle');
        var links = document.getElementById('navLinks');
        if (!toggle || !links) return;

        toggle.addEventListener('click', function() {
            toggle.classList.toggle('active');
            links.classList.toggle('open');
        });
        links.querySelectorAll('a').forEach(function(a) {
            a.addEventListener('click', function() {
                toggle.classList.remove('active');
                links.classList.remove('open');
            });
        });
    }

    /* ---------- Scroll animations ---------- */
    function initScrollAnimations() {
        var els = document.querySelectorAll('[data-animate]');
        if (!els.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    var delay = parseInt(entry.target.getAttribute('data-delay') || '0', 10);
                    setTimeout(function() {
                        entry.target.classList.add('animated');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        els.forEach(function(el) { observer.observe(el); });
    }

    /* ---------- Count-up ---------- */
    function initCountUp() {
        var nums = document.querySelectorAll('.stat-number[data-count]');
        if (!nums.length) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var target = parseFloat(el.getAttribute('data-count'));
                var isFloat = String(target).indexOf('.') !== -1;
                var duration = 2000;
                var start = performance.now();

                function step(now) {
                    var elapsed = now - start;
                    var progress = Math.min(elapsed / duration, 1);
                    var ease = 1 - Math.pow(1 - progress, 3);
                    var current = ease * target;
                    el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
                    if (progress < 1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        nums.forEach(function(n) { observer.observe(n); });
    }

    /* ---------- Lightbox ---------- */
    function initLightbox() {
        var lightbox = document.getElementById('lightbox');
        var placeholder = document.getElementById('lightboxPlaceholder');
        var caption = document.getElementById('lightboxCaption');
        var closeBtn = document.getElementById('lightboxClose');
        var prevBtn = document.getElementById('lightboxPrev');
        var nextBtn = document.getElementById('lightboxNext');
        var items = document.querySelectorAll('.gallery-item');

        if (!lightbox || !items.length) return;

        var currentIndex = 0;

        function openLightbox(index) {
            currentIndex = index;
            updateLightbox();
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function updateLightbox() {
            var item = items[currentIndex];
            var cap = item.getAttribute('data-caption') || '';
            var icon = item.querySelector('.gallery-placeholder i');
            var label = item.querySelector('.gallery-placeholder span');

            placeholder.innerHTML = '';
            if (icon) {
                var i = document.createElement('i');
                i.className = icon.className;
                placeholder.appendChild(i);
            }
            if (label) {
                var s = document.createElement('span');
                s.textContent = label.textContent;
                placeholder.appendChild(s);
            }
            caption.textContent = cap;
        }

        function navigate(dir) {
            currentIndex = (currentIndex + dir + items.length) % items.length;
            updateLightbox();
        }

        items.forEach(function(item, i) {
            item.addEventListener('click', function() { openLightbox(i); });
        });
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', function() { navigate(-1); });
        nextBtn.addEventListener('click', function() { navigate(1); });
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });
    }

    /* ---------- Contact form ---------- */
    function initContactForm() {
        var form = document.getElementById('contactForm');
        var feedback = document.getElementById('formFeedback');
        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var name = form.querySelector('#contactName').value.trim();
            var email = form.querySelector('#contactEmail').value.trim();
            var message = form.querySelector('#contactMessage').value.trim();

            if (!name || !email || !message) {
                showFeedback('Please fill in all fields.', 'error');
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showFeedback('Please enter a valid email address.', 'error');
                return;
            }

            fetch('https://formspree.io/f/mkokeevo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, message: message })
                })
                .then(function(response) {
                    if (response.ok) {
                        showFeedback('Thank you, ' + name + '! Your message has been received.', 'success');
                        form.reset();
                    } else {
                        showFeedback('Something went wrong. Try again.', 'error');
                    }
                })
                .catch(function() {
                    showFeedback('Network error. Try again.', 'error');
                });
        });

        function showFeedback(msg, type) {
            feedback.textContent = msg;
            feedback.className = 'form-feedback ' + type;
            setTimeout(function() {
                feedback.className = 'form-feedback';
            }, 6000);
        }
    }

    /* ---------- Back to top ---------- */
    function initBackToTop() {
        var btn = document.getElementById('backToTop');
        if (!btn) return;

        window.addEventListener('scroll', function() {
            btn.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Smooth scroll for anchor links ---------- */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(a) {
            a.addEventListener('click', function(e) {
                var href = a.getAttribute('href');
                if (href === '#') return;
                var target = document.querySelector(href);
                if (!target) return;
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ---------- Hero Canvas Particles ---------- */
    function initHeroCanvas() {
        var canvas = document.getElementById('heroCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var particles = [];
        var connections = [];
        var PARTICLE_COUNT = 50;
        var MAX_DIST = 150;
        var mouse = { x: -999, y: -999 };

        function resize() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        // Track mouse in hero area
        var hero = document.getElementById('hero');
        hero.addEventListener('mousemove', function(e) {
            var rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', function() {
            mouse.x = -999;
            mouse.y = -999;
        });

        // Create particles
        for (var i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                r: Math.random() * 2 + 1,
                hue: Math.random() > 0.5 ? 30 : 38 // orange to yellow range
            });
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update & draw particles
            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Bounce at edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Mouse repulsion
                var dx = p.x - mouse.x;
                var dy = p.y - mouse.y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    var force = (120 - dist) / 120 * 0.02;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }

                // Speed limit
                var speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                if (speed > 1.5) {
                    p.vx = (p.vx / speed) * 1.5;
                    p.vy = (p.vy / speed) * 1.5;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = 'hsla(' + p.hue + ', 100%, 60%, 0.6)';
                ctx.fill();
            }

            // Draw connections
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx = particles[i].x - particles[j].x;
                    var dy = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        var alpha = (1 - dist / MAX_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = 'rgba(255, 155, 50, ' + alpha + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        }
        animate();
    }

})();