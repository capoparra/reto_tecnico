# Verifies Paso 1 and 2: build, unit tests, and optional API smoke test (requires Docker + Postgres)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$backend = Join-Path $root "backend"

$env:Path = "C:\Program Files\nodejs;" + $env:Path

Write-Host "=== 1. Build ===" -ForegroundColor Cyan
Push-Location $backend
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== 2. Unit tests ===" -ForegroundColor Cyan
npm test
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "=== 3. Docker / Postgres ===" -ForegroundColor Cyan
Pop-Location
Push-Location $root
$dockerOk = $false
try {
  docker compose up -d 2>&1 | Out-Host
  if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
} catch {
  Write-Host "Docker no disponible. Instala Docker Desktop para probar la API en vivo." -ForegroundColor Yellow
}

if (-not $dockerOk) {
  Write-Host "Build y tests OK. API en vivo requiere: docker compose up -d" -ForegroundColor Green
  exit 0
}

Start-Sleep -Seconds 5
Write-Host "=== 4. API smoke test ===" -ForegroundColor Cyan
Push-Location $backend
$job = Start-Job { param($b) Set-Location $b; npm run start:dev 2>&1 } -ArgumentList $backend
Start-Sleep -Seconds 18

$base = "http://localhost:3000/api"
$product = Invoke-RestMethod -Uri "$base/products" -Method Get
Write-Host "GET /products stockUnits=$($product.stockUnits)"

$fees = Invoke-RestMethod -Uri "$base/config/fees" -Method Get
Write-Host "GET /config/fees base=$($fees.baseFeeCents) delivery=$($fees.deliveryFeeCents)"

$customer = Invoke-RestMethod -Uri "$base/customers" -Method Post -ContentType "application/json" -Body '{"fullName":"Verify User","email":"verify@test.com","phone":"3001112233"}'
Write-Host "POST /customers id=$($customer.id)"

$txBody = @{
  customerId = $customer.id
  productId = $product.id
  delivery = @{
    addressLine = "Calle 100 # 10-20"
    city = "Bogota"
    region = "Cundinamarca"
    postalCode = "110111"
    country = "CO"
  }
} | ConvertTo-Json -Depth 5

$pending = Invoke-RestMethod -Uri "$base/transactions" -Method Post -ContentType "application/json" -Body $txBody
Write-Host "POST /transactions number=$($pending.transaction.transactionNumber) status=$($pending.transaction.status)"

$stockBefore = $product.stockUnits
$completeBody = '{"status":"APPROVED","wompiTransactionId":"verify-sandbox-1","paymentResultMessage":"OK"}'
$completed = Invoke-RestMethod -Uri "$base/transactions/$($pending.transaction.id)/payment-result" -Method Patch -ContentType "application/json" -Body $completeBody
Write-Host "PATCH payment-result status=$($completed.transaction.status)"

$productAfter = Invoke-RestMethod -Uri "$base/products" -Method Get
Write-Host "GET /products after stockUnits=$($productAfter.stockUnits) (was $stockBefore)"

if ($productAfter.stockUnits -ne ($stockBefore - 1)) {
  Write-Host "ERROR: stock did not decrease" -ForegroundColor Red
  Stop-Job $job -ErrorAction SilentlyContinue
  exit 1
}

Write-Host "=== All checks passed ===" -ForegroundColor Green
Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -Force -ErrorAction SilentlyContinue
