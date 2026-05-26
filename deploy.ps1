$token   = Read-Host "GitHub Personal Access Token"
$repo    = "felix792/trainings-app"
$baseDir = $PSScriptRoot
$files   = @("db.js", "player.js", "player.html", "players.html", "team.html", "team.js", "settings.html", "settings.js", "profile.html", "profile.js", "cards.html", "cards.js", "blackbox.html", "blackbox.js", "exercises.html", "exercises.js", "exercise.html", "exercise.js", "plays.html", "plays.js", "play.html", "play.js", "lineups.html", "lineups.js", "lineup.html", "lineup.js", "livegame.html", "livegame.js", "styles.css", "sw.js")
$headers = @{
  Authorization = "token $token"
  Accept        = "application/vnd.github.v3+json"
  "User-Agent"  = "TactIQ-Deploy"
}

foreach ($file in $files) {
  $filePath = Join-Path $baseDir $file
  $bytes    = [System.IO.File]::ReadAllBytes($filePath)
  $encoded  = [Convert]::ToBase64String($bytes)
  $url      = "https://api.github.com/repos/$repo/contents/$file"

  try {
    $existing = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    $sha = $existing.sha
  } catch {
    $sha = $null
  }

  $body = @{ message = "Update $file"; content = $encoded }
  if ($sha) { $body.sha = $sha }

  Invoke-RestMethod -Uri $url -Headers $headers -Method Put `
    -Body ($body | ConvertTo-Json) -ContentType "application/json" | Out-Null

  Write-Host "Pushed: $file"
}

Write-Host ""
Write-Host "Done! GitHub Pages redeploys in about 1 minute."
