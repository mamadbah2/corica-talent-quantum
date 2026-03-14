import { NextRequest, NextResponse } from "next/server";

// Base de données des utilisateurs Corica extraite de la capture d'écran
// Interface Utilisateur -> route de redirection
const INTERFACE_TO_ROUTE: Record<string, string> = {
    employe: "/employee",
    evaluateur: "/manager",
    administrator: "/site-admin",
    coordinateur: "/country-admin",
    "group manager": "/group-admin",
    superadmin: "/super-admin",
    calibration: "/manager-n2",
};

export interface CoricaUser {
    id_usercount: number;
    nom_prenoms: string;
    pays: string;
    departement: string;
    fonction: string;
    scope: string;
    interface_utilisateur: string; // employe | evaluateur | administrator | coordinateur | group manager | superadmin
    usercount: string;    // e.g. Employe.10053@company.com
    mot_de_passe: string; // e.g. COR-123
    id_evaluateur: number | null;
    id_evaluateur_n2: number | null;
    route: string;        // computed from interface_utilisateur
}

const USERS: CoricaUser[] = [
    { id_usercount: 10053, nom_prenoms: "Blaise Bonzou Essey", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "COUNTRY HR MANAGER", scope: "groupe", interface_utilisateur: "coordinateur", usercount: "Employe.10053@company.com", mot_de_passe: "COR-123", id_evaluateur: 10089, id_evaluateur_n2: 10088, route: "/country-admin" },
    { id_usercount: 10054, nom_prenoms: "Koua Jean Jeaques KOUAMANAN", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERINTENDENT", scope: "sissengue", interface_utilisateur: "administrator", usercount: "Employe.10054@company.com", mot_de_passe: "COR-123", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10055, nom_prenoms: "Etienne Famien", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "sissengue", interface_utilisateur: "administrator", usercount: "Employe.10055@company.com", mot_de_passe: "COR-123", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10056, nom_prenoms: "Mamadou Traore", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "PROJECT MANAGER", scope: "sissengue", interface_utilisateur: "evaluateur", usercount: "Employe.10056@company.com", mot_de_passe: "COR-123", id_evaluateur: 10096, id_evaluateur_n2: 10092, route: "/manager" },
    { id_usercount: 10057, nom_prenoms: "Anzoumana Diakite", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10057@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10058, nom_prenoms: "Issiaka Konate", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10058@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10059, nom_prenoms: "Siaka Djakite", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10059@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10060, nom_prenoms: "Fiacre Tossou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10060@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10061, nom_prenoms: "Arouna Sankara", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10061@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10062, nom_prenoms: "Kamoko Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10062@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10063, nom_prenoms: "Issouf Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10063@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10064, nom_prenoms: "Zie Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10064@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10065, nom_prenoms: "Dognimin Coulibaly", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10065@company.com", mot_de_passe: "COR-123", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10066, nom_prenoms: "Francis Nestor Koffi", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR MANAGER", scope: "ity", interface_utilisateur: "administrator", usercount: "Employe.10066@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/site-admin" },
    { id_usercount: 10067, nom_prenoms: "David Kone", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "PROJECT MANAGER", scope: "ity", interface_utilisateur: "evaluateur", usercount: "Employe.10067@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10068, nom_prenoms: "Lambert Akai", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10068@company.com", mot_de_passe: "COR-123", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10069, nom_prenoms: "Guillaume Tao", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10069@company.com", mot_de_passe: "COR-123", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10070, nom_prenoms: "Pierre Zahiri", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10070@company.com", mot_de_passe: "COR-123", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10071, nom_prenoms: "Honore Tokaleu", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10071@company.com", mot_de_passe: "COR-123", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10072, nom_prenoms: "Diomande Abou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10072@company.com", mot_de_passe: "COR-123", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10073, nom_prenoms: "Michel Gonkanou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10073@company.com", mot_de_passe: "COR-123", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10074, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "yamousoukro", interface_utilisateur: "administrator", usercount: "Employe.10074@company.com", mot_de_passe: "COR-123", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10075, nom_prenoms: "Deepak Kumar", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "General Manager - Asset & Maintenance", scope: "yamousoukro", interface_utilisateur: "evaluateur", usercount: "Employe.10075@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10076, nom_prenoms: "Hamidou Moussa", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10076@company.com", mot_de_passe: "COR-123", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10077, nom_prenoms: "Mamadou Ouattara", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10077@company.com", mot_de_passe: "COR-123", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10078, nom_prenoms: "Theophile Kakou", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10078@company.com", mot_de_passe: "COR-123", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10079, nom_prenoms: "Djamiou Badara", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10079@company.com", mot_de_passe: "COR-123", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10080, nom_prenoms: "Boniface Ettien", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10080@company.com", mot_de_passe: "COR-123", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10081, nom_prenoms: "Hyacinthe Djaha", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10081@company.com", mot_de_passe: "COR-123", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10082, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "abidjan", interface_utilisateur: "administrator", usercount: "Employe.10082@company.com", mot_de_passe: "COR-123", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10083, nom_prenoms: "Kalilou Sanogo", pays: "Cote d'Ivoire", departement: "FINANCE", fonction: "COUNTRY FINANCE MANAGER", scope: "abidjan", interface_utilisateur: "evaluateur", usercount: "Employe.10083@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10084, nom_prenoms: "Serge Anibie", pays: "Cote d'Ivoire", departement: "IT", fonction: "IT SUPERINTENDENT", scope: "abidjan", interface_utilisateur: "evaluateur", usercount: "Employe.10084@company.com", mot_de_passe: "COR-123", id_evaluateur: 10097, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10085, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "IT SUPERVISOR", scope: "abidjan", interface_utilisateur: "employe", usercount: "Employe.10085@company.com", mot_de_passe: "COR-123", id_evaluateur: 10084, id_evaluateur_n2: 10097, route: "/employee" },
    { id_usercount: 10086, nom_prenoms: "Madiara Traore epse Bamba", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "abidjan", interface_utilisateur: "employe", usercount: "Employe.10086@company.com", mot_de_passe: "COR-123", id_evaluateur: 10095, id_evaluateur_n2: 10092, route: "/employee" },
    { id_usercount: 10087, nom_prenoms: "Bamba Abdoulaye", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "GROUP PM MANAGER RECRUITMENT, TRAINING", scope: "groupe", interface_utilisateur: "coordinateur", usercount: "Employe.10087@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/group-admin" },
    { id_usercount: 10088, nom_prenoms: "Hendrik Horden", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "CHIEF PEOPLE OFFICER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10088@company.com", mot_de_passe: "COR-123", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10089, nom_prenoms: "Christian Lankoande", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "GROUP HR MANAGER OPERATIONS SUPPORT", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10089@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10090, nom_prenoms: "Issa Sore", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "EMPLOYE", scope: "groupe", interface_utilisateur: "employe", usercount: "Employe.10090@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10091, nom_prenoms: "Mel Kawandami", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GM BUSINESS ANALYST & SUPPLY CHAIN", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10091@company.com", mot_de_passe: "COR-123", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10092, nom_prenoms: "Yoen Myombo", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GROUP SUPPLY CHAIN MANAGER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10092@company.com", mot_de_passe: "COR-123", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10093, nom_prenoms: "Youndou Alain", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GROUP LOGISTICS MANAGER", scope: "groupe", interface_utilisateur: "employe", usercount: "Employe.10093@company.com", mot_de_passe: "COR-123", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10094, nom_prenoms: "Bah Modibo", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "groupe", interface_utilisateur: "employe", usercount: "Employe.10094@company.com", mot_de_passe: "COR-123", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10095, nom_prenoms: "Amidou Keba", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10095@company.com", mot_de_passe: "COR-123", id_evaluateur: 10092, id_evaluateur_n2: 10091, route: "/manager" },
    { id_usercount: 10096, nom_prenoms: "Siya", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "OPERATIONS MANAGER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10096@company.com", mot_de_passe: "COR-123", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10097, nom_prenoms: "Ibrahima Thiero", pays: "Tous les pays", departement: "INFORMATION SYSTEM", fonction: "CHIEF INFORMATION OFFICER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10097@company.com", mot_de_passe: "COR-123", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager" },
    // Comptes manager N+2 / calibration et super admin
    { id_usercount: 10098, nom_prenoms: "Comite Calibration N+2", pays: "Tous les pays", departement: "DIRECTION GENERALE", fonction: "CALIBRATION COMMITTEE", scope: "groupe", interface_utilisateur: "calibration", usercount: "Employe.10098@company.com", mot_de_passe: "COR-123", id_evaluateur: null, id_evaluateur_n2: 10101, route: "/manager-n2" },
    // 10101: Sommet de la pyramide (Abdoulaye Diallo)
    { id_usercount: 10101, nom_prenoms: "Abdoulaye Diallo", pays: "Tous les pays", departement: "DIRECTION GENERALE", fonction: "CHIEF EXECUTIVE OFFICER (CEO)", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10101@company.com", mot_de_passe: "COR-123", id_evaluateur: null, id_evaluateur_n2: null, route: "/manager-n2" },
    // Super Admin: Djibo Ibouraima
    { id_usercount: 12410, nom_prenoms: "Djibo Ibouraima", pays: "Cote d'Ivoire", departement: "GOUVERNANCE & COMPLIANCE", fonction: "SUPER ADMINISTRATEUR / GRC", scope: "Abidjan", interface_utilisateur: "superadmin", usercount: "Employe.12410@company.com", mot_de_passe: "COR-123", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/super-admin" },
];

// GET all users (for admin listings)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope');
    const role = searchParams.get('role');

    let filtered = USERS;
    if (scope) filtered = filtered.filter(u => u.scope === scope);
    if (role) filtered = filtered.filter(u => u.interface_utilisateur === role);

    // Never return passwords in listing
    return NextResponse.json(filtered.map(u => ({
        ...u,
        mot_de_passe: undefined
    })));
}

// POST /api/users/auth - Authentication
export async function POST(request: NextRequest) {
    const { usercount, password } = await request.json();

    if (!usercount || !password) {
        return NextResponse.json({ success: false, error: "Usercount et mot de passe requis." }, { status: 400 });
    }

    // Case-insensitive match on usercount
    const user = USERS.find(
        u => u.usercount.toLowerCase() === usercount.toLowerCase().trim()
            && u.mot_de_passe === password.trim()
    );

    if (!user) {
        return NextResponse.json({ success: false, error: "Identifiants incorrects." }, { status: 401 });
    }

    return NextResponse.json({
        success: true,
        user: {
            id_usercount: user.id_usercount,
            nom_prenoms: user.nom_prenoms,
            pays: user.pays,
            departement: user.departement,
            fonction: user.fonction,
            scope: user.scope,
            interface_utilisateur: user.interface_utilisateur,
            usercount: user.usercount,
            id_evaluateur: user.id_evaluateur,
            route: user.route,
        }
    });
}
