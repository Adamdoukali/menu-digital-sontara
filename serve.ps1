$port = 5151
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Listening on http://localhost:$port/"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        $request = $context.Request

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }

        # Convert URL path to local filesystem path
        $filePath = Join-Path (Get-Location).Path $localPath.Replace("/", "\")

        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            # Simple MIME type guessing
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($ext) {
                ".html" { $response.ContentType = "text/html" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".pdf"  { $response.ContentType = "application/pdf" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $errorMsg = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found")
            $response.ContentLength64 = $errorMsg.Length
            $response.OutputStream.Write($errorMsg, 0, $errorMsg.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
