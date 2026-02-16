Add-Type -AssemblyName System.Drawing

$inputPath = "c:\Users\Lipaz\Desktop\לימודים ופיתוחים\ModerniMan\ידידים\yedidim-generator\website_static\backup\atlit_banner_backup_20260217_000652.png"
$outputPath = "c:\Users\Lipaz\Desktop\לימודים ופיתוחים\ModerniMan\ידידים\yedidim-generator\website_static\backup\atlit_banner_compressed.jpg"

$img = [System.Drawing.Image]::FromFile($inputPath)
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

$img.Save($outputPath, $jpegEncoder, $encoderParams)
$img.Dispose()

Write-Host "Compressed to JPEG successfully!"
Get-Item $outputPath | Select-Object Name, Length
