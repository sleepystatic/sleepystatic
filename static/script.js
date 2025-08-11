const logo = document.getElementById("logo");
const track = document.querySelector('.nxe-track');

let currentIndex = 0;
let dx = 1.5;
let dy = 1.5;

// Initial logo position
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

function updateTiles() {
    if (!track) return;

    const visibleTile = track.querySelectorAll('.tile');
    if (visibleTiles.length === 0) return;

    visibleTiles.forEach((tile, index) => {
        const offsetIndex = index - currentIndex;
        const scale = Math.max(0.6, 1 - Math.abs(offsetIndex) * 0.1);

        // Fixed positioning calculation
        const xOffset = offsetIndex * -95;
        const basePosition = 220;

        // Only show current + right-side tiles
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

    const centerTileOffset = visibleTiles[currentIndex].offsetLeft;
    track.style.transform = `translateX(${-centerTileOffset + basePosition}px)`;
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

glitch();


document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentIndex < tiles.length - 1) {
        currentIndex++;
        updateTiles();
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        currentIndex--;
        updateTiles();
    }
});

document.getElementById('upload-form').addEventListener('submit', function () {
    // Show the spinning progress bar and update text
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressText = document.getElementById('progress-text');
    progressBarContainer.style.display = 'block';
    progressText.textContent = 'Processing video... please wait.';
});

updateTiles();