// Debug script for Firebase banner save functionality
// Run this in the browser console to diagnose banner save issues

console.log('🔍 Starting Firebase Banner Debug...');

// Test Firebase Connection
async function testFirebaseConnection() {
    console.log('=== TESTING FIREBASE CONNECTION ===');
    
    try {
        // Check if Firebase globals are available
        console.log('Checking Firebase globals:');
        console.log('  db:', typeof db !== 'undefined' ? '✅ Available' : '❌ Missing');
        console.log('  collection:', typeof collection !== 'undefined' ? '✅ Available' : '❌ Missing');
        console.log('  getDocs:', typeof getDocs !== 'undefined' ? '✅ Available' : '❌ Missing');
        console.log('  addDoc:', typeof addDoc !== 'undefined' ? '✅ Available' : '❌ Missing');
        console.log('  updateDoc:', typeof updateDoc !== 'undefined' ? '✅ Available' : '❌ Missing');
        
        if (typeof db === 'undefined') {
            console.error('❌ Firebase db not available. Check Firebase initialization.');
            return false;
        }
        
        // Test basic Firestore read operation
        console.log('\n📖 Testing Firestore read access...');
        const noticeRef = collection(db, 'notice');
        const noticeSnapshot = await getDocs(noticeRef);
        
        console.log('✅ Read access successful!');
        console.log('  Collection: notice');
        console.log('  Documents found:', noticeSnapshot.size);
        console.log('  Is empty:', noticeSnapshot.empty);
        
        if (!noticeSnapshot.empty) {
            noticeSnapshot.forEach(doc => {
                console.log('  Document ID:', doc.id);
                console.log('  Document data:', doc.data());
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Firebase connection test failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Provide specific error guidance
        if (error.code === 'permission-denied') {
            console.error('🚨 PERMISSION DENIED: Check Firebase security rules for the "notice" collection');
        } else if (error.code === 'unavailable') {
            console.error('🚨 SERVICE UNAVAILABLE: Check internet connection and Firebase project status');
        } else if (error.code === 'unauthenticated') {
            console.error('🚨 UNAUTHENTICATED: User needs to sign in first');
        }
        
        return false;
    }
}

// Test Firebase Write Operation (simulated)
async function testFirebaseWrite() {
    console.log('\n=== TESTING FIREBASE WRITE ACCESS ===');
    
    try {
        if (typeof db === 'undefined' || typeof collection === 'undefined') {
            console.error('❌ Firebase not available for write test');
            return false;
        }
        
        // Check authentication state
        if (typeof auth !== 'undefined' && auth.currentUser) {
            console.log('👤 User authenticated:', auth.currentUser.email);
        } else {
            console.log('🚫 User not authenticated (this might be the issue!)');
        }
        
        console.log('📝 Testing write access to notice collection...');
        const noticeRef = collection(db, 'notice');
        const testData = {
            enabled: false,
            text: 'Test banner - ' + new Date().toISOString(),
            lastUpdated: new Date(),
            isTest: true
        };
        
        console.log('Test data to write:', testData);
        
        // Try to add a test document
        const docRef = await addDoc(noticeRef, testData);
        console.log('✅ Write test successful! Document ID:', docRef.id);
        
        // Clean up the test document
        if (typeof deleteDoc !== 'undefined') {
            await deleteDoc(doc(db, 'notice', docRef.id));
            console.log('🧹 Test document cleaned up');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Firebase write test failed:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        // Provide specific guidance
        if (error.code === 'permission-denied') {
            console.error('🚨 WRITE PERMISSION DENIED:');
            console.error('   - Check Firebase security rules');
            console.error('   - Make sure user is authenticated');
            console.error('   - Verify user has write permissions to "notice" collection');
        }
        
        return false;
    }
}

// Check Firebase Security Rules Compliance
function analyzeSecurityRequirements() {
    console.log('\n=== ANALYZING SECURITY REQUIREMENTS ===');
    
    // Check authentication
    if (typeof auth !== 'undefined') {
        console.log('Authentication service:', auth ? '✅ Available' : '❌ Missing');
        
        if (auth && auth.currentUser) {
            console.log('Current user:', auth.currentUser.email);
            console.log('User verified:', auth.currentUser.emailVerified);
            console.log('User ID:', auth.currentUser.uid);
        } else {
            console.log('🚫 No user currently signed in');
            console.log('💡 TIP: Try signing in first, then test banner save');
        }
    } else {
        console.log('❌ Firebase Auth not available');
    }
    
    // Suggest common security rule patterns
    console.log('\n📋 Common Firestore security rules for notice collection:');
    console.log('  Option 1 (Admin only):');
    console.log('    allow read, write: if request.auth != null && request.auth.token.admin == true;');
    console.log('  Option 2 (Any authenticated user):');
    console.log('    allow read, write: if request.auth != null;');
    console.log('  Option 3 (Public read, admin write):');
    console.log('    allow read: if true;');
    console.log('    allow write: if request.auth != null && request.auth.token.admin == true;');
}

// Main debug function
async function debugBannerIssue() {
    console.log('🚀 Starting comprehensive banner debug...\n');
    
    // Step 1: Test Firebase connection
    const connectionOk = await testFirebaseConnection();
    
    if (!connectionOk) {
        console.log('\n❌ Firebase connection failed. Cannot proceed with further tests.');
        return;
    }
    
    // Step 2: Analyze security requirements
    analyzeSecurityRequirements();
    
    // Step 3: Test write operations
    await testFirebaseWrite();
    
    console.log('\n=== DEBUG SUMMARY ===');
    console.log('1. Check the error messages above');
    console.log('2. If you see "permission-denied", check Firebase security rules');
    console.log('3. If you see "unauthenticated", sign in first');
    console.log('4. If tests pass, the issue might be elsewhere');
    
    console.log('\n💡 To fix banner save issues:');
    console.log('1. Go to Firebase Console > Firestore > Rules');
    console.log('2. Make sure "notice" collection allows writes');
    console.log('3. Consider authentication requirements');
    console.log('4. Test with different user permissions');
}

// Quick fix suggestions
function suggestQuickFixes() {
    console.log('\n=== QUICK FIX SUGGESTIONS ===');
    console.log('1. 🔑 Sign in first: Click the sign in button in mobile menu');
    console.log('2. 🛡️ Check Firebase rules: Go to Firebase Console > Firestore > Rules');
    console.log('3. 🌐 Check internet: Ensure stable connection');
    console.log('4. 🔄 Clear cache: Try clearing browser cache and cookies');
    console.log('5. 📱 Test on different device: Try on desktop vs mobile');
}

// Export functions for console use
window.debugBannerIssue = debugBannerIssue;
window.testFirebaseConnection = testFirebaseConnection;
window.testFirebaseWrite = testFirebaseWrite;
window.suggestQuickFixes = suggestQuickFixes;

console.log('🛠️ Debug tools loaded! Run these commands in console:');
console.log('  debugBannerIssue() - Full diagnosis');
console.log('  testFirebaseConnection() - Test read access');
console.log('  testFirebaseWrite() - Test write access');
console.log('  suggestQuickFixes() - Quick fix suggestions');

// Auto-run basic connection test
console.log('\n🔄 Running automatic connection test...');
testFirebaseConnection();