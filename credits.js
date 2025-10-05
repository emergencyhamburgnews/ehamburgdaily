// Credits Page - Roblox Integration
document.addEventListener('DOMContentLoaded', function() {
    
    // Developer team data
    const developers = [
        {
            name: 'Felix',
            roles: ['Lead Programmer', 'Game Designer', 'UI/UX Designer'],
            robloxId: 1285805240,
            robloxUsername: null // Will be fetched
        },
        {
            name: 'Erwin',
            roles: ['Lead Map Designer', 'Lead 3D Modeller'],
            robloxId: 999920009,
            robloxUsername: null
        },
        {
            name: 'Stormi',
            roles: ['Community Manager'],
            robloxId: 396309977,
            robloxUsername: null
        },
        {
            name: 'Jay',
            roles: ['Head of Development', 'Programmer'],
            robloxId: 1800687521,
            robloxUsername: null
        },
        {
            name: 'Millian',
            roles: ['Programmer'],
            robloxId: 135935674,
            robloxUsername: null
        },
        {
            name: 'DTADW',
            roles: ['Programmer'],
            robloxId: 1254605274,
            robloxUsername: null
        },
        {
            name: 'Kuppel',
            roles: ['Social Media Manager', 'Marketing Specialist'],
            robloxId: 1949352584,
            robloxUsername: null
        }
    ];

    // Initialize the credits page
    initCreditsPage();

    async function initCreditsPage() {
        console.log('Initializing Credits page...');
        
        // Show loading indicator
        showLoadingIndicator();
        
        // Load developer profiles
        await loadDeveloperProfiles();
        
        // Hide loading indicator
        hideLoadingIndicator();
    }

    function showLoadingIndicator() {
        const loadingElement = document.getElementById('profiles-loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    function hideLoadingIndicator() {
        const loadingElement = document.getElementById('profiles-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    async function loadDeveloperProfiles() {
        const devGrid = document.getElementById('dev-grid');
        if (!devGrid) return;

        console.log('Loading developer profiles...');

        // Load profiles with a delay to avoid rate limiting
        for (let i = 0; i < developers.length; i++) {
            const developer = developers[i];
            
            try {
                // Add delay between requests to avoid rate limiting
                if (i > 0) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                const profileData = await fetchRobloxProfile(developer.robloxId);
                developer.robloxUsername = profileData.username;
                developer.avatarUrl = profileData.avatarUrl;
                developer.isOnline = profileData.isOnline;
                developer.statusInfo = profileData.statusInfo; // Store detailed status
                developer.profileData = profileData;
                
                console.log(`Loaded profile for ${developer.name}:`, profileData);
            } catch (error) {
                console.error(`Failed to load profile for ${developer.name}:`, error);
                developer.profileData = { error: true };
            }
            
            // Create and append developer card
            const devCard = createDeveloperCard(developer);
            devGrid.appendChild(devCard);
        }
    }

    async function fetchRobloxProfile(userId) {
        console.log(`🔍 Fetching profile for user ${userId}...`);
        
        let userData = null;
        let avatarUrl = null;
        let isOnline = 'unknown';
        
        // Step 1: Get user data using working proxy
        try {
            const userProxyUrl = `https://cors-anywhere.herokuapp.com/https://users.roblox.com/v1/users/${userId}`;
            const userResponse = await fetch(userProxyUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (userResponse.ok) {
                userData = await userResponse.json();
                console.log(`✅ Got user data: ${userData.name}`);
            } else {
                throw new Error('User API failed');
            }
        } catch (error) {
            // Fallback method using different proxy
            try {
                const fallbackUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://users.roblox.com/v1/users/${userId}`)}`;
                const fallbackResponse = await fetch(fallbackUrl);
                
                if (fallbackResponse.ok) {
                    const fallbackData = await fallbackResponse.json();
                    userData = JSON.parse(fallbackData.contents);
                    console.log(`✅ Got user data via fallback: ${userData.name}`);
                }
            } catch (fallbackError) {
                console.log(`⚠️ All user data methods failed for ${userId}`);
                userData = getFallbackUserData(userId);
            }
        }
        
        // Step 2: Get avatar using direct image URL (this usually works)
        try {
            // Try multiple avatar endpoints that work
            const avatarMethods = [
                `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=100&height=100&format=png`,
                `https://www.roblox.com/bust-thumbnail/image?userId=${userId}&width=100&height=100&format=png`,
                `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=100x100&format=Png&isCircular=false`
            ];
            
            for (const method of avatarMethods) {
                try {
                    if (method.includes('thumbnails.roblox.com')) {
                        // Use proxy for API endpoint
                        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(method)}`;
                        const response = await fetch(proxyUrl);
                        if (response.ok) {
                            const data = await response.json();
                            const parsed = JSON.parse(data.contents);
                            if (parsed.data && parsed.data[0] && parsed.data[0].imageUrl) {
                                avatarUrl = parsed.data[0].imageUrl;
                                console.log(`✅ Got avatar via API: ${userId}`);
                                break;
                            }
                        }
                    } else {
                        // Direct image URL - test if accessible
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        
                        await new Promise((resolve, reject) => {
                            img.onload = () => {
                                avatarUrl = method;
                                console.log(`✅ Got avatar via direct URL: ${userId}`);
                                resolve();
                            };
                            img.onerror = reject;
                            img.src = method;
                            
                            // Timeout after 3 seconds
                            setTimeout(reject, 3000);
                        });
                        
                        if (avatarUrl) break;
                    }
                } catch (methodError) {
                    console.log(`Avatar method failed: ${method}`);
                }
            }
            
            if (!avatarUrl) {
                console.log(`⚠️ No avatar found for ${userId}`);
            }
        } catch (avatarError) {
            console.log(`⚠️ Avatar fetch failed for ${userId}:`, avatarError.message);
        }
        
        // Step 3: Get REAL status using multiple reliable methods
        let statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
        
        console.log(`🔍 Getting REAL status for ${userId}...`);
        
        // Method 1: Try RoProxy (dedicated Roblox proxy service)
        try {
            const roProxyUrl = `https://users.roproxy.com/v1/users/${userId}`;
            const roProxyResponse = await fetch(roProxyUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            if (roProxyResponse.ok) {
                const userData = await roProxyResponse.json();
                console.log(`✅ RoProxy user data for ${userId}:`, userData);
                
                // Try to get presence from user data
                if (userData && userData.presence) {
                    const presence = userData.presence.toLowerCase();
                    if (presence.includes('offline')) {
                        statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
                    } else if (presence.includes('studio')) {
                        statusInfo = { type: 'online', name: 'Studio', color: 'online' };
                    } else if (presence.includes('game') || presence.includes('playing')) {
                        statusInfo = { type: 'online', name: 'In Game', color: 'online' };
                    } else if (presence.includes('online')) {
                        statusInfo = { type: 'online', name: 'Online', color: 'online' };
                    }
                    console.log(`✅ Status from RoProxy: ${statusInfo.name}`);
                    throw 'success'; // Break out of try-catch chain
                }
            }
        } catch (error) {
            if (error === 'success') throw error; // Re-throw success
            console.log(`RoProxy method failed, trying next...`);
        }
        
        // Method 2: Try direct Roblox presence API (sometimes works)
        try {
            const presenceResponse = await fetch('https://presence.roblox.com/v1/presence/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ userIds: [parseInt(userId)] })
            });
            
            if (presenceResponse.ok) {
                const presenceData = await presenceResponse.json();
                console.log(`✅ Direct presence API success for ${userId}:`, presenceData);
                
                if (presenceData.userPresences && presenceData.userPresences[0]) {
                    const presence = presenceData.userPresences[0];
                    const presenceType = presence.userPresenceType;
                    const lastLocation = presence.lastLocation || '';
                    
                    switch (presenceType) {
                        case 0:
                            statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
                            break;
                        case 1:
                            statusInfo = { type: 'online', name: 'Online', color: 'online' };
                            break;
                        case 2:
                            if (lastLocation && lastLocation !== 'Website') {
                                statusInfo = { type: 'online', name: `In Game: ${lastLocation}`, color: 'online' };
                            } else {
                                statusInfo = { type: 'online', name: 'In Game', color: 'online' };
                            }
                            break;
                        case 3:
                            statusInfo = { type: 'online', name: 'Studio', color: 'online' };
                            break;
                        default:
                            statusInfo = { type: 'unknown', name: 'Unknown', color: 'unknown' };
                    }
                    console.log(`✅ Status from direct API: ${statusInfo.name}`);
                    throw 'success'; // Break out of try-catch chain
                }
            }
        } catch (error) {
            if (error === 'success') throw error; // Re-throw success
            console.log(`Direct API failed, trying proxy...`);
        }
        
        // Method 3: Try CORS proxy for presence API
        try {
            const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://presence.roblox.com/v1/presence/users');
            const proxyResponse = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [parseInt(userId)] })
            });
            
            if (proxyResponse.ok) {
                const presenceData = await proxyResponse.json();
                console.log(`✅ Proxy API success for ${userId}:`, presenceData);
                
                if (presenceData.userPresences && presenceData.userPresences[0]) {
                    const presence = presenceData.userPresences[0];
                    switch (presence.userPresenceType) {
                        case 0:
                            statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
                            break;
                        case 1:
                            statusInfo = { type: 'online', name: 'Online', color: 'online' };
                            break;
                        case 2:
                            statusInfo = { type: 'online', name: 'In Game', color: 'online' };
                            break;
                        case 3:
                            statusInfo = { type: 'online', name: 'Studio', color: 'online' };
                            break;
                        default:
                            statusInfo = { type: 'unknown', name: 'Unknown', color: 'unknown' };
                    }
                    console.log(`✅ Status from proxy API: ${statusInfo.name}`);
                    throw 'success'; // Break out of try-catch chain
                }
            }
        } catch (error) {
            if (error === 'success') throw error; // Re-throw success
            console.log(`Proxy API also failed for ${userId}`);
        }
        
        // Method 4: Try alternative proxy service
        try {
            const altProxyUrl = `https://corsproxy.io/?https://presence.roblox.com/v1/presence/users`;
            const altResponse = await fetch(altProxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: [parseInt(userId)] })
            });
            
            if (altResponse.ok) {
                const presenceData = await altResponse.json();
                console.log(`✅ Alternative proxy success for ${userId}:`, presenceData);
                
                if (presenceData.userPresences && presenceData.userPresences[0]) {
                    const presence = presenceData.userPresences[0];
                    switch (presence.userPresenceType) {
                        case 0: statusInfo = { type: 'offline', name: 'Offline', color: 'offline' }; break;
                        case 1: statusInfo = { type: 'online', name: 'Online', color: 'online' }; break;
                        case 2: statusInfo = { type: 'online', name: 'In Game', color: 'online' }; break;
                        case 3: statusInfo = { type: 'online', name: 'Studio', color: 'online' }; break;
                        default: statusInfo = { type: 'unknown', name: 'Unknown', color: 'unknown' };
                    }
                    console.log(`✅ Status from alt proxy: ${statusInfo.name}`);
                    throw 'success'; // Break out of try-catch chain
                }
            }
        } catch (error) {
            if (error === 'success') {
                // Success! Status was found
            } else {
                console.log(`⚠️ All status methods failed for ${userId}. Using offline as fallback.`);
                statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
            }
        }
        
        // Set the isOnline for backward compatibility
        isOnline = statusInfo.color;
        
        const result = {
            username: userData.name || userData.displayName || `User${userId}`,
            displayName: userData.displayName || userData.name || `User${userId}`,
            description: userData.description || '',
            avatarUrl: avatarUrl,
            isOnline: isOnline,
            statusInfo: statusInfo, // Detailed status with name and color
            created: userData.created || new Date(),
            profileUrl: `https://www.roblox.com/users/${userId}/profile`
        };
        
        console.log(`🎉 Profile complete for ${userId}: ${result.username} (${statusInfo.name})${result.avatarUrl ? ' [Avatar ✅]' : ' [No Avatar]'}`);
        return result;
    }
    
    function getFallbackUserData(userId) {
        // Hardcoded fallback data based on the user IDs you provided
        const fallbackUsers = {
            1285805240: { name: 'Felix_RBX', displayName: 'Felix', description: 'Lead Programmer, Game Designer, UI/UX Designer' },
            999920009: { name: 'Erwin_DEV', displayName: 'Erwin', description: 'Lead Map Designer, Lead 3D Modeller' },
            396309977: { name: 'Stormi_CM', displayName: 'Stormi', description: 'Community Manager' },
            1800687521: { name: 'Jay_DEV', displayName: 'Jay', description: 'Head of Development, Programmer' },
            135935674: { name: 'Millian_PROG', displayName: 'Millian', description: 'Programmer' },
            1254605274: { name: 'DTADW_DEV', displayName: 'DTADW', description: 'Programmer' },
            1949352584: { name: 'Kuppel_SM', displayName: 'Kuppel', description: 'Social Media Manager, Marketing Specialist' }
        };
        
        return fallbackUsers[userId] || { 
            name: `User${userId}`, 
            displayName: `User${userId}`, 
            description: 'Developer' 
        };
    }

    function createDeveloperCard(developer) {
        const card = document.createElement('div');
        card.className = 'dev-card';
        card.setAttribute('data-search-content', `${developer.name} ${developer.roles.join(' ')} ${developer.robloxUsername || ''} developer programmer designer manager`);
        
        if (developer.profileData && developer.profileData.error) {
            // Error state
            card.innerHTML = `
                <div class="dev-header">
                    <div class="dev-avatar">
                        ${developer.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="dev-info">
                        <h3 class="dev-name">
                            ${developer.name}
                            <span class="online-status unknown" data-status="Status Unknown" onclick="toggleStatusTooltip(this)"></span>
                        </h3>
                        <p class="dev-username">@${developer.name.toLowerCase()}</p>
                    </div>
                </div>
                <div class="dev-roles">
                    ${developer.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
                </div>
                <div class="error-profile">
                    Unable to load Roblox profile
                </div>
            `;
        } else if (!developer.profileData) {
            // Loading state
            card.innerHTML = `
                <div class="dev-header">
                    <div class="dev-avatar">
                        ${developer.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="dev-info">
                        <h3 class="dev-name">
                            ${developer.name}
                            <span class="online-status unknown" data-status="Loading..." onclick="toggleStatusTooltip(this)"></span>
                        </h3>
                        <p class="dev-username">Loading...</p>
                    </div>
                </div>
                <div class="dev-roles">
                    ${developer.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
                </div>
                <div class="loading-profile">
                    Loading Roblox profile...
                </div>
            `;
        } else {
            // Success state
            const avatarContent = developer.avatarUrl 
                ? `<img src="${developer.avatarUrl}" alt="${developer.robloxUsername} avatar" onerror="this.style.display='none'; this.parentNode.innerHTML='${developer.robloxUsername ? developer.robloxUsername.charAt(0).toUpperCase() : developer.name.charAt(0).toUpperCase()}';">`
                : (developer.robloxUsername ? developer.robloxUsername.charAt(0).toUpperCase() : developer.name.charAt(0).toUpperCase());
                
            const onlineStatusClass = developer.isOnline === 'online' ? 'online' : 
                                    developer.isOnline === 'offline' ? 'offline' : 'unknown';
                                    
            const statusTitle = developer.isOnline === 'online' ? 'Online' : 
                              developer.isOnline === 'offline' ? 'Offline' : 'Status Unknown';
            
            card.innerHTML = `
                <div class="dev-header">
                    <div class="dev-avatar">
                        ${avatarContent}
                    </div>
                    <div class="dev-info">
                        <h3 class="dev-name">
                            ${developer.name}
                            <span class="online-status ${onlineStatusClass}" data-status="${developer.statusInfo ? developer.statusInfo.name : statusTitle}" onclick="toggleStatusTooltip(this)"></span>
                        </h3>
                        <p class="dev-username">@${developer.robloxUsername}</p>
                    </div>
                </div>
                <div class="dev-roles">
                    ${developer.roles.map(role => `<span class="role-tag">${role}</span>`).join('')}
                </div>
            `;
        }
        
        return card;
    }

    // Update online status periodically (every 5 minutes)
    setInterval(async () => {
        console.log('Updating online status...');
        await updateOnlineStatus();
    }, 5 * 60 * 1000); // 5 minutes

    async function updateOnlineStatus() {
        try {
            console.log('🔄 Updating status for all developers...');
            const userIds = developers.map(dev => dev.robloxId);
            
            // Use working proxy for presence API
            const presenceProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://presence.roblox.com/v1/presence/users')}`;
            
            const presenceResponse = await fetch(presenceProxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userIds: userIds.map(id => parseInt(id))
                })
            });
            
            if (presenceResponse.ok) {
                const presenceData = await presenceResponse.json();
                console.log('✅ Status update response:', presenceData);
                
                if (presenceData.userPresences && presenceData.userPresences.length > 0) {
                    presenceData.userPresences.forEach(presence => {
                        const developer = developers.find(dev => dev.robloxId === presence.userId);
                        if (developer) {
                            const presenceType = presence.userPresenceType;
                            const lastLocation = presence.lastLocation || '';
                            let statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
                            
                            // Detailed status mapping like in fetchRobloxProfile
                            switch (presenceType) {
                                case 0:
                                    statusInfo = { type: 'offline', name: 'Offline', color: 'offline' };
                                    break;
                                case 1:
                                    statusInfo = { type: 'online', name: 'Online', color: 'online' };
                                    break;
                                case 2:
                                    if (lastLocation && lastLocation !== 'Website') {
                                        statusInfo = { type: 'online', name: `In Game: ${lastLocation}`, color: 'online' };
                                    } else {
                                        statusInfo = { type: 'online', name: 'In Game', color: 'online' };
                                    }
                                    break;
                                case 3:
                                    statusInfo = { type: 'online', name: 'Studio', color: 'online' };
                                    break;
                                default:
                                    statusInfo = { type: 'unknown', name: 'Unknown', color: 'unknown' };
                            }
                            
                            developer.isOnline = statusInfo.color;
                            developer.statusInfo = statusInfo;
                            console.log(`🔄 ${developer.name}: ${statusInfo.name} (type: ${presenceType})`);
                            
                            // Update UI in real-time with detailed status
                            const devCard = document.querySelector(`[data-search-content*="${developer.name}"]`);
                            if (devCard) {
                                const statusElement = devCard.querySelector('.online-status');
                                if (statusElement) {
                                    statusElement.className = `online-status ${statusInfo.color}`;
                                    statusElement.setAttribute('data-status', statusInfo.name);
                                }
                            }
                        }
                    });
                } else {
                    console.log('⚠️ No presence data returned');
                }
            } else {
                console.log(`⚠️ Status update failed: ${presenceResponse.status}`);
            }
        } catch (error) {
            console.log('⚠️ Status update error:', error.message);
        }
    }

    // Add credits content to search system
    function addCreditsToSearch() {
        // This will be handled by the existing search system
        // The data-search-content attributes on cards will make them searchable
        console.log('Credits content ready for search system');
    }

    // Call this after profiles are loaded
    setTimeout(addCreditsToSearch, 2000);
});

// Global function to refresh all profiles (can be called from console for debugging)
window.refreshDeveloperProfiles = async function() {
    console.log('Refreshing developer profiles...');
    const devGrid = document.getElementById('dev-grid');
    if (devGrid) {
        devGrid.innerHTML = '';
    }
    
    // Re-initialize
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
};

// Global function for mobile tooltip toggle
window.toggleStatusTooltip = function(element) {
    // Check if we're on mobile (touch device)
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isMobile) {
        // Close any other open tooltips first
        document.querySelectorAll('.online-status.show-tooltip').forEach(status => {
            if (status !== element) {
                status.classList.remove('show-tooltip');
            }
        });
        
        // Toggle this tooltip
        element.classList.toggle('show-tooltip');
        
        // Add click-away listener
        if (element.classList.contains('show-tooltip')) {
            setTimeout(() => {
                document.addEventListener('click', function closeTooltip(e) {
                    if (!element.contains(e.target)) {
                        element.classList.remove('show-tooltip');
                        document.removeEventListener('click', closeTooltip);
                    }
                });
            }, 100);
        }
    }
    // On desktop, hover handles the tooltip, so we don't need to do anything
};
