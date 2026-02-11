// Configuration
const TOTAL_CATS = 10;
let currentCatIndex = 0;
let likedCats = [];
let dislikedCats = [];

// DOM Elements
const cardContainer = document.getElementById('card-container');
const currentCountElement = document.getElementById('current-count');
const totalCountElement = document.getElementById('total-count');
const likeButton = document.getElementById('like-btn');
const dislikeButton = document.getElementById('dislike-btn');
const resultsScreen = document.getElementById('results-screen');
const likedCountElement = document.getElementById('liked-count');
const dislikedCountElement = document.getElementById('disliked-count');
const totalSeenElement = document.getElementById('total-seen');
const likedCatsContainer = document.getElementById('liked-cats');
const playAgainButton = document.getElementById('play-again-btn');

// Pre-loaded cat images that will 100% work
const CAT_IMAGES = [
    "https://cataas.com/cat",
    "https://cataas.com/cat/cute",
    "https://cataas.com/cat/says/hello",
    "https://cataas.com/cat/gif",
    "https://cataas.com/cat/small",
    "https://cataas.com/cat/young",
    "https://cataas.com/cat/sleepy",
    "https://cataas.com/cat/playful",
    "https://cataas.com/cat/curious",
    "https://cataas.com/cat/funny",
    "https://cataas.com/cat/hat",
    "https://cataas.com/cat/glasses",
    "https://cataas.com/cat/box",
    "https://cataas.com/cat/blanket",
    "https://cataas.com/cat/window",
    "https://cataas.com/cat/garden",
    "https://cataas.com/cat/black",
    "https://cataas.com/cat/white",
    "https://cataas.com/cat/tabby",
    "https://cataas.com/cat/siamese"
];

// Initialize the app
function init() {
    totalCountElement.textContent = TOTAL_CATS;
    currentCountElement.textContent = 1;
    
    // Create first card immediately
    createCard(0);
    
    // Add event listeners
    likeButton.addEventListener('click', () => handleLike());
    dislikeButton.addEventListener('click', () => handleDislike());
    playAgainButton.addEventListener('click', resetGame);
    
    // Preload all images
    preloadImages();
}

// Preload images for smooth experience
function preloadImages() {
    for (let i = 0; i < TOTAL_CATS; i++) {
        const img = new Image();
        img.src = getCatImageUrl(i);
    }
}

// Get a cat image URL (with unique parameter to prevent caching)
function getCatImageUrl(index) {
    const baseUrl = CAT_IMAGES[index % CAT_IMAGES.length];
    // Add random parameter to prevent caching
    return `${baseUrl}?t=${Date.now()}-${index}&width=400&height=500`;
}

// Create a card for a cat
function createCard(index) {
    cardContainer.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    
    // Create image
    const img = document.createElement('img');
    const imageUrl = getCatImageUrl(index);
    img.src = imageUrl;
    img.alt = 'Cute cat';
    
    // If image fails to load, use fallback
    img.onerror = function() {
        console.log('Image failed to load, using fallback');
        this.src = `https://placekitten.com/400/500?t=${Date.now()}-${index}`;
    };
    
    // Create overlays for swipe feedback
    const heartOverlay = document.createElement('div');
    heartOverlay.className = 'heart-overlay';
    heartOverlay.innerHTML = '<i class="fas fa-heart"></i>';
    
    const crossOverlay = document.createElement('div');
    crossOverlay.className = 'cross-overlay';
    crossOverlay.innerHTML = '<i class="fas fa-times"></i>';
    
    card.appendChild(img);
    card.appendChild(heartOverlay);
    card.appendChild(crossOverlay);
    cardContainer.appendChild(card);
    
    // Add swipe events
    addSwipeEvents(card);
}

// Add swipe functionality to a card
function addSwipeEvents(card) {
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    
    // Mouse events
    card.addEventListener('mousedown', (e) => {
        isDragging = true;
        card.style.transition = 'none';
        startX = e.clientX;
        currentX = startX;
    });
    
    // Touch events
    card.addEventListener('touchstart', (e) => {
        isDragging = true;
        card.style.transition = 'none';
        startX = e.touches[0].clientX;
        currentX = startX;
        e.preventDefault();
    });
    
    card.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        currentX = e.clientX;
        updateCardPosition(card, deltaX);
    });
    
    card.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        currentX = e.touches[0].clientX;
        updateCardPosition(card, deltaX);
        e.preventDefault();
    });
    
    card.addEventListener('mouseup', () => endDrag(card));
    card.addEventListener('mouseleave', () => endDrag(card));
    card.addEventListener('touchend', () => endDrag(card));
}

// Update card position during drag
function updateCardPosition(card, deltaX) {
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`;
    
    const heartOverlay = card.querySelector('.heart-overlay');
    const crossOverlay = card.querySelector('.cross-overlay');
    
    if (deltaX > 50) {
        heartOverlay.style.opacity = Math.min(deltaX / 100, 1);
        crossOverlay.style.opacity = 0;
    } else if (deltaX < -50) {
        crossOverlay.style.opacity = Math.min(-deltaX / 100, 1);
        heartOverlay.style.opacity = 0;
    } else {
        heartOverlay.style.opacity = 0;
        crossOverlay.style.opacity = 0;
    }
}

// End drag and handle swipe decision
function endDrag(card) {
    const rect = card.getBoundingClientRect();
    const deltaX = currentX - startX;
    
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    if (deltaX > 100) {
        // Swiped right (like)
        handleLike();
    } else if (deltaX < -100) {
        // Swiped left (dislike)
        handleDislike();
    } else {
        // Return to center
        card.style.transform = 'translateX(0) rotate(0)';
        
        // Hide overlays
        const heartOverlay = card.querySelector('.heart-overlay');
        const crossOverlay = card.querySelector('.cross-overlay');
        heartOverlay.style.opacity = 0;
        crossOverlay.style.opacity = 0;
    }
}

// Handle like action
function handleLike() {
    const currentImageUrl = getCatImageUrl(currentCatIndex);
    likedCats.push(currentImageUrl);
    
    animateSwipe('right');
    updateCounter();
    
    setTimeout(() => {
        nextCat();
    }, 300);
}

// Handle dislike action
function handleDislike() {
    const currentImageUrl = getCatImageUrl(currentCatIndex);
    dislikedCats.push(currentImageUrl);
    
    animateSwipe('left');
    updateCounter();
    
    setTimeout(() => {
        nextCat();
    }, 300);
}

// Animate card swipe
function animateSwipe(direction) {
    const card = document.querySelector('.card');
    
    if (direction === 'right') {
        card.style.transform = 'translateX(200px) rotate(20deg)';
        card.style.opacity = '0';
    } else {
        card.style.transform = 'translateX(-200px) rotate(-20deg)';
        card.style.opacity = '0';
    }
}

// Move to next cat
function nextCat() {
    currentCatIndex++;
    
    if (currentCatIndex < TOTAL_CATS) {
        createCard(currentCatIndex);
        currentCountElement.textContent = currentCatIndex + 1;
    } else {
        showResults();
    }
}

// Update counter display
function updateCounter() {
    currentCountElement.textContent = currentCatIndex + 1;
}

// Show results screen
function showResults() {
    document.querySelector('.main-content').style.display = 'none';
    resultsScreen.classList.remove('hidden');
    
    likedCountElement.textContent = likedCats.length;
    dislikedCountElement.textContent = dislikedCats.length;
    totalSeenElement.textContent = TOTAL_CATS;
    
    displayLikedCats();
}

// Display liked cats in results
function displayLikedCats() {
    likedCatsContainer.innerHTML = '';
    
    if (likedCats.length === 0) {
        likedCatsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999; grid-column: 1 / -1;">
                <i class="fas fa-cat" style="font-size: 60px; margin-bottom: 20px;"></i>
                <p>No cats liked yet. Try again!</p>
            </div>
        `;
        return;
    }
    
    likedCats.forEach((catUrl, index) => {
        const catCard = document.createElement('div');
        catCard.className = 'liked-cat-card';
        
        const img = document.createElement('img');
        img.src = catUrl;
        img.alt = `Liked cat ${index + 1}`;
        img.onerror = function() {
            this.src = `https://placekitten.com/200/200?t=${Date.now()}-${index}`;
        };
        
        const badge = document.createElement('div');
        badge.className = 'heart-badge';
        badge.innerHTML = `<i class="fas fa-heart"></i> #${index + 1}`;
        
        catCard.appendChild(img);
        catCard.appendChild(badge);
        likedCatsContainer.appendChild(catCard);
    });
}

// Reset the game
function resetGame() {
    currentCatIndex = 0;
    likedCats = [];
    dislikedCats = [];
    
    document.querySelector('.main-content').style.display = 'flex';
    resultsScreen.classList.add('hidden');
    
    currentCountElement.textContent = 1;
    createCard(0);
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', init);
