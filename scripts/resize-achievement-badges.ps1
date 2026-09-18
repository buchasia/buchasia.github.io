param(
  [string]$Directory = 'public/images/achievements/milestones',
  [int]$Size = 512
)

Add-Type -AssemblyName System.Drawing

Get-ChildItem -LiteralPath $Directory -Filter '*.png' | ForEach-Object {
  $source = [System.Drawing.Bitmap]::new($_.FullName)
  $target = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($target)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $scale = [Math]::Min($Size / $source.Width, $Size / $source.Height)
  $width = [Math]::Round($source.Width * $scale)
  $height = [Math]::Round($source.Height * $scale)
  $x = [Math]::Round(($Size - $width) / 2)
  $y = [Math]::Round(($Size - $height) / 2)
  $graphics.DrawImage($source, $x, $y, $width, $height)

  $temporaryPath = "$($_.FullName).optimized.png"
  $target.Save($temporaryPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $source.Dispose()
  $target.Dispose()
  Move-Item -LiteralPath $temporaryPath -Destination $_.FullName -Force
  Write-Output "Resized $($_.Name) to ${Size}x${Size}"
}
