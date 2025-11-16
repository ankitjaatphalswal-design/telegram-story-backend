// Telegram Mini App - Stories Feature
// Connects to your backend server

// Configuration
const API_BASE_URL = 'https://your-railway-app.up.railway.app/api'; // Replace with your Railway URL
let authToken = null;
let currentUser = null;

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        tg.showAlert(error.message || 'Something went wrong');
        throw error;
    }
}

// Authentication
async function authenticateUser() {
    try {
        const user = tg.initDataUnsafe.user;

        if (!user) {
            tg.showAlert('Unable to get user data from Telegram');
            return false;
        }

        // Try to login
        try {
            const loginData = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    telegramId: user.id.toString(),
                    username: user.username || `user${user.id}`
                })
            });

            authToken = loginData.data.token;
            currentUser = loginData.data.user;
            return true;
        } catch (loginError) {
            // If login fails, register
            const registerData = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    telegramId: user.id.toString(),
                    username: user.username || `user${user.id}`,
                    firstName: user.first_name || '',
                    lastName: user.last_name || '',
                    photoUrl: user.photo_url || ''
                })
            });

            authToken = registerData.data.token;
            currentUser = registerData.data.user;
            return true;
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return false;
    }
}

// Load Stories
async function loadStories() {
    try {
        const response = await apiRequest('/stories');
        const stories = response.data.stories || [];

        const storiesGrid = document.getElementById('stories-grid');
        storiesGrid.innerHTML = '';

        if (stories.length === 0) {
            storiesGrid.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <circle cx="9" cy="10" r="1" fill="currentColor"/>
                        <circle cx="15" cy="10" r="1" fill="currentColor"/>
                    </svg>
                    <h3>No stories yet</h3>
                    <p>Be the first to create a story!</p>
                </div>
            `;
            return;
        }

        stories.forEach(story => {
            const storyCard = createStoryCard(story);
            storiesGrid.appendChild(storyCard);
        });
    } catch (error) {
        console.error('Error loading stories:', error);
    }
}

function createStoryCard(story) {
    const card = document.createElement('div');
    card.className = 'story-card';
    card.onclick = () => viewStory(story);

    let content = '';
    if (story.type === 'image' && story.mediaUrl) {
        content = `<img src="${story.mediaUrl}" alt="Story">`;
    } else if (story.type === 'video' && story.mediaUrl) {
        content = `<video src="${story.mediaUrl}" muted></video>`;
    } else if (story.type === 'text') {
        content = `<div style="background-color: ${story.backgroundColor}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 20px; color: white; font-size: 18px; text-align: center;">${story.textContent || story.caption || 'Story'}</div>`;
    }

    card.innerHTML = `
        ${content}
        <div class="story-overlay">
            <div class="user-name">${story.userId.username || story.userId.firstName || 'User'}</div>
            <div class="story-time">${formatTime(story.createdAt)}</div>
        </div>
    `;

    return card;
}

function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// View Story
async function viewStory(story) {
    const modal = document.getElementById('viewModal');
    const storyMedia = document.getElementById('storyMedia');

    // Set user info
    document.querySelector('.story-viewer .user-name').textContent = story.userId.username || story.userId.firstName || 'User';
    document.querySelector('.story-viewer .story-time').textContent = formatTime(story.createdAt);

    // Set media
    if (story.type === 'image' && story.mediaUrl) {
        storyMedia.innerHTML = `<img src="${story.mediaUrl}" alt="Story">`;
    } else if (story.type === 'video' && story.mediaUrl) {
        storyMedia.innerHTML = `<video src="${story.mediaUrl}" controls autoplay></video>`;
    } else if (story.type === 'text') {
        storyMedia.innerHTML = `<div style="background-color: ${story.backgroundColor}; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px; color: white; font-size: 24px; text-align: center;">${story.textContent || story.caption}</div>`;
    }

    // Set stats
    document.getElementById('likeCount').textContent = story.likesCount || 0;
    document.getElementById('viewCount').textContent = story.viewsCount || 0;

    // Check if liked
    const likeBtn = document.getElementById('likeBtn');
    const isLiked = story.likes && story.likes.some(like => like.userId === currentUser.id);
    likeBtn.classList.toggle('liked', isLiked);

    // Record view
    try {
        await apiRequest(`/stories/${story._id}/view`, { method: 'POST' });
    } catch (error) {
        console.error('Error recording view:', error);
    }

    // Setup like button
    likeBtn.onclick = async () => {
        try {
            await apiRequest(`/stories/${story._id}/like`, { method: 'POST' });
            const newCount = parseInt(document.getElementById('likeCount').textContent);
            document.getElementById('likeCount').textContent = isLiked ? newCount - 1 : newCount + 1;
            likeBtn.classList.toggle('liked');
            tg.HapticFeedback.impactOccurred('light');
        } catch (error) {
            console.error('Error liking story:', error);
        }
    };

    modal.classList.remove('hidden');
}

// Create Story Modal
let selectedFile = null;
let storyType = 'image';

document.getElementById('createStoryBtn').onclick = () => {
    document.getElementById('createModal').classList.remove('hidden');
};

document.getElementById('closeModal').onclick = () => {
    document.getElementById('createModal').classList.add('hidden');
    resetCreateForm();
};

document.getElementById('closeViewModal').onclick = () => {
    document.getElementById('viewModal').classList.add('hidden');
};

// Story type selector
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        storyType = btn.dataset.type;

        // Show/hide sections
        if (storyType === 'text') {
            document.getElementById('mediaUpload').classList.add('hidden');
            document.getElementById('textInput').classList.remove('hidden');
        } else {
            document.getElementById('mediaUpload').classList.remove('hidden');
            document.getElementById('textInput').classList.add('hidden');

            const fileInput = document.getElementById('fileInput');
            fileInput.accept = storyType === 'image' ? 'image/*' : 'video/*';
        }
    };
});

// File upload
document.getElementById('fileInput').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    selectedFile = file;
    const preview = document.getElementById('preview');
    const reader = new FileReader();

    reader.onload = (event) => {
        if (storyType === 'image') {
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        } else {
            preview.innerHTML = `<video src="${event.target.result}" controls></video>`;
        }
        preview.classList.remove('hidden');
    };

    reader.readAsDataURL(file);
};

// Publish Story
document.getElementById('publishBtn').onclick = async () => {
    tg.MainButton.showProgress();

    try {
        const formData = new FormData();

        if (storyType === 'text') {
            const text = document.getElementById('storyText').value;
            if (!text.trim()) {
                tg.showAlert('Please enter some text');
                return;
            }
            formData.append('type', 'text');
            formData.append('textContent', text);
            formData.append('backgroundColor', document.getElementById('bgColor').value);
        } else {
            if (!selectedFile) {
                tg.showAlert('Please select a file');
                return;
            }
            formData.append('type', storyType);
            formData.append('file', selectedFile);
        }

        const caption = document.getElementById('caption').value;
        if (caption) formData.append('caption', caption);

        formData.append('visibility', document.getElementById('visibility').value);

        const response = await fetch(`${API_BASE_URL}/stories/create`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to create story');
        }

        tg.showAlert('Story published successfully!');
        document.getElementById('createModal').classList.add('hidden');
        resetCreateForm();
        await loadStories();

    } catch (error) {
        console.error('Error publishing story:', error);
        tg.showAlert(error.message || 'Failed to publish story');
    } finally {
        tg.MainButton.hideProgress();
    }
};

function resetCreateForm() {
    selectedFile = null;
    document.getElementById('fileInput').value = '';
    document.getElementById('preview').innerHTML = '';
    document.getElementById('preview').classList.add('hidden');
    document.getElementById('storyText').value = '';
    document.getElementById('caption').value = '';
    document.getElementById('bgColor').value = '#0088CC';
    document.getElementById('visibility').value = 'public';
}

// Initialize App
async function initApp() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('main-content').classList.add('hidden');

    const authenticated = await authenticateUser();

    if (authenticated) {
        await loadStories();
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');

        // Setup refresh
        setInterval(loadStories, 30000); // Refresh every 30 seconds
    } else {
        tg.showAlert('Authentication failed. Please try again.');
    }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
