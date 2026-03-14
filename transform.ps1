$content = [System.IO.File]::ReadAllText("src\app\employee\page.tsx", [System.Text.Encoding]::UTF8)

$content = $content.Replace("export default function EmployeeDashboard()", "export function MyProfileMockup()")
$content = $content.Replace('className="flex flex-col h-screen bg-[#E3E1DB] font-sans overflow-hidden"', 'className="w-[calc(100vw-64px)] sm:w-full relative h-[calc(100vh-250px)] flex flex-col font-sans overflow-hidden"')
$content = $content.Replace('className="fixed top-24', 'className="absolute top-4')

# We need to replace fixed modals by absolute:
$content = $content.Replace('className="fixed inset-0', 'className="absolute inset-0')

$content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?s)<header.*?</header>', '')
$content = [System.Text.RegularExpressions.Regex]::Replace($content, '(?s)\{\/\* Breadcrumb Navigation Banner \*\/\}[\s\S]*?<main', '<main')

[System.IO.File]::WriteAllText("src\components\mockups\MyProfileMockup.tsx", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done"
