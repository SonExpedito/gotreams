# Inicia login, produto, venda (Spring Boot) e o front (Next.js), cada um em sua janela.
# Uso:  .\iniciar.ps1          (inicio normal)
#       .\iniciar.ps1 -Clean   (roda "mvnw clean" antes, util apos trocar porta ou configuracao)
param([switch]$Clean)

$raiz = $PSScriptRoot
if (-not $raiz) { $raiz = (Get-Location).Path }

$servicos = @(
    @{ Nome = "login";   PortaPadrao = 8083 },
    @{ Nome = "produto"; PortaPadrao = 8081 },
    @{ Nome = "venda";   PortaPadrao = 8082 }
)
$portaFront = 3000

function Get-Porta($dir, $padrao) {
    $arq = Join-Path $dir "src\main\resources\application.properties"
    if (Test-Path $arq) {
        $linha = Select-String -Path $arq -Pattern '^\s*server\.port\s*=\s*(\d+)' | Select-Object -First 1
        if ($linha) { return [int]$linha.Matches[0].Groups[1].Value }
    }
    return $padrao
}

function Liberar-Porta($porta) {
    Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  Encerrando processo $($_.OwningProcess) que usava a porta $porta" -ForegroundColor Yellow
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

function Esperar-Porta($porta, $timeoutSeg) {
    $limite = (Get-Date).AddSeconds($timeoutSeg)
    while ((Get-Date) -lt $limite) {
        if (Get-NetTCPConnection -LocalPort $porta -State Listen -ErrorAction SilentlyContinue) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

$goal = if ($Clean) { "clean spring-boot:run" } else { "spring-boot:run" }

# ---- Servicos Spring Boot (um por vez; espera a porta abrir antes do proximo) ----
foreach ($s in $servicos) {
    $mvnw = Get-ChildItem -Path (Join-Path $raiz $s.Nome) -Filter mvnw.cmd -Recurse -Depth 1 -ErrorAction SilentlyContinue |
            Select-Object -First 1
    if (-not $mvnw) {
        Write-Host "NAO ENCONTRADO: pasta '$($s.Nome)' (mvnw.cmd nao existe aqui)" -ForegroundColor Red
        continue
    }

    $dir   = $mvnw.DirectoryName
    $porta = Get-Porta $dir $s.PortaPadrao
    Write-Host "Iniciando $($s.Nome) (porta $porta)..."
    Liberar-Porta $porta

    $comando = "`$Host.UI.RawUI.WindowTitle = '$($s.Nome) :$porta'; .\mvnw.cmd $goal"
    Start-Process powershell -WorkingDirectory $dir -ArgumentList "-NoExit", "-Command", $comando

    if (Esperar-Porta $porta 120) {
        Write-Host "  $($s.Nome) no ar." -ForegroundColor Green
    } else {
        Write-Host "  $($s.Nome) nao abriu a porta $porta em 120s. Veja a janela dele." -ForegroundColor Red
    }
}

# ---- Front Next.js: procura o package.json que tem "next" ----
$pkg = Get-ChildItem -Path $raiz -Filter package.json -Recurse -Depth 2 -ErrorAction SilentlyContinue |
       Where-Object { $_.FullName -notmatch 'node_modules' } |
       Where-Object { Select-String -Path $_.FullName -Pattern '"next"' -Quiet } |
       Select-Object -First 1

if (-not $pkg) {
    Write-Host "Front Next.js nao encontrado (nenhum package.json com 'next')." -ForegroundColor Red
} else {
    Write-Host "Iniciando front (porta $portaFront) em $($pkg.DirectoryName)..."
    Liberar-Porta $portaFront
    $comando = "`$Host.UI.RawUI.WindowTitle = 'front :$portaFront'; if (-not (Test-Path node_modules)) { npm install }; npm run dev"
    Start-Process powershell -WorkingDirectory $pkg.DirectoryName -ArgumentList "-NoExit", "-Command", $comando

    if (Esperar-Porta $portaFront 120) {
        Write-Host "  front no ar." -ForegroundColor Green
        Start-Process "http://localhost:$portaFront"
    } else {
        Write-Host "  front nao abriu a porta $portaFront em 120s. Veja a janela dele." -ForegroundColor Red
    }
}

Write-Host "Pronto. Painel de testes: http://localhost:$portaFront/teste"
