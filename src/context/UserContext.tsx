"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface CoricaUser {
    id_usercount: number;
    nom_prenoms: string;
    pays: string;
    departement: string;
    fonction: string;
    scope: string;
    interface_utilisateur: string;
    usercount: string;              // e.g. Employe.10057@company.com
    id_evaluateur: number | null;   // N+1 direct
    id_evaluateur_n2: number | null; // N+2 = évaluateur du N+1 (pré-calculé)
    route: string;
    photo_url?: string;             // URL ou base64 de la photo de profil
    telephone?: string;
    date_embauche?: string;
}

export interface CoricaNotification {
    id: string;
    userId: number;
    message: string;
    timestamp: number;
    read: boolean;
    type: 'success' | 'info' | 'warning';
    link?: string; // Nouvelle propriété pour la redirection
}

// ─────────────────────────────────────────────
// Types de la chaîne managériale
// ─────────────────────────────────────────────
export interface ManagerN2Info {
    nom_prenoms: string;
    usercount: string;
    fonction: string;
    departement?: string;
    id_usercount?: number | null;  // null = compte par défaut Ibouraima
    isDefault: boolean;            // true = fallback Ibouraima Djibo
}

// ─────────────────────────────────────────────
// Compte N+2 par défaut (utilisé si le N+1 n'a pas d'évaluateur)
// ─────────────────────────────────────────────
const MANAGER_N2_DEFAULT: ManagerN2Info = {
    nom_prenoms: "Abdoulaye Diallo",
    usercount: "Employe.10101@company.com",
    fonction: "CHIEF EXECUTIVE OFFICER (CEO)",
    departement: "DIRECTION GENERALE",
    id_usercount: 10101,
    isDefault: true,
};

// ─────────────────────────────────────────────
// Lookup table partiellement intégrée ici
// pour retrouver les managers sans refaire un appel API
// ─────────────────────────────────────────────
export const ALL_USERS: CoricaUser[] = [
    // ─── SITE SISSENGUE ───────────────────────────────────────────────────────────
    // 10053: N+1=10089(Christian), N+2=10088(Hendrik, éval de Christian)
    { id_usercount: 10053, nom_prenoms: "Blaise Bonzou Essey", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "COUNTRY HR MANAGER", scope: "groupe", interface_utilisateur: "coordinateur", usercount: "Employe.10053@company.com", id_evaluateur: 10089, id_evaluateur_n2: 10088, route: "/country-admin" },
    // 10054: N+1=10053(Blaise), N+2=10089(Christian, éval de Blaise)
    { id_usercount: 10054, nom_prenoms: "Koua Jean Jeaques KOUAMANAN", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERINTENDENT", scope: "sissengue", interface_utilisateur: "administrator", usercount: "Employe.10054@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    // 10055: N+1=10053(Blaise), N+2=10089(Christian)
    { id_usercount: 10055, nom_prenoms: "Etienne Famien", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "sissengue", interface_utilisateur: "administrator", usercount: "Employe.10055@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    // 10056: N+1=10096(Siya), N+2=10092(Yoen Myombo, éval de Siya)
    { id_usercount: 10056, nom_prenoms: "Mamadou Traore", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "PROJECT MANAGER", scope: "sissengue", interface_utilisateur: "evaluateur", usercount: "Employe.10056@company.com", id_evaluateur: 10096, id_evaluateur_n2: 10092, route: "/manager" },
    // 10057-10065: N+1=10056(Mamadou), N+2=10096(Siya, éval de Mamadou)
    { id_usercount: 10057, nom_prenoms: "Anzoumana Diakite", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10057@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10058, nom_prenoms: "Issiaka Konate", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10058@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10059, nom_prenoms: "Siaka Djakite", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10059@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10060, nom_prenoms: "Fiacre Tossou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10060@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10061, nom_prenoms: "Arouna Sankara", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10061@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10062, nom_prenoms: "Kamoko Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10062@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10063, nom_prenoms: "Issouf Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10063@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10064, nom_prenoms: "Zie Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10064@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10065, nom_prenoms: "Dognimin Coulibaly", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", interface_utilisateur: "employe", usercount: "Employe.10065@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    // ─── SITE ITY ────────────────────────────────────────────────────────────────
    // 10066: N+1=10088(Hendrik), N+2=10101(éval de Hendrik)
    { id_usercount: 10066, nom_prenoms: "Francis Nestor Koffi", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR MANAGER", scope: "ity", interface_utilisateur: "administrator", usercount: "Employe.10066@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/site-admin" },
    // 10067: N+1=10088(Hendrik), N+2=10101
    { id_usercount: 10067, nom_prenoms: "David Kone", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "PROJECT MANAGER", scope: "ity", interface_utilisateur: "evaluateur", usercount: "Employe.10067@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    // 10068-10073: N+1=10067(David), N+2=10088(Hendrik, éval de David)
    { id_usercount: 10068, nom_prenoms: "Lambert Akai", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10068@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10069, nom_prenoms: "Guillaume Tao", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10069@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10070, nom_prenoms: "Pierre Zahiri", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10070@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10071, nom_prenoms: "Honore Tokaleu", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10071@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10072, nom_prenoms: "Diomande Abou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10072@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10073, nom_prenoms: "Michel Gonkanou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", interface_utilisateur: "employe", usercount: "Employe.10073@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    // ─── SITE YAMOUSSOUKRO ───────────────────────────────────────────────────────
    // 10074: N+1=10053(Blaise), N+2=10089(Christian)
    { id_usercount: 10074, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "yamousoukro", interface_utilisateur: "administrator", usercount: "Employe.10074@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    // 10075: N+1=10088(Hendrik), N+2=10101
    { id_usercount: 10075, nom_prenoms: "Deepak Kumar", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "General Manager - Asset & Maintenance", scope: "yamousoukro", interface_utilisateur: "evaluateur", usercount: "Employe.10075@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    // 10076-10081: N+1=10075(Deepak), N+2=10088(Hendrik, éval de Deepak)
    { id_usercount: 10076, nom_prenoms: "Hamidou Moussa", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10076@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10077, nom_prenoms: "Mamadou Ouattara", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10077@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10078, nom_prenoms: "Theophile Kakou", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10078@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10079, nom_prenoms: "Djamiou Badara", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10079@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10080, nom_prenoms: "Boniface Ettien", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10080@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10081, nom_prenoms: "Hyacinthe Djaha", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", interface_utilisateur: "employe", usercount: "Employe.10081@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    // ─── SITE ABIDJAN ────────────────────────────────────────────────────────────
    // 10082: N+1=10053(Blaise), N+2=10089
    { id_usercount: 10082, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "abidjan", interface_utilisateur: "administrator", usercount: "Employe.10082@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    // 10083: N+1=10088(Hendrik), N+2=10101
    { id_usercount: 10083, nom_prenoms: "Kalilou Sanogo", pays: "Cote d'Ivoire", departement: "FINANCE", fonction: "COUNTRY FINANCE MANAGER", scope: "abidjan", interface_utilisateur: "evaluateur", usercount: "Employe.10083@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    // 10084: N+1=10097(Ibrahima Thiero), N+2=10101(éval d'Ibrahima)
    { id_usercount: 10084, nom_prenoms: "Serge Anibie", pays: "Cote d'Ivoire", departement: "IT", fonction: "IT SUPERINTENDENT", scope: "abidjan", interface_utilisateur: "evaluateur", usercount: "Employe.10084@company.com", id_evaluateur: 10097, id_evaluateur_n2: 10101, route: "/manager" },
    // 10085: N+1=10084(Serge), N+2=10097(Ibrahima, éval de Serge)
    { id_usercount: 10085, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "IT SUPERVISOR", scope: "abidjan", interface_utilisateur: "employe", usercount: "Employe.10085@company.com", id_evaluateur: 10084, id_evaluateur_n2: 10097, route: "/employee" },
    // 10086: N+1=10095(Amidou), N+2=10092(Yoen, éval d'Amidou)
    { id_usercount: 10086, nom_prenoms: "Madiara Traore epse Bamba", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "abidjan", interface_utilisateur: "employe", usercount: "Employe.10086@company.com", id_evaluateur: 10095, id_evaluateur_n2: 10092, route: "/employee" },
    // ─── GROUPE ──────────────────────────────────────────────────────────────────
    // 10087: N+1=10088(Hendrik), N+2=10101
    { id_usercount: 10087, nom_prenoms: "Bamba Abdoulaye", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "GROUP PM MANAGER RECRUITMENT, TRAINING", scope: "groupe", interface_utilisateur: "coordinateur", usercount: "Employe.10087@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/group-admin" },
    // 10088: N+1=10101(CEO), N+2=10101 (sommet)
    { id_usercount: 10088, nom_prenoms: "Hendrik Horden", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "CHIEF PEOPLE OFFICER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10088@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager-n2" },
    // 10089: N+1=10088(Hendrik), N+2=10101
    { id_usercount: 10089, nom_prenoms: "Christian Lankoande", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "GROUP HR MANAGER OPERATIONS SUPPORT", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10089@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager-n2" },
    // 10090: N+1=10088(Hendrik), N+2=10101
    { id_usercount: 10090, nom_prenoms: "Issa Sore", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "EMPLOYE", scope: "groupe", interface_utilisateur: "employe", usercount: "Employe.10090@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/employee" },
    // 10091: N+1=10101(CEO), N+2=10101 (sommet)
    { id_usercount: 10091, nom_prenoms: "Mel Kawandami", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GM BUSINESS ANALYST & SUPPLY CHAIN", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10091@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager" },
    // 10092-10094: N+1=10091(Mel), N+2=10101(éval de Mel)
    { id_usercount: 10092, nom_prenoms: "Yoen Myombo", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GROUP SUPPLY CHAIN MANAGER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10092@company.com", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10093, nom_prenoms: "Youndou Alain", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GROUP LOGISTICS MANAGER", scope: "groupe", interface_utilisateur: "employe", usercount: "Employe.10093@company.com", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10094, nom_prenoms: "Bah Modibo", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "groupe", interface_utilisateur: "employe", usercount: "Employe.10094@company.com", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/employee" },
    // 10095: N+1=10092(Yoen Myombo), N+2=10091(Mel, éval de Yoen)
    { id_usercount: 10095, nom_prenoms: "Amidou Keba", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10095@company.com", id_evaluateur: 10092, id_evaluateur_n2: 10091, route: "/manager" },
    // 10096: N+1=10101(CEO), N+2=10101 (sommet)
    { id_usercount: 10096, nom_prenoms: "Siya", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "OPERATIONS MANAGER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10096@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager-n2" },
    // 10097: N+1=10101(CEO), N+2=10101 (sommet)
    { id_usercount: 10097, nom_prenoms: "Ibrahima Thiero", pays: "Tous les pays", departement: "INFORMATION SYSTEM", fonction: "CHIEF INFORMATION OFFICER", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10097@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager" },
    // ─── COMPTES SYSTÈME ────────────────────────────────────────────────────────
    { id_usercount: 10098, nom_prenoms: "Comite Calibration N+2", pays: "Tous les pays", departement: "DIRECTION GENERALE", fonction: "CALIBRATION COMMITTEE", scope: "groupe", interface_utilisateur: "calibration", usercount: "Employe.10098@company.com", id_evaluateur: null, id_evaluateur_n2: 10101, route: "/manager-n2" },
    // 10101: Sommet de la pyramide (Abdoulaye Diallo)
    { id_usercount: 10101, nom_prenoms: "Abdoulaye Diallo", pays: "Tous les pays", departement: "DIRECTION GENERALE", fonction: "CHIEF EXECUTIVE OFFICER (CEO)", scope: "groupe", interface_utilisateur: "evaluateur", usercount: "Employe.10101@company.com", id_evaluateur: null, id_evaluateur_n2: null, route: "/manager-n2" },
    // Super Admin: Djibo Ibouraima (Reports to Hendrik Horden 10088)
    { 
        id_usercount: 12410, 
        nom_prenoms: "Djibo Ibouraima", 
        pays: "Cote d'Ivoire", 
        departement: "GOUVERNANCE & COMPLIANCE", 
        fonction: "SUPER ADMINISTRATEUR / GRC", 
        scope: "Abidjan", 
        interface_utilisateur: "superadmin", 
        usercount: "Employe.12410@company.com", 
        id_evaluateur: 10088, 
        id_evaluateur_n2: 10101, 
        route: "/super-admin",
        telephone: "+225 05 04 90 01 1 2",
        date_embauche: "08/08/2022" 
    },
];

// Helper: trouve un utilisateur par son id
export function findUserById(id: number | null): CoricaUser | null {
    if (!id) return null;
    return ALL_USERS.find(u => u.id_usercount === id) ?? null;
}

// Helper: trouve l'évaluateur N+1 d'un utilisateur
export function findManagerN1(user: CoricaUser): CoricaUser | null {
    return findUserById(user.id_evaluateur);
}

/**
 * Résolution de l'évaluateur N+2 :
 * 1. Cherche l'évaluateur du N+1 (managerN1.id_evaluateur) dans ALL_USERS.
 * 2. Si trouvé → retourne cet utilisateur converti en ManagerN2Info.
 * 3. Si non trouvé (N+1 sans évaluateur dans le tableau) → retourne le compte Ibouraima Djibo par défaut.
 */
export function resolveManagerN2(user: CoricaUser | null, managerN1: CoricaUser | null): ManagerN2Info {
    // Priorité 1 : utiliser le champ pré-calculé id_evaluateur_n2
    if (user && user.id_evaluateur_n2) {
        const n2User = findUserById(user.id_evaluateur_n2);
        if (n2User) {
            return {
                nom_prenoms: n2User.nom_prenoms,
                usercount: n2User.usercount,
                fonction: n2User.fonction,
                departement: n2User.departement,
                id_usercount: n2User.id_usercount,
                isDefault: false,
            };
        }
    }
    // Priorité 2 : dynamique via l'évaluateur du N+1
    if (managerN1 && managerN1.id_evaluateur) {
        const n2User = findUserById(managerN1.id_evaluateur);
        if (n2User) {
            return {
                nom_prenoms: n2User.nom_prenoms,
                usercount: n2User.usercount,
                fonction: n2User.fonction,
                departement: n2User.departement,
                id_usercount: n2User.id_usercount,
                isDefault: false,
            };
        }
    }
    // Fallback : Administrateur Système (10101)
    return MANAGER_N2_DEFAULT;
}

// ─────────────────────────────────────────────
// Type du Contexte
// ─────────────────────────────────────────────
export interface UserContextType {
    currentUser: CoricaUser | null;
    managerN1: CoricaUser | null;    // Évaluateur N+1 (manager direct)
    managerN2: ManagerN2Info;        // Évaluateur N+2 (résolu dynamiquement)
    setCurrentUser: (user: CoricaUser | null) => void;
    loadUserFromStorage: () => void;
    userPhotoUrl: string | null;     // Photo de profil (base64 ou URL)
    setUserPhotoUrl: (url: string | null) => void;  // Mise à jour photo
    notifications: CoricaNotification[];
    unreadCount: number;
    addNotification: (userId: number, message: string, type?: CoricaNotification['type'], link?: string) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

const UserContext = createContext<UserContextType>({
    currentUser: null,
    managerN1: null,
    managerN2: MANAGER_N2_DEFAULT,
    setCurrentUser: () => { },
    loadUserFromStorage: () => { },
    userPhotoUrl: null,
    setUserPhotoUrl: () => { },
    notifications: [],
    unreadCount: 0,
    addNotification: () => { },
    markAsRead: () => { },
    markAllAsRead: () => { },
    clearNotifications: () => { },
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUserState] = useState<CoricaUser | null>(null);
    const [managerN1, setManagerN1] = useState<CoricaUser | null>(null);
    const [managerN2, setManagerN2] = useState<ManagerN2Info>(MANAGER_N2_DEFAULT);
    const [userPhotoUrl, setUserPhotoUrlState] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<CoricaNotification[]>([]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Charger les notifications depuis le localStorage
    useEffect(() => {
        if (currentUser) {
            const saved = localStorage.getItem(`notifications_${currentUser.id_usercount}`);
            if (saved) {
                setNotifications(JSON.parse(saved));
            } else {
                setNotifications([]);
            }
        } else {
            setNotifications([]);
        }
    }, [currentUser]);

    // Sauvegarder les notifications dès qu'elles changent
    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(`notifications_${currentUser.id_usercount}`, JSON.stringify(notifications));
        }
    }, [notifications, currentUser]);

    // Écouter les changements de localStorage pour le "temps réel" inter-onglets
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (currentUser && e.key === `notifications_${currentUser.id_usercount}`) {
                setNotifications(JSON.parse(e.newValue || '[]'));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [currentUser]);

    const addNotification = (userId: number, message: string, type: CoricaNotification['type'] = 'info', link?: string) => {
        const newNotif: CoricaNotification = {
            id: Date.now().toString(),
            userId,
            message,
            timestamp: Date.now(),
            read: false,
            type,
            link
        };

        // Si l'utilisateur est le destinataire actuel, on met à jour l'état
        if (currentUser?.id_usercount === userId) {
            setNotifications(prev => [newNotif, ...prev]);
        } else {
            // Sinon, on met directement dans le localStorage pour l'autre utilisateur
            const saved = localStorage.getItem(`notifications_${userId}`);
            const existing: CoricaNotification[] = saved ? JSON.parse(saved) : [];
            localStorage.setItem(`notifications_${userId}`, JSON.stringify([newNotif, ...existing]));
            
            // Dispatch un storage event manuel pour les autres onglets
            window.dispatchEvent(new StorageEvent('storage', {
                key: `notifications_${userId}`,
                newValue: JSON.stringify([newNotif, ...existing])
            }));
        }
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    // Clé localStorage pour stocker la photo (par usercount)
    const photoKey = (user: CoricaUser | null) =>
        user ? `corica_photo_${user.usercount}` : null;

    /**
     * Résout et met à jour toute la chaîne N+1 / N+2 pour un utilisateur donné.
     */
    const resolveChain = (user: CoricaUser) => {
        const n1 = findManagerN1(user);
        setManagerN1(n1);
        setManagerN2(resolveManagerN2(user, n1));
    };

    const setCurrentUser = (user: CoricaUser | null) => {
        setCurrentUserState(user);
        if (user) {
            sessionStorage.setItem('corica_user', JSON.stringify(user));
            // Toujours essayer de prendre la version la plus fraîche dans ALL_USERS
            const latest = ALL_USERS.find(u => u.id_usercount === user.id_usercount) || user;
            setCurrentUserState(latest);
            resolveChain(latest);
            // Charger la photo de cet utilisateur depuis localStorage
            const key = photoKey(latest);
            if (key) {
                const stored = localStorage.getItem(key);
                setUserPhotoUrlState(stored || null);
            }
        } else {
            sessionStorage.removeItem('corica_user');
            setManagerN1(null);
            setManagerN2(MANAGER_N2_DEFAULT);
            setUserPhotoUrlState(null);
        }
    };

    // Mise à jour de la photo — persiste en localStorage
    const setUserPhotoUrl = (url: string | null) => {
        setUserPhotoUrlState(url);
        const key = photoKey(currentUser);
        if (key) {
            if (url) localStorage.setItem(key, url);
            else localStorage.removeItem(key);
        }
    };

    const loadUserFromStorage = () => {
        try {
            const stored = sessionStorage.getItem('corica_user');
            if (stored) {
                const user = JSON.parse(stored) as CoricaUser;
                // Re-sync avec ALL_USERS pour avoir les routes/IDs à jour
                const latest = ALL_USERS.find(u => u.id_usercount === user.id_usercount) || user;
                setCurrentUserState(latest);
                resolveChain(latest);
                // Charger la photo
                const key = photoKey(latest);
                if (key) {
                    const photo = localStorage.getItem(key);
                    setUserPhotoUrlState(photo || null);
                }
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        loadUserFromStorage();
    }, []);

    return (
        <UserContext.Provider value={{
            currentUser,
            managerN1,
            managerN2,
            setCurrentUser,
            loadUserFromStorage,
            userPhotoUrl,
            setUserPhotoUrl,
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
