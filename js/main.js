/* ===================================================================
 * Luther 1.0.0 - Main JS
 *
 * ------------------------------------------------------------------- */

(function (html) {

    "use strict";

    html.className = html.className.replace(/\bno-js\b/g, '') + ' js ';



    /* Animations
     * -------------------------------------------------- */
    const tl = anime.timeline({
        easing: 'easeInOutCubic',
        duration: 800,
        autoplay: false
    })
        .add({
            targets: '#loader',
            opacity: 0,
            duration: 1000,
            begin: function (anim) {
                window.scrollTo(0, 0);
            }
        })
        .add({
            targets: '#preloader',
            opacity: 0,
            complete: function (anim) {
                document.querySelector("#preloader").style.visibility = "hidden";
                document.querySelector("#preloader").style.display = "none";
            }
        })
        .add({
            targets: '.s-header',
            translateY: [-100, 0],
            opacity: [0, 1]
        }, '-=200')
        .add({
            targets: ['.s-intro .text-pretitle', '.s-intro .text-huge-title'],
            translateX: [100, 0],
            opacity: [0, 1],
            delay: anime.stagger(400)
        })
        .add({
            targets: '.circles span',
            keyframes: [
                { opacity: [0, .3] },
                { opacity: [.3, .1], delay: anime.stagger(100, { direction: 'reverse' }) }
            ],
            delay: anime.stagger(100, { direction: 'reverse' })
        })
        .add({
            targets: '.intro-social li',
            translateX: [-50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, { direction: 'reverse' })
        })
        .add({
            targets: '.intro-scrolldown',
            translateY: [100, 0],
            opacity: [0, 1]
        }, '-=800');



    /* Preloader
     * -------------------------------------------------- */
    const ssPreloader = function () {

        const preloader = document.querySelector('#preloader');
        if (!preloader) return;

        window.addEventListener('load', function () {
            document.querySelector('html').classList.remove('ss-preload');
            document.querySelector('html').classList.add('ss-loaded');

            document.querySelectorAll('.ss-animated').forEach(function (item) {
                item.classList.remove('ss-animated');
            });

            tl.play();
        });

        // force page scroll position to top at page refresh
        // window.addEventListener('beforeunload' , function () {
        //     // window.scrollTo(0, 0);
        // });

    }; // end ssPreloader


    /* Mobile Menu
     * ---------------------------------------------------- */
    const ssMobileMenu = function () {

        const toggleButton = document.querySelector('.mobile-menu-toggle');
        const mainNavWrap = document.querySelector('.main-nav-wrap');
        const siteBody = document.querySelector("body");

        if (!(toggleButton && mainNavWrap)) return;

        toggleButton.addEventListener('click', function (event) {
            event.preventDefault();
            toggleButton.classList.toggle('is-clicked');
            siteBody.classList.toggle('menu-is-open');
        });

        mainNavWrap.querySelectorAll('.main-nav a').forEach(function (link) {
            link.addEventListener("click", function (event) {

                // at 800px and below
                if (window.matchMedia('(max-width: 800px)').matches) {
                    toggleButton.classList.toggle('is-clicked');
                    siteBody.classList.toggle('menu-is-open');
                }
            });
        });

        window.addEventListener('resize', function () {

            // above 800px
            if (window.matchMedia('(min-width: 801px)').matches) {
                if (siteBody.classList.contains('menu-is-open')) siteBody.classList.remove('menu-is-open');
                if (toggleButton.classList.contains("is-clicked")) toggleButton.classList.remove("is-clicked");
            }
        });

    }; // end ssMobileMenu


    /* Highlight active menu link on pagescroll
     * ------------------------------------------------------ */
    const ssScrollSpy = function () {

        const sections = document.querySelectorAll(".target-section");

        // Add an event listener listening for scroll
        window.addEventListener("scroll", navHighlight);

        function navHighlight() {

            // Get current scroll position
            let scrollY = window.pageYOffset;

            // Loop through sections to get height(including padding and border), 
            // top and ID values for each
            sections.forEach(function (current) {
                const sectionHeight = current.offsetHeight;
                const sectionTop = current.offsetTop - 50;
                const sectionId = current.getAttribute("id");

                /* If our current scroll position enters the space where current section 
                 * on screen is, add .current class to parent element(li) of the thecorresponding 
                 * navigation link, else remove it. To know which link is active, we use 
                 * sectionId variable we are getting while looping through sections as 
                 * an selector
                 */
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    document.querySelector(".main-nav a[href*=" + sectionId + "]").parentNode.classList.add("current");
                } else {
                    document.querySelector(".main-nav a[href*=" + sectionId + "]").parentNode.classList.remove("current");
                }
            });
        }

    }; // end ssScrollSpy


    /* Animate elements if in viewport
     * ------------------------------------------------------ */
    const ssViewAnimate = function () {

        const blocks = document.querySelectorAll("[data-animate-block]");

        window.addEventListener("scroll", viewportAnimation);

        function viewportAnimation() {

            let scrollY = window.pageYOffset;

            blocks.forEach(function (current) {

                const viewportHeight = window.innerHeight;
                const triggerTop = (current.offsetTop + (viewportHeight * .2)) - viewportHeight;
                const blockHeight = current.offsetHeight;
                const blockSpace = triggerTop + blockHeight;
                const inView = scrollY > triggerTop && scrollY <= blockSpace;
                const isAnimated = current.classList.contains("ss-animated");

                if (inView && (!isAnimated)) {
                    anime({
                        targets: current.querySelectorAll("[data-animate-el]"),
                        opacity: [0, 1],
                        translateY: [100, 0],
                        delay: anime.stagger(400, { start: 200 }),
                        duration: 800,
                        easing: 'easeInOutCubic',
                        begin: function (anim) {
                            current.classList.add("ss-animated");
                        }
                    });
                }
            });
        }

    }; // end ssViewAnimate


    /* Swiper
     * ------------------------------------------------------ */
    const ssSwiper = function () {

        const mySwiper = new Swiper('.swiper-container', {

            slidesPerView: 1,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                // when window width is > 400px
                401: {
                    slidesPerView: 1,
                    spaceBetween: 20
                },
                // when window width is > 800px
                801: {
                    slidesPerView: 2,
                    spaceBetween: 32
                },
                // when window width is > 1200px
                1201: {
                    slidesPerView: 2,
                    spaceBetween: 80
                }
            }
        });

    }; // end ssSwiper


    /* Lightbox
     * ------------------------------------------------------ */
    const ssLightbox = function () {

        const folioLinks = document.querySelectorAll('.folio-list__item-link');
        const modals = [];

        folioLinks.forEach(function (link) {
            let modalbox = link.getAttribute('href');
            let instance = basicLightbox.create(
                document.querySelector(modalbox),
                {
                    onShow: function (instance) {
                        //detect Escape key press
                        document.addEventListener("keydown", function (event) {
                            event = event || window.event;
                            if (event.keyCode === 27) {
                                instance.close();
                            }
                        });
                    }
                }
            )
            modals.push(instance);
        });

        folioLinks.forEach(function (link, index) {
            link.addEventListener("click", function (event) {
                event.preventDefault();
                modals[index].show();
            });
        });

    };  // end ssLightbox


    /* Alert boxes
     * ------------------------------------------------------ */
    const ssAlertBoxes = function () {

        const boxes = document.querySelectorAll('.alert-box');

        boxes.forEach(function (box) {

            box.addEventListener('click', function (event) {
                if (event.target.matches(".alert-box__close")) {
                    event.stopPropagation();
                    event.target.parentElement.classList.add("hideit");

                    setTimeout(function () {
                        box.style.display = "none";
                    }, 500)
                }
            });

        })

    }; // end ssAlertBoxes


    /* Smoothscroll
     * ------------------------------------------------------ */
    const ssMoveTo = function () {

        const easeFunctions = {
            easeInQuad: function (t, b, c, d) {
                t /= d;
                return c * t * t + b;
            },
            easeOutQuad: function (t, b, c, d) {
                t /= d;
                return -c * t * (t - 2) + b;
            },
            easeInOutQuad: function (t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t * t + b;
                t -= 2;
                return c / 2 * (t * t * t + 2) + b;
            }
        }

        const triggers = document.querySelectorAll('.smoothscroll');

        const moveTo = new MoveTo({
            tolerance: 0,
            duration: 1200,
            easing: 'easeInOutCubic',
            container: window
        }, easeFunctions);

        triggers.forEach(function (trigger) {
            moveTo.registerTrigger(trigger);
        });

    }; // end ssMoveTo


    /* Initialize
     * ------------------------------------------------------ */
    (function ssInit() {

        ssPreloader();
        ssMobileMenu();
        ssScrollSpy();
        ssViewAnimate();
        ssSwiper();
        ssLightbox();
        ssAlertBoxes();
        ssMoveTo();

    })();

    document.addEventListener("DOMContentLoaded", () => {
        // Render Intro Section
        const intro = siteData.intro;
        document.getElementById("intro-content").innerHTML = `
            <div class="row intro-content wide">
                <div class="column">
                    <div class="text-pretitle with-line">${intro.pretitle}</div>
                    <h1 class="text-huge-title">${intro.title}</h1>
                </div>
                <ul class="intro-social">
                    ${intro.socialLinks.map(link => `<li><a href="#0">${link}</a></li>`).join("")}
                </ul>
            </div>
        `;

        // Render About Section
        const about = siteData.about;
        document.getElementById("about-info").innerHTML = `
            <div class="row about-info wide">
                <div class="column lg-6 md-12 about-info__pic-block">
                    <img src="${about.info.image.src}" srcset="${about.info.image.srcset}" alt="" class="about-info__pic">
                </div>
                <div class="column lg-6 md-12">
                    <div class="about-info__text">
                        <h2 class="text-pretitle with-line">${about.info.pretitle}</h2>
                        <p class="attention-getter">${about.info.text}</p>
                        <a href="#0" class="btn btn--medium u-fullwidth">${about.info.button}</a>
                    </div>
                </div>
            </div>
        `;
        document.getElementById("about-expertise").innerHTML = `
            <div class="row about-expertise">
                <div class="column lg-12">
                    <h2 class="text-pretitle">Expertise</h2>
                    <ul class="skills-list h1">
                        ${about.expertise.map(skill => `<li>${skill}</li>`).join("")}
                    </ul>
                </div>
            </div>
        `;
        document.getElementById("about-timelines").innerHTML = `
            <div class="row about-timelines">
                <div class="column lg-6 tab-12">
                    <h2 class="text-pretitle">Experience</h2>
                    <div class="timeline">
                        ${about.timelines.experience.map(exp => `
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">${exp.title}</h4>
                                    <h5 class="timeline__meta">${exp.role}</h5>
                                    <p class="timeline__timeframe">${exp.timeframe}</p>
                                </div>
                                <div class="timeline__desc">
                                    <p>${exp.description}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
                <div class="column lg-6 tab-12">
                    <h2 class="text-pretitle">Education</h2>
                    <div class="timeline">
                        ${about.timelines.education.map(edu => `
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">${edu.title}</h4>
                                    <h5 class="timeline__meta">${edu.degree}</h5>
                                    <p class="timeline__timeframe">${edu.timeframe}</p>
                                </div>
                                <div class="timeline__desc">
                                    <p>${edu.description}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
        `;

        // Render Works Section
        const works = siteData.works;
        document.getElementById("works-portfolio").innerHTML = `
            <div class="row works-portfolio">
                ${works.map((work, index) => `
                    <div class="column lg-12">
                        <a class="works-head" target="_blank" rel="noopener noreferrer" href="${work.modal.link}">
                            <img class="works-head-img" src="${work.image}" alt="${work.title}">
                            <div>
                                <h3>${work.title}</h3>
                                <p>${work.modal.description}</p>
                            </div>
                        </a>
                        <div class="swiper work-swiper-${index}">
                            <div class="swiper-wrapper">
                                ${work.swiperImages.map(image => `
                                    <div class="swiper-slide">
                                        <img src="${image}" alt="${work.title}">
                                    </div>
                                `).join("")}
                            </div>
                            <div class="swiper-button-next"></div>
                            <div class="swiper-button-prev"></div>
                            <div class="swiper-pagination"></div>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        // Initialize Swipers for Works
        works.forEach((_, index) => {
            new Swiper(`.work-swiper-${index}`, {
                loop: true,
                autoplay: {
                    delay: 10000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: `.work-swiper-${index} .swiper-pagination`,
                    clickable: true,
                },
                navigation: {
                    nextEl: `.work-swiper-${index} .swiper-button-next`,
                    prevEl: `.work-swiper-${index} .swiper-button-prev`,
                },
            });
        });

        // Render Contact Section
        const contact = siteData.contact;
        document.getElementById("contact-top").innerHTML = `
            <div class="row contact-top">
                <div class="column lg-12">
                    <h2 class="text-pretitle">${contact.top.pretitle}</h2>
                    <p class="h1">${contact.top.text}</p>
                </div>
            </div>
        `;
        document.getElementById("contact-bottom").innerHTML = `
            <div class="row contact-bottom">
                <div class="column lg-3 md-5 tab-6 stack-on-550 contact-block">
                    <h3 class="text-pretitle">Reach me at</h3>
                    <p class="contact-links">
                        <a href="mailto:${contact.bottom.reachMe.email}" class="mailtoui">${contact.bottom.reachMe.email}</a><br>
                        <a href="tel:${contact.bottom.reachMe.phone}">${contact.bottom.reachMe.phone}</a>
                    </p>
                </div>
                <div class="column lg-4 md-5 tab-6 stack-on-550 contact-block">
                    <h3 class="text-pretitle">Social</h3>
                    <ul class="contact-social">
                        ${contact.bottom.social.map(social => `<li><a href="#0">${social}</a></li>`).join("")}
                    </ul>
                </div>
            </div>
        `;

        // Render Footer
        const footer = siteData.footer;
        document.getElementById("footer-content").innerHTML = `
            <div class="row">
                <div class="column ss-copyright">
                    <span>${footer.copyright}</span>
                    <span>Design by <a href="https://www.styleshout.com/">${footer.designBy}</a> Distribution By <a href="https://themewagon.com">${footer.distributionBy}</a></span>
                </div>
            </div>
        `;

        // Render Main Swiper Slider
        const slidingImages = siteData.slidingImages;
        const swiperContainer = document.querySelector(".mySwiper .swiper-wrapper");
        swiperContainer.innerHTML = slidingImages.map(slide => `
            <div class="swiper-slide">
                <img src="${slide.image}" alt="Slide Image">
                <p>${slide.description}</p>
            </div>
        `).join("");

        new Swiper(".mySwiper", {
            loop: true,
            autoplay: {
                delay: 10000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".mySwiper .swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".mySwiper .swiper-button-next",
                prevEl: ".mySwiper .swiper-button-prev",
            },
        });
    });

})(document.documentElement);