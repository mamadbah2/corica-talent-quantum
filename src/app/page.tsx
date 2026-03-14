"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, UserCircle, Briefcase, Globe, Shield, LogIn, ArrowRight, Scale, Map } from 'lucide-react';
import { CoricaLogo } from '@/components/CoricaLogo';

export default function HomePortal() {
  const router = useRouter();

  const roles = [
    {
      title: "Portail de Connexion",
      path: "/login",
      icon: LogIn,
      color: "bg-[#463738]",
      desc: "Simulation de l'écran d'authentification (Microsoft 365 / Kiosque PIN)."
    },
    {
      title: "Mon Profil",
      path: "/employee",
      icon: UserCircle,
      color: "bg-[#9A9750]",
      desc: "Vue de l'employé avec le module de co-construction, notation et Data Vault."
    },
    {
      title: "Espace Manager (Évaluateur N+1)",
      path: "/manager",
      icon: Users,
      color: "bg-[#F26322]",
      desc: "Gestion de l'équipe, évaluation et validation phygitale (Scanner PDF OCR)."
    },
    {
      title: "Superviseur de Niveaux (Comité N+2)",
      path: "/manager-n2",
      icon: Scale,
      color: "bg-[#9A9750]",
      desc: "Arbitrage et Calibration des placements de vos différents Managers directs."
    },
    {
      title: "Administrateur Site Local (RRH)",
      path: "/site-admin",
      icon: Briefcase,
      color: "bg-[#463738]",
      desc: "Pilotage d'une campagne précise, Dashboard Site et revues d'audit."
    },
    {
      title: "Coordinateur / DRH Pays",
      path: "/country-admin",
      icon: Map,
      color: "bg-[#F26322]",
      desc: "Agrégation nationale, Dashboard consolidé des multiples sites de la filiale."
    },
    {
      title: "Group HR Manager RTD",
      path: "/group-admin",
      icon: Globe,
      color: "bg-[#9A9750]",
      desc: "Coordinateur Global, analyses inter-sites et forçage de validation."
    },
    {
      title: "Super Administrateur (GRC)",
      path: "/super-admin",
      icon: Shield,
      color: "bg-[#dc2626]",
      desc: "Gouvernance, Audit System, Logs de sécurité et intégrité base de données."
    }
  ];

  return (
    <div className="min-h-screen bg-[#E3E1DB] flex flex-col font-sans">
      <header className="h-[80px] bg-white border-b border-[#A39D98]/30 px-8 flex items-center justify-between shrink-0 shadow-sm relative z-10">
        <div className="flex items-center gap-4">
          <CoricaLogo className="h-14 w-auto" />
          <div>
            <h1 className="text-[22px] text-[#463738] font-black tracking-tight leading-tight">CORICA TALENT QUANTUM</h1>
            <p className="text-[#F26322] font-bold text-[11px] tracking-widest uppercase">Environnement de Démonstration v8.0</p>
          </div>
        </div>
        <div className="bg-orange-100 text-[#F26322] px-4 py-2 rounded-lg font-bold text-sm border border-orange-200">
          Mode Bac à Sable (Demo) Activé
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-[#463738] mb-4">Bienvenue dans l'environnement de Test</h2>
            <p className="text-[#A39D98] text-lg font-medium">Sélectionnez le rôle que vous souhaitez simuler pour votre présentation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role, idx) => {
              const Icon = role.icon;
              return (
                <button
                  key={idx}
                  onClick={() => router.push(role.path)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-[#A39D98]/20 hover:border-[#F26322] hover:shadow-lg transition-all group flex items-start gap-5 text-left h-full"
                >
                  <div className={`w-14 h-14 ${role.color} rounded-xl text-white flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#463738] text-lg mb-1 group-hover:text-[#F26322] transition-colors">{role.title}</h3>
                    <p className="text-sm text-[#A39D98] leading-snug">{role.desc}</p>
                  </div>
                  <ArrowRight size={20} className="text-[#A39D98] mt-2 group-hover:text-[#F26322] group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-[#A39D98] text-sm font-semibold border-t border-[#A39D98]/20 bg-[#E3E1DB]">
        Corica Mining Services © 2026 - Propulsé par Antigravity RH
      </footer>
    </div>
  );
}
