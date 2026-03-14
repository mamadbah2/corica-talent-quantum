"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CoricaUser {
  id_usercount: number;
  usercount: string;
  nom_prenoms: string;
  role: string;
  interface_utilisateur: string; // Required for compatibility
  pays: string;
  site: string;
  departement: string;
  fonction: string;
  scope: string;
  route: string;
  telephone?: string;
  date_embauche?: string;
  n1_email?: string;
  n2_email?: string;
  photo?: string;
  id_evaluateur: number | null;
  id_evaluateur_n2: number | null;
}

export interface ManagerN2Info {
  nom_prenoms: string;
  usercount: string;
  pays: string;
  site: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  timestamp: string; // Changed to required string (ISO)
  link?: string;
}

export type CoricaNotification = Notification;

interface UserContextType {
  currentUser: CoricaUser | null;
  setCurrentUser: (user: CoricaUser | null) => void;
  user: CoricaUser | null;
  allUsers: CoricaUser[];
  isLoadingUsers: boolean;
  usersError: string | null;
  refetchUsers: () => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  addNotification: (targetUserId: number, message: string, type?: 'info' | 'success' | 'warning' | 'error', link?: string) => void;
  profilePhotos: Record<string, string>;
  setProfilePhoto: (usercount: string, photo: string) => void;
  setUserPhotoUrl: (url: string | null) => void;
  userPhotoUrl: string | null;
  managerN1: CoricaUser | null;
  managerN2: CoricaUser | null;
  findUserById: (id: number) => CoricaUser | undefined;
}

// ─── Static Data (for compatibility) ──────────────────────────────────────────

export const ALL_USERS: CoricaUser[] = [
    { id_usercount: 10053, nom_prenoms: "Blaise Bonzou Essey", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "COUNTRY HR MANAGER", scope: "groupe", site: "Group", interface_utilisateur: "coordinateur", role: "coordinateur", usercount: "Employe.10053@company.com", id_evaluateur: 10089, id_evaluateur_n2: 10088, route: "/country-admin" },
    { id_usercount: 10054, nom_prenoms: "Koua Jean Jeaques KOUAMANAN", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERINTENDENT", scope: "sissengue", site: "Sissengue", interface_utilisateur: "administrator", role: "administrator", usercount: "Employe.10054@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10055, nom_prenoms: "Etienne Famien", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "sissengue", site: "Sissengue", interface_utilisateur: "administrator", role: "administrator", usercount: "Employe.10055@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10056, nom_prenoms: "Mamadou Traore", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "PROJECT MANAGER", scope: "sissengue", site: "Sissengue", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10056@company.com", id_evaluateur: 10096, id_evaluateur_n2: 10092, route: "/manager" },
    { id_usercount: 10057, nom_prenoms: "Anzoumana Diakite", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10057@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10058, nom_prenoms: "Issiaka Konate", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10058@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10059, nom_prenoms: "Siaka Djakite", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10059@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10060, nom_prenoms: "Fiacre Tossou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10060@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10061, nom_prenoms: "Arouna Sankara", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10061@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10062, nom_prenoms: "Kamoko Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10062@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10063, nom_prenoms: "Issouf Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10063@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10064, nom_prenoms: "Zie Kone", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10064@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10065, nom_prenoms: "Dognimin Coulibaly", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "sissengue", site: "Sissengue", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10065@company.com", id_evaluateur: 10056, id_evaluateur_n2: 10096, route: "/employee" },
    { id_usercount: 10066, nom_prenoms: "Francis Nestor Koffi", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR MANAGER", scope: "ity", site: "Ity", interface_utilisateur: "administrator", role: "administrator", usercount: "Employe.10066@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/site-admin" },
    { id_usercount: 10067, nom_prenoms: "David Kone", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "PROJECT MANAGER", scope: "ity", site: "Ity", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10067@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10068, nom_prenoms: "Lambert Akai", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", site: "Ity", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10068@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10069, nom_prenoms: "Guillaume Tao", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", site: "Ity", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10069@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10070, nom_prenoms: "Pierre Zahiri", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", site: "Ity", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10070@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10071, nom_prenoms: "Honore Tokaleu", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", site: "Ity", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10071@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10072, nom_prenoms: "Diomande Abou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", site: "Ity", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10072@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10073, nom_prenoms: "Michel Gonkanou", pays: "Cote d'Ivoire", departement: "PRODUCTION", fonction: "EMPLOYE", scope: "ity", site: "Ity", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10073@company.com", id_evaluateur: 10067, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10074, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "administrator", role: "administrator", usercount: "Employe.10074@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10075, nom_prenoms: "Deepak Kumar", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "General Manager - Asset & Maintenance", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10075@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10076, nom_prenoms: "Hamidou Moussa", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10076@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10077, nom_prenoms: "Mamadou Ouattara", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10077@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10078, nom_prenoms: "Theophile Kakou", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10078@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10079, nom_prenoms: "Djamiou Badara", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10079@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10080, nom_prenoms: "Boniface Ettien", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10080@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10081, nom_prenoms: "Hyacinthe Djaha", pays: "Cote d'Ivoire", departement: "MAINTENANCE", fonction: "EMPLOYE", scope: "yamousoukro", site: "Yamoussoukro", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10081@company.com", id_evaluateur: 10075, id_evaluateur_n2: 10088, route: "/employee" },
    { id_usercount: 10082, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "HR SUPERVISOR", scope: "abidjan", site: "Abidjan", interface_utilisateur: "administrator", role: "administrator", usercount: "Employe.10082@company.com", id_evaluateur: 10053, id_evaluateur_n2: 10089, route: "/site-admin" },
    { id_usercount: 10083, nom_prenoms: "Kalilou Sanogo", pays: "Cote d'Ivoire", departement: "FINANCE", fonction: "COUNTRY FINANCE MANAGER", scope: "abidjan", site: "Abidjan", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10083@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10084, nom_prenoms: "Serge Anibie", pays: "Cote d'Ivoire", departement: "IT", fonction: "IT SUPERINTENDENT", scope: "abidjan", site: "Abidjan", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10084@company.com", id_evaluateur: 10097, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10085, nom_prenoms: "Soumaila Ouattara", pays: "Cote d'Ivoire", departement: "RESSOURCES HUMAINES", fonction: "IT SUPERVISOR", scope: "abidjan", site: "Abidjan", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10085@company.com", id_evaluateur: 10084, id_evaluateur_n2: 10097, route: "/employee" },
    { id_usercount: 10086, nom_prenoms: "Madiara Traore epse Bamba", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "abidjan", site: "Abidjan", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10086@company.com", id_evaluateur: 10095, id_evaluateur_n2: 10092, route: "/employee" },
    { id_usercount: 10087, nom_prenoms: "Bamba Abdoulaye", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "GROUP PM MANAGER RECRUITMENT, TRAINING", scope: "groupe", site: "Group", interface_utilisateur: "coordinateur", role: "coordinateur", usercount: "Employe.10087@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/group-admin" },
    { id_usercount: 10088, nom_prenoms: "Hendrik Horden", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "CHIEF PEOPLE OFFICER", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10088@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10089, nom_prenoms: "Christian Lankoande", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "GROUP HR MANAGER OPERATIONS SUPPORT", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10089@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10090, nom_prenoms: "Issa Sore", pays: "Tous les pays", departement: "RESSOURCES HUMAINES", fonction: "EMPLOYE", scope: "groupe", site: "Group", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10090@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10091, nom_prenoms: "Mel Kawandami", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GM BUSINESS ANALYST & SUPPLY CHAIN", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10091@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10092, nom_prenoms: "Yoen Myombo", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GROUP SUPPLY CHAIN MANAGER", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10092@company.com", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10093, nom_prenoms: "Youndou Alain", pays: "Tous les pays", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "GROUP LOGISTICS MANAGER", scope: "groupe", site: "Group", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10093@company.com", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10094, nom_prenoms: "Bah Modibo", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "groupe", site: "Group", interface_utilisateur: "employe", role: "employe", usercount: "Employe.10094@company.com", id_evaluateur: 10091, id_evaluateur_n2: 10101, route: "/employee" },
    { id_usercount: 10095, nom_prenoms: "Amidou Keba", pays: "Cote d'Ivoire", departement: "SUPPLY CHAIN & LOGISTIC", fonction: "EMPLOYE", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10095@company.com", id_evaluateur: 10092, id_evaluateur_n2: 10091, route: "/manager" },
    { id_usercount: 10096, nom_prenoms: "Siya", pays: "Cote d'Ivoire", departement: "ADMINISTRATION", fonction: "OPERATIONS MANAGER", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10096@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10097, nom_prenoms: "Ibrahima Thiero", pays: "Tous les pays", departement: "INFORMATION SYSTEM", fonction: "CHIEF INFORMATION OFFICER", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10097@company.com", id_evaluateur: 10101, id_evaluateur_n2: 10101, route: "/manager" },
    { id_usercount: 10098, nom_prenoms: "Comite Calibration N+2", pays: "Tous les pays", departement: "DIRECTION GENERALE", fonction: "CALIBRATION COMMITTEE", scope: "groupe", site: "Group", interface_utilisateur: "calibration", role: "calibration", usercount: "Employe.10098@company.com", id_evaluateur: null, id_evaluateur_n2: 10101, route: "/manager-n2" },
    { id_usercount: 10101, nom_prenoms: "Abdoulaye Diallo", pays: "Tous les pays", departement: "DIRECTION GENERALE", fonction: "CHIEF EXECUTIVE OFFICER (CEO)", scope: "groupe", site: "Group", interface_utilisateur: "evaluateur", role: "evaluateur", usercount: "Employe.10101@company.com", id_evaluateur: null, id_evaluateur_n2: null, route: "/manager-n2" },
    { id_usercount: 12410, nom_prenoms: "Djibo Ibouraima", pays: "Cote d'Ivoire", departement: "GOUVERNANCE & COMPLIANCE", fonction: "SUPER ADMINISTRATEUR / GRC", scope: "abidjan", site: "Abidjan", interface_utilisateur: "superadmin", role: "superadmin", usercount: "Employe.12410@company.com", id_evaluateur: 10088, id_evaluateur_n2: 10101, route: "/super-admin" },
];

export const findUserById = (id: number | null | undefined, users: CoricaUser[] = ALL_USERS) => 
    users.find(u => u.id_usercount === id);

// ─── Context ──────────────────────────────────────────────────────────────────

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CoricaUser | null>(null);
  const [allUsers, setAllUsers] = useState<CoricaUser[]>(ALL_USERS);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profilePhotos, setProfilePhotos] = useState<Record<string, string>>({});

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const data = await res.json();
      const users = data.users ?? data;
      setAllUsers(users.map((u: any) => ({ ...u, interface_utilisateur: u.role || u.interface_utilisateur })));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setUsersError(message);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('corica_profile_photos');
      if (stored) setProfilePhotos(JSON.parse(stored));
    } catch {}
  }, []);

  const setProfilePhoto = useCallback((usercount: string, photo: string) => {
    setProfilePhotos(prev => {
      const updated = { ...prev, [usercount]: photo };
      try {
        localStorage.setItem('corica_profile_photos', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('corica_current_user');
      if (stored) {
          const u = JSON.parse(stored);
          setCurrentUser(u);
      }
    } catch {}
  }, []);

  const handleSetCurrentUser = useCallback((user: CoricaUser | null) => {
    const updatedUser = user ? { ...user, interface_utilisateur: user.role } : null;
    setCurrentUser(updatedUser);
    try {
      if (updatedUser) sessionStorage.setItem('corica_current_user', JSON.stringify(updatedUser));
      else sessionStorage.removeItem('corica_current_user');
    } catch {}
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const addNotification = useCallback((targetUserId: number, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string) => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message: message || '',
      type: type,
      read: false,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      link: link
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const managerN1 = useMemo(() => {
    if (!currentUser || !currentUser.id_evaluateur) return null;
    return allUsers.find(u => u.id_usercount === currentUser.id_evaluateur) || null;
  }, [currentUser, allUsers]);

  const managerN2 = useMemo(() => {
    if (!currentUser || !currentUser.id_evaluateur_n2) return null;
    return allUsers.find(u => u.id_usercount === currentUser.id_evaluateur_n2) || null;
  }, [currentUser, allUsers]);

  const userPhotoUrl = useMemo(() => {
    if (!currentUser) return null;
    return profilePhotos[currentUser.usercount] || currentUser.photo || null;
  }, [currentUser, profilePhotos]);

  const setUserPhotoUrl = useCallback((url: string | null) => {
    if (currentUser && url) {
      setProfilePhoto(currentUser.usercount, url);
    }
  }, [currentUser, setProfilePhoto]);

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser: handleSetCurrentUser,
      user: currentUser,
      allUsers,
      isLoadingUsers,
      usersError,
      refetchUsers: fetchUsers,
      notifications,
      markNotificationRead,
      unreadCount,
      markAsRead: markNotificationRead,
      markAllAsRead,
      clearNotifications,
      addNotification,
      profilePhotos,
      setProfilePhoto,
      setUserPhotoUrl,
      userPhotoUrl,
      managerN1,
      managerN2,
      findUserById: (id: number) => allUsers.find(u => u.id_usercount === id)
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
