# ============================================================================
# Cleanup and Review Script for Logic View Bright Repository
# ============================================================================
# Purpose: Comprehensive cleanup, verification, and analysis automation
# Created: 2025-12-18 01:25:54 UTC
# Author: logiccamila-wq
# ============================================================================

param(
    [switch]$CleanupArtifacts = $true,
    [switch]$RemoveBranches = $true,
    [switch]$VerifySecurity = $true,
    [switch]$AnalyzePackages = $true,
    [switch]$GenerateReport = $true,
    [string]$ReportPath = "cleanup-report.html",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

# ============================================================================
# Configuration
# ============================================================================
$script:Config = @{
    RepoRoot = Get-Location
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    DryRun = $DryRun
    Verbose = $Verbose
    BuildArtifactPatterns = @(
        "*.tmp"
        "*.log"
        "*.bak"
        "*.swp"
        ".DS_Store"
        "Thumbs.db"
        "node_modules/.cache"
        "dist"
        "build"
        "out"
        "coverage"
        ".pytest_cache"
        ".tox"
        "*.egg-info"
    )
    BranchPatterns = @(
        "edit/*"
        "feature/deprecated/*"
        "bugfix/old-*"
        "hotfix/temp-*"
        "wip/*"
    )
    SecurityPatterns = @(
        "*.key"
        "*.pem"
        "*.p12"
        "*.pfx"
        "*secret*"
        "*password*"
        ".env"
        ".env.local"
        "*.vault"
    )
}

$script:Report = @{
    StartTime = Get-Date
    EndTime = $null
    Summary = @()
    Errors = @()
    Warnings = @()
    ArtifactsRemoved = @()
    BranchesRemoved = @()
    SecurityIssues = @()
    PackageAnalysis = @()
    Stats = @{
        ArtifactsCount = 0
        BranchesCount = 0
        SecurityIssuesCount = 0
        TotalSizeFreed = 0
    }
}

# ============================================================================
# Logging Functions
# ============================================================================

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("Info", "Warning", "Error", "Success")]
        [string]$Level = "Info",
        [switch]$NoNewline
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "Info" { "Cyan" }
        "Warning" { "Yellow" }
        "Error" { "Red" }
        "Success" { "Green" }
    }
    
    $prefix = switch ($Level) {
        "Info" { "[INFO]" }
        "Warning" { "[WARN]" }
        "Error" { "[ERR!]" }
        "Success" { "[OK]" }
    }
    
    Write-Host "$timestamp $prefix $Message" -ForegroundColor $color -NoNewline:$NoNewline
    
    if ($Level -eq "Error") {
        $script:Report.Errors += $Message
    } elseif ($Level -eq "Warning") {
        $script:Report.Warnings += $Message
    }
}

function Write-Verbose-Log {
    param([string]$Message)
    if ($script:Config.Verbose) {
        Write-Log -Message $Message -Level "Info"
    }
}

# ============================================================================
# Artifact Cleanup Functions
# ============================================================================

function Get-BuildArtifacts {
    Write-Log "Scanning for build artifacts..." -Level "Info"
    $artifacts = @()
    
    foreach ($pattern in $script:Config.BuildArtifactPatterns) {
        Write-Verbose-Log "Searching for pattern: $pattern"
        $found = Get-ChildItem -Path $script:Config.RepoRoot -Filter $pattern -Recurse -ErrorAction SilentlyContinue -Force
        
        if ($found) {
            $artifacts += $found
            Write-Verbose-Log "Found $($found.Count) items matching '$pattern'"
        }
    }
    
    return $artifacts
}

function Remove-BuildArtifacts {
    Write-Log "Starting build artifact cleanup..." -Level "Info"
    $artifacts = Get-BuildArtifacts
    
    if ($artifacts.Count -eq 0) {
        Write-Log "No build artifacts found." -Level "Success"
        return
    }
    
    Write-Log "Found $($artifacts.Count) artifact(s) to remove." -Level "Warning"
    
    $totalSize = 0
    foreach ($artifact in $artifacts) {
        try {
            $size = if ($artifact.PSIsContainer) {
                (Get-ChildItem -Path $artifact.FullName -Recurse -Force | Measure-Object -Property Length -Sum).Sum
            } else {
                $artifact.Length
            }
            $totalSize += $size
            
            if ($script:Config.DryRun) {
                Write-Log "  [DRY RUN] Would remove: $($artifact.FullName) ($(Format-Size $size))" -Level "Warning"
            } else {
                Remove-Item -Path $artifact.FullName -Recurse -Force -ErrorAction Stop
                Write-Log "  Removed: $($artifact.FullName) ($(Format-Size $size))" -Level "Success"
            }
            
            $script:Report.ArtifactsRemoved += @{
                Path = $artifact.FullName
                Size = $size
                Type = if ($artifact.PSIsContainer) { "Directory" } else { "File" }
            }
            $script:Report.Stats.ArtifactsCount++
        } catch {
            Write-Log "  Failed to remove: $($artifact.FullName) - $($_.Exception.Message)" -Level "Error"
        }
    }
    
    $script:Report.Stats.TotalSizeFreed = $totalSize
    Write-Log "Artifact cleanup complete. Freed space: $(Format-Size $totalSize)" -Level "Success"
}

# ============================================================================
# Branch Management Functions
# ============================================================================

function Get-EditBranches {
    Write-Log "Scanning for branches matching removal patterns..." -Level "Info"
    $branchesToRemove = @()
    
    try {
        $allBranches = git branch -a 2>$null | ForEach-Object { $_.TrimStart("* ").Trim() }
        
        foreach ($branch in $allBranches) {
            # Skip main/master branches
            if ($branch -match "^(main|master|develop|development|origin/(main|master))$") {
                continue
            }
            
            foreach ($pattern in $script:Config.BranchPatterns) {
                if ($branch -like $pattern) {
                    $branchesToRemove += $branch
                    Write-Verbose-Log "Branch matched pattern '$pattern': $branch"
                    break
                }
            }
        }
    } catch {
        Write-Log "Error scanning branches: $($_.Exception.Message)" -Level "Error"
    }
    
    return $branchesToRemove
}

function Remove-EditBranches {
    Write-Log "Starting branch removal..." -Level "Info"
    $branchesToRemove = Get-EditBranches
    
    if ($branchesToRemove.Count -eq 0) {
        Write-Log "No branches matching removal patterns found." -Level "Success"
        return
    }
    
    Write-Log "Found $($branchesToRemove.Count) branch(es) to remove." -Level "Warning"
    
    foreach ($branch in $branchesToRemove) {
        try {
            $isRemoteBranch = $branch -match "^origin/"
            $branchName = $branch -replace "^origin/", ""
            
            if ($script:Config.DryRun) {
                Write-Log "  [DRY RUN] Would delete: $branch" -Level "Warning"
            } else {
                if ($isRemoteBranch) {
                    git push origin --delete $branchName 2>$null
                    Write-Log "  Deleted remote branch: $branch" -Level "Success"
                } else {
                    git branch -D $branch 2>$null
                    Write-Log "  Deleted local branch: $branch" -Level "Success"
                }
            }
            
            $script:Report.BranchesRemoved += $branch
            $script:Report.Stats.BranchesCount++
        } catch {
            Write-Log "  Failed to delete branch: $branch - $($_.Exception.Message)" -Level "Error"
        }
    }
    
    Write-Log "Branch removal complete." -Level "Success"
}

# ============================================================================
# Security Verification Functions
# ============================================================================

function Verify-SecurityThreats {
    Write-Log "Performing security verification..." -Level "Info"
    $threats = @()
    
    Write-Log "Scanning for sensitive files..." -Level "Info"
    foreach ($pattern in $script:Config.SecurityPatterns) {
        Write-Verbose-Log "Checking for sensitive pattern: $pattern"
        $found = Get-ChildItem -Path $script:Config.RepoRoot -Filter $pattern -Recurse -ErrorAction SilentlyContinue -Force | 
                 Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }
        
        if ($found) {
            foreach ($file in $found) {
                $threats += @{
                    File = $file.FullName
                    Pattern = $pattern
                    Severity = "High"
                    Description = "Sensitive file matching pattern: $pattern"
                }
                Write-Log "  [HIGH] Sensitive file found: $($file.FullName)" -Level "Warning"
                $script:Report.Stats.SecurityIssuesCount++
            }
        }
    }
    
    Write-Log "Checking for credentials in common files..." -Level "Info"
    $checkFiles = @("package.json", "config.js", "settings.json", ".npmrc", ".gitconfig")
    foreach ($checkFile in $checkFiles) {
        $files = Get-ChildItem -Path $script:Config.RepoRoot -Filter $checkFile -Recurse -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match "(password|secret|token|key|credential)\s*[:=]" -and $content -notmatch '^\s*//') {
                $threats += @{
                    File = $file.FullName
                    Pattern = "Potential credential"
                    Severity = "High"
                    Description = "Potential credentials detected in configuration file"
                }
                Write-Log "  [HIGH] Potential credentials in: $($file.FullName)" -Level "Warning"
                $script:Report.Stats.SecurityIssuesCount++
            }
        }
    }
    
    $script:Report.SecurityIssues = $threats
    
    if ($threats.Count -eq 0) {
        Write-Log "Security verification complete. No threats detected." -Level "Success"
    } else {
        Write-Log "Security verification complete. Found $($threats.Count) potential issue(s)." -Level "Warning"
    }
    
    return $threats
}

# ============================================================================
# Package Analysis Functions
# ============================================================================

function Analyze-PackageJson {
    Write-Log "Analyzing package.json..." -Level "Info"
    $analysis = @()
    
    $packageFiles = Get-ChildItem -Path $script:Config.RepoRoot -Filter "package.json" -Recurse -ErrorAction SilentlyContinue |
                    Where-Object { $_.FullName -notlike "*node_modules*" }
    
    if ($packageFiles.Count -eq 0) {
        Write-Log "No package.json files found." -Level "Warning"
        return $analysis
    }
    
    foreach ($packageFile in $packageFiles) {
        Write-Verbose-Log "Processing: $($packageFile.FullName)"
        
        try {
            $content = Get-Content -Path $packageFile.FullName -Raw | ConvertFrom-Json
            
            $packageInfo = @{
                File = $packageFile.FullName
                Name = $content.name
                Version = $content.version
                Description = $content.description
                Dependencies = $content.dependencies.PSObject.Properties.Name.Count
                DevDependencies = $content.devDependencies.PSObject.Properties.Name.Count
                Scripts = $content.scripts.PSObject.Properties.Name.Count
                License = $content.license
                Vulnerabilities = @()
            }
            
            # Check for outdated patterns
            if ($content.dependencies) {
                foreach ($dep in $content.dependencies.PSObject.Properties) {
                    if ($dep.Value -eq "*" -or $dep.Value -eq "latest") {
                        $packageInfo.Vulnerabilities += "Dependency '$($dep.Name)' uses unstable version: $($dep.Value)"
                    }
                }
            }
            
            $analysis += $packageInfo
            Write-Log "  Analyzed package: $($content.name) v$($content.version)" -Level "Success"
            Write-Log "    Dependencies: $($packageInfo.Dependencies), DevDependencies: $($packageInfo.DevDependencies), Scripts: $($packageInfo.Scripts)" -Level "Info"
            
            if ($packageInfo.Vulnerabilities.Count -gt 0) {
                foreach ($vuln in $packageInfo.Vulnerabilities) {
                    Write-Log "    [WARN] $vuln" -Level "Warning"
                }
            }
        } catch {
            Write-Log "  Failed to parse package.json: $($packageFile.FullName) - $($_.Exception.Message)" -Level "Error"
        }
    }
    
    $script:Report.PackageAnalysis = $analysis
    Write-Log "Package analysis complete. Processed $($analysis.Count) file(s)." -Level "Success"
    
    return $analysis
}

# ============================================================================
# Report Generation Functions
# ============================================================================

function Format-Size {
    param([long]$Size)
    
    if ($Size -lt 1KB) { return "$Size B" }
    if ($Size -lt 1MB) { return "$([math]::Round($Size / 1KB, 2)) KB" }
    if ($Size -lt 1GB) { return "$([math]::Round($Size / 1MB, 2)) MB" }
    return "$([math]::Round($Size / 1GB, 2)) GB"
}

function Generate-HtmlReport {
    param([string]$ReportPath)
    
    Write-Log "Generating HTML report..." -Level "Info"
    $script:Report.EndTime = Get-Date
    $duration = $script:Report.EndTime - $script:Report.StartTime
    
    $html = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cleanup and Review Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }
        header p {
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 30px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .summary-card h3 {
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.9;
            margin-bottom: 10px;
        }
        .summary-card .value {
            font-size: 32px;
            font-weight: bold;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .status-success { color: #27ae60; }
        .status-warning { color: #f39c12; }
        .status-error { color: #e74c3c; }
        .status-info { color: #3498db; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #dee2e6;
        }
        table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        table tr:hover {
            background: #f8f9fa;
        }
        .alert {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
            border-left: 4px solid;
        }
        .alert-success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        .alert-warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        .alert-error {
            background: #f8d7da;
            border-color: #f5c6cb;
            color: #721c24;
        }
        .alert-info {
            background: #d1ecf1;
            border-color: #bee5eb;
            color: #0c5460;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .empty-state p {
            font-size: 16px;
        }
        footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #dee2e6;
        }
        .metric {
            margin-bottom: 10px;
        }
        .metric-label {
            font-weight: 600;
            color: #333;
        }
        .metric-value {
            color: #667eea;
            font-weight: bold;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🧹 Cleanup and Review Report</h1>
            <p>Repository: logic-view-bright | Generated: $($script:Report.EndTime.ToString('yyyy-MM-dd HH:mm:ss UTC'))</p>
        </header>
        
        <div class="content">
            <!-- Summary Cards -->
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Build Artifacts Removed</h3>
                    <div class="value">$($script:Report.Stats.ArtifactsCount)</div>
                </div>
                <div class="summary-card">
                    <h3>Branches Removed</h3>
                    <div class="value">$($script:Report.Stats.BranchesCount)</div>
                </div>
                <div class="summary-card">
                    <h3>Security Issues Found</h3>
                    <div class="value">$($script:Report.Stats.SecurityIssuesCount)</div>
                </div>
                <div class="summary-card">
                    <h3>Space Freed</h3>
                    <div class="value">$(Format-Size $script:Report.Stats.TotalSizeFreed)</div>
                </div>
            </div>

            <!-- Execution Summary -->
            <div class="section">
                <div class="section-title">📊 Execution Summary</div>
                <div class="metric">
                    <span class="metric-label">Start Time:</span>
                    <span class="metric-value">$($script:Report.StartTime.ToString('yyyy-MM-dd HH:mm:ss UTC'))</span>
                </div>
                <div class="metric">
                    <span class="metric-label">End Time:</span>
                    <span class="metric-value">$($script:Report.EndTime.ToString('yyyy-MM-dd HH:mm:ss UTC'))</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Duration:</span>
                    <span class="metric-value">$($duration.TotalSeconds.ToString('F2')) seconds</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Execution Mode:</span>
                    <span class="metric-value">$(if ($script:Config.DryRun) { 'Dry Run (No Changes)' } else { 'Live Execution' })</span>
                </div>
            </div>

            <!-- Build Artifacts Section -->
            <div class="section">
                <div class="section-title">🗑️ Build Artifacts Cleanup</div>
                $(if ($script:Report.ArtifactsRemoved.Count -gt 0) {
                    "<table>
                        <tr>
                            <th>Path</th>
                            <th>Type</th>
                            <th>Size</th>
                        </tr>
                        $(foreach ($artifact in $script:Report.ArtifactsRemoved) {
                            "<tr>
                                <td><code>$($artifact.Path)</code></td>
                                <td>$($artifact.Type)</td>
                                <td>$(Format-Size $artifact.Size)</td>
                            </tr>"
                        })
                    </table>"
                    "<div class='alert alert-success'>✓ Successfully removed $($script:Report.ArtifactsRemoved.Count) artifact(s), freeing $(Format-Size $script:Report.Stats.TotalSizeFreed).</div>"
                } else {
                    "<div class='empty-state'><p>✓ No build artifacts found or removed.</p></div>"
                })
            </div>

            <!-- Branch Removal Section -->
            <div class="section">
                <div class="section-title">🌿 Branch Management</div>
                $(if ($script:Report.BranchesRemoved.Count -gt 0) {
                    "<table>
                        <tr>
                            <th>Branch Name</th>
                            <th>Status</th>
                        </tr>
                        $(foreach ($branch in $script:Report.BranchesRemoved) {
                            "<tr>
                                <td><code>$branch</code></td>
                                <td class='status-success'>✓ Removed</td>
                            </tr>"
                        })
                    </table>"
                    "<div class='alert alert-success'>✓ Successfully removed $($script:Report.BranchesRemoved.Count) branch(es).</div>"
                } else {
                    "<div class='empty-state'><p>✓ No branches matching removal patterns found.</p></div>"
                })
            </div>

            <!-- Security Verification Section -->
            <div class="section">
                <div class="section-title">🔒 Security Verification</div>
                $(if ($script:Report.SecurityIssues.Count -gt 0) {
                    "<table>
                        <tr>
                            <th>File</th>
                            <th>Pattern</th>
                            <th>Severity</th>
                            <th>Description</th>
                        </tr>
                        $(foreach ($issue in $script:Report.SecurityIssues) {
                            "<tr>
                                <td><code>$($issue.File)</code></td>
                                <td>$($issue.Pattern)</td>
                                <td><span class='status-error'>$($issue.Severity)</span></td>
                                <td>$($issue.Description)</td>
                            </tr>"
                        })
                    </table>"
                    "<div class='alert alert-warning'>⚠️ Found $($script:Report.SecurityIssues.Count) potential security issue(s). Please review and remediate.</div>"
                } else {
                    "<div class='empty-state'><p>✓ No security threats detected.</p></div>"
                })
            </div>

            <!-- Package Analysis Section -->
            <div class="section">
                <div class="section-title">📦 Package Analysis</div>
                $(if ($script:Report.PackageAnalysis.Count -gt 0) {
                    "<table>
                        <tr>
                            <th>Package</th>
                            <th>Version</th>
                            <th>Dependencies</th>
                            <th>Dev Dependencies</th>
                            <th>Scripts</th>
                            <th>License</th>
                        </tr>
                        $(foreach ($pkg in $script:Report.PackageAnalysis) {
                            "<tr>
                                <td><code>$($pkg.Name)</code></td>
                                <td>$($pkg.Version)</td>
                                <td>$($pkg.Dependencies)</td>
                                <td>$($pkg.DevDependencies)</td>
                                <td>$($pkg.Scripts)</td>
                                <td>$($pkg.License)</td>
                            </tr>"
                        })
                    </table>"
                    "$(foreach ($pkg in $script:Report.PackageAnalysis | Where-Object { $_.Vulnerabilities.Count -gt 0 }) {
                        "<div class='alert alert-warning'>
                            <strong>$($pkg.Name) v$($pkg.Version)</strong> has vulnerability warnings:
                            <ul>
                                $(foreach ($vuln in $pkg.Vulnerabilities) {
                                    "<li>$vuln</li>"
                                })
                            </ul>
                        </div>"
                    })"
                } else {
                    "<div class='empty-state'><p>ℹ️ No package.json files found.</p></div>"
                })
            </div>

            <!-- Errors Section -->
            $(if ($script:Report.Errors.Count -gt 0) {
                "<div class='section'>
                    <div class='section-title'>❌ Errors</div>
                    $(foreach ($error in $script:Report.Errors) {
                        "<div class='alert alert-error'>$error</div>"
                    })
                </div>"
            })

            <!-- Warnings Section -->
            $(if ($script:Report.Warnings.Count -gt 0) {
                "<div class='section'>
                    <div class='section-title'>⚠️ Warnings</div>
                    $(foreach ($warning in $script:Report.Warnings) {
                        "<div class='alert alert-warning'>$warning</div>"
                    })
                </div>"
            })
        </div>
        
        <footer>
            <p>Cleanup and Review Report | Generated on 2025-12-18 01:25:54 UTC by logiccamila-wq</p>
            <p>Repository: logiccamila-wq/logic-view-bright</p>
        </footer>
    </div>
</body>
</html>
"@

    try {
        $html | Out-File -FilePath $ReportPath -Encoding UTF8 -Force
        Write-Log "Report generated successfully: $ReportPath" -Level "Success"
    } catch {
        Write-Log "Failed to generate report: $($_.Exception.Message)" -Level "Error"
    }
}

function Generate-TextReport {
    Write-Log "Generating text summary..." -Level "Info"
    
    $summary = @"
================================================================================
CLEANUP AND REVIEW REPORT
================================================================================
Repository: logic-view-bright
Generated:  $($script:Report.EndTime.ToString('yyyy-MM-dd HH:mm:ss UTC'))
Duration:   $((New-TimeSpan -Start $script:Report.StartTime -End $script:Report.EndTime).TotalSeconds.ToString('F2')) seconds
Mode:       $(if ($script:Config.DryRun) { 'Dry Run (No Changes)' } else { 'Live Execution' })

SUMMARY STATISTICS
================================================================================
Artifacts Removed:        $($script:Report.Stats.ArtifactsCount)
Branches Removed:         $($script:Report.Stats.BranchesCount)
Security Issues Found:    $($script:Report.Stats.SecurityIssuesCount)
Total Space Freed:        $(Format-Size $script:Report.Stats.TotalSizeFreed)

DETAILED RESULTS
================================================================================

Build Artifacts Removed: $($script:Report.ArtifactsRemoved.Count)
$($script:Report.ArtifactsRemoved | ForEach-Object { "  - $($_.Path) ($($_.Type), $(Format-Size $_.Size))" } | Out-String)

Branches Removed: $($script:Report.BranchesRemoved.Count)
$($script:Report.BranchesRemoved | ForEach-Object { "  - $_" } | Out-String)

Security Issues: $($script:Report.SecurityIssues.Count)
$($script:Report.SecurityIssues | ForEach-Object { "  - [$($_.Severity)] $($_.File): $($_.Description)" } | Out-String)

Package Analysis: $($script:Report.PackageAnalysis.Count) file(s)
$($script:Report.PackageAnalysis | ForEach-Object { "  - $($_.Name) v$($_.Version) (Dependencies: $($_.Dependencies), DevDeps: $($_.DevDependencies))" } | Out-String)

$(@"
Errors: $($script:Report.Errors.Count)
$($script:Report.Errors | ForEach-Object { "  - $_" } | Out-String)

Warnings: $($script:Report.Warnings.Count)
$($script:Report.Warnings | ForEach-Object { "  - $_" } | Out-String)

================================================================================
END OF REPORT
================================================================================
"@)
    
    Write-Host $summary
}

# ============================================================================
# Main Execution
# ============================================================================

function Main {
    Write-Log "========== CLEANUP AND REVIEW SCRIPT STARTED ==========" -Level "Info"
    Write-Log "Repository: $($script:Config.RepoRoot)" -Level "Info"
    Write-Log "Execution Mode: $(if ($script:Config.DryRun) { 'DRY RUN' } else { 'LIVE' })" -Level "Warning"
    Write-Log "" -Level "Info"
    
    if ($CleanupArtifacts) {
        Remove-BuildArtifacts
        Write-Log "" -Level "Info"
    }
    
    if ($RemoveBranches) {
        Remove-EditBranches
        Write-Log "" -Level "Info"
    }
    
    if ($VerifySecurity) {
        Verify-SecurityThreats
        Write-Log "" -Level "Info"
    }
    
    if ($AnalyzePackages) {
        Analyze-PackageJson
        Write-Log "" -Level "Info"
    }
    
    if ($GenerateReport) {
        Generate-HtmlReport -ReportPath $ReportPath
        Generate-TextReport
    }
    
    Write-Log "========== CLEANUP AND REVIEW SCRIPT COMPLETED ==========" -Level "Success"
}

# Execute main function
Main
