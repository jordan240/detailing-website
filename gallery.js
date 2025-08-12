// Gallery Page JavaScript
let config = null;
let galleryData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load configuration first
    loadConfiguration().then(() => {
        // Load saved gallery data from localStorage
        loadGalleryDataFromStorage();
        // Initialize gallery functionality
        initializeGallery();
        // Apply configuration
        applyConfiguration();
        // Render saved gallery data
        renderGalleryFromData();
    });
});

async function loadConfiguration() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        console.log('Configuration loaded:', config);
    } catch (error) {
        console.error('Failed to load configuration, using defaults:', error);
        // Fallback configuration
        config = {
            gallery: {
                addCarButton: { enabled: true, text: "Add Another Car", icon: "fas fa-plus" },
                removeCarButton: { enabled: true, text: "Remove Car", icon: "fas fa-trash" },
                maxCars: 20
            }
        };
    }
}

function loadGalleryDataFromStorage() {
    try {
        const savedData = localStorage.getItem('nicheDetailingGallery');
        if (savedData) {
            galleryData = JSON.parse(savedData);
            console.log('Gallery data loaded from localStorage:', galleryData);
        } else {
            galleryData = [];
            console.log('No saved gallery data found, starting fresh');
        }
    } catch (error) {
        console.error('Failed to load gallery data from localStorage:', error);
        galleryData = [];
    }
}

function saveGalleryDataToStorage() {
    try {
        // Get current gallery state from DOM
        const currentGalleryData = extractGalleryDataFromDOM();
        
        // Save to localStorage (works with GitHub Pages)
        localStorage.setItem('nicheDetailingGallery', JSON.stringify(currentGalleryData));
        
        console.log('Gallery data saved to localStorage:', currentGalleryData);
        
        // Also update the galleryData variable
        galleryData = currentGalleryData;
        
    } catch (error) {
        console.error('Failed to save gallery data to localStorage:', error);
    }
}

function extractGalleryDataFromDOM() {
    const cars = [];
    const carGalleries = document.querySelectorAll('.car-gallery');
    
    carGalleries.forEach(carGallery => {
        const carData = {
            name: carGallery.querySelector('.car-header h2').textContent,
            packageType: carGallery.querySelector('.car-header p').textContent,
            badges: Array.from(carGallery.querySelectorAll('.car-details .badge')).map(badge => ({
                text: badge.textContent,
                class: badge.className
            })),
            afterPhotos: {
                description: carGallery.querySelector('.after-card .placeholder-content p')?.textContent || '',
                hasContent: carGallery.querySelector('.after-card .placeholder-content i.fa-image') === null
            },
            finalVideo: {
                description: carGallery.querySelector('.video-card .placeholder-content p')?.textContent || '',
                hasContent: carGallery.querySelector('.video-card .placeholder-content i.fa-play-circle') === null
            }
        };
        cars.push(carData);
    });
    
    return cars;
}

function renderGalleryFromData() {
    if (galleryData.length === 0) return;
    
    const galleryContainer = document.querySelector('.gallery-section .container');
    const addButton = document.querySelector('.text-center.mt-5');
    
    // Remove any existing cars
    const existingCars = document.querySelectorAll('.car-gallery');
    existingCars.forEach(car => car.remove());
    
    // Render each car from saved data
    galleryData.forEach(carData => {
        const carGallery = createCarGalleryFromData(carData);
        galleryContainer.insertBefore(carGallery, addButton);
    });
    
    // Reinitialize gallery functionality
    initializeGallery();
}

function createCarGalleryFromData(carData) {
    const carGallery = document.createElement('div');
    carGallery.className = 'car-gallery mb-5';
    
    // Generate badges HTML
    const badgesHTML = carData.badges.map(badge => 
        `<span class="${badge.class}">${badge.text}</span>`
    ).join('');
    
    carGallery.innerHTML = `
        <div class="car-header text-center mb-4">
            <h2 class="display-6 fw-bold mb-2">${carData.name}</h2>
            <p class="lead text-muted">${carData.packageType}</p>
            <div class="car-details d-flex justify-content-center gap-4">
                ${badgesHTML}
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="gallery-card after-card">
                    <h5 class="card-title text-center mb-3">
                        <i class="fas fa-check-circle text-success me-2"></i>Finished Detail Photos
                    </h5>
                    <div class="placeholder-content">
                        ${carData.afterPhotos.hasContent ? 
                            `<p class="text-muted">${carData.afterPhotos.description}</p>` :
                            `<i class="fas fa-image fa-4x text-muted mb-3"></i>
                             <p class="text-muted">Finished detail photos will be displayed here</p>
                             <small class="text-muted">Click to add photos</small>`
                        }
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="gallery-card video-card">
                    <h5 class="card-title text-center mb-3">
                        <i class="fas fa-video text-primary me-2"></i>Final Video
                    </h5>
                    <div class="placeholder-content">
                        ${carData.finalVideo.hasContent ? 
                            `<p class="text-muted">${carData.finalVideo.description}</p>` :
                            `<i class="fas fa-play-circle fa-4x text-muted mb-3"></i>
                             <p class="text-muted">Video content will be displayed here</p>
                             <small class="text-muted">Click to add video</small>`
                        }
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-3">
            ${config && config.gallery.removeCarButton.enabled ? `
            <button class="btn btn-outline-danger btn-sm" onclick="removeCar(this)">
                <i class="${config.gallery.removeCarButton.icon || 'fas fa-trash'} me-1"></i>${config.gallery.removeCarButton.text || 'Remove Car'}
            </button>
            ` : ''}
        </div>
    `;
    
    return carGallery;
}

function applyConfiguration() {
    // Apply add car button configuration
    const addCarButton = document.querySelector('.btn-primary[onclick="addNewCar()"]');
    if (addCarButton && config.gallery.addCarButton) {
        if (!config.gallery.addCarButton.enabled) {
            addCarButton.style.display = 'none';
        } else {
            // Update button text and icon if specified
            if (config.gallery.addCarButton.text) {
                addCarButton.innerHTML = `<i class="${config.gallery.addCarButton.icon} me-2"></i>${config.gallery.addCarButton.text}`;
            }
        }
    }
    
    // Apply remove car button configuration
    const removeButtons = document.querySelectorAll('.btn-outline-danger');
    removeButtons.forEach(button => {
        if (!config.gallery.removeCarButton.enabled) {
            button.style.display = 'none';
        }
    });
}

function initializeGallery() {
    // Add click handlers to gallery cards
    const galleryCards = document.querySelectorAll('.gallery-card');
    galleryCards.forEach(card => {
        card.addEventListener('click', function() {
            handleCardClick(this);
        });
    });

    // Add hover effects
    addHoverEffects();
}

function handleCardClick(card) {
    // Show a modal or prompt to add content
    const cardType = getCardType(card);
    const carName = getCarName(card);
    
    showAddContentModal(cardType, carName);
}

function getCardType(card) {
    if (card.classList.contains('after-card')) return 'after';
    if (card.classList.contains('video-card')) return 'video';
    return 'unknown';
}

function getCarName(card) {
    // Find the closest car-gallery parent and get the car name
    const carGallery = card.closest('.car-gallery');
    if (carGallery) {
        const carHeader = carGallery.querySelector('.car-header h2');
        return carHeader ? carHeader.textContent : 'Unknown Car';
    }
    return 'Unknown Car';
}

function showAddContentModal(cardType, carName) {
    // Create a simple modal for adding content
    const modal = document.createElement('div');
    modal.className = 'content-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h5>Add ${cardType.charAt(0).toUpperCase() + cardType.slice(1)} Content</h5>
                <button class="close-btn" onclick="this.closest('.content-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Type:</strong> ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}</p>
                <div class="form-group">
                    <label>Upload ${cardType === 'video' ? 'Video' : 'Photos'}:</label>
                    <input type="file" accept="${cardType === 'video' ? 'video/*' : 'image/*'}" multiple>
                </div>
                <div class="form-group">
                    <label>Description (optional):</label>
                    <textarea placeholder="Add a description..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.content-modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="saveContent(this)">Save Content</button>
            </div>
        </div>
    `;
    
    // Add modal styles
    addModalStyles();
    
    // Add to page
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => modal.classList.add('show'), 10);
}

function saveContent(button) {
    // Simulate saving content
    const modal = button.closest('.content-modal');
    const saveBtn = modal.querySelector('.btn-primary');
    const originalText = saveBtn.textContent;
    
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        saveBtn.textContent = 'Saved!';
        saveBtn.classList.remove('btn-primary');
        saveBtn.classList.add('btn-success');
        
        // Save gallery data after content is saved
        saveGalleryDataToStorage();
        
        setTimeout(() => {
            modal.remove();
        }, 1000);
    }, 1500);
}

function addNewCar() {
    // Check if add car functionality is enabled
    if (!config || !config.gallery.addCarButton.enabled) {
        alert('Adding new cars is currently disabled.');
        return;
    }
    
    // Check if we've reached the maximum number of cars
    const currentCars = document.querySelectorAll('.car-gallery').length;
    if (currentCars >= config.gallery.maxCars) {
        alert(`Maximum number of cars (${config.gallery.maxCars}) reached.`);
        return;
    }
    
    // Get car details from user
    const carName = prompt('Enter car name (e.g., "Tesla Model S"):');
    if (!carName) return;
    
    const packageType = prompt('Enter package type (e.g., "Full Package + Ceramic"):');
    if (!packageType) return;
    
    const duration = prompt('Enter duration (e.g., "2.5 Hours"):');
    if (!duration) return;
    
    // Create new car gallery
    const newCarGallery = createCarGallery(carName, packageType, duration);
    
    // Add to page before the "Add Another Car" button
    const addButton = document.querySelector('.text-center.mt-5');
    addButton.parentNode.insertBefore(newCarGallery, addButton);
    
    // Add animation class
    newCarGallery.classList.add('new-car');
    
    // Initialize the new gallery
    initializeGallery();
    
    // Save gallery data
    saveGalleryDataToStorage();
    
    // Scroll to new car
    newCarGallery.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function createCarGallery(carName, packageType, duration) {
    const carGallery = document.createElement('div');
    carGallery.className = 'car-gallery mb-5';
    
    // Determine badges based on package type
    const badges = generateBadges(packageType, duration);
    
    carGallery.innerHTML = `
        <div class="car-header text-center mb-4">
            <h2 class="display-6 fw-bold mb-2">${carName}</h2>
            <p class="lead text-muted">${packageType}</p>
            <div class="car-details d-flex justify-content-center gap-4">
                ${badges}
            </div>
        </div>
        
        <div class="row g-4">
            <div class="col-md-6">
                <div class="gallery-card after-card">
                    <h5 class="card-title text-center mb-3">
                        <i class="fas fa-check-circle text-success me-2"></i>Finished Detail Photos
                    </h5>
                    <div class="placeholder-content">
                        <i class="fas fa-image fa-4x text-muted mb-3"></i>
                        <p class="text-muted">Finished detail photos will be displayed here</p>
                        <small class="text-muted">Click to add photos</small>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="gallery-card video-card">
                    <h5 class="card-title text-center mb-3">
                        <i class="fas fa-video text-primary me-2"></i>Final Video
                    </h5>
                    <div class="placeholder-content">
                        <i class="fas fa-play-circle fa-4x text-muted mb-3"></i>
                        <p class="text-muted">Video content will be displayed here</p>
                        <small class="text-muted">Click to add video</small>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-3">
            ${config && config.gallery.removeCarButton.enabled ? `
            <button class="btn btn-outline-danger btn-sm" onclick="removeCar(this)">
                <i class="${config.gallery.removeCarButton.icon || 'fas fa-trash'} me-1"></i>${config.gallery.removeCarButton.text || 'Remove Car'}
            </button>
            ` : ''}
        </div>
    `;
    
    return carGallery;
}

function generateBadges(packageType, duration) {
    let badges = '';
    
    if (packageType.toLowerCase().includes('exterior')) {
        badges += '<span class="badge bg-primary">Exterior</span>';
    }
    if (packageType.toLowerCase().includes('interior')) {
        badges += '<span class="badge bg-success">Interior</span>';
    }
    if (packageType.toLowerCase().includes('ceramic')) {
        badges += '<span class="badge bg-warning">Ceramic Coating</span>';
    }
    if (packageType.toLowerCase().includes('leather')) {
        badges += '<span class="badge bg-secondary">Leather Care</span>';
    }
    if (packageType.toLowerCase().includes('premium')) {
        badges += '<span class="badge bg-danger">Premium</span>';
    }
    
    badges += `<span class="badge bg-info">${duration}</span>`;
    
    return badges;
}

function removeCar(button) {
    const carGallery = button.closest('.car-gallery');
    if (confirm('Are you sure you want to remove this car from the gallery?')) {
        carGallery.style.opacity = '0';
        carGallery.style.transform = 'scale(0.8)';
        setTimeout(() => {
            carGallery.remove();
            // Save gallery data after removal
            saveGalleryDataToStorage();
        }, 300);
    }
}

function addHoverEffects() {
    // Add ripple effect to cards
    const cards = document.querySelectorAll('.gallery-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .content-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .content-modal.show {
            opacity: 1;
        }
        
        .modal-content {
            background: var(--mdc-theme-surface);
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--mdc-elevation-24);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        }
        
        .content-modal.show .modal-content {
            transform: scale(1);
        }
        
        .modal-header {
            padding: 20px;
            border-bottom: 1px solid rgba(139, 92, 246, 0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h5 {
            color: var(--mdc-theme-on-surface);
            margin: 0;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            color: var(--mdc-theme-on-surface);
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .close-btn:hover {
            background: rgba(139, 92, 246, 0.1);
            color: var(--mdc-theme-primary);
        }
        
        .modal-body {
            padding: 20px;
        }
        
        .modal-body p {
            color: var(--mdc-theme-on-surface);
            margin-bottom: 15px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            color: var(--mdc-theme-on-surface);
            margin-bottom: 8px;
            font-weight: 500;
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid rgba(139, 92, 246, 0.3);
            border-radius: 8px;
            background: var(--mdc-theme-background);
            color: var(--mdc-theme-on-surface);
            transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--mdc-theme-primary);
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        
        .form-group textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .modal-footer {
            padding: 20px;
            border-top: 1px solid rgba(139, 92, 246, 0.2);
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .btn {
            padding: 10px 20px;
            border-radius: 6px;
            border: none;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: var(--mdc-theme-primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--mdc-theme-accent);
            transform: translateY(-2px);
        }
        
        .btn-secondary {
            background: rgba(139, 92, 246, 0.1);
            color: var(--mdc-theme-primary);
            border: 1px solid rgba(139, 92, 246, 0.3);
        }
        
        .btn-secondary:hover {
            background: rgba(139, 92, 246, 0.2);
        }
        
        .btn-success {
            background: #10b981;
            color: white;
        }
        
        .btn-outline-danger {
            background: transparent;
            color: #ef4444;
            border: 1px solid #ef4444;
        }
        
        .btn-outline-danger:hover {
            background: #ef4444;
            color: white;
        }
    `;
    
    document.head.appendChild(style);
}

// Add smooth scrolling for navigation
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

// Add loading animation to cards when clicked
function addLoadingState(card) {
    card.classList.add('loading');
    setTimeout(() => {
        card.classList.remove('loading');
    }, 2000);
}

// Export functions for global access
window.addNewCar = addNewCar;
window.removeCar = removeCar;
window.saveContent = saveContent;
window.exportGalleryData = exportGalleryData;

// Function to export gallery data as JSON file
function exportGalleryData() {
    try {
        const currentData = extractGalleryDataFromDOM();
        const dataStr = JSON.stringify(currentData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'niche-detailing-gallery.json';
        link.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(link.href);
        
        console.log('Gallery data exported successfully');
    } catch (error) {
        console.error('Failed to export gallery data:', error);
        alert('Failed to export gallery data. Please try again.');
    }
}
