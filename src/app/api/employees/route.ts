import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const origin = request.nextUrl.origin;
    const { searchParams } = new URL(request.url);
    const managerIdParam = searchParams.get('managerId');
    const managerId = managerIdParam ? parseInt(managerIdParam, 10) : null;

    const usersRes = await fetch(`${origin}/api/users`);
    let ALL_USERS: any[] = await usersRes.json();

    // Si un managerId est fourni, filtrer pour ne garder que ses n-1
    if (managerId) {
        ALL_USERS = ALL_USERS.filter(u => u.id_evaluateur === managerId);
    }

    // Transformation des VRAIS utilisateurs (ALL_USERS) en employés compatibles avec la 9-Box
    const REAL_EMPLOYEES = ALL_USERS.filter(u => u.interface_utilisateur !== 'superadmin').map((user) => {
        // Pseudo-random data basée sur l'id pour garder l'interface riche et consistante
        const randomPerf = ((user.id_usercount % 15) / 10) + 2.5; // Entre 2.5 et 4.0
        const randomPot = Array.from({ length: 16 }, (_, j) => ((user.id_usercount + j) % 3) + 1);

        return {
            id: user.id_usercount.toString(),
            name: user.nom_prenoms,
            department: user.departement,
            position: user.fonction,
            role: user.interface_utilisateur,
            jobGrade: ["G1", "G2", "G3", "G4"][user.id_usercount % 4],
            seniority: ["< 1 year", "1-3 years", "3-5 years", "+5 years"][user.id_usercount % 4],
            site: user.scope.charAt(0).toUpperCase() + user.scope.slice(1),
            performanceScoreN: parseFloat(randomPerf.toFixed(1)),
            potentialAnswers: randomPot
        };
    });

    return NextResponse.json(REAL_EMPLOYEES);
}

export async function PUT(request: NextRequest) {
    const data = await request.json();
    console.log("Mock Save: ", data);
    return NextResponse.json({ success: true, message: "Évaluation enregistrée" });
}
