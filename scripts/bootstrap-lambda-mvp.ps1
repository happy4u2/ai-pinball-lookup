$ErrorActionPreference = "Stop"

Write-Host "Bootstrapping Lambda MVP structure..." -ForegroundColor Cyan

# Ensure we are at repo root
$repoRoot = Get-Location

# Create directories
$dirs = @(
    "lambda",
    "lambda\lib",
    "lambda\events"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
    else {
        Write-Host "Directory already exists: $dir"
    }
}

# File contents
$packageJson = @'
{
  "name": "ai-pinball-lookup-lambda",
  "version": "0.1.0",
  "description": "MVP Lambda for AI Pinball Lookup",
  "type": "module",
  "main": "handler.js",
  "scripts": {
    "test:local": "node handler.js"
  }
}
'@

$responseJs = @'
export function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}
'@

$normalizeJs = @'
export function normalizeMachineName(value) {
  if (!value || typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ");
}
'@

$handlerJs = @'
import { jsonResponse } from "./lib/response.js";
import { normalizeMachineName } from "./lib/normalize.js";

export const handler = async (event = {}) => {
  try {
    const body = parseBody(event.body);
    const machineName =
      body.machineName ??
      event?.queryStringParameters?.machineName ??
      event?.queryStringParameters?.name ??
      "";

    const normalizedName = normalizeMachineName(machineName);

    if (!normalizedName) {
      return jsonResponse(400, {
        error: "Missing machineName",
        message: "Provide a machineName in the JSON body or query string."
      });
    }

    return jsonResponse(200, {
      source: "lambda-mvp",
      result: {
        query: machineName,
        normalized_query: normalizedName,
        status: "accepted",
        next_step: "Wire OPDB lookup service"
      }
    });
  } catch (error) {
    return jsonResponse(500, {
      error: "InternalServerError",
      message: error.message || "Unexpected error"
    });
  }
};

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return JSON.parse(body);
  }

  if (typeof body === "object") {
    return body;
  }

  return {};
}
'@

$lookupTzJson = @'
{
  "body": "{\"machineName\":\"Twilight Zone\"}"
}
'@

$lookupEmptyJson = @'
{
  "body": "{}"
}
'@

# Files to create
$files = @{
    "lambda\package.json"             = $packageJson
    "lambda\lib\response.js"          = $responseJs
    "lambda\lib\normalize.js"         = $normalizeJs
    "lambda\handler.js"               = $handlerJs
    "lambda\events\lookup-tz.json"    = $lookupTzJson
    "lambda\events\lookup-empty.json" = $lookupEmptyJson
}

foreach ($file in $files.Keys) {
    $parent = Split-Path $file -Parent
    if ($parent -and -not (Test-Path $parent)) {
        New-Item -ItemType Directory -Path $parent | Out-Null
    }

    Set-Content -Path $file -Value $files[$file] -Encoding UTF8
    Write-Host "Wrote file: $file"
}

Write-Host ""
Write-Host "Lambda MVP bootstrap complete." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review files"
Write-Host "2. git add ."
Write-Host '3. git commit -m "feat: add lambda MVP handler with input validation and normalized response"'