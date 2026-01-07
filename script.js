// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('nav ul');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
});

// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const modeLabel = document.querySelector('.mode-label');
    const modeIcon = document.querySelector('#dark-mode-toggle i');
    
    if (!darkModeToggle) return;
    
    const isDarkModeStored = localStorage.getItem('darkMode') === 'true';

    if (isDarkModeStored) {
        document.body.classList.add('dark-mode');
        modeIcon.className = 'fas fa-sun';
        modeLabel.textContent = 'Light';
    } else {
        modeIcon.className = 'fas fa-moon';
        modeLabel.textContent = 'Dark';
    }

    darkModeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        if (isDarkMode) {
            modeIcon.className = 'fas fa-sun';
            modeLabel.textContent = 'Light';
        } else {
            modeIcon.className = 'fas fa-moon';
            modeLabel.textContent = 'Dark';
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animation to sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeIn 0.6s ease-in-out forwards';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Define fade-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Gallery carousel (large viewer with thumbnails)
document.addEventListener('DOMContentLoaded', function() {
    const thumbsContainer = document.getElementById('gallery-thumbs');
    const videoEl = document.getElementById('gallery-video');
    const imageEl = document.getElementById('gallery-image');
    const titleEl = document.getElementById('gallery-title');
    const descEl = document.getElementById('gallery-desc');
    const prevBtn = document.querySelector('.gallery-nav.prev');
    const nextBtn = document.querySelector('.gallery-nav.next');

    if (!thumbsContainer || !videoEl || !imageEl) return;

    const items = Array.from(thumbsContainer.querySelectorAll('.gallery-thumb')).map((btn, index) => {
        btn.dataset.index = index;
        return {
            button: btn,
            type: btn.dataset.type,
            src: btn.dataset.src,
            title: btn.dataset.title || '',
            desc: btn.dataset.desc || ''
        };
    });

    let currentIndex = 0;

    function render(index) {
        if (!items.length) return;
        currentIndex = (index + items.length) % items.length;
        const item = items[currentIndex];

        // Reset media elements
        videoEl.pause();
        videoEl.removeAttribute('src');
        imageEl.removeAttribute('src');
        videoEl.style.display = 'none';
        imageEl.style.display = 'none';

        if (item.type === 'video') {
            videoEl.src = item.src;
            videoEl.style.display = 'block';
            videoEl.load();
        } else {
            imageEl.src = item.src;
            imageEl.alt = item.title;
            imageEl.style.display = 'block';
        }

        titleEl.textContent = item.title;
        descEl.textContent = item.desc;

        items.forEach((entry, i) => {
            if (i === currentIndex) {
                entry.button.classList.add('active');
            } else {
                entry.button.classList.remove('active');
            }
        });

        // Ensure active thumbnail is visible and centered in the rail
        const activeBtn = items[currentIndex].button;
        if (activeBtn && typeof activeBtn.scrollIntoView === 'function') {
            activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }

    function handleThumbClick(e) {
        const btn = e.currentTarget;
        const idx = Number(btn.dataset.index);
        render(idx);
    }

    items.forEach(item => {
        item.button.addEventListener('click', handleThumbClick);
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => render(currentIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => render(currentIndex + 1));
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            render(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
            render(currentIndex + 1);
        }
    });

    // Inject paused <video> elements as unique thumbnails (avoids canvas/CORS issues)
    (function injectVideoThumbnails() {
        const videoItems = items.filter(it => it.type === 'video');
        if (!videoItems.length) return;

        videoItems.forEach(it => {
            const btn = it.button;
            // If already processed, skip
            if (btn.querySelector('video.thumb-video')) return;

            const thumbVideo = document.createElement('video');
            thumbVideo.className = 'thumb-video';
            thumbVideo.src = it.src;
            thumbVideo.muted = true;
            thumbVideo.preload = 'metadata';
            thumbVideo.playsInline = true;
            thumbVideo.setAttribute('playsinline', '');
            thumbVideo.controls = false;
            thumbVideo.setAttribute('aria-hidden', 'true');

            const imgEl = btn.querySelector('img');

            const onLoadedMeta = () => {
                const dur = Number.isFinite(thumbVideo.duration) && thumbVideo.duration > 0 ? thumbVideo.duration : 5;
                const targetTime = Math.min(15, dur);
                // Some browsers require a tiny play/pause to enable seeking preview frames
                const seek = () => {
                    try {
                        thumbVideo.currentTime = targetTime;
                    } catch (_e) {
                        // Ignore seek errors
                    }
                };
                // Attempt seek after a rAF to ensure readiness
                requestAnimationFrame(seek);
            };

            const onSeeked = () => {
                // Pause to keep frame visible
                try { thumbVideo.pause(); } catch (_e) {}
                // Hide the fallback image once we have a frame
                if (imgEl) imgEl.style.display = 'none';
            };

            thumbVideo.addEventListener('loadedmetadata', onLoadedMeta, { once: true });
            thumbVideo.addEventListener('seeked', onSeeked);

            // Insert video into the button (before img so it can overlay if needed)
            if (imgEl && imgEl.parentNode === btn) {
                btn.insertBefore(thumbVideo, imgEl);
            } else {
                btn.appendChild(thumbVideo);
            }

            // As fallback, if nothing happens within a few seconds, keep image
            setTimeout(() => {
                if (thumbVideo.readyState < 2 && imgEl) {
                    // Could not load metadata—leave image
                    thumbVideo.remove();
                }
            }, 3500);
        });
    })();

    render(0);
});

// Click-to-view modal controller for section images (Model Architecture & Results)
document.addEventListener('DOMContentLoaded', function() {
    function initModalForSection(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const clickableItems = container.querySelectorAll('.clickable');
        if (!clickableItems.length) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = `${containerId}-modal`;
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" aria-label="Close modal"><i class="fas fa-times"></i></button>
                <button class="modal-nav prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
                <button class="modal-nav next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
                <div id="${containerId}-modal-media" style="position: relative; width: 100%; height: 100%;">
                    <img class="modal-media" alt="Modal media" style="display: none;">
                    <video class="modal-media" controls style="display: none;"></video>
                </div>
                <div class="modal-title" id="${containerId}-modal-title"></div>
                <div class="modal-counter" id="${containerId}-modal-counter"></div>
            </div>
        `;
        document.body.appendChild(modal);

        const items = Array.from(clickableItems).map((el, idx) => {
            const isVideo = el.querySelector('video');
            const isImg = el.querySelector('img');
            return {
                type: isVideo ? 'video' : 'image',
                src: isVideo ? isVideo.src : isImg.src,
                title: el.querySelector('figcaption')?.textContent || `Item ${idx + 1}`,
                element: el,
                index: idx
            };
        });

        let currentIdx = 0;

        const imgEl = modal.querySelector('img.modal-media');
        const vidEl = modal.querySelector('video.modal-media');
        const titleEl = modal.querySelector('.modal-title');
        const counterEl = modal.querySelector('.modal-counter');
        const closeBtn = modal.querySelector('.modal-close');
        const prevBtn = modal.querySelector('.modal-nav.prev');
        const nextBtn = modal.querySelector('.modal-nav.next');

        function showItem(idx) {
            const item = items[idx % items.length];
            currentIdx = idx % items.length;

            vidEl.pause();
            imgEl.style.display = 'none';
            vidEl.style.display = 'none';

            if (item.type === 'video') {
                vidEl.src = item.src;
                vidEl.style.display = 'block';
                vidEl.load();
            } else {
                imgEl.src = item.src;
                imgEl.alt = item.title;
                imgEl.style.display = 'block';
            }

            titleEl.textContent = item.title;
            counterEl.textContent = `${currentIdx + 1} / ${items.length}`;
        }

        clickableItems.forEach((el, idx) => {
            el.addEventListener('click', () => {
                showItem(idx);
                modal.classList.add('active');
            });
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            vidEl.pause();
        });

        prevBtn.addEventListener('click', () => showItem(currentIdx - 1));
        nextBtn.addEventListener('click', () => showItem(currentIdx + 1));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                vidEl.pause();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!modal.classList.contains('active')) return;
            if (e.key === 'Escape') {
                modal.classList.remove('active');
                vidEl.pause();
            } else if (e.key === 'ArrowLeft') {
                showItem(currentIdx - 1);
            } else if (e.key === 'ArrowRight') {
                showItem(currentIdx + 1);
            }
        });
    }

    // Initialize modals for new sections
    initModalForSection('model-progression-modal');
    initModalForSection('results-video-modal');
    
    // Init modal for GUI image (single item)
    const guiFigure = document.getElementById('gui-figure-modal');
    if (guiFigure) {
        const guiImg = guiFigure.querySelector('img.clickable');
        if (guiImg) {
            const guiModal = document.createElement('div');
            guiModal.className = 'modal-overlay';
            guiModal.id = 'gui-modal';
            guiModal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close" aria-label="Close modal"><i class="fas fa-times"></i></button>
                    <img class="modal-media" src="assets/GUI.png" alt="Simulation GUI" style="display: block;">
                    <div class="modal-title">Simulation Control Interface</div>
                </div>
            `;
            document.body.appendChild(guiModal);

            guiImg.addEventListener('click', () => {
                guiModal.classList.add('active');
            });

            guiModal.querySelector('.modal-close').addEventListener('click', () => {
                guiModal.classList.remove('active');
            });

            guiModal.addEventListener('click', (e) => {
                if (e.target === guiModal) {
                    guiModal.classList.remove('active');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (!guiModal.classList.contains('active')) return;
                if (e.key === 'Escape') {
                    guiModal.classList.remove('active');
                }
            });
        }
    }
});
