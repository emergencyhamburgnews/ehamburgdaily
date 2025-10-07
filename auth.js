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
            if (user) {
                console.log('👤 User signed in:', {
                    name: user.displayName,
                    email: user.email,
                    uid: user.uid,
                    photoURL: user.photoURL
                });
            } else {
                console.log('🚪 User signed out');
            }
            updateAuthUI(user);
        });
    } else {
        console.error('Firebase Auth onAuthStateChanged not available');
    }
    
    authInitialized = true;
    console.log('🔐 Authentication system initialized');
}

// Update UI based on authentication state
function updateAuthUI(user) {
    // Only target mobile elements and settings page - ignore desktop profile
    const mobileLoginButtons = document.querySelectorAll('.auth-login-btn-mobile');
    const mobileUserProfiles = document.querySelectorAll('.auth-user-profile-mobile');
    const mobileUserAvatars = document.querySelectorAll('.mobile-user-compact .auth-user-avatar');
    const mobileUserNames = document.querySelectorAll('.mobile-user-info .auth-user-name');
    const mobileUserEmails = document.querySelectorAll('.mobile-user-info .auth-user-email');
    
    // Settings page specific elements
    const authSignedOut = document.getElementById('auth-signed-out');
    const authSignedIn = document.getElementById('auth-signed-in');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profileAvatar = document.getElementById('profile-avatar');
    
    console.log('🔄 Updating auth UI, user:', user ? 'signed in' : 'signed out');
    console.log('📊 Found', mobileLoginButtons.length, 'mobile login buttons and', mobileUserProfiles.length, 'mobile user profiles');
    console.log('📊 Mobile elements found:');
    console.log('  - Avatars:', mobileUserAvatars.length);
    console.log('  - Names:', mobileUserNames.length);
    console.log('  - Emails:', mobileUserEmails.length);
    
    // Debug: log the actual elements found
    mobileUserAvatars.forEach((el, i) => console.log(`  Avatar ${i}:`, el));
    mobileUserNames.forEach((el, i) => console.log(`  Name ${i}:`, el));
    mobileUserEmails.forEach((el, i) => console.log(`  Email ${i}:`, el));
    
    // Test broader selectors
    const testAvatars = document.querySelectorAll('.auth-user-avatar');
    const testNames = document.querySelectorAll('.auth-user-name');
    const testEmails = document.querySelectorAll('.auth-user-email');
    console.log('🔭 Broader search results:');
    console.log('  - All avatars:', testAvatars.length);
    console.log('  - All names:', testNames.length);
    console.log('  - All emails:', testEmails.length);
    
    if (user) {
        // User is signed in - update mobile profile only
        mobileLoginButtons.forEach(btn => {
            btn.style.display = 'none';
        });
        
        mobileUserProfiles.forEach(profile => {
            profile.style.display = 'block';
        });
        
        // Update user info
        const displayName = user.displayName || 'User';
        const email = user.email || '';
        const photoURL = user.photoURL || generateAvatarURL(displayName);
        
        mobileUserAvatars.forEach((avatar, i) => {
            console.log(`🔄 Updating avatar ${i} with:`, photoURL);
            if (avatar.tagName === 'IMG') {
                avatar.src = photoURL;
                avatar.alt = displayName;
            } else {
                avatar.style.backgroundImage = `url(${photoURL})`;
            }
        });
        
        mobileUserNames.forEach((name, i) => {
            console.log(`🔄 Updating name ${i} with:`, displayName);
            name.textContent = displayName;
        });
        
        mobileUserEmails.forEach((emailEl, i) => {
            console.log(`🔄 Updating email ${i} with:`, email);
            emailEl.textContent = email;
        });
        
        // Update settings page specific elements
        if (authSignedOut) authSignedOut.style.display = 'none';
        if (authSignedIn) authSignedIn.style.display = 'block';
        if (profileName) profileName.textContent = displayName;
        if (profileEmail) profileEmail.textContent = email;
        if (profileAvatar) profileAvatar.src = photoURL;
        
    } else {
        // User is signed out - show mobile login button only
        mobileLoginButtons.forEach(btn => {
            btn.style.display = 'flex';
        });
        
        mobileUserProfiles.forEach(profile => {
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
    
    console.log('🚀 Starting account creation for:', email);
    
    // Validate name first
    const nameValidation = validateName(displayName);
    if (!nameValidation.valid) {
        showMessage('error', nameValidation.message);
        return;
    }
    
    try {
        showLoadingState('Checking email availability...');
        
        // Check if email already exists
        const emailExists = await checkEmailExists(email);
        if (emailExists) {
            showMessage('error', 'An account with this email already exists. Please sign in instead.');
            hideLoadingState();
            return;
        }
        
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
    // Show mobile login buttons only - desktop profile is completely hidden
    const mobileLoginButtons = document.querySelectorAll('.auth-login-btn-mobile');
    const mobileUserProfiles = document.querySelectorAll('.auth-user-profile-mobile');
    
    console.log('⚡ Immediate auth UI init - showing mobile login buttons only');
    
    mobileLoginButtons.forEach(btn => {
        btn.style.display = 'flex';
    });
    
    mobileUserProfiles.forEach(profile => {
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

// Manual test function for debugging
function testMobileProfileUpdate() {
    console.log('🧪 Testing mobile profile update manually...');
    const testUser = {
        displayName: 'Test User',
        email: 'test@example.com',
        photoURL: null
    };
    updateAuthUI(testUser);
}

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
    showMessage,
    testMobileProfileUpdate  // Add test function
};

console.log('🔐 Auth system loaded');

// ========================================
// VALIDATION FUNCTIONS
// ========================================

// Validate user name according to rules
function validateName(name) {
    // List of inappropriate words (expand as needed)
    const inappropriateWords = [
        'admin', 'administrator', 'mod', 'moderator', 'fuck', 'shit', 'ass', 'damn', 'hell',
        'bitch', 'bastard', 'crap', 'piss', 'sex', 'porn', 'nude', 'naked', 'dick', 'cock',
        'pussy', 'vagina', 'penis', 'boob', 'breast', 'nazi', 'hitler', 'terrorist', 'kill',
        'murder', 'death', 'suicide', 'drug', 'cocaine', 'heroin', 'weed', 'marijuana',
        'spam', 'scam', 'hack', 'cheat', 'bot', 'fake', 'test', 'null', 'undefined'
    ];
    
    if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Name is required' };
    }
    
    const trimmedName = name.trim();
    
    // Check for numbers
    if (/\d/.test(trimmedName)) {
        return { valid: false, message: 'Name cannot contain numbers' };
    }
    
    // Check for special characters (allow only letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(trimmedName)) {
        return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
    
    // Split name into words
    const words = trimmedName.split(/\s+/).filter(word => word.length > 0);
    
    // Check for maximum 2 names
    if (words.length > 2) {
        return { valid: false, message: 'Please enter maximum 2 names (e.g., "John Smith")' };
    }
    
    // Check for minimum 1 name
    if (words.length === 0) {
        return { valid: false, message: 'Please enter at least one name' };
    }
    
    // Check each word for inappropriate content
    for (let word of words) {
        const lowerWord = word.toLowerCase();
        for (let inappropriate of inappropriateWords) {
            if (lowerWord.includes(inappropriate)) {
                return { valid: false, message: 'Please use an appropriate name' };
            }
        }
        
        // Check minimum word length
        if (word.length < 2) {
            return { valid: false, message: 'Each name must be at least 2 characters long' };
        }
    }
    
    return { valid: true, message: '' };
}

// Check if email is already in use
async function checkEmailExists(email) {
    try {
        // Import Firebase auth functions
        const { fetchSignInMethodsForEmail } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        const signInMethods = await fetchSignInMethodsForEmail(auth, email);
        return signInMethods.length > 0;
    } catch (error) {
        console.error('Error checking email:', error);
        // If there's an error checking, assume email doesn't exist to allow signup attempt
        return false;
    }
}
