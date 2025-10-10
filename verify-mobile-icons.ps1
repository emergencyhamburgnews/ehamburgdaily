# PowerShell script to verify all mobile theme toggle icons are using white stroke
Write-Host "Checking mobile theme toggle icons on all pages..." -ForegroundColor Yellow

$pages = @("index.html", "about.html", "settings.html", "credits.html", "emergency-hamburg.html")
$allGood = $true

foreach ($page in $pages) {
    Write-Host "`nChecking $page..." -ForegroundColor Cyan
    
    # Check if mobile theme section exists
    $hasMobileSection = Select-String -Path $page -Pattern "mobile-theme-section" -Quiet
    if ($hasMobileSection) {
        Write-Host "  ✓ Has mobile theme section" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing mobile theme section" -ForegroundColor Red
        $allGood = $false
        continue
    }
    
    # Check if has theme-toggle-mobile class
    $hasToggleMobile = Select-String -Path $page -Pattern "theme-toggle-mobile" -Quiet
    if ($hasToggleMobile) {
        Write-Host "  ✓ Has theme-toggle-mobile button" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing theme-toggle-mobile button" -ForegroundColor Red
        $allGood = $false
        continue
    }
    
    # Check if SVG uses white stroke
    $hasWhiteStroke = Select-String -Path $page -Pattern 'stroke="white"' -Quiet
    if ($hasWhiteStroke) {
        Write-Host "  ✓ SVG uses white stroke" -ForegroundColor Green
    } else {
        Write-Host "  ✗ SVG does not use white stroke" -ForegroundColor Red
        $allGood = $false
    }
    
    # Check if path element has explicit white stroke
    $hasPathWhiteStroke = Select-String -Path $page -Pattern 'stroke="white" fill="none"' -Quiet
    if ($hasPathWhiteStroke) {
        Write-Host "  ✓ Path element has explicit white stroke" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Path element missing explicit white stroke" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host "`n" + "="*50 -ForegroundColor Yellow
if ($allGood) {
    Write-Host "🎉 ALL PAGES HAVE CORRECT WHITE MOBILE THEME TOGGLE ICONS!" -ForegroundColor Green
    Write-Host "The mobile theme toggle should now be visible on all pages." -ForegroundColor Green
} else {
    Write-Host "❌ SOME PAGES HAVE ISSUES WITH MOBILE THEME TOGGLE ICONS" -ForegroundColor Red
}
Write-Host "="*50 -ForegroundColor Yellow