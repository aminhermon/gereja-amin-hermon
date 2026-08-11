$root = "C:\Users\LENOVO\.gemini\antigravity-ide\scratch\gereja-amin-hermon"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8090/")
$listener.Start()
Write-Host "Server running on http://localhost:8090"

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $localPath = $ctx.Request.Url.LocalPath
    if ($localPath -eq "/") { $localPath = "/index.html" }
    $filePath = Join-Path $root ($localPath.TrimStart("/").Replace("/", "\"))
    
    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        switch ($ext) {
            ".html" { $ctx.Response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $ctx.Response.ContentType = "text/css; charset=utf-8" }
            ".js"   { $ctx.Response.ContentType = "application/javascript; charset=utf-8" }
            ".png"  { $ctx.Response.ContentType = "image/png" }
            ".jpg"  { $ctx.Response.ContentType = "image/jpeg" }
            ".svg"  { $ctx.Response.ContentType = "image/svg+xml" }
            ".pdf"  { $ctx.Response.ContentType = "application/pdf" }
            default { $ctx.Response.ContentType = "application/octet-stream" }
        }
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $ctx.Response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
        $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    }
    $ctx.Response.OutputStream.Close()
}
