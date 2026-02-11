// Configuration
const TOTAL_CATS = 10; // You can change this to 20 if you want
let currentCatIndex = 0;
let likedCats = [];
let dislikedCats = [];
let allCats = [];
let isDragging = false;
let startX = 0;
let currentX = 0;

// DOM Elements
const cardContainer = document.getElementById('card-container');
const loadingElement = document.getElementById('loading');
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
const shareButton = document.getElementById('share-btn');

// Initialize the app
function init() {
    totalCountElement.textContent = TOTAL_CATS;
    currentCountElement.textContent = currentCatIndex + 1;
    
    // Load initial cats
    loadCats();
    
    // Add event listeners for buttons
    likeButton.addEventListener('click', () => handleLike());
    dislikeButton.addEventListener('click', () => handleDislike());
    playAgainButton.addEventListener('click', resetGame);
    shareButton.addEventListener('click', shareResults);
}

// Load cats from CATAAS API
async function loadCats() {
    showLoading(true);
    
    try {
        // We need to get multiple cat images
        for (let i = 0; i < TOTAL_CATS; i++) {
            // CATAAS API returns a JSON with cat information
            const response = await fetch('https://cataas.com/cat?json=true');
            const data = await response.json();
            
            // Construct the full image URL
            const catUrl = `https://cataas.com/cat/${data._id}`;
            
            allCats.push({
                id: data._id,
                url: catUrl,
                tags: data.tags || []
            });
        }
        
        // Create the first card
        if (allCats.length > 0) {
            createCard(allCats[0]);
        }
        
        showLoading(false);
    } catch (error) {
        console.error('Error loading cats:', error);
        showLoading(false);
        
        // Fallback: Use placeholder cats if API fails
        loadFallbackCats();
    }
}

// Fallback cat images in case API fails
function loadFallbackCats() {
    const fallbackCats = [];
    
    // Using a different cat image API as fallback
    for (let i = 0; i < TOTAL_CATS; i++) {
        // Using cat pictures from placekitten.com
        const width = 400 + Math.floor(Math.random() * 100);
        const height = 500 + Math.floor(Math.random() * 100);
        
        fallbackCats.push({
            id: `fallback-${i}`,
            url: `https://placekitten.com/${width}/${height}`,
            tags: ['cute', 'kitten', 'cat']
        });
    }
    
    allCats = fallbackCats;
    createCard(allCats[0]);
}

// Create a card for a cat
function createCard(cat) {
    cardContainer.innerHTML = '';
    
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = cat.id;
    card.dataset.index = currentCatIndex;
    
    // Create image
    const img = document.createElement('img');
    img.src = cat.url;
    img.alt = 'Cute cat';
    img.onerror = function() {
        // If image fails to load, use a placeholder
        this.src = 'https://placekitten.com/400/500';
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
    
    // Add touch/mouse events for swiping
    addSwipeEvents(card);
}

// Add swipe functionality to a card
function addSwipeEvents(card) {
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag);
    
    card.addEventListener('mousemove', drag);
    card.addEventListener('touchmove', drag);
    
    card.addEventListener('mouseup', endDrag);
    card.addEventListener('mouseleave', endDrag);
    card.addEventListener('touchend', endDrag);
}

// Drag functions for swipe
function startDrag(e) {
    isDragging = true;
    const card = e.currentTarget;
    card.style.transition = 'none';
    
    // Get initial position
    if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
    } else {
        startX = e.clientX;
    }
    
    currentX = startX;
}

function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    const card = e.currentTarget;
    let clientX;
    
    if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
    } else {
        clientX = e.clientX;
    }
    
    const deltaX = clientX - startX;
    currentX = clientX;
    
    // Move the card
    card.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.05}deg)`;
    
    // Show feedback overlay
    const heartOverlay = card.querySelector('.heart-overlay');
    const crossOverlay = card.querySelector('.cross-overlay');
    
    if (deltaX > 50) {
        // Swiping right (like)
        heartOverlay.style.opacity = Math.min(deltaX / 100, 1);
        crossOverlay.style.opacity = 0;
    } else if (deltaX < -50) {
        // Swiping left (dislike)
        crossOverlay.style.opacity = Math.min(-deltaX / 100, 1);
        heartOverlay.style.opacity = 0;
    } else {
        heartOverlay.style.opacity = 0;
        crossOverlay.style.opacity = 0;
    }
}

function endDrag(e) {
    if (!isDragging) return;
    
    isDragging = false;
    const card = e.currentTarget;
    card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    
    const deltaX = currentX - startX;
    
    // Determine if swipe was far enough
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
    const currentCat = allCats[currentCatIndex];
    likedCats.push(currentCat);
    
    animateSwipe('right');
    updateCounter();
    
    // Move to next cat after animation
    setTimeout(() => {
        nextCat();
    }, 300);
}

// Handle dislike action
function handleDislike() {
    const currentCat = allCats[currentCatIndex];
    dislikedCats.push(currentCat);
    
    animateSwipe('left');
    updateCounter();
    
    // Move to next cat after animation
    setTimeout(() => {
        nextCat();
    }, 300);
}

// Animate card swipe
function animateSwipe(direction) {
    const card = document.querySelector('.card');
    
    if (direction === 'right') {
        card.classList.add('swipe-right');
    } else {
        card.classList.add('swipe-left');
    }
}

// Move to next cat
function nextCat() {
    currentCatIndex++;
    
    if (currentCatIndex < TOTAL_CATS) {
        // Show next cat
        createCard(allCats[currentCatIndex]);
        currentCountElement.textContent = currentCatIndex + 1;
    } else {
        // All cats shown, show results
        showResults();
    }
}

// Update counter display
function updateCounter() {
    currentCountElement.textContent = currentCatIndex + 1;
}

// Show results screen
function showResults() {
    // Hide main content
    document.querySelector('.main-content').style.display = 'none';
    
    // Show results screen
    resultsScreen.classList.remove('hidden');
    
    // Update results
    likedCountElement.textContent = likedCats.length;
    dislikedCountElement.textContent = dislikedCats.length;
    totalSeenElement.textContent = TOTAL_CATS;
    
    // Display liked cats
    displayLikedCats();
}

// Display liked cats in results
function displayLikedCats() {
    likedCatsContainer.innerHTML = '';
    
    if (likedCats.length === 0) {
        likedCatsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <i class="fas fa-cat" style="font-size: 60px; margin-bottom: 20px;"></i>
                <p>No cats liked yet. Try again!</p>
            </div>
        `;
        return;
    }
    
    likedCats.forEach((cat, index) => {
        const catCard = document.createElement('div');
        catCard.className = 'liked-cat-card';
        
        const img = document.createElement('img');
        img.src = cat.url;
        img.alt = 'Liked cat';
        img.onerror = function() {
            this.src = 'https://placekitten.com/200/200';
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
    // Reset all data
    currentCatIndex = 0;
    likedCats = [];
    dislikedCats = [];
    
    // Reload new cats
    allCats = [];
    loadCats();
    
    // Show main content, hide results
    document.querySelector('.main-content').style.display = 'flex';
    resultsScreen.classList.add('hidden');
    
    // Reset counter
    currentCountElement.textContent = 1;
}

// Share results
function shareResults() {
    const shareText = `I just discovered my kitty preferences with Paws & Preferences! 🐱\n\nI liked ${likedCats.length} out of ${TOTAL_CATS} cats!\n\nTry it yourself!`;
    
    // Check if Web Share API is supported
    if (navigator.share) {
        navigator.share({
            title: 'My Kitty Preferences',
            text: shareText,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            alert('Results copied to clipboard!');
        });
    }
}

// Show/hide loading indicator
function showLoading(show) {
    loadingElement.style.display = show ? 'block' : 'none';
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', init);