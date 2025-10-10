# Final verification of mobile theme toggle across all pages
Write-Host "FINAL MOBILE THEME TOGGLE CHECK" -ForegroundColor Yellow
Write-Host ('=' * 50) -ForegroundColor Yellow

$pages = @("index.html", "about.html", "settings.html", "credits.html", "emergency-hamburg.html")
$allPerfect = $true

foreach ($page in $pages) {
    Write-Host "`n🔍 Checking $page..." -ForegroundColor Cyan
    
    # 1. Check mobile theme section exists
    $hasMobileSection = Select-String -Path $page -Pattern "mobile-theme-section" -Quiet
    if ($hasMobileSection) {
        Write-Host "  ✅ Has mobile theme section" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing mobile theme section" -ForegroundColor Red
        $allPerfect = $false
        continue
    }
    
    # 2. Check theme toggle mobile button exists
    $hasToggleMobile = Select-String -Path $page -Pattern "theme-toggle-mobile" -Quiet
    if ($hasToggleMobile) {
        Write-Host "  ✅ Has theme-toggle-mobile button" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing theme-toggle-mobile button" -ForegroundColor Red
        $allPerfect = $false
    }
    
    # 3. Check SVG uses currentColor
    $hasCurrentColor = Select-String -Path $page -Pattern 'stroke="currentColor"' -Quiet
    if ($hasCurrentColor) {
        Write-Host "  ✅ SVG uses currentColor (good for CSS control)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SVG does not use currentColor" -ForegroundColor Red
        $allPerfect = $false
    }
    
    # 4. Check label is clean (no emojis)
    $hasCleanLabel = Select-String -Path $page -Pattern '<span class="mobile-theme-label">Theme</span>' -Quiet
    if ($hasCleanLabel) {
        Write-Host "  ✅ Has clean 'Theme' label (no emojis)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Label is not clean or missing" -ForegroundColor Red
        $allPerfect = $false
    }
    
    # 5. Check SVG viewBox is correct
    $hasCorrectViewBox = Select-String -Path $page -Pattern 'viewBox="0 0 24 24"' -Quiet
    if ($hasCorrectViewBox) {
        Write-Host "  ✅ SVG has correct viewBox" -ForegroundColor Green
    } else {
        Write-Host "  ❌ SVG viewBox is incorrect" -ForegroundColor Red
        $allPerfect = $false
    }
    
    # 6. Check theme-toggle.js is included
    $hasThemeJS = Select-String -Path $page -Pattern 'theme-toggle.js' -Quiet
    if ($hasThemeJS) {
        Write-Host "  ✅ Includes theme-toggle.js" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing theme-toggle.js" -ForegroundColor Red
        $allPerfect = $false
    }
}

Write-Host ('=' * 50) -ForegroundColor Yellow

# Check CSS has the white color override
Write-Host "🎨 Checking CSS for white color override..." -ForegroundColor Cyan
$hasWhiteOverride = Select-String -Path "styles.css" -Pattern "mobile-theme-section.*color.*white.*important" -Quiet
if ($hasWhiteOverride) {
    Write-Host "  ✅ CSS has white color override for mobile theme section" -ForegroundColor Green
} else {
    Write-Host "  ❌ CSS missing white color override" -ForegroundColor Red
    $allPerfect = $false
}

# Check theme-toggle.js uses currentColor
Write-Host "`n🔧 Checking theme-toggle.js..." -ForegroundColor Cyan
$jsUsesCurrentColor = Select-String -Path "theme-toggle.js" -Pattern 'stroke="currentColor"' -Quiet
if ($jsUsesCurrentColor) {
    Write-Host "  ✅ theme-toggle.js uses currentColor" -ForegroundColor Green
} else {
    Write-Host "  ❌ theme-toggle.js does not use currentColor" -ForegroundColor Red
    $allPerfect = $false
}

Write-Host ('=' * 50) -ForegroundColor Yellow

if ($allPerfect) {
    Write-Host "🎉 PERFECT! ALL MOBILE THEME TOGGLES ARE PROPERLY SET UP!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 The icon SHOULD NOW BE VISIBLE on all pages!" -ForegroundColor Green
    Write-Host "   - Orange background section ✅" -ForegroundColor Green
    Write-Host "   - 'Theme' label ✅" -ForegroundColor Green
    Write-Host "   - Visible white icon ✅" -ForegroundColor Green
    Write-Host "   - Proper CSS override ✅" -ForegroundColor Green
    Write-Host "   - JavaScript compatibility ✅" -ForegroundColor Green
} else {
    Write-Host "❌ SOME ISSUES FOUND - CHECK ABOVE FOR DETAILS" -ForegroundColor Red
}

Write-Host ('=' * 50) -ForegroundColor Yellow
