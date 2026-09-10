// ================================================================
// NAVIGATION
// ================================================================

const hamburger = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');

function toggleMenu() {
    const isOpen = navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    navOverlay.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMenu() {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
    navOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

// Toggle menu on hamburger click
hamburger.addEventListener('click', toggleMenu);

// Handle nav link click: close menu + smooth scroll to section
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();

            closeMenu();

            setTimeout(() => {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const navHeight = document.querySelector('.main-header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 350);
        } else {
            closeMenu();
        }
    });
});

// Close menu on overlay click
navOverlay.addEventListener('click', closeMenu);

// Close menu on Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
    }
});

// Close menu on window resize (if screen becomes desktop)
window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        closeMenu();
    }
});

// ================================================================
// SMART-BEN MODAL FUNCTIONS
// ================================================================

function openModal() {
    document.getElementById('screenshotModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('screenshotModal').classList.remove('active');
    document.body.style.overflow = '';
}

document.getElementById('screenshotModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeModal();
    }
});

// ================================================================
// SMART-BEN FULL-SCREEN FUNCTIONS
// ================================================================

const screenshotList = [
    { src: 'images/smartben-login.png', caption: 'Login Page' },
    { src: 'images/smartben-register.png', caption: 'Registration' },
    { src: 'images/smartben-residents.png', caption: 'Residents List' },
    { src: 'images/smartben-dashboard.png', caption: 'Dashboard' },
    { src: 'images/smartben-programs.png', caption: 'Aid Programs' },
    { src: 'images/smartben-history.png', caption: 'History' }
];

let currentIndex = 0;

function openFullScreen(imageSrc, caption) {
    currentIndex = screenshotList.findIndex(item => item.src === imageSrc);
    if (currentIndex === -1) currentIndex = 0;

    const overlay = document.getElementById('fullScreenOverlay');
    const img = document.getElementById('fullScreenImage');
    const captionEl = document.getElementById('fullScreenCaption');

    img.src = imageSrc;
    captionEl.textContent = caption;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset zoom + pan when opening a new image
    currentZoom = 1;
    panX = 0;
    panY = 0;
    img.classList.remove('zoomed');
    img.style.transform = 'scale(1)';
}

function closeFullScreen() {
    document.getElementById('fullScreenOverlay').classList.remove('active');
    resetZoom();

    // Only unlock body scroll if the Smart-Ben modal is NOT still open
    const modal = document.getElementById('screenshotModal');
    if (!modal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

function navigateFullScreen(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = screenshotList.length - 1;
    if (currentIndex >= screenshotList.length) currentIndex = 0;

    const img = document.getElementById('fullScreenImage');
    const captionEl = document.getElementById('fullScreenCaption');
    const item = screenshotList[currentIndex];

    img.style.opacity = '0';
    setTimeout(() => {
        img.src = item.src;
        captionEl.textContent = item.caption;
        img.style.opacity = '1';
    }, 150);
    resetZoom();
}

function prevImage(e) {
    if (e) e.stopPropagation();
    navigateFullScreen(-1);
}

function nextImage(e) {
    if (e) e.stopPropagation();
    navigateFullScreen(1);
}

// Keyboard navigation for full-screen
document.addEventListener('keydown', function (e) {
    const overlay = document.getElementById('fullScreenOverlay');
    if (overlay.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            navigateFullScreen(-1);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            navigateFullScreen(1);
            e.preventDefault();
        }
    }
});

// Close full-screen when clicking outside
document.getElementById('fullScreenOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closeFullScreen();
    }
});

document.getElementById('fullScreenImage').addEventListener('click', function (e) {
    e.stopPropagation();
});

// Close modals with Escape key
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeModal();
        closeFullScreen();
        closeGameModal();
        closeGameFullScreen();
    }
});

// ================================================================
// SWIPE SUPPORT FOR SMART-BEN FULL-SCREEN
// ================================================================

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

document.getElementById('fullScreenOverlay').addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.getElementById('fullScreenOverlay').addEventListener('touchmove', function (e) {
    // Only prevent default when not zoomed (allows pan when zoomed)
    if (currentZoom <= 1) {
        e.preventDefault();
    }
}, { passive: false });

document.getElementById('fullScreenOverlay').addEventListener('touchend', function (e) {
    // Only handle swipe navigation when NOT zoomed in
    if (currentZoom > 1) return;

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
            navigateFullScreen(1);
        } else {
            navigateFullScreen(-1);
        }
    }
}

// Double tap to toggle zoom (instead of closing)
let lastTap = 0;

document.getElementById('fullScreenImage').addEventListener('touchend', function (e) {
    e.stopPropagation();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
        if (currentZoom === 1) {
            zoomIn();
        } else {
            resetZoom();
        }
    }
    lastTap = currentTime;
});

// ================================================================
// GAME MODAL FUNCTIONS
// ================================================================

function openGameModal() {
    document.getElementById('gameModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeGameModal() {
    document.getElementById('gameModal').classList.remove('active');
    document.body.style.overflow = '';
    closeGameFullScreen();
}

document.getElementById('gameModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closeGameModal();
    }
});

// ================================================================
// GAME FULL-SCREEN FUNCTIONS
// ================================================================

const gameScreenshotList = [
    { src: 'images/guessing-game-code.png', caption: 'Java Source Code' },
    { src: 'images/guessing-game-output.png', caption: 'Console Output' }
];

let currentGameIndex = 0;

function openGameFullScreen(imageSrc, caption) {
    currentGameIndex = gameScreenshotList.findIndex(item => item.src === imageSrc);
    if (currentGameIndex === -1) currentGameIndex = 0;

    const overlay = document.getElementById('gameFullScreenOverlay');
    const img = document.getElementById('gameFullScreenImage');
    const captionEl = document.getElementById('gameFullScreenCaption');

    img.src = imageSrc;
    captionEl.textContent = caption;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Reset zoom + pan when opening a new image
    currentZoom = 1;
    panX = 0;
    panY = 0;
    img.classList.remove('zoomed');
    img.style.transform = 'scale(1)';
}

function closeGameFullScreen() {
    document.getElementById('gameFullScreenOverlay').classList.remove('active');
    resetZoom();

    // Only unlock body scroll if the Game modal is NOT still open
    const modal = document.getElementById('gameModal');
    if (!modal.classList.contains('active')) {
        document.body.style.overflow = '';
    }
}

function navigateGameFullScreen(direction) {
    currentGameIndex += direction;
    if (currentGameIndex < 0) currentGameIndex = gameScreenshotList.length - 1;
    if (currentGameIndex >= gameScreenshotList.length) currentGameIndex = 0;

    const img = document.getElementById('gameFullScreenImage');
    const captionEl = document.getElementById('gameFullScreenCaption');
    const item = gameScreenshotList[currentGameIndex];

    img.style.opacity = '0';
    setTimeout(() => {
        img.src = item.src;
        captionEl.textContent = item.caption;
        img.style.opacity = '1';
    }, 150);
    resetZoom();
}

function prevGameImage(e) {
    if (e) e.stopPropagation();
    navigateGameFullScreen(-1);
}

function nextGameImage(e) {
    if (e) e.stopPropagation();
    navigateGameFullScreen(1);
}

// Keyboard navigation for game full-screen
document.addEventListener('keydown', function (e) {
    const overlay = document.getElementById('gameFullScreenOverlay');
    if (overlay.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
            navigateGameFullScreen(-1);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            navigateGameFullScreen(1);
            e.preventDefault();
        }
    }
});

document.getElementById('gameFullScreenOverlay').addEventListener('click', function (e) {
    if (e.target === this) {
        closeGameFullScreen();
    }
});

document.getElementById('gameFullScreenImage').addEventListener('click', function (e) {
    e.stopPropagation();
});

// ================================================================
// SWIPE SUPPORT FOR GAME FULL-SCREEN
// ================================================================

let gameTouchStartX = 0;
let gameTouchEndX = 0;
let gameTouchStartY = 0;
let gameTouchEndY = 0;

document.getElementById('gameFullScreenOverlay').addEventListener('touchstart', function (e) {
    gameTouchStartX = e.changedTouches[0].screenX;
    gameTouchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.getElementById('gameFullScreenOverlay').addEventListener('touchmove', function (e) {
    // Only prevent default when not zoomed (allows pan when zoomed)
    if (currentZoom <= 1) {
        e.preventDefault();
    }
}, { passive: false });

document.getElementById('gameFullScreenOverlay').addEventListener('touchend', function (e) {
    // Only handle swipe navigation when NOT zoomed in
    if (currentZoom > 1) return;

    gameTouchEndX = e.changedTouches[0].screenX;
    gameTouchEndY = e.changedTouches[0].screenY;
    handleGameSwipe();
}, { passive: true });

function handleGameSwipe() {
    const swipeThreshold = 50;
    const diffX = gameTouchStartX - gameTouchEndX;
    const diffY = gameTouchStartY - gameTouchEndY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
            navigateGameFullScreen(1);
        } else {
            navigateGameFullScreen(-1);
        }
    }
}

// Double tap to toggle zoom (instead of closing)
let gameLastTap = 0;

document.getElementById('gameFullScreenImage').addEventListener('touchend', function (e) {
    e.stopPropagation();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - gameLastTap;
    if (tapLength < 300 && tapLength > 0) {
        if (currentZoom === 1) {
            zoomIn();
        } else {
            resetZoom();
        }
    }
    gameLastTap = currentTime;
});

// ================================================================
// ZOOM + PAN FUNCTIONALITY
// ================================================================

let currentZoom = 1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.2;

// Pan state
let panX = 0;
let panY = 0;

function getActiveImage() {
    const overlay = document.getElementById('fullScreenOverlay');
    if (overlay.classList.contains('active')) {
        return document.getElementById('fullScreenImage');
    }
    const gameOverlay = document.getElementById('gameFullScreenOverlay');
    if (gameOverlay.classList.contains('active')) {
        return document.getElementById('gameFullScreenImage');
    }
    return null;
}

function applyTransform(img) {
    if (!img) return;
    img.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
    img.style.transformOrigin = 'center center';

    // Toggle .zoomed class for cursor style
    if (currentZoom > 1) {
        img.classList.add('zoomed');
    } else {
        img.classList.remove('zoomed');
    }
}

function zoomIn() {
    const img = getActiveImage();
    if (!img) return;
    currentZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
    applyTransform(img);
}

function zoomOut() {
    const img = getActiveImage();
    if (!img) return;
    currentZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
    // Reset pan when zooming back to 1
    if (currentZoom <= 1) {
        panX = 0;
        panY = 0;
    }
    applyTransform(img);
}

function resetZoom() {
    const img = getActiveImage();
    if (!img) return;
    currentZoom = 1;
    panX = 0;
    panY = 0;
    img.style.transition = 'transform 0.3s ease';
    applyTransform(img);
    setTimeout(() => {
        img.style.transition = '';
    }, 300);
}

// Handle double-click to toggle zoom
document.addEventListener('dblclick', function (e) {
    const overlay = document.getElementById('fullScreenOverlay');
    const gameOverlay = document.getElementById('gameFullScreenOverlay');
    if (overlay && overlay.classList.contains('active')) {
        if (currentZoom === 1) {
            zoomIn();
        } else {
            resetZoom();
        }
    }
    if (gameOverlay && gameOverlay.classList.contains('active')) {
        if (currentZoom === 1) {
            zoomIn();
        } else {
            resetZoom();
        }
    }
});

// ================================================================
// PINCH-TO-ZOOM + PAN SUPPORT (Touch events)
// ================================================================

let lastTouchDistance = 0;
let lastTouchMidX = 0;
let lastTouchMidY = 0;
let isPanning = false;

function setupPinchZoom(overlayId, imgId) {
    const overlay = document.getElementById(overlayId);
    const img = document.getElementById(imgId);
    if (!overlay || !img) return;

    overlay.addEventListener('touchstart', function (e) {
        // Two-finger pinch
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            lastTouchDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            lastTouchMidX = (touch1.clientX + touch2.clientX) / 2;
            lastTouchMidY = (touch1.clientY + touch2.clientY) / 2;
            isPanning = false;
        }
        // One-finger pan (only when zoomed in)
        else if (e.touches.length === 1 && currentZoom > 1 && e.target === img) {
            isPanning = true;
            lastTouchMidX = e.touches[0].clientX;
            lastTouchMidY = e.touches[0].clientY;
        }
    }, { passive: true });

    overlay.addEventListener('touchmove', function (e) {
        // Two-finger pinch
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            const currentMidX = (touch1.clientX + touch2.clientX) / 2;
            const currentMidY = (touch1.clientY + touch2.clientY) / 2;

            // Handle zoom
            if (lastTouchDistance > 0) {
                const delta = currentDistance - lastTouchDistance;
                const scaleFactor = 1 + delta / 300;
                const newZoom = Math.min(Math.max(currentZoom * scaleFactor, ZOOM_MIN), ZOOM_MAX);
                currentZoom = newZoom;
            }

            // Handle pan with two fingers
            panX += currentMidX - lastTouchMidX;
            panY += currentMidY - lastTouchMidY;

            // Reset pan if back to 1x zoom
            if (currentZoom <= 1) {
                panX = 0;
                panY = 0;
            }

            applyTransform(img);
            lastTouchDistance = currentDistance;
            lastTouchMidX = currentMidX;
            lastTouchMidY = currentMidY;
        }
        // One-finger pan (only when zoomed in)
        else if (e.touches.length === 1 && isPanning && currentZoom > 1) {
            e.preventDefault();
            const touch = e.touches[0];
            panX += touch.clientX - lastTouchMidX;
            panY += touch.clientY - lastTouchMidY;
            lastTouchMidX = touch.clientX;
            lastTouchMidY = touch.clientY;
            applyTransform(img);
        }
    }, { passive: false });

    overlay.addEventListener('touchend', function (e) {
        lastTouchDistance = 0;
        if (e.touches.length === 0) {
            isPanning = false;
        }
    }, { passive: true });
}

// Setup pinch zoom + pan for both overlays
setupPinchZoom('fullScreenOverlay', 'fullScreenImage');
setupPinchZoom('gameFullScreenOverlay', 'gameFullScreenImage');

// ================================================================
// PRELOAD IMAGES FOR SMOOTHER EXPERIENCE
// ================================================================

function preloadImages() {
    const allImages = [
        ...screenshotList.map(item => item.src),
        ...gameScreenshotList.map(item => item.src)
    ];

    allImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

window.addEventListener('load', preloadImages);
