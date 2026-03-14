const fs = require('fs');

let content = fs.readFileSync('src/app/employee/page.tsx', 'utf8');

// Replace function name
content = content.replace('export default function EmployeeDashboard()', 'export function MyProfileMockup()');

// Remove Topbar block. It starts with {/* Topbar */} and ends with </header>
let topbarStart = content.indexOf('{/* Topbar */}');
let headerEnd = content.indexOf('</header>') + '</header>'.length;
if (topbarStart !== -1 && headerEnd !== -1) {
    content = content.substring(0, topbarStart) + content.substring(headerEnd);
}

// Remove Breadcrumb block. It starts with {/* Breadcrumb Navigation Banner */} and ends with </div> just before <main
let breadStart = content.indexOf('{/* Breadcrumb Navigation Banner */}');
let mainStart = content.indexOf('<main className="flex-1 overflow-y-auto px-4');
if (breadStart !== -1 && mainStart !== -1) {
    content = content.substring(0, breadStart) + content.substring(mainStart);
}

// Fix outer div classes
content = content.replace('className="flex flex-col h-screen bg-[#E3E1DB] font-sans overflow-hidden"', 'className="w-full relative h-[calc(100vh-140px)] flex flex-col font-sans"');

// Fix toast position
content = content.replace('className="fixed top-24', 'className="absolute top-4');

// Finally save it
fs.writeFileSync('src/components/mockups/MyProfileMockup.tsx', content, 'utf8');
console.log("Transformed.");
