/* =============================================
   Fluid Glass Clone — Main JS
   Uses original site's scroll architecture:
   body/html fixed + .scroll container
   ============================================= */

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

// ─── Scroll Setup: .scroll is the scroll container (matches original site) ───
const wrapper = document.querySelector('.scroll');
const content = wrapper ? wrapper.querySelector('.content') : null;

const lenis = new Lenis({
  wrapper: wrapper || window,
  content: content || document.documentElement,
});

// Connect Lenis → ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Tell ScrollTrigger to use .scroll as the scroller
if (wrapper) {
  ScrollTrigger.scrollerProxy(wrapper, {
    scrollTop(value) {
      if (arguments.length) {
        wrapper.scrollTop = value;
      }
      return wrapper.scrollTop;
    },
    getBoundingClientRect() {
      return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
    },
    pinType: 'transform'
  });

  ScrollTrigger.defaults({ scroller: wrapper });
}

const isMobile = () => window.innerWidth < 1024;

// ─── Init ───
document.addEventListener('DOMContentLoaded', () => {
  document.fonts.ready.then(() => {
    initIntro();
    initBaseHeadings();
    initHeroParallax();
    initProductCollection();
    initBannerShowroom();
    initFeaturedProjects();
    initAssetsDuo();
    initReviews();
    initBannerCTA();
    initFooter();
    initWhoWeServe();
    initDesignCap();
    initMenu();
    initLangToggle();
    ScrollTrigger.refresh();
  });
});

/* ─── 0. INTRO ─── */
function initIntro() {
  const intro = document.querySelector('.intro');
  if (!intro) return;

  const overlay = intro.querySelector('.overlay');
  const logo = intro.querySelector('.logo');
  const brandmark = intro.querySelector('.brandmark');
  const cube = intro.querySelector('.cube');
  const shape = intro.querySelector('.shape');
  const wordmarkSvg = intro.querySelector('.wordmark-svg');
  const wordmarkPaths = wordmarkSvg ? wordmarkSvg.querySelectorAll('path') : [];
  const main = document.querySelector('main');

  lenis.stop();

  const tl = gsap.timeline({
    onComplete: () => {
      intro.style.display = 'none';
      lenis.start();
      ScrollTrigger.refresh();
    }
  });

  // Logo is the parent of brandmark+wordmark. Animate logo, not brandmark.
  tl.set(wordmarkPaths, { yPercent: 150 })
    .set(logo, { xPercent: 41, autoAlpha: 1 })
    .add(() => { if (cube) cube.classList.add('rotate'); }, 0);

  tl.fromTo(cube,
    { yPercent: 100, scale: 0 },
    { yPercent: 0, scale: 0.95, duration: 1.5, ease: 'power3.inOut' }
  )
  .add(() => { if (logo) logo.classList.add('mask'); }, 1.5);

  tl.to(logo, { xPercent: 0, duration: 1, ease: 'power3.inOut' }, 1.3)
    .to(cube, { xPercent: 100, yPercent: 50, duration: 1, ease: 'power3.inOut' }, '<')
    .to(wordmarkPaths, { yPercent: 0, stagger: 0.05, duration: 1, ease: 'power3.out' }, '<');

  tl.set(intro, { zIndex: 0 }, 2.2)
    .to(overlay, { opacity: 0.5, duration: 1.2, ease: 'power3.inOut' }, 2.2)
    .fromTo(main, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: 'power3.inOut' }, 2.2);

  tl.to(logo, {
    y: -(window.innerHeight / 3), autoAlpha: 0,
    duration: 1.2, ease: 'power3.inOut'
  }, 2.3);

  const firstChild = main ? main.firstElementChild : null;
  if (firstChild) {
    tl.fromTo(firstChild,
      { scale: 1.1 },
      { scale: 1, duration: 1.2, ease: 'power3.inOut', willChange: 'transform' },
      2.6
    );
  }
  if (main) {
    tl.fromTo(main,
      { scale: isMobile() ? 0.9 : 0.8, rotate: 0.01 },
      { scale: 1, duration: 1.2, ease: 'power3.inOut', willChange: 'transform', clearProps: 'all' },
      '<'
    );
  }
}

/* ─── BaseHeading — SplitText Line Reveal ─── */
function initBaseHeadings() {
  const headings = document.querySelectorAll('.base-heading');
  headings.forEach((el, i) => {
    const split = new SplitText(el, {
      type: 'lines',
      linesClass: 'line',
      mask: 'lines'
    });

    gsap.set(split.lines, { yPercent: 200 });

    const delay = i === 0 ? 3 : 0;

    gsap.to(split.lines, {
      yPercent: 0,
      stagger: 0.1,
      duration: 1.5,
      delay: delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
      }
    });
  });
}

/* ─── 2. HOME HEADER — Hero Parallax ─── */
function initHeroParallax() {
  const section = document.querySelector('.home-header');
  if (!section) return;

  const indicator = section.querySelector('.indicator');
  const asset = section.querySelector('.asset');

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      scrub: true,
      start: 'top top',
      end: 'bottom top',
      trigger: section,
    }
  })
  .fromTo(indicator, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.1 }, 0)
  .fromTo(asset, { yPercent: 0 }, { yPercent: 50 }, 0);
}

/* ─── 4. PRODUCT COLLECTION — Parallax + Hover ─── */
function initProductCollection() {
  const section = document.querySelector('.product-collection');
  if (!section || isMobile()) return;

  const blocks = section.querySelectorAll('.block');
  const blocksContainer = section.querySelector('.blocks');

  if (blocks.length >= 3) {
    gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        scrub: true,
        start: 'top bottom',
        end: 'bottom top',
        trigger: blocksContainer,
      }
    })
    .fromTo(blocks[1], { yPercent: 50 }, { yPercent: 0 }, 0)
    .fromTo(blocks[2], { yPercent: -50 }, { yPercent: 0 }, 0);
  }

  blocks.forEach((block) => {
    const img = block.querySelector('img');
    if (!img) return;
    block.addEventListener('mouseenter', () => {
      gsap.to(img, { scale: 1.1, duration: 1, ease: 'power3.out' });
    });
    block.addEventListener('mouseleave', () => {
      gsap.to(img, { scale: 1, duration: 2, ease: 'power3.out' });
    });
  });
}

/* ─── 5. BANNER SHOWROOM — Split Enter ─── */
function initBannerShowroom() {
  const section = document.querySelector('.banner-showroom');
  if (!section || isMobile()) return;

  const colOne = section.querySelector('.content .column:first-child');
  const colTwo = section.querySelector('.content .column:last-child');
  const border = section.querySelector('.border');
  const background = section.querySelector('.background');

  const scale = window.innerWidth / 1600;

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      scrub: true,
      start: 'top top',
      end: 'bottom bottom',
      trigger: section,
    }
  })
  .fromTo(colOne, { x: scale * 65 }, { x: 0 }, 0)
  .fromTo(colTwo, { x: -scale * 65 }, { x: 0 }, 0)
  .fromTo(border, { scaleX: 0 }, { scaleX: 1 }, 0)
  .fromTo(background, { opacity: 0.7, scale: 0.55 }, { opacity: 0.3, scale: 1 }, 0);
}

/* ─── 6. FEATURED PROJECTS — Hover ─── */
function initFeaturedProjects() {
  const section = document.querySelector('.featured-projects');
  if (!section) return;

  section.querySelectorAll('.project').forEach((project) => {
    const img = project.querySelector('.image img');
    if (!img) return;
    project.addEventListener('mouseenter', () => {
      gsap.fromTo(img, { scale: 1.1 }, { scale: 1, duration: 1, ease: 'power3.out' });
    });
  });
}

/* ─── 7. ASSETS DUO — Parallax ─── */
function initAssetsDuo() {
  const section = document.querySelector('.assets-duo');
  if (!section || isMobile()) return;

  const container = section.querySelector('.container');
  const images = section.querySelectorAll('.block img');

  const setup = () => {
    images.forEach((img) => {
      if (img.clientHeight < container.clientHeight) {
        const diff = container.clientHeight - img.clientHeight;
        gsap.fromTo(img.parentElement,
          { y: 0 },
          {
            y: diff, ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            }
          }
        );
      }
    });
  };

  const allLoaded = Array.from(images).every(img => img.complete);
  if (allLoaded) { setup(); }
  else {
    let loaded = 0;
    images.forEach(img => {
      if (img.complete) { loaded++; }
      else { img.addEventListener('load', () => { loaded++; if (loaded >= images.length) setup(); }, { once: true }); }
    });
  }
}

/* ─── 8. REVIEWS — Carousel with SplitText ─── */
function initReviews() {
  const section = document.querySelector('.reviews');
  if (!section) return;

  const blocks = section.querySelectorAll('.block');
  const blockquotes = section.querySelectorAll('.blockquote');
  const blocksContainer = section.querySelector('.blocks');
  const indicator = section.querySelector('.indicator');

  // Buttons are inside .arrow-nav — first button = prev, second = next
  const arrowNav = section.querySelector('.arrow-nav');
  const navButtons = arrowNav ? arrowNav.querySelectorAll('.button') : [];
  const prevBtn = navButtons[0] || null;
  const nextBtn = navButtons[1] || null;

  if (blocks.length === 0) return;

  // SplitText all blockquotes
  const splits = [];
  blockquotes.forEach((bq) => {
    splits.push(new SplitText(bq, { type: 'lines', linesClass: 'line', mask: 'lines' }));
  });

  // Calculate max height — temporarily make all blocks visible to measure
  blocks.forEach(b => { b.style.visibility = 'visible'; b.style.position = 'relative'; });
  let maxH = 0;
  blocks.forEach((b) => { if (b.offsetHeight > maxH) maxH = b.offsetHeight; });
  // Reset — only active block stays visible
  blocks.forEach((b, i) => {
    b.style.position = 'absolute';
    if (i === 0) {
      b.classList.add('is-active');
      b.style.visibility = 'inherit';
    } else {
      b.classList.remove('is-active');
      b.style.visibility = 'hidden';
    }
  });
  if (blocksContainer && maxH > 0) {
    blocksContainer.style.height = maxH + 'px';
    blocksContainer.style.position = 'relative';
  }

  let current = 0, animating = false;
  const total = blocks.length;

  const updateIndicator = () => {
    if (indicator) indicator.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  };

  const goTo = (dir) => {
    if (animating) return;
    animating = true;
    const prev = current;
    current += dir;
    if (current < 0) current = total - 1;
    if (current >= total) current = 0;
    updateIndicator();

    // Show new block before animating
    blocks[current].style.visibility = 'inherit';

    gsap.fromTo(blocks[prev], { autoAlpha: 1 }, { autoAlpha: 0, ease: 'power3.inOut', onComplete: () => {
      blocks[prev].classList.remove('is-active');
      blocks[prev].style.visibility = 'hidden';
    }});

    blocks[current].classList.add('is-active');
    gsap.fromTo(blocks[current], { autoAlpha: 0 }, { autoAlpha: 1, ease: 'power3.inOut' });

    if (splits[current]) {
      gsap.fromTo(splits[current].lines,
        { yPercent: dir === 1 ? 200 : -200 },
        { yPercent: 0, stagger: dir === 1 ? 0.1 : -0.1, duration: 1.5, ease: 'power3.out',
          onComplete: () => { animating = false; }
        }
      );
    } else { animating = false; }
  };

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(1));
  updateIndicator();
}

/* ─── 9. BANNER CTA — SVG DrawSVG ─── */
function initBannerCTA() {
  const section = document.querySelector('.banner-cta');
  if (!section || isMobile()) return;

  const svgPaths = section.querySelectorAll('.banner-cta-svg path');
  if (svgPaths.length === 0) return;

  gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      scrub: true,
      start: 'top bottom',
      end: 'bottom top',
      trigger: section,
    }
  })
  .fromTo(svgPaths, { drawSVG: '0%' }, { drawSVG: '-100%' })
  .fromTo(svgPaths, { drawSVG: '100%' }, { drawSVG: '0%' });
}

/* ─── 10. FOOTER — Parallax + Scale ─── */
function initFooter() {
  const footer = document.querySelector('.footer');
  if (!footer) return;

  const container = footer.querySelector('.container');
  const bgImage = footer.querySelector('.background img');
  const logo = footer.querySelector('.logo');
  const wordmark = footer.querySelector('.wordmark');

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      scrub: true,
      start: 'top bottom',
      end: 'bottom bottom',
      trigger: footer,
      onEnter: () => document.body.classList.add('is-footer'),
      onLeaveBack: () => document.body.classList.remove('is-footer'),
    }
  });

  if (container) tl.fromTo(container, { yPercent: -50 }, { yPercent: 0, duration: 1 }, 0);
  if (bgImage) tl.fromTo(bgImage, { scale: 1 }, { scale: isMobile() ? 2 : 1.1, duration: 1 }, 0);
  if (logo) tl.fromTo(logo, { opacity: 0, pointerEvents: 'none' }, { opacity: 1, duration: 0.05, pointerEvents: 'all' }, 0.95);
  if (isMobile() && wordmark) tl.fromTo(wordmark, { maskPosition: '0% 50%' }, { duration: 1, maskPosition: '80% 50%' }, 0);
}

/* ─── MENU — Hamburger Open/Close ─── */
function initMenu() {
  const app = document.querySelector('.app');
  const burger = document.querySelector('.burger');
  const closeBtn = document.querySelector('.close');
  const menu = document.querySelector('.menu');
  const menuBg = menu ? menu.querySelector('.background') : null;
  const menuMasks = menu ? menu.querySelectorAll('.mask') : [];
  const menuButton = menu ? menu.querySelector('.base-button') : null;

  if (!app || !burger || !menu) return;

  let isOpen = false;

  const openMenu = () => {
    if (isOpen) return;
    isOpen = true;
    app.classList.add('is-overlay', 'is-menu');
    burger.parentElement.classList.add('menu-open');
    menu.style.visibility = 'visible';
    menu.style.pointerEvents = 'auto';
    lenis.stop();

    // Animate in
    gsap.fromTo(menuBg, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' });
    gsap.fromTo(menuMasks, { yPercent: 100 }, { yPercent: 0, stagger: 0.05, duration: 0.6, delay: 0.2, ease: 'power3.out' });
    if (menuButton) gsap.fromTo(menuButton, { yPercent: 100, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, delay: 0.4, ease: 'power3.out' });

    // Show close button, hide burger
    if (closeBtn) closeBtn.style.visibility = 'visible';
    burger.style.visibility = 'hidden';
  };

  const closeMenu = () => {
    if (!isOpen) return;
    isOpen = false;

    gsap.to(menuBg, { scaleY: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => {
      app.classList.remove('is-overlay', 'is-menu');
      burger.parentElement.classList.remove('menu-open');
      menu.style.visibility = 'hidden';
      menu.style.pointerEvents = 'none';
      if (closeBtn) closeBtn.style.visibility = 'hidden';
      burger.style.visibility = 'visible';
      lenis.start();
    }});
  };

  burger.addEventListener('click', (e) => { e.stopPropagation(); openMenu(); });
  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeMenu(); });

  // Close when clicking outside menu
  app.addEventListener('click', (e) => {
    if (isOpen && !menu.contains(e.target) && !burger.contains(e.target)) {
      closeMenu();
    }
  });
}

/* ─── WHO WE SERVE — Client Personas Grid ─── */
function initWhoWeServe() {
  const section = document.querySelector('.who-we-serve');
  if (!section) return;

  const heading = section.querySelector('.wws-heading');
  const cards = section.querySelectorAll('.wws-card');

  // Heading fade in
  if (heading) {
    gsap.set(heading, { opacity: 0, y: 40 });
    gsap.to(heading, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 85%' }
    });
  }

  // Cards stagger fade in
  if (cards.length > 0) {
    gsap.set(cards, { opacity: 0, y: 40 });
    gsap.to(cards, {
      opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: section.querySelector('.wws-grid'), start: 'top 85%' }
    });
  }
}

/* ─── DESIGN CAPABILITY — Team + Stats + Marquees ─── */
function initDesignCap() {
  const section = document.querySelector('.design-cap');
  if (!section) return;

  const heading = section.querySelector('.dc-heading');
  const members = section.querySelectorAll('.dc-member');
  const stats = section.querySelectorAll('.dc-stat');
  const statNumbers = section.querySelectorAll('.dc-stat-number');

  // Heading fade in
  if (heading) {
    gsap.set(heading, { opacity: 0, y: 40 });
    gsap.to(heading, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 85%' }
    });
  }

  // Team members stagger
  if (members.length > 0) {
    gsap.set(members, { opacity: 0, y: 30 });
    gsap.to(members, {
      opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: section.querySelector('.dc-team'), start: 'top 85%' }
    });
  }

  // Stats count up
  if (statNumbers.length > 0) {
    gsap.set(stats, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: section.querySelector('.dc-stats'),
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(stats, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
        statNumbers.forEach(el => {
          const target = parseInt(el.getAttribute('data-count'));
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target, duration: 2, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.round(obj.val) + '+'; }
          });
        });
      }
    });
  }
}

/* ─── LANGUAGE TOGGLE — EN / 中 ─── */
const i18n = {
  nav_about: { en: 'About' },
  nav_products: { en: 'Products' },
  nav_projects: { en: 'Projects' },
  nav_process: { en: 'Process' },
  nav_contact: { en: 'Contact' },
  mega_label_cats: { en: 'Series' },
  mega_label_featured: { en: 'Featured' },
  mega_view_all: { en: 'View all →' },
  mega_browse_all: { en: 'Browse all products →' },
  mega_cat_wood: { en: 'Wood Panels' },
  mega_cat_ceiling: { en: 'Ceiling Systems' },
  mega_cat_metal: { en: 'Metal Acoustic' },
  mega_cat_fabric: { en: 'Fabric & Eco' },
  mega_cat_specialty: { en: 'Diffusers & Doors' },
  prod_classic_series: { en: 'Classic' },
  prod_classic_name: { en: 'Grooved Acoustic Panel' },
  prod_uniseam_series: { en: 'Uniseam' },
  prod_uniseam_name: { en: 'Seamless Acoustic Ceiling' },
  prod_micro_series: { en: 'Micro Art' },
  prod_micro_name: { en: 'Micro Perforated Panel' },
  prod_curve_series: { en: 'Wood Curve' },
  prod_curve_name: { en: 'Curved Acoustic Panel' },
  mega_cta_eyebrow: { en: 'Bespoke' },
  mega_cta_title: { en: 'Custom Acoustic Design' },
  mega_cta_sub: { en: 'Tailored to your project' },
  // Mega menu — By Application
  mega_label_apps: { en: 'By Application' },
  mega_label_hint: { en: 'Hover to explore →' },
  mega_label_recommended: { en: 'Recommended Series' },
  mega_or_browse: { en: '— or browse by series' },
  app_cinema: { en: 'Cinema & Performance' },
  app_studio: { en: 'Recording Studio' },
  app_office: { en: 'Office & Meeting' },
  app_auditorium: { en: 'Auditorium & Worship' },
  app_hospitality: { en: 'Hospitality & F&B' },
  app_residential: { en: 'Residential' },
  app_cinema_desc: { en: 'Low reverberation with diffuse first reflections. Dark finishes that vanish on screen.' },
  app_studio_desc: { en: 'Controlled decay across the spectrum — broadband absorption, targeted bass treatment, scatter at the rear.' },
  app_office_desc: { en: 'Speech clarity and privacy without acoustic dead zones. Warm, soft architectural surfaces.' },
  app_auditorium_desc: { en: 'Even RT60 across the seating area. Balance reflective surfaces with absorption to preserve presence.' },
  app_hospitality_desc: { en: 'Lower the noise floor without sacrificing atmosphere. Sculptural, tactile, on-brand finishes.' },
  app_residential_desc: { en: 'Quiet rooms for sleep, listening, home cinema. Eco-friendly materials with refined finishes.' },
  rec_classic: { en: 'Grooved Acoustic Panel' },
  rec_micro: { en: 'Micro Perforated Panel' },
  rec_diffuser: { en: 'MLS / QRD Diffusers' },
  rec_door: { en: 'Soundproof Doors' },
  rec_fabric: { en: 'Fabricoustic Panels' },
  rec_microc: { en: 'Micro Classic Panel' },
  rec_qrd: { en: 'QRD Diffusers' },
  rec_spray: { en: 'Acouspray AS30' },
  rec_acona: { en: 'Acona Art Ceiling' },
  rec_pet: { en: 'PET Engraving Panel' },
  rec_curve: { en: 'Wood Curve Panel' },
  rec_uniseam: { en: 'Seamless Ceiling' },
  rec_wool: { en: 'Wood Wool Cement' },
  rec_phonex: { en: 'Phonex Compose Metal' },
  rec_perfo: { en: 'Classic Perforated' },
  rec_door2: { en: 'Soundproof Doors' },
  rec_curve2: { en: 'Wood Curve Panel' },
  rec_art: { en: 'Art Acoustic CNC' },
  rec_aconac: { en: 'Acona Classic Ceiling' },
  rec_eco: { en: 'Fabricoustic Eco' },
  rec_petv: { en: 'PET V-Groove Panel' },
  rec_microc2: { en: 'Micro Classic Panel' },
  rec_cleaneo: { en: 'Cleaneo Gypsum' },
  rec_fabricc: { en: 'Fabricoustic Classic' },
  // Mega menu — Series Index v2
  mcat_label_series: { en: 'Series' },
  mcat_all: { en: 'All 128 models →' },
  mcat_classic: { en: 'Classic Wood' },
  mcat_art: { en: 'Art & Curve' },
  mcat_metal: { en: 'PHONEX Metal' },
  mcat_ceiling: { en: 'Ceiling Systems' },
  mcat_fabric: { en: 'Fabric & Eco' },
  mcat_pet: { en: 'Polyester (PET)' },
  mcat_diffuser: { en: 'Diffusers' },
  mcat_specialty: { en: 'Wood Wool / Spray / Door' },
  mcat_classic_title: { en: 'Classic Wood Series' },
  mcat_classic_desc: { en: 'MDF/MGO base with melamine, HPL or veneer finish. Grooved, perforated and micro-perforated patterns for any acoustic profile.' },
  mcat_art_title: { en: 'Art Acoustic & Wood Curve' },
  mcat_art_desc: { en: 'CNC-carved decorative panels and R≤1000mm curved panels. Sculptural acoustic focal points for hospitality and lobby spaces.' },
  mcat_metal_title: { en: 'PHONEX Metal Acoustic' },
  mcat_metal_desc: { en: 'Perforated aluminum with honeycomb core. Designed for airports, labs, kitchens and high-traffic industrial spaces.' },
  mcat_ceiling_title: { en: 'Ceiling Systems' },
  mcat_ceiling_desc: { en: 'Seamless plaster ceilings, perforated gypsum and fiberglass tiles. Plus suspended 3D Acona Art for sculpted soffits.' },
  mcat_fabric_title: { en: 'Fabricoustic — Fabric & Eco' },
  mcat_fabric_desc: { en: 'High-density fiberglass or recycled cotton core wrapped in Class-A flame-retardant acoustic fabric. NRC up to 0.9.' },
  mcat_pet_title: { en: 'Polyester (PET) — 100% Recyclable' },
  mcat_pet_desc: { en: 'PET acoustic panels, V-groove walls, engraving ceilings and folded acoustic clouds. Color-rich, low-VOC, child-safe.' },
  mcat_diffuser_title: { en: 'Acoustic Diffusers' },
  mcat_diffuser_desc: { en: 'ISO 17497-tested MLS, QRD, Skyline and geometric diffusers. Solid wood or MDF with paint or veneer finish.' },
  mcat_specialty_title: { en: 'Wood Wool · Spray · Soundproof Doors' },
  mcat_specialty_desc: { en: 'Mineralized wood-wool cement boards, seamless Acouspray AS30 finish, and STC 35-45 dB soundproof doors in metal, wood and composite.' },
  cls_classic: { en: 'Classic Grooved · 10' },
  cls_perfo: { en: 'Perfo · 6' },
  cls_microc: { en: 'Micro Classic · 4' },
  cls_microa: { en: 'Micro Art · 7' },
  cls_curve: { en: 'Wood Curve · 4' },
  cls_artac: { en: 'Art Acoustic · 22 (NY-AA-001~022)' },
  cls_curve2: { en: 'Wood Curve · 3 perforations' },
  cls_microart: { en: 'Micro Art Geometric · 7' },
  cls_compose: { en: 'Compose · 3' },
  cls_metalcl: { en: 'Classic · 10' },
  cls_metalstd: { en: 'Standard · 4' },
  cls_uniseam: { en: 'Uniseam Aero / Mono' },
  cls_cleaneo: { en: 'Cleaneo · 4' },
  cls_aconac: { en: 'Acona Classic' },
  cls_aconaa: { en: 'Acona Art · 10 + 10 collections' },
  cls_fabricc: { en: 'Classic · 25-60mm' },
  cls_fabrice: { en: 'Eco · 25/50mm recycled cotton' },
  cls_petp: { en: 'Flat Panel · 9/12mm' },
  cls_petv: { en: 'V-Groove · 12 SKU' },
  cls_petb: { en: 'Engraving Ceiling · 12 SKU' },
  cls_petc: { en: 'Acoustic Cloud' },
  cls_mls: { en: 'MLS Series · 3' },
  cls_qrd: { en: 'QRD / Skyline · 5' },
  cls_geom: { en: 'Geometric · 9' },
  cls_wool: { en: 'Wood Wool · 7 shapes' },
  cls_spray: { en: 'Acouspray AS30' },
  cls_door: { en: 'Doors · STC 35-45 dB' },
  // About — Numbers & Proof
  proof_eyebrow: { en: 'About NAAYA' },
  proof_heading: { en: 'An acoustic systems company — sixteen years of designing surfaces that disappear into the architecture.' },
  proof_stat_founded: { en: 'Founded' },
  proof_stat_series: { en: 'Series' },
  proof_stat_projects: { en: 'Projects delivered' },
  proof_stat_iso: { en: 'Certified across all series' },
  proof_note_1: { en: '· Tested by Tongji & SIA Acoustic Lab' },
  proof_note_2: { en: '· Delivered to airports, theaters, studios across Asia & EU' },
  tape_summary: { en: '14 categories · 5 material families · ISO 354 tested' },
  cmp_title: { en: 'From reverberant to optimal — drag to see the difference NAAYA makes.' },
  cmp_before: { en: 'Before' },
  cmp_before_cap: { en: 'Too reverberant' },
  cmp_after: { en: 'After' },
  cmp_after_cap: { en: 'Optimal speech' },
  manifesto_l1: { en: 'Your RT60.' },
  manifesto_l2: { en: 'In sixty seconds.' },
  manifesto_sub: { en: 'Sketch a room. Pick finishes. Ship a spec.' },
  manifesto_meta_1: { en: 'Free' },
  manifesto_meta_2: { en: 'No sign-up' },
  manifesto_meta_3: { en: 'ISO 354 methodology' },
  calc_mag_badge: { en: 'Free · Instant report' },
  mag_headline: { en: 'A free acoustic report for your space — delivered the moment you finish entering it.' },
  mag_body: { en: 'No quote forms. No back-and-forth with a sales engineer. Sketch your room, pick your finishes, and our calculator returns a frequency-accurate RT60 report — backed by ISO 354 — right there on screen. Yours to download as a PDF.' },
  mag_meta_1: { en: '100% free' },
  mag_meta_2: { en: 'No sign-up' },
  mag_meta_3: { en: '60-second turnaround' },
  cta_button: { en: 'Get in touch' },
  hero_heading: { en: 'Acoustic elegance for spaces that inspire.' },
  hero_title: { en: 'Acoustic specialists' },
  hero_text: { en: 'We design, engineer and deliver integrated acoustic solutions for ambitious architectural projects. Every surface reflects our commitment to clarity, craft, and performance.' },
  hero_scroll: { en: 'Scroll to explore' },
  about_title: { en: 'About NAAYA' },
  about_heading: { en: 'We bring spaces to life through sound and design. Trusted by architects who demand precision, beauty, and acoustic excellence.' },
  about_button: { en: 'Who we are' },
  aw_heading: { en: 'Sixteen years of<br>designing how a<br>room sounds.' },
  cat_index_viewall: { en: 'All 128 models' },
  cr_headline: { en: 'Your free acoustic report — one click away.' },
  cr_body: { en: 'Sketch your room, pick from 14 NAAYA series, and our calculator returns a frequency-accurate RT60 report — backed by ISO 354. Download as PDF the moment it\'s ready.' },
  cr_meta: { en: '100% free  ·  No sign-up  ·  ISO 354 methodology' },
  about_materials: { en: '16 series — a complete material study across wood, metal, fabric, polyester, gypsum and spray-applied acoustics. Every surface tested to ISO 354.' },
  mat_wood: { en: 'Wood' },
  mat_metal: { en: 'Metal' },
  mat_fabric: { en: 'Fabric' },
  mat_gypsum: { en: 'Gypsum' },
  mat_pet: { en: 'PET Eco' },
  mat_spray: { en: 'Spray' },
  mat_eyebrow_01: { en: '01' },
  mat_eyebrow_02: { en: '02' },
  mat_eyebrow_03: { en: '03' },
  mat_eyebrow_04: { en: '04' },
  mat_eyebrow_05: { en: '05' },
  mat_eyebrow_06: { en: '06' },
  product_title: { en: 'Product collection' },
  product_button: { en: 'Product overview' },
  collection_heading: { en: '16 series engineered for every acoustic challenge — across five material families.' },
  collection_viewall: { en: 'View all' },
  collection_count: { en: '14 categories' },
  cat_wood_name: { en: 'Grooved' },
  cat_wood_count: { en: 'Classic' },
  cat_perfo_name: { en: 'Perforated' },
  cat_perfo_count: { en: 'Perfo' },
  cat_micro_name: { en: 'Micro' },
  cat_micro_count: { en: 'Micro Art' },
  cat_curve_name: { en: 'Curved' },
  cat_curve_count: { en: 'Wood Curve' },
  cat_metal_name: { en: 'Metal' },
  cat_metal_count: { en: 'Phonex' },
  cat_uniseam_name: { en: 'Seamless' },
  cat_uniseam_count: { en: 'Uniseam' },
  cat_gypsum_name: { en: 'Gypsum' },
  cat_gypsum_count: { en: 'Cleaneo' },
  cat_spray_name: { en: 'Spray' },
  cat_spray_count: { en: 'Acouspray' },
  cat_fiberglass_name: { en: 'Fiberglass' },
  cat_fiberglass_count: { en: 'Acona' },
  cat_fabric_name: { en: 'Fabric' },
  cat_fabric_count: { en: 'Fabricoustic' },
  cat_pet_name: { en: 'Eco PET' },
  cat_pet_count: { en: 'Polyester' },
  cat_woodwool_name: { en: 'Wood Wool' },
  cat_woodwool_count: { en: 'Wood Wool' },
  cat_diffuser_name: { en: 'Diffuser' },
  cat_diffuser_count: { en: 'Diffuser' },
  cat_door_name: { en: 'Door' },
  cat_door_count: { en: 'Soundproof' },
  product_1: { en: 'Grooved Panel' },
  product_2: { en: 'Uniseam Ceiling' },
  product_3: { en: 'Micro Panel' },
  product_4: { en: 'Perforated Panel' },
  factory_title: { en: 'Factory' },
  factory_heading: { en: 'Where precision engineering meets acoustic innovation.' },
  factory_label: { en: 'Location' },
  factory_address: { en: 'Guangzhou, China' },
  factory_button: { en: 'Our factory' },
  projects_title: { en: 'Featured projects' },
  projects_viewall: { en: 'View all 6 projects' },
  projects_heading: { en: 'Each project tells its own story of acoustic design and spatial harmony.' },
  projects_button: { en: 'View projects' },
  wws_title: { en: 'Who we serve' },
  wws_heading: { en: 'From concept to completion, we partner with every voice in the built environment.' },
  wws_voices_heading: { en: 'In their own words.' },
  wws_net_heading: { en: 'Eight roles. One project.' },
  wws_net_sub: { en: 'From concept to completion, NAAYA touches every voice in the built environment. Hover any role to see how.' },
  wws_matrix_heading: { en: 'A role for every voice in the project.' },
  wws_matrix_sub: { en: 'From concept to completion, NAAYA serves eight distinct user groups — each with their own concern and a matching deliverable.' },
  process_eyebrow: { en: 'How we work' },
  process_heading: { en: 'From brief to handover — three steps.' },
  process_deliver: { en: 'Deliverable' },
  process_s1_name: { en: 'Brief' },
  process_s1_desc: { en: 'You share project drawings, function, and RT60 targets — or use our free calculator first. We respond with a feasibility note within 48 hours.' },
  process_s1_deliver: { en: 'Feasibility note · 48 hr turnaround · Free, no sign-up' },
  process_s2_name: { en: 'Spec' },
  process_s2_desc: { en: 'Our acoustic team models the room, proposes a panel mix tuned to ISO 354 targets, and delivers a tender-ready specification with Revit / CAD assets.' },
  process_s2_deliver: { en: 'RT60 report · Panel-mix spec · Revit / CAD library · 5 working days' },
  process_s3_name: { en: 'Build' },
  process_s3_desc: { en: 'Custom production, factory-direct shipping, on-site installation support, and post-install acoustic verification — closing the loop with measured RT60.' },
  process_s3_deliver: { en: 'Manufactured panels · Install support · ISO 354 verification report' },
  process_foot_text: { en: 'Ready to brief us on your project?' },
  process_cta: { en: 'Contact us' },
  ptl_s1_meta: { en: '48-HOUR TURNAROUND' },
  ptl_s2_meta: { en: '5 WORKING DAYS' },
  ptl_s3_meta: { en: 'ISO 354 VERIFIED' },
  voice_owner_role: { en: 'Property Owners' },
  voice_owner_quote: { en: '“I’m betting my brand on this space.”' },
  voice_owner_ans: { en: 'Turnkey acoustics with documented performance, not promises.' },
  voice_arch_role: { en: 'Architects' },
  voice_arch_quote: { en: '“I need RT60 numbers I can defend in a design review.”' },
  voice_arch_ans: { en: 'Every panel ships with ISO 354 data + Revit / CAD library.' },
  voice_mep_role: { en: 'MEP Consultants' },
  voice_mep_quote: { en: '“Coordination between trades has to be clean.”' },
  voice_mep_ans: { en: 'Pre-cut reveals, integrated lighting / grille details, BIM-ready families.' },
  voice_acoustic_role: { en: 'Acoustic Consultants' },
  voice_acoustic_quote: { en: '“I spec on tested data — not estimates.”' },
  voice_acoustic_ans: { en: 'Third-party NRC published for every model across 125 Hz – 4 kHz.' },
  voice_interior_role: { en: 'Interior Designers' },
  voice_interior_quote: { en: '“Acoustic shouldn’t compromise the visual language.”' },
  voice_interior_ans: { en: '14 wood species, RAL-matched paint, custom veneer — without breaking ratings.' },
  voice_contr_role: { en: 'Contractors' },
  voice_contr_quote: { en: '“I need things to fit on site, fast.”' },
  voice_contr_ans: { en: 'Cut-to-size, labeled per drawing, installer-rated mounting kits.' },
  voice_fitout_role: { en: 'Fit-out Partners' },
  voice_fitout_quote: { en: '“The last 10% is where the timeline burns.”' },
  voice_fitout_ans: { en: 'Direct factory ship, regional warehousing, free replacement on damage.' },
  voice_dist_role: { en: 'Distributors' },
  voice_dist_quote: { en: '“I sell solutions, not just product lists.”' },
  voice_dist_ans: { en: 'Co-branded samples, training, project leads, exclusive territory.' },
  wws_cta: { en: 'Get a quote' },
  wws_owner_name: { en: 'Property Owners' },
  wws_owner_desc: { en: 'Visionaries commissioning exceptional spaces' },
  wws_architect_name: { en: 'Architects' },
  wws_architect_desc: { en: 'Designers shaping the acoustic blueprint' },
  wws_mep_name: { en: 'MEP Consultants' },
  wws_mep_desc: { en: 'Engineering allies for seamless integration' },
  wws_acoustic_name: { en: 'Acoustic Consultants' },
  wws_acoustic_desc: { en: 'Specialists defining the sound of a space' },
  wws_interior_name: { en: 'Interior Designers' },
  wws_interior_desc: { en: 'Creatives balancing beauty and performance' },
  wws_contractor_name: { en: 'General Contractors' },
  wws_contractor_desc: { en: 'Builders delivering complex projects on time' },
  wws_fitout_name: { en: 'Fit-out Companies' },
  wws_fitout_desc: { en: 'Experts in precision acoustic installation' },
  wws_distributor_name: { en: 'Acoustic Distributors' },
  wws_distributor_desc: { en: 'Partners extending our global reach' },
  footer_tag: { en: 'Acoustic elegance for spaces that inspire. 16 series engineered for architectural projects worldwide.' },
  footer_email_label: { en: 'Email' },
  footer_phone_label: { en: 'Phone' },
  footer_addr_label: { en: 'Address' },
  footer_addr: { en: 'Guangzhou, China' },
  footer_products: { en: 'Products' },
  footer_p_wood: { en: 'Wood Panels' },
  footer_p_ceiling: { en: 'Ceiling Systems' },
  footer_p_metal: { en: 'Metal Acoustic' },
  footer_p_fabric: { en: 'Fabric & Eco' },
  footer_p_specialty: { en: 'Diffusers & Doors' },
  footer_p_all: { en: 'All series →' },
  footer_company: { en: 'Company' },
  footer_c_about: { en: 'About NAAYA' },
  footer_c_approach: { en: 'Our approach' },
  footer_c_projects: { en: 'Featured projects' },
  footer_c_factory: { en: 'Factory tour' },
  footer_c_careers: { en: 'Careers' },
  footer_c_news: { en: 'News' },
  footer_resources: { en: 'Resources' },
  footer_r_specs: { en: 'Spec sheets' },
  footer_r_catalog: { en: 'Product catalogue' },
  footer_r_guide: { en: 'Acoustics 101' },
  footer_r_certs: { en: 'Certifications' },
  footer_r_faq: { en: 'FAQ' },
  footer_get_in_touch: { en: 'Get in touch' },
  footer_cta_text: { en: 'For project enquiries, samples and bespoke acoustic design.' },
  footer_newsletter: { en: 'Subscribe to our newsletter' },
  calc_eyebrow: { en: '◆ Acoustic Calculator' },
  calc_heading: { en: 'A free RT60 evaluation for your space — in 60 seconds.' },
  calc_sub: { en: 'Sketch your room, pick your finishes, and our calculator returns a frequency-accurate reverberation report — plus a panel mix tuned to ISO 354 targets.' },
  calc_step_1: { en: 'Input your space' },
  calc_step_1d: { en: 'Volume, function, ceiling height.' },
  calc_step_2: { en: 'Pick your materials' },
  calc_step_2d: { en: 'From 14 NAAYA series and common surfaces.' },
  calc_step_3: { en: 'Get the RT report' },
  calc_step_3d: { en: 'Frequency curve, NRC, and panel mix.' },
  calc_cta: { en: 'Launch the calculator' },
  calc_foot: { en: 'Free · No sign-up · ISO 354 methodology' },
  wws_1_title: { en: 'Property Owners' },
  wws_1_desc: { en: 'Visionaries who commission exceptional spaces' },
  wws_2_title: { en: 'Architects' },
  wws_2_desc: { en: 'Design partners who shape the acoustic blueprint' },
  wws_3_title: { en: 'MEP Consultants' },
  wws_3_desc: { en: 'Engineering allies ensuring seamless integration' },
  wws_4_title: { en: 'Acoustic Consultants' },
  wws_4_desc: { en: 'Specialists who define the sound of a space' },
  wws_5_title: { en: 'Interior Designers' },
  wws_5_desc: { en: 'Creatives who demand beauty and performance' },
  wws_6_title: { en: 'General Contractors' },
  wws_6_desc: { en: 'Builders who deliver complex projects on time' },
  wws_7_title: { en: 'Fit-out Companies' },
  wws_7_desc: { en: 'Specialists in precision acoustic installation' },
  wws_8_title: { en: 'Acoustic Distributors' },
  wws_8_desc: { en: 'Partners extending our global reach' },
  reviews_title: { en: 'Client stories' },
  cta_title: { en: 'Where sound meets design' },
  cta_heading: { en: 'Every great space begins with listening' },
  cta_button_1: { en: 'Our approach' },
  dc_title: { en: 'Design capability' },
  dc_heading: { en: 'A team built on decades of acoustic expertise, powered by world-class tools.' },
};

let currentLang = 'en';

function initLangToggle() {
  const btn = document.querySelector('.lang-toggle');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentLang = currentLang === 'en' ? 'cn' : 'en';
    btn.textContent = currentLang === 'en' ? 'EN' : '中';
    applyLang();
  });
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[key] && i18n[key][currentLang]) {
      el.textContent = i18n[key][currentLang];
    }
  });
}

/* ─── SITE NAV — scroll state + mobile burger ─── */
(function initSiteNav(){
  const nav = document.getElementById('siteNav');
  const burger = document.getElementById('siteNavBurger');
  const mobile = document.getElementById('siteNavMobile');
  if (!nav) return;

  // Use IntersectionObserver on the hero — when hero leaves the viewport top,
  // nav switches to "is-scrolled" (cream bg + dark text). Reliable with Lenis.
  const hero = document.querySelector('.home-header');
  if (hero){
    const io = new IntersectionObserver(
      (entries) => {
        // hero intersecting top of viewport → transparent nav over dark video
        // hero gone → switch to scrolled state
        const e = entries[0];
        nav.classList.toggle('is-scrolled', !e.isIntersecting || e.intersectionRatio < 0.1);
      },
      { rootMargin: '-70px 0px 0px 0px', threshold: [0, 0.1] }
    );
    io.observe(hero);
  } else {
    nav.classList.add('is-scrolled');
  }

  // Mobile burger
  if (burger && mobile){
    burger.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      mobile.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
    mobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('nav-open');
      mobile.setAttribute('aria-hidden', 'true');
    }));
  }
})();

/* ─── Collection horizontal scroller ─── */
(function initCollectionScroller(){
  const row = document.getElementById('collectionRow');
  if (!row) return;
  document.querySelectorAll('.collection-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = parseInt(btn.dataset.dir, 10) || 1;
      const card = row.querySelector('.cat-card');
      const step = card ? card.offsetWidth + 16 : 280;
      row.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    });
  });
})();

/* ─── Cinematic carousel (featured projects) ─── */
(function initCineCarousel(){
  const stage = document.getElementById('cineStage');
  if (!stage) return;
  const slides = stage.querySelectorAll('.cine-slide');
  const metas  = stage.querySelectorAll('.cine-meta');
  const thumbs = document.querySelectorAll('.cine-thumb');
  const prev = document.getElementById('cinePrev');
  const next = document.getElementById('cineNext');
  const current = document.getElementById('cineCurrent');
  const progress = document.getElementById('cineProgress');
  const total = slides.length;
  let idx = 0;
  let autoplayId = null;

  const go = (n) => {
    idx = ((n % total) + total) % total;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    metas.forEach((m, i) => m.classList.toggle('is-active', i === idx));
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
    if (current) current.textContent = String(idx + 1).padStart(2, '0');
    if (progress) progress.style.width = ((idx + 1) / total * 100) + '%';
  };

  if (prev) prev.addEventListener('click', () => { go(idx - 1); restartAuto(); });
  if (next) next.addEventListener('click', () => { go(idx + 1); restartAuto(); });
  thumbs.forEach((t, i) => t.addEventListener('click', () => { go(i); restartAuto(); }));

  const startAuto = () => { autoplayId = setInterval(() => go(idx + 1), 6000); };
  const stopAuto = () => { if (autoplayId) clearInterval(autoplayId); autoplayId = null; };
  const restartAuto = () => { stopAuto(); startAuto(); };
  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', startAuto);

  go(0);
  startAuto();
})();

/* ============ Mega Menu — Series Index v2 hover switcher ============ */
(function initMegaCatsV2(){
  document.querySelectorAll('.mega-cats-v2').forEach(menu => {
    const items = menu.querySelectorAll('.mcat-item');
    const panes = menu.querySelectorAll('.mcat-pane');
    if (!items.length || !panes.length) return;
    const activate = (key) => {
      items.forEach(c => c.classList.toggle('is-active', c.dataset.cat === key));
      panes.forEach(p => p.classList.toggle('is-active', p.dataset.pane === key));
    };
    items.forEach(item => {
      item.addEventListener('mouseenter', () => activate(item.dataset.cat));
    });
  });
})();

/* ============ About — Numbers count-up on scroll into view ============ */
(function initProofCounters(){
  const stats = document.querySelectorAll('.stat-num[data-count]');
  if (!stats.length) return;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = parseInt(el.dataset.duration, 10) || 1500;
    const plus = el.querySelector('.stat-plus');
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(easeOutCubic(t) * target);
      el.firstChild.nodeValue = val.toString();
      if (t < 1) requestAnimationFrame(step);
      else if (plus) plus.style.opacity = 1;
    };
    if (plus) plus.style.opacity = 0;
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4, root: document.querySelector('.scroll') });
  stats.forEach(s => io.observe(s));
})();

/* ============ Collection Tape — JS marquee with drag/swipe ============ */
(function initTape(){
  const tape = document.querySelector('.collection-tape .tape');
  if (!tape) return;
  const rows = tape.querySelectorAll('.tape-row');

  rows.forEach((row, idx) => {
    const track = row.querySelector('.tape-track');
    if (!track) return;

    const direction = idx === 0 ? -1 : 1; // row 1 left, row 2 right
    const speed = idx === 0 ? 40 : 34;    // px/sec
    let halfWidth = 0;
    let position = 0;
    let lastFrame = performance.now();

    let isHover = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartPos = 0;
    let dragPointerId = null;

    const measure = () => {
      halfWidth = track.scrollWidth / 2;
      if (direction > 0 && position === 0) position = -halfWidth;
    };
    measure();
    // remeasure after images load
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure);
    setTimeout(measure, 600);
    setTimeout(measure, 1500);

    const wrap = () => {
      if (halfWidth <= 0) return;
      while (position <= -halfWidth) position += halfWidth;
      while (position > 0) position -= halfWidth;
    };

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (!isHover && !isDragging) {
        position += direction * speed * dt;
      }
      wrap();
      track.style.transform = `translate3d(${position}px,0,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    row.addEventListener('mouseenter', () => { isHover = true; });
    row.addEventListener('mouseleave', () => { isHover = false; });

    row.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      dragStartX = e.clientX;
      dragStartPos = position;
      dragPointerId = e.pointerId;
      row.classList.add('is-dragging');
      row.setPointerCapture(e.pointerId);
    });
    row.addEventListener('pointermove', (e) => {
      if (!isDragging || e.pointerId !== dragPointerId) return;
      position = dragStartPos + (e.clientX - dragStartX);
    });
    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      dragPointerId = null;
      row.classList.remove('is-dragging');
    };
    row.addEventListener('pointerup', endDrag);
    row.addEventListener('pointercancel', endDrag);
    row.addEventListener('pointerleave', endDrag);

    // Prevent card click after a drag of more than 5px
    row.querySelectorAll('.tape-card').forEach(card => {
      let downX = 0;
      card.addEventListener('pointerdown', (e) => { downX = e.clientX; });
      card.addEventListener('click', (e) => {
        if (Math.abs(e.clientX - downX) > 5) { e.preventDefault(); e.stopPropagation(); }
      });
    });
  });
})();

/* ============ Calc Compare — Draggable Before/After slider ============ */
(function initCmpSlider(){
  const stage = document.getElementById('cmpStage');
  if (!stage) return;
  const handle = stage.querySelector('.cmp-handle');
  let isDragging = false;
  let pointerId = null;

  const setPos = (clientX) => {
    const rect = stage.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    stage.style.setProperty('--slider-pos', pct + '%');
  };

  const onDown = (e) => {
    isDragging = true;
    pointerId = e.pointerId;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(e.pointerId);
    setPos(e.clientX);
  };
  const onMove = (e) => {
    if (!isDragging || e.pointerId !== pointerId) return;
    setPos(e.clientX);
  };
  const onUp = () => {
    isDragging = false;
    pointerId = null;
    stage.classList.remove('is-dragging');
  };

  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);

  // Keyboard support
  handle.tabIndex = 0;
  handle.addEventListener('keydown', (e) => {
    const cur = parseFloat(getComputedStyle(stage).getPropertyValue('--slider-pos')) || 50;
    let next = cur;
    if (e.key === 'ArrowLeft') next = Math.max(2, cur - 3);
    if (e.key === 'ArrowRight') next = Math.min(98, cur + 3);
    if (next !== cur) {
      stage.style.setProperty('--slider-pos', next + '%');
      e.preventDefault();
    }
  });
})();

/* ============ Featured Projects — Hero + Index hover switcher ============ */
(function initCineIndex(){
  const stage = document.querySelector('.cine-index-stage');
  if (!stage) return;
  const items = stage.querySelectorAll('.cine-index-item');
  const photos = stage.querySelectorAll('.cine-index-photo');
  if (!items.length || !photos.length) return;
  const activate = (slide) => {
    items.forEach(i => i.classList.toggle('is-active', i.dataset.slide === slide));
    photos.forEach(p => p.classList.toggle('is-active', p.dataset.slide === slide));
  };
  items.forEach(item => {
    item.addEventListener('mouseenter', () => activate(item.dataset.slide));
    item.addEventListener('focus', () => activate(item.dataset.slide));
  });
})();

/* ============ Who We Serve — Network hover switcher ============ */
(function initWwsNetwork(){
  const stage = document.getElementById('wwsNetwork');
  if (!stage) return;
  const nodes = stage.querySelectorAll('.wn-node');
  const lines = stage.querySelectorAll('.wn-line');
  const panes = stage.querySelectorAll('.wn-pane');
  if (!nodes.length) return;
  const activate = (key) => {
    nodes.forEach(n => n.classList.toggle('is-active', n.dataset.node === key));
    lines.forEach(l => l.classList.toggle('is-active', l.dataset.node === key));
    panes.forEach(p => p.classList.toggle('is-active', p.dataset.pane === key));
  };
  nodes.forEach(n => {
    n.addEventListener('mouseenter', () => activate(n.dataset.node));
    n.addEventListener('focus', () => activate(n.dataset.node));
  });
})();

/* ============ Collection Cat Index — hover photo switcher ============ */
(function initCatIndex(){
  const stage = document.querySelector('.collection-cat-index .cat-index-stage');
  if (!stage) return;
  const items = stage.querySelectorAll('.cat-index-item');
  const photos = stage.querySelectorAll('.cat-index-photo');
  if (!items.length || !photos.length) return;
  const activate = (key) => {
    items.forEach(i => i.classList.toggle('is-active', i.dataset.cat === key));
    photos.forEach(p => p.classList.toggle('is-active', p.dataset.cat === key));
  };
  items.forEach(item => {
    item.addEventListener('mouseenter', () => activate(item.dataset.cat));
    item.addEventListener('focus', () => activate(item.dataset.cat));
  });
})();

/* ============ Sound Fabric — number underline IO trigger ============ */
(function initSfNums(){
  const nums = document.querySelectorAll('.sf-num');
  if (!nums.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.6, root: document.querySelector('.scroll') });
  nums.forEach(n => io.observe(n));
})();
