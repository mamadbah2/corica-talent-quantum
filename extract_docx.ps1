
$docxPath = "Formulaire d'Évaluation Performances annuelle- CORICA MINING SERVICES.docx"
$zipPath = "temp_doc.zip"
$extractDir = "temp_extract"

if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }
Copy-Item $docxPath $zipPath
Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

$xmlPath = "$extractDir\word\document.xml"
if (Test-Path $xmlPath) {
    [xml]$doc = Get-Content $xmlPath
    $ns = New-Object System.Xml.XmlNamespaceManager($doc.NameTable)
    $ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
    
    $texts = $doc.SelectNodes("//w:t", $ns) | ForEach-Object { $_.InnerText }
    $texts -join "`n" | Out-File -FilePath "extracted_text.txt" -Encoding utf8
}

Remove-Item $zipPath
# Keep extractDir for debug if needed, but let's clean up
# Remove-Item -Recurse -Force $extractDir
