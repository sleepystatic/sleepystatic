const logo = document.getElementById("logo");
const track = document.querySelector('.nxe-track');

let currentIndex = 0;
let dx = 1;
let dy = 1;

// Touch/swipe variables
let startX = 0;
let startY = 0;
let isDragging = false;

// Initial logo position
if (logo) {
    let x = Math.random() * (window.innerWidth - logo.clientWidth);
    let y = Math.random() * (window.innerHeight - logo.clientHeight);

    // Animate the logo
    function moveLogo() {
        x += dx;
        y += dy;

        if (x + logo.clientWidth >= window.innerWidth || x <= 0) dx = -dx;
        if (y + logo.clientHeight >= window.innerHeight || y <= 0) dy = -dy;

        logo.style.left = x + "px";
        logo.style.top = y + "px";

        requestAnimationFrame(moveLogo);
    }
    moveLogo();
}

// Glitch effect for header
const header = document.querySelector('.site-header');

function glitch() {
    if (!header) return;

    header.classList.add('glitch-font');
    setTimeout(() => {
        header.classList.remove('glitch-font');
    }, 200);

    const nextGlitch = Math.random() * 7000 + 2000; //between 2s-5s
    setTimeout(glitch, nextGlitch);
}

if (header) {
    glitch();
}

// Navigation functions
function navigateLeft() {
    const musicSection = document.querySelector('.music-section');

    if (musicSection) {
        const activeCategory = document.querySelector('.category.active');
        if (!activeCategory) return;
        const visibleTiles = activeCategory.querySelectorAll('.tile');
        if (currentIndex > 0) {
            currentIndex--;
            updateTiles();
        }
    } else if (track) {
        const visibleTiles = track.querySelectorAll('.tile');
        if (currentIndex > 0) {
            currentIndex--;
            updateTiles();
        }
    }
}

function navigateRight() {
    const musicSection = document.querySelector('.music-section');

    if (musicSection) {
        const activeCategory = document.querySelector('.category.active');
        if (!activeCategory) return;
        const visibleTiles = activeCategory.querySelectorAll('.tile');
        if (currentIndex < visibleTiles.length - 1) {
            currentIndex++;
            updateTiles();
        }
    } else if (track) {
        const visibleTiles = track.querySelectorAll('.tile');
        if (currentIndex < visibleTiles.length - 1) {
            currentIndex++;
            updateTiles();
        }
    }
}

function attachUnifiedTouchHandling(element) {
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isSwiping = false;

    // Prevent default link behavior on all anchor tags in the container
    const links = element.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('touchend', (e) => {
            // Always prevent default, we'll handle navigation manually
            e.preventDefault();
        }, { passive: false });
    });

    element.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isSwiping = false;
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
        const moveX = Math.abs(e.touches[0].clientX - touchStartX);
        const moveY = Math.abs(e.touches[0].clientY - touchStartY);

        if (moveX > 10 || moveY > 10) {
            isSwiping = true;
        }
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent default behavior

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = touchStartX - endX;
        const deltaY = touchStartY - endY;
        const touchDuration = Date.now() - touchStartTime;

        // Handle swipes
        if (isSwiping && (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50)) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    navigateRight();
                } else {
                    navigateLeft();
                }
            } else {
                // Vertical swipe (music page only)
                if (document.querySelector('.music-section')) {
                    if (deltaY > 0) {
                        navigateDown();
                    } else {
                        navigateUp();
                    }
                }
            }
        }
        // Handle taps
        else if (!isSwiping && touchDuration < 500) {
            const tile = e.target.closest('.tile');
            if (tile) {
                handleMobileTap(tile);
            }
        }
    }, { passive: false });
}

// 3. Add this function to handle mobile taps on tiles:

function handleMobileTap(tile) {
    const musicSection = document.querySelector('.music-section');
    let tiles;

    if (musicSection) {
        const activeCategory = document.querySelector('.category.active');
        if (!activeCategory) return;
        tiles = Array.from(activeCategory.querySelectorAll('.tile'));
    } else {
        if (!track) return;
        tiles = Array.from(track.querySelectorAll('.tile'));
    }

    const tileIndex = tiles.indexOf(tile);
    if (tileIndex === -1) return;

    if (tileIndex !== currentIndex) {
        // Make the tile active but DON'T navigate
        currentIndex = tileIndex;
        updateTiles();
        return false; // Important: prevent any navigation
    } else {
        // Only navigate if clicking already-active tile
        const link = tile.closest('a');
        if (link && link.href && !link.href.endsWith('#')) {
            window.location.href = link.href;
        }
        return false;
    }
}

function attachTouchNavigation(element) {
    if (!element) return;

    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = startX - endX;
        const deltaY = startY - endY;

        // Only handle if there was significant movement (real swipe)
        if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) {
                    navigateRight();
                } else {
                    navigateLeft();
                }
            } else {
                if (document.querySelector('.music-section')) {
                    if (deltaY > 0) {
                        navigateDown();
                    } else {
                        navigateUp();
                    }
                }
            }
        }
    }, { passive: true });
}




function attachClickHandlers() {
    const musicSection = document.querySelector('.music-section');

    if (musicSection) {
        // Music page - attach to all categories
        const allCategories = musicSection.querySelectorAll('.category');
        allCategories.forEach(category => {
            const tiles = category.querySelectorAll('.tile');
            tiles.forEach((tile, index) => {
                const link = tile.closest('a');

                tile.addEventListener('click', (e) => {
                    if (index !== currentIndex) {
                        e.preventDefault();
                        e.stopPropagation();
                        currentIndex = index;
                        updateTiles();
                    }
                });

                if (link) {
                    link.addEventListener('click', (e) => {
                        if (index !== currentIndex) {
                            e.preventDefault();
                            currentIndex = index;
                            updateTiles();
                        }
                    });
                }
            });
        });
    } else {
        // Regular pages - restore original logic
        if (track) {
            const tiles = track.querySelectorAll('.tile');
            tiles.forEach((tile, index) => {
                const link = tile.closest('a');

                tile.addEventListener('click', (e) => {
                    if (index !== currentIndex) {
                        e.preventDefault();
                        e.stopPropagation();
                        currentIndex = index;
                        updateTiles();
                    }
                });

                if (link) {
                    link.addEventListener('click', (e) => {
                        if (index !== currentIndex) {
                            e.preventDefault();
                            currentIndex = index;
                            updateTiles();
                        }
                    });
                }
            });
        }
    }
}

function makeColumnNamesClickable() {
    const columnNames = document.querySelector('.column-names');
    if (!columnNames) return;

    const previousEl = columnNames.querySelector('.previous');
    const nextEl = columnNames.querySelector('.next');

    // Add CSS to make them look clickable
    const style = document.createElement('style');
    style.textContent = `
        .column-name.previous,
        .column-name.next {
            cursor: pointer;
            transition: all 0.3s ease;
            user-select: none;
            -webkit-user-select: none;
            pointer-events: auto !important;
        }
        .column-name.previous:hover,
        .column-name.next:hover {
            color: #66a3ff !important;
            transform: scale(1.1);
        }
        .column-name.previous:active,
        .column-name.next:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    // Add click handlers
    if (previousEl) {
        previousEl.addEventListener('click', (e) => {
            e.preventDefault();
            navigateUp();
        });

        // Also handle touch for mobile
        previousEl.addEventListener('touchend', (e) => {
            e.preventDefault();
            navigateUp();
        });
    }

    if (nextEl) {
        nextEl.addEventListener('click', (e) => {
            e.preventDefault();
            navigateDown();
        });

        // Also handle touch for mobile
        nextEl.addEventListener('touchend', (e) => {
            e.preventDefault();
            navigateDown();
        });
    }
}

// Enhanced progress bar logic with debugging
const uploadForm = document.getElementById('upload-form');

if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
        const progressBarContainer = document.getElementById('progress-bar-container');
        const progressText = document.getElementById('progress-text');
        const fileInput = document.querySelector('input[type="file"]');
        const submitButton = document.querySelector('button[type="submit"]');

        // Disable the submit button
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Processing...';
        }

        // Show progress bar
        if (progressBarContainer) {
            progressBarContainer.style.display = 'block';
        }

        // Set up progress text with corrected completion logic
        if (progressText) {
            progressText.style.display = 'block';

            if (fileInput && fileInput.files[0]) {
                const fileSize = fileInput.files[0].size;
                const fileSizeMB = fileSize / (1024 * 1024);
                const estimatedSeconds = Math.max(10, Math.min(300, fileSizeMB * 2));

                progressText.textContent = `Processing video... estimated ${Math.round(estimatedSeconds)} seconds`;

                // Start countdown with corrected completion message
                let timeLeft = estimatedSeconds;
                const countdown = setInterval(() => {
                    timeLeft--;

                    if (timeLeft > 0) {
                        progressText.textContent = `Processing video... estimated ${timeLeft} seconds remaining`;
                    } else {
                        // FIXED: Show completion message properly
                        progressText.textContent = 'Processing complete!';
                        console.log('Showing completion message');

                        // Hide after showing completion
                        setTimeout(() => {
                            if (progressBarContainer) {
                                progressBarContainer.style.display = 'none';
                            }
                            if (progressText) {
                                progressText.style.display = 'none';
                            }
                            console.log('Progress elements hidden');
                        }, 2000);

                        clearInterval(countdown);
                    }
                }, 1000);
            } else {
                // Fallback for when no file size is detected
                progressText.textContent = 'Processing video...';

                setTimeout(() => {
                    progressText.textContent = 'Processing complete!';
                    setTimeout(() => {
                        progressBarContainer.style.display = 'none';
                        progressText.style.display = 'none';
                    }, 2000);
                }, 30000);
            }
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    // Initialize click handlers for desktop
    attachClickHandlers();

    // Initialize unified touch handling for mobile
    const musicSection = document.querySelector('.music-section');
    if (musicSection) {
        const allCategories = musicSection.querySelectorAll('.category');
        allCategories.forEach(category => {
            attachUnifiedTouchHandling(category);
        });

        // Make column names clickable on music page
        makeColumnNamesClickable();
    } else {
        attachUnifiedTouchHandling(track);
    }

    // Rest of existing initialization
    setTimeout(updateTiles, 100);

    if (track && window.innerWidth > 768) {
        createNavigationHints();
    }

    if (document.querySelector('.music-section')) {
        setTimeout(() => {
            updateRows();
            updateTiles();
            updateColumnNames();
        }, 100);
    }
});




// Create visual navigation hints
function createNavigationHints() {
    if (document.querySelector('.nav-hint')) return; // Don't create duplicates

    const hint = document.createElement('div');
    hint.className = 'nav-hint';
    hint.innerHTML = '← → Arrow keys or click tiles to navigate';
    hint.style.cssText = `
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-family: Impact, sans-serif;
        text-transform: uppercase;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(hint);

    // Show hint briefly
    setTimeout(() => hint.style.opacity = '1', 1000);
    setTimeout(() => hint.style.opacity = '0', 4000);
    setTimeout(() => hint.remove(), 4500);
}
// Add this to your script.js - Vertical navigation for music page

let currentRow = 0;
const totalRows = 3;

// Row navigation functions
function navigateUp() {
    if (currentRow > 0) {
        currentRow--;
        updateRows();
    }
}

function navigateDown() {
    if (currentRow < totalRows - 1) {
        currentRow++;
        updateRows();
    }
}

function updateRows() {
    const musicSection = document.querySelector('.music-section');
    if (!musicSection) return;

    const categories = musicSection.querySelectorAll('.category');

    categories.forEach((category, index) => {
        category.classList.remove('active', 'slide-up');

        if (index === currentRow) {
            category.classList.add('active');
            // CRITICAL: Set z-index to bring active row to front
            category.style.zIndex = '100';
        } else if (index < currentRow) {
            category.classList.add('slide-up');
            // Inactive rows get lower z-index
            category.style.zIndex = '1';
        } else {
            // Categories below also get lower z-index
            category.style.zIndex = '1';
        }
    });

    currentIndex = 0;
    setTimeout(() => updateTiles(), 100);
    updateColumnNames();
}



// CORRECTED: Replace the entire keyboard navigation section
document.addEventListener('keydown', (e) => {
    const musicSection = document.querySelector('.music-section');

    if (musicSection) {
        // We're on music page - handle both horizontal and vertical navigation
        switch(e.key) {
            case 'ArrowRight':
                navigateRight();
                break;
            case 'ArrowLeft':
                navigateLeft();
                break;
            case 'ArrowUp':
                navigateUp();
                break;
            case 'ArrowDown':
                navigateDown();
                break;
        }
    } else {
        // We're on other pages - only handle horizontal navigation
        if (e.key === 'ArrowRight') {
            navigateRight();
        } else if (e.key === 'ArrowLeft') {
            navigateLeft();
        }
    }
});

// Replace your updateTiles function with this simpler working version
function updateTiles() {
    // Check if we're on music page first
    const musicSection = document.querySelector('.music-section');

    if (musicSection) {
        // Music page - work with active category
        const currentTrack = document.querySelector('.category.active');
        const visibleTiles = currentTrack ? currentTrack.querySelectorAll('.tile') : [];

        if (visibleTiles.length === 0) return;

        const basePosition = window.innerWidth * 0.35;

        visibleTiles.forEach((tile, index) => {
            const offsetIndex = index - currentIndex;
            const scale = Math.max(0.6, 1 - Math.abs(offsetIndex) * 0.1);
            const xOffset = offsetIndex * -95;

            if (offsetIndex < 0) {
                tile.style.opacity = 0;
                tile.style.pointerEvents = 'none';
                tile.style.visibility = 'hidden';
            } else {
                tile.style.opacity = 1;
                tile.style.pointerEvents = 'auto';
                tile.style.visibility = 'visible';
            }

            tile.style.transform = `translateX(${xOffset}px) scale(${scale})`;
            tile.style.zIndex = 100 - Math.abs(offsetIndex);
            tile.classList.toggle('active', index === currentIndex);
        });

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            const mobileBasePosition = window.innerWidth / 2 - 150;
            const trackOffset = currentIndex * 210;
            currentTrack.style.transform = `translateX(${mobileBasePosition - trackOffset}px)`;
        } else {
            const trackOffset = currentIndex * 300;
            currentTrack.style.transform = `translateX(${basePosition - trackOffset}px)`;
        }
    } else {
        // Other pages - original logic
        if (!track) return;

        const visibleTiles = track.querySelectorAll('.tile');
        if (visibleTiles.length === 0) return;

        const basePosition = window.innerWidth * 0.35;

        visibleTiles.forEach((tile, index) => {
            const offsetIndex = index - currentIndex;
            const scale = Math.max(0.6, 1 - Math.abs(offsetIndex) * 0.1);
            const xOffset = offsetIndex * -95;

            if (offsetIndex < 0) {
                tile.style.opacity = 0;
                tile.style.pointerEvents = 'none';
                tile.style.visibility = 'hidden';
            } else {
                tile.style.opacity = 1;
                tile.style.pointerEvents = 'auto';
                tile.style.visibility = 'visible';
            }

            tile.style.transform = `translateX(${xOffset}px) scale(${scale})`;
            tile.style.zIndex = 100 - Math.abs(offsetIndex);
            tile.classList.toggle('active', index === currentIndex);
        });

        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            const mobileBasePosition = window.innerWidth / 2 - 150;
            const trackOffset = currentIndex * 210;
            track.style.transform = `translateX(${mobileBasePosition - trackOffset}px)`;
        } else {
            const trackOffset = currentIndex * 300;
            track.style.transform = `translateX(${basePosition - trackOffset}px)`;
        }
    }
}

// ADD this function for updating column names
function updateColumnNames() {
    const columnNames = document.querySelector('.column-names');
    if (!columnNames) return;

    const rowTitles = ['Stream', 'Releases', 'Visual'];

    const previousEl = columnNames.querySelector('.previous');
    const currentEl = columnNames.querySelector('.current');
    const nextEl = columnNames.querySelector('.next');

    // Simple text updates without complex animations
    if (previousEl) {
        previousEl.textContent = currentRow > 0 ? rowTitles[currentRow - 1] : '';
        previousEl.style.opacity = currentRow > 0 ? '1' : '0';
    }

    if (currentEl) {
        currentEl.textContent = rowTitles[currentRow];
    }

    if (nextEl) {
        nextEl.textContent = currentRow < totalRows - 1 ? rowTitles[currentRow + 1] : '';
        nextEl.style.opacity = currentRow < totalRows - 1 ? '1' : '0';
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    updateTiles();
});

// Initialize everything
updateTiles();