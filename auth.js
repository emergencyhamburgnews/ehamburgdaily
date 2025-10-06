// Firebase Authentication System - Regular JavaScript

// Initialize authentication
let auth;
let googleProvider;
let currentUser = null;
let authInitialized = false;

// Initialize auth when Firebase is ready
function initializeAuth() {
    if (typeof window.auth === 'undefined') {
        console.error('Firebase auth not initialized');
        return;
    }
    
    auth = window.auth;
    googleProvider = window.googleProvider;
    
    if (!auth || !googleProvider) {
        console.error('Firebase auth or Google provider not found');
        return;
    }
    
    // Configure Google provider
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    // Listen for auth state changes using Firebase auth from window
    if (auth && auth.onAuthStateChanged) {
        auth.onAuthStateChanged((user) => {
            currentUser = user;
            updateAuthUI(user);
            console.log('Auth state changed:', user ? 'User signed in' : 'User signed out');
        });
    } else {
        console.error('Firebase Auth onAuthStateChanged not available');
    }
    
    authInitialized = true;
    console.log('🔐 Authentication system initialized');
}

// Update UI based on authentication state
function updateAuthUI(user) {
    const loginButtons = document.querySelectorAll('.auth-login-btn');
    const userProfiles = document.querySelectorAll('.auth-user-profile');
    const userAvatars = document.querySelectorAll('.auth-user-avatar');
    const userNames = document.querySelectorAll('.auth-user-name');
    const userEmails = document.querySelectorAll('.auth-user-email');
    
    // Settings page specific elements
    const authSignedOut = document.getElementById('auth-signed-out');
    const authSignedIn = document.getElementById('auth-signed-in');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    console.log('🔄 Updating auth UI, user:', user ? 'signed in' : 'signed out');
    console.log('📊 Found', loginButtons.length, 'login buttons and', userProfiles.length, 'user profiles');
    
    if (user) {
        // User is signed in
        loginButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        userProfiles.forEach(profile => {
            profile.style.display = 'flex';
        });
        
        // Update user info
        const displayName = user.displayName || 'User';
        const email = user.email || '';
        const photoURL = user.photoURL || generateAvatarURL(displayName);
        
        userAvatars.forEach(avatar => {
            if (avatar.tagName === 'IMG') {
                avatar.src = photoURL;
                avatar.alt = displayName;
            } else {
                avatar.style.backgroundImage = `url(${photoURL})`;
            }
        });
        
        userNames.forEach(name => {
            name.textContent = displayName;
        });
        
        userEmails.forEach(emailEl => {
            emailEl.textContent = email;
        });
        
        // Update settings page specific elements
        if (authSignedOut) authSignedOut.style.display = 'none';
        if (authSignedIn) authSignedIn.style.display = 'block';
        if (profileName) profileName.textContent = displayName;
        if (profileEmail) profileEmail.textContent = email;
        if (profileAvatar) profileAvatar.src = photoURL;
        
    } else {
        // User is signed out
        loginButtons.forEach(btn => {
            // Show login buttons with correct display style
            if (btn.classList.contains('auth-login-btn-desktop')) {
                btn.style.display = 'flex';
            } else if (btn.classList.contains('auth-login-btn-mobile')) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'block';
            }
        });
        
        userProfiles.forEach(profile => {
            profile.style.display = 'none';
        });
        
        // Update settings page specific elements
        if (authSignedOut) authSignedOut.style.display = 'block';
        if (authSignedIn) authSignedIn.style.display = 'none';
    }
}

// Generate avatar URL from initials
function generateAvatarURL(name) {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const colors = ['#FF6B35', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'];
    const color = colors[name.length % colors.length];
    
    const svg = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="${color}"/>
            <text x="20" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="600">${initials}</text>
        </svg>
    `;
    
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Sign in with Google
async function signInWithGoogle() {
    if (!auth || !googleProvider) {
        console.error('Auth not initialized');
        showMessage('error', 'Authentication system not ready. Please refresh the page.');
        return;
    }
    
    try {
        showLoadingState('Signing in with Google...');
        
        // Import Firebase auth functions dynamically
        const { signInWithPopup } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log('Google sign in successful:', user.email);
        hideLoginModal();
        showMessage('success', `Welcome, ${user.displayName}!`);
        
    } catch (error) {
        console.error('Google sign in error:', error);
        let message = 'Failed to sign in with Google';
        
        if (error.code === 'auth/popup-closed-by-user') {
            message = 'Sign in was cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            message = 'Popup was blocked. Please allow popups for this site';
        }
        
        showMessage('error', message);
    } finally {
        hideLoadingState();
    }
}

// Sign in with email and password
async function signInWithEmail(email, password) {
    if (!auth) {
        console.error('Auth not initialized');
        showMessage('error', 'Authentication system not ready. Please refresh the page.');
        return;
    }
    
    try {
        showLoadingState('Signing in...');
        
        // Import Firebase auth functions dynamically
        const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        console.log('Email sign in successful:', user.email);
        hideLoginModal();
        showMessage('success', `Welcome back, ${user.displayName || 'User'}!`);
        
    } catch (error) {
        console.error('Email sign in error:', error);
        let message = 'Failed to sign in';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later';
                break;
        }
        
        showMessage('error', message);
    } finally {
        hideLoadingState();
    }
}

// Sign up with email and password
async function signUpWithEmail(email, password, displayName) {
    if (!auth) {
        console.error('Auth not initialized');
        showMessage('error', 'Authentication system not ready. Please refresh the page.');
        return;
    }
    
    try {
        showLoadingState('Creating account...');
        
        // Import Firebase auth functions dynamically
        const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        
        // Update display name
        if (displayName) {
            await updateProfile(user, {
                displayName: displayName
            });
        }
        
        console.log('Account created:', user.email);
        hideLoginModal();
        showMessage('success', `Welcome to EHAMBURG DAILY, ${displayName || 'User'}!`);
        
    } catch (error) {
        console.error('Sign up error:', error);
        let message = 'Failed to create account';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters';
                break;
        }
        
        showMessage('error', message);
    } finally {
        hideLoadingState();
    }
}

// Sign out
async function signOutUser() {
    if (!auth) {
        console.error('Auth not initialized');
        showMessage('error', 'Authentication system not ready. Please refresh the page.');
        return;
    }
    
    try {
        // Import Firebase auth functions dynamically
        const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        await signOut(auth);
        console.log('User signed out');
        showMessage('success', 'Signed out successfully');
    } catch (error) {
        console.error('Sign out error:', error);
        showMessage('error', 'Failed to sign out');
    }
}

// Show loading state
function showLoadingState(message = 'Loading...') {
    const loadingElements = document.querySelectorAll('.auth-loading');
    const loadingMessages = document.querySelectorAll('.auth-loading-message');
    
    loadingElements.forEach(el => el.style.display = 'flex');
    loadingMessages.forEach(el => el.textContent = message);
}

// Hide loading state
function hideLoadingState() {
    const loadingElements = document.querySelectorAll('.auth-loading');
    loadingElements.forEach(el => el.style.display = 'none');
}

// Show message
function showMessage(type, message, duration = 5000) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.innerHTML = `
        <div class="auth-message-content">
            <div class="auth-message-icon">
                ${type === 'success' ? 
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20,6 9,17 4,12"></polyline></svg>' :
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>'
                }
            </div>
            <span>${message}</span>
            <button class="auth-message-close" onclick="this.parentElement.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    `;
    
    // Add to page
    let container = document.getElementById('auth-messages');
    if (!container) {
        container = document.createElement('div');
        container.id = 'auth-messages';
        container.className = 'auth-messages-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(messageEl);
    
    // Auto remove
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, duration);
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is signed in
function isSignedIn() {
    return currentUser !== null;
}

// Initialize auth UI immediately (before Firebase loads)
function initializeAuthUIImmediate() {
    // Show login buttons immediately
    const loginButtons = document.querySelectorAll('.auth-login-btn');
    const userProfiles = document.querySelectorAll('.auth-user-profile');
    
    console.log('⚡ Immediate auth UI init - showing login buttons');
    
    loginButtons.forEach(btn => {
        if (btn.classList.contains('auth-login-btn-desktop')) {
            btn.style.display = 'flex';
        } else if (btn.classList.contains('auth-login-btn-mobile')) {
            btn.style.display = 'flex';
        } else {
            btn.style.display = 'block';
        }
    });
    
    userProfiles.forEach(profile => {
        profile.style.display = 'none';
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show login buttons immediately
    initializeAuthUIImmediate();
    
    // Wait for Firebase to be ready
    const checkFirebase = () => {
        if (window.auth && window.googleProvider) {
            initializeAuth();
        } else {
            setTimeout(checkFirebase, 100);
        }
    };
    checkFirebase();
});

// Export functions for global use
window.authSystem = {
    showLoginModal,
    hideLoginModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOutUser,
    getCurrentUser,
    isSignedIn,
    showMessage
};

console.log('🔐 Auth system loaded');