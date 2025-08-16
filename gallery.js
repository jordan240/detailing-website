// Gallery functionality for Eau Auto Spa
let galleryData = [];
let galleryConfig = {};

// Initialize gallery when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Eau Auto Spa Gallery loaded successfully!');
    loadGalleryConfig();
});

// Load gallery configuration from JSON file
async function loadGalleryConfig() {
    try {
        const response = await fetch('./gallery-data.json');
        if (!response.ok) {
            throw new Error('Failed to load gallery configuration');
        }
        
        galleryConfig = await response.json();
        galleryData = galleryConfig.cars || [];
        
        // Update page content with configuration
        updatePageContent();
        await renderGallery();
        updateTotalCars();
        
        console.log('Gallery configuration loaded successfully');
    } catch (error) {
        console.error('Error loading gallery configuration:', error);
        showNotification('Failed to load gallery data', 'danger');
        // Show fallback content
        showFallbackContent();
    }
}

// Update page content based on configuration
function updatePageContent() {
    // Update hero section
    if (galleryConfig.gallerySettings) {
        const title = document.querySelector('.gallery-hero h1');
        const subtitle = document.querySelector('.gallery-hero p');
        const totalCars = document.getElementById('totalCars');
        const customerRating = document.querySelector('.gallery-stats .stat-item:nth-child(2) h4');
        const satisfactionRate = document.querySelector('.gallery-stats .stat-item:nth-child(3) h4');
        
        if (title && galleryConfig.gallerySettings.title) {
            title.textContent = galleryConfig.gallerySettings.title;
        }
        if (subtitle && galleryConfig.gallerySettings.subtitle) {
            subtitle.textContent = galleryConfig.gallerySettings.subtitle;
        }
        if (totalCars && galleryConfig.gallerySettings.stats) {
            totalCars.textContent = galleryConfig.gallerySettings.stats.totalCars;
        }
        if (customerRating && galleryConfig.gallerySettings.stats) {
            customerRating.textContent = galleryConfig.gallerySettings.stats.customerRating;
        }
        if (satisfactionRate && galleryConfig.gallerySettings.stats) {
            satisfactionRate.textContent = galleryConfig.gallerySettings.stats.satisfactionRate;
        }
    }
}

// Show fallback content if configuration fails to load
function showFallbackContent() {
    const grid = document.getElementById('galleryGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-gallery">
                    <i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
                    <h4 class="text-warning">Gallery Data Unavailable</h4>
                    <p class="text-muted">Please check the gallery configuration file or try again later.</p>
                </div>
            </div>
        `;
    }
}

// Render the gallery grid
async function renderGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;

    if (galleryData.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-gallery">
                    <i class="fas fa-car fa-4x text-muted mb-3"></i>
                    <h4 class="text-muted">No cars in gallery yet</h4>
                    <p class="text-muted">Gallery data will appear here once configured.</p>
                </div>
            </div>
        `;
        return;
    }

    // Show loading state
    grid.innerHTML = `
        <div class="col-12 text-center">
            <div class="gallery-loading">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading gallery...</span>
                </div>
                <div class="ms-3">
                    <p class="text-muted mb-0">Loading gallery...</p>
                    <small class="text-muted">Please wait</small>
                </div>
            </div>
        </div>
    `;

    try {
        // Create car cards
        const carCards = [];
        
        for (let i = 0; i < galleryData.length; i++) {
            const car = galleryData[i];
            const carCard = await createCarCard(car);
            carCards.push(carCard);
        }
        
        grid.innerHTML = carCards.join('');
        console.log(`Successfully loaded ${galleryData.length} cars`);
    } catch (error) {
        console.error('Error rendering gallery:', error);
        grid.innerHTML = `
            <div class="col-12 text-center">
                <div class="empty-gallery">
                    <i class="fas fa-exclamation-triangle fa-4x text-warning mb-3"></i>
                    <h4 class="text-warning">Gallery Error</h4>
                    <p class="text-muted">Failed to load gallery. Please refresh the page.</p>
                </div>
            </div>
        `;
    }
}

// Create individual car card
async function createCarCard(car) {
    // Create Instagram reel embed with local thumbnail
    const instagramEmbed = await createInstagramEmbed(car.instagramReelUrl);

    const addOnsHtml = car.addOns && car.addOns.length > 0 
        ? `<div class="add-ons mb-2">
             <strong>Add-ons:</strong> ${car.addOns.join(', ')}
           </div>`
        : '';

    const notesHtml = car.notes 
        ? `<div class="notes mb-2">
             <strong>Notes:</strong> ${car.notes}
           </div>`
        : '';

    const featuredBadge = car.featured 
        ? '<div class="badge bg-warning position-absolute top-0 start-0 m-2">Featured</div>'
        : '';

    const packageColor = getPackageColor(car.packageType);

    return `
        <div class="col-lg-4 col-md-6" data-car-id="${car.id}">
            <div class="car-card ${car.featured ? 'featured' : ''}">
                <div class="car-media-container">
                    ${featuredBadge}
                    ${instagramEmbed}
                </div>
                <div class="car-info">
                    <h5 class="car-title">${car.year} ${car.make} ${car.model}</h5>
                    <p class="car-color text-muted">${car.color}</p>
                    <div class="package-info">
                        <span class="badge bg-${packageColor}">${car.packageType}</span>
                    </div>
                    ${addOnsHtml}
                    ${notesHtml}
                    <div class="car-footer">
                        <small class="text-muted">Added: ${formatDate(car.dateAdded)}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Get package color based on package type
function getPackageColor(packageType) {
    if (!galleryConfig.packages) return 'primary';
    
    const packageConfig = galleryConfig.packages.find(pkg => pkg.name === packageType);
    return packageConfig ? packageConfig.color : 'primary';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Update total cars count
function updateTotalCars() {
    const totalElement = document.getElementById('totalCars');
    if (totalElement) {
        totalElement.textContent = galleryData.length;
    }
}

// Create Instagram reel embed with local thumbnail
async function createInstagramEmbed(instagramUrl) {
    if (!instagramUrl) {
        return `
            <div class="instagram-placeholder">
                <i class="fab fa-instagram fa-3x text-muted mb-2"></i>
                <p class="text-muted">Instagram reel not available</p>
            </div>
        `;
    }

    // Extract the post ID from the Instagram URL
    let postId = '';
    if (instagramUrl.includes('/reel/')) {
        // Handle reel URLs
        const reelMatch = instagramUrl.match(/\/reel\/([^\/\?]+)/);
        postId = reelMatch ? reelMatch[1] : '';
    } else if (instagramUrl.includes('/p/')) {
        // Handle regular post URLs
        const postMatch = instagramUrl.match(/\/p\/([^\/\?]+)/);
        postId = postMatch ? postMatch[1] : '';
    }

    if (!postId) {
        return `
            <div class="instagram-placeholder">
                <i class="fab fa-instagram fa-3x text-muted mb-2"></i>
                <p class="text-muted">Invalid Instagram URL</p>
            </div>
        `;
    }

    // Check if we have a local thumbnail first
    const car = galleryData.find(car => car.instagramReelUrl === instagramUrl);
    if (car && car.localThumbnail) {
        console.log(`Using local thumbnail for post: ${postId}`);
        return `
            <div class="instagram-thumbnail-container">
                <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="instagram-thumbnail-link">
                    <img 
                        src="${car.localThumbnail}" 
                        alt="Instagram Reel Thumbnail" 
                        class="instagram-thumbnail"
                        onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';"
                    >
                    <div class="instagram-fallback" style="display: none; text-align: center; padding: 20px;">
                        <i class="fab fa-instagram fa-3x text-muted mb-2"></i>
                        <p class="text-muted">Image not found</p>
                        <small class="text-muted">Check: ${car.localThumbnail}</small>
                    </div>
                    <div class="instagram-overlay">
                        <i class="fab fa-instagram fa-2x"></i>
                        <span>View Reel</span>
                    </div>
                </a>
            </div>
        `;
    }

    // Show placeholder if no local thumbnail
    return `
        <div class="instagram-placeholder">
            <i class="fab fa-instagram fa-3x text-muted mb-2"></i>
            <p class="text-muted">Add localThumbnail to gallery-data.json</p>
            <small class="text-muted">Example: "localThumbnail": "./thumbnails/Image-287.jpg"</small>
        </div>
    `;
}







// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Public API functions for external use
window.EauAutoSpaGallery = {
    // Get all cars
    getCars: () => galleryData,
    
    // Get specific car by ID
    getCar: (id) => galleryData.find(car => car.id === id),
    
    // Get gallery configuration
    getConfig: () => galleryConfig,
    
    // Refresh gallery data
    refresh: () => loadGalleryConfig()
};
