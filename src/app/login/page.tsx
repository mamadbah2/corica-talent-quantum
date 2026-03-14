"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { Mail, TabletSmartphone, MonitorSmartphone, KeySquare, Delete, LogOut, ChevronDown, ChevronUp, ExternalLink, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoricaLogo } from '@/components/CoricaLogo';
import { useUser, ALL_USERS } from '@/context/UserContext';

type LoginMode = 'KIOSK' | 'DESKTOP';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setCurrentUser } = useUser();
    const [mode, setMode] = useState<LoginMode>('DESKTOP');
    const [matricule, setMatricule] = useState('');
    const [pin, setPin] = useState<string>(''); // max 4 chars

    // Desktop Auth State — pré-rempli depuis URL si lien de notification
    const urlUsercount = searchParams.get('usercount') ?? '';
    const isFirstLoginParam = searchParams.get('firstLogin') === 'true';
    const [email, setEmail] = useState(urlUsercount || 'Employe.10057@company.com');
    const [password, setPassword] = useState(isFirstLoginParam ? '' : 'COR-123');
    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);

    // Synchroniser si les params URL changent
    useEffect(() => {
        if (urlUsercount) setEmail(urlUsercount);
        if (isFirstLoginParam) setPassword('');
    }, [urlUsercount, isFirstLoginParam]);

    // Comptes de démo à afficher dans l'aide
    const DEMO_ACCOUNTS = [
        { role: 'Employé (Non-Cadre)', usercount: 'Employe.10057@company.com', nom: 'Anzoumana Diakite' },
        { role: 'Évaluateur N+1 (Manager)', usercount: 'Employe.10056@company.com', nom: 'Mamadou Traore' },
        { role: 'Admin Local Site (RRH)', usercount: 'Employe.10054@company.com', nom: 'Koua Jean Jeaques' },
        { role: 'Coordinateur Pays (DRH)', usercount: 'Employe.10053@company.com', nom: 'Blaise Bonzou Essey' },
        { role: 'Comité Calibration N+2', usercount: 'Employe.10098@company.com', nom: 'Comité Calibration' },
        { role: 'Group HR Manager RTD', usercount: 'Employe.10087@company.com', nom: 'Bamba Abdoulaye' },
        { role: 'Super Administrateur GRC', usercount: 'Employe.12410@company.com', nom: 'Djibo Ibouraima' },
    ];
    const DEFAULT_PASSWORD = 'COR-123';

    // Simulation de redirection
    const handleLogin = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.push('/');
    };

    const handleDesktopLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        if (!email || !password) {
            setErrorMsg('Veuillez remplir tous les champs.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usercount: email, password }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrorMsg(data.error || 'Identifiants incorrects.');
                setIsLoading(false);
                return;
            }

            // Retrouver l'utilisateur complet dans ALL_USERS
            const fullUser = ALL_USERS.find(
                u => u.usercount.toLowerCase() === email.toLowerCase().trim()
            );
            if (fullUser) {
                setCurrentUser(fullUser);
            }

            // Redirection vers le bon espace
            router.push(data.user.route);
        } catch (err) {
            setErrorMsg('Erreur de connexion au serveur.');
            setIsLoading(false);
        }
    };

    const handlePasswordReset = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (newPassword !== confirmPassword) {
            setErrorMsg("Les mots de passe ne correspondent pas.");
            return;
        }

        if (newPassword.length < 8) {
            setErrorMsg("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }

        router.push('/');
    };

    const handleNumpadPress = (num: number) => {
        if (pin.length < 4) {
            setPin(prev => prev + num.toString());
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    return (
        <div className="min-h-screen bg-[#E3E1DB] flex items-center justify-center p-4">

            {/* Container Principal */}
            <div className="w-full max-w-[1040px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-[#A39D98]/20">

                {/* ============= PANNEAU GAUCHE : IDENTITÉ VISUELLE ============= */}
                <div className="w-full md:w-[420px] shrink-0 bg-[#463738] text-white p-10 flex flex-col justify-between relative overflow-hidden group min-h-[240px]">

                    {/* Formes décoratives */}
                    <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#F26322]/20 rounded-full blur-[80px] pointer-events-none transition-transform duration-[3s] group-hover:scale-150"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-[#9A9750]/20 rounded-full blur-[60px] pointer-events-none transition-transform duration-[3s] group-hover:scale-110"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#F26322]/5 rounded-full blur-[90px] pointer-events-none"></div>

                    {/* Marque */}
                    <div className="relative z-10 flex flex-col items-center sm:items-start">
                        <div className="flex items-center gap-3 mb-6">
                            <CoricaLogo className="h-14" />
                        </div>
                        <h1 className="font-black tracking-tight leading-tight mb-4 text-center sm:text-left">
                            <span className="text-[32px] block text-[#F26322]">TALENT QUANTUM</span>
                        </h1>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-px flex-1 bg-white/15"></div>
                            <p className="text-[#A39D98] text-[10px] font-semibold tracking-widest uppercase px-1">Système Intelligent de Gestion</p>
                            <div className="h-px flex-1 bg-white/15"></div>
                        </div>
                        <p className="text-[#F26322]/80 text-[10px] font-bold tracking-widest uppercase text-center">Talent Management</p>
                    </div>

                    <div className="relative z-10 mt-6 flex justify-between items-end">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-5 max-w-[320px]">
                                {['Performance Management', '9-Box Matrix', 'OKR & KPI', 'Talent Review', 'Succession Planning', 'Career Path'].map(tag => (
                                    <span key={tag} className="text-[10px] font-bold text-white/70 bg-white/10 border border-white/15 px-2.5 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                            <h2 className="text-[22px] font-bold leading-snug mb-3">
                                Cultivons l'Excellence,<br />Validons le Potentiel.
                            </h2>
                            <p className="text-[#A39D98] text-[13px] leading-relaxed max-w-[350px]">
                                Une plateforme centralisée pour suivre vos objectifs, évaluer la performance et piloter les carrières au sein du groupe Corica.
                            </p>
                        </div>

                        <div className="hidden lg:flex flex-col items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F26322]">Version Mobile</span>
                            <div className="bg-white p-2 rounded-lg">
                                <img src="/qr-local.png" alt="QR Code d'installation" className="w-[80px] h-[80px] object-contain" />
                            </div>
                            <span className="text-[9px] text-white/50 w-[80px] text-center leading-tight">Scannez pour installer</span>
                        </div>
                    </div>

                    {/* Avatars footer */}
                    <div className="relative z-10 flex items-center gap-3 mt-8 pt-5 border-t border-white/10">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className={`w-9 h-9 rounded-full border-2 border-[#463738] flex items-center justify-center text-xs font-bold ${i === 1 ? 'bg-[#F26322]' : i === 2 ? 'bg-[#9A9750]' : 'bg-[#A39D98]'}`}>
                                    {i === 1 ? 'ID' : i === 2 ? 'FN' : 'MK'}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-white text-xs font-bold">Le réseau des talents Corica</p>
                            <p className="text-[#A39D98] text-[10px]">Connectez-vous pour accéder à votre espace</p>
                        </div>
                    </div>
                </div>

                {/* ============= PANNEAU DROIT : FORMULAIRE ============= */}
                <div className="flex-1 p-8 md:p-12 flex flex-col">

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-[#463738] mb-1">Connexion</h2>
                        <p className="text-[#A39D98] text-sm font-medium">Authentifiez-vous avec votre Usercount Corica</p>
                    </div>

                    {/* Toggle Kiosque / PC */}
                    <div className="flex bg-[#E3E1DB]/80 p-1.5 rounded-2xl mb-8 w-full max-w-sm mx-auto shadow-inner border-2 border-[#A39D98]/30">
                        <button
                            type="button"
                            onClick={() => setMode('KIOSK')}
                            className={`flex-1 py-3 text-[14px] font-black flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${mode === 'KIOSK' ? 'bg-white text-[#F26322] shadow-md border border-[#F26322]/20' : 'text-[#A39D98] hover:text-[#463738] hover:bg-white/50'}`}
                        >
                            <TabletSmartphone size={18} /> SMARTPHONE
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('DESKTOP')}
                            className={`flex-1 py-3 text-[14px] font-black flex items-center justify-center gap-2 rounded-xl transition-all duration-300 ${mode === 'DESKTOP' ? 'bg-white text-[#F26322] shadow-md border border-[#F26322]/20' : 'text-[#A39D98] hover:text-[#463738] hover:bg-white/50'}`}
                        >
                            <MonitorSmartphone size={18} /> BUREAU (PC)
                        </button>
                    </div>

                    {/* ─── VUE KIOSQUE ─── */}
                    {mode === 'KIOSK' && (
                        <div className="w-full max-w-sm mx-auto flex flex-col gap-5 animate-in fade-in slide-in-from-left-4 duration-300">

                            <div>
                                <label className="block text-xs font-bold text-[#463738] uppercase tracking-wider mb-2">Votre Matricule (Ex: COR-1234)</label>
                                <input
                                    type="text"
                                    value={matricule}
                                    onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                                    placeholder="Saisissez votre matricule"
                                    className="w-full bg-[#E3E1DB]/30 border border-[#A39D98]/40 rounded-xl px-4 py-3.5 text-[#463738] font-bold text-center tracking-widest outline-none focus:border-[#F26322] focus:ring-4 focus:ring-[#F26322]/10 transition-all placeholder:text-[#A39D98] placeholder:font-normal placeholder:tracking-normal"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#463738] uppercase tracking-wider mb-3 text-center">Code PIN (4 Chiffres)</label>
                                <div className="flex justify-center gap-3 mb-5">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div
                                            key={index}
                                            className={`w-14 h-16 rounded-xl flex items-center justify-center text-3xl font-black transition-all duration-300 ${pin.length > index
                                                ? 'bg-[#F26322] text-white shadow-lg shadow-[#F26322]/20 border border-[#F26322] scale-105'
                                                : pin.length === index
                                                    ? 'bg-white border-2 border-[#F26322] text-transparent shadow-[0_0_15px_rgba(242,99,34,0.15)]'
                                                    : 'bg-[#E3E1DB]/50 border border-[#A39D98]/30 text-transparent'
                                                }`}
                                        >
                                            {pin[index] ? '•' : ''}
                                        </div>
                                    ))}
                                </div>

                                {/* Numpad */}
                                <div className="grid grid-cols-3 gap-2.5 mb-5">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => handleNumpadPress(num)}
                                            className="py-3.5 w-full bg-white border border-[#A39D98]/20 rounded-xl font-bold text-[#463738] text-xl shadow-sm hover:border-[#F26322] hover:text-[#F26322] hover:shadow-md hover:-translate-y-0.5 active:bg-[#F26322]/5 transition-all"
                                        >
                                            {num}
                                        </button>
                                    ))}
                                    <div className="py-3.5 flex items-center justify-center text-[#A39D98] text-xs font-semibold uppercase">Oublié ?</div>
                                    <button
                                        onClick={() => handleNumpadPress(0)}
                                        className="py-3.5 w-full bg-white border border-[#A39D98]/20 rounded-xl font-bold text-[#463738] text-xl shadow-sm hover:border-[#F26322] hover:text-[#F26322] hover:shadow-md hover:-translate-y-0.5 active:bg-[#F26322]/5 transition-all"
                                    >
                                        0
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="py-3.5 w-full bg-[#E3E1DB]/50 border border-[#A39D98]/30 rounded-xl font-bold text-[#463738] flex items-center justify-center hover:bg-white hover:text-[#F26322] transition-colors"
                                    >
                                        <Delete size={22} />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={pin.length < 4 || !matricule}
                                className="w-full bg-[#F26322] text-white font-bold text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F26322]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E35414] hover:-translate-y-0.5"
                            >
                                Connexion au Portail <KeySquare size={18} />
                            </button>
                        </div>
                    )}

                    {/* ─── VUE BUREAU ─── */}
                    {mode === 'DESKTOP' && (
                        <div className="w-full max-w-sm mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
                            {!isFirstLogin ? (
                                <form onSubmit={handleDesktopLogin} className="w-full">
                                    <div className="bg-[#E3E1DB]/30 border border-[#A39D98]/40 p-5 rounded-2xl mb-5 text-center ring-1 ring-white/50">
                                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-[#A39D98]/20 text-[#463738]">
                                            <Mail size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#463738] mb-1">Authentification Entreprise</h3>
                                        <p className="text-xs text-[#A39D98]">Identifiez-vous avec votre adresse email Corica.</p>
                                    </div>

                                    {errorMsg && (
                                        <div className="mb-4 bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-200 text-center">
                                            {errorMsg}
                                        </div>
                                    )}

                                    {isFirstLoginParam && urlUsercount && (
                                        <div className="mb-4 bg-emerald-50 border border-emerald-300 rounded-xl p-4 flex items-start gap-3">
                                            <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-black text-emerald-800">Bienvenue sur CORICA TALENT QUANTUM !</p>
                                                <p className="text-xs text-emerald-700 mt-1">
                                                    Votre compte a été créé. Votre Usercount est pré-rempli ci-dessous.
                                                    Saisissez le <strong>mot de passe par défaut</strong> reçu par email pour accéder à votre espace.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-5">
                                        <div>
                                            <label className="block text-xs font-bold text-[#463738] uppercase tracking-wider mb-2">Usercount (Email Corica)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={email}
                                                    onChange={(e) => !urlUsercount && setEmail(e.target.value)}
                                                    readOnly={!!urlUsercount}
                                                    placeholder="Employe.10057@company.com"
                                                    className={`w-full border rounded-xl px-4 py-3.5 text-[#463738] font-bold outline-none transition-all placeholder:font-normal placeholder:text-[#A39D98] ${urlUsercount
                                                        ? 'bg-emerald-50 border-emerald-300 cursor-not-allowed text-emerald-800'
                                                        : 'bg-[#E3E1DB]/30 border-[#A39D98]/40 focus:border-[#F26322] focus:ring-4 focus:ring-[#F26322]/10'
                                                        }`}
                                                />
                                                {urlUsercount && (
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                                                        ✓ Pré-rempli
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="block text-xs font-bold text-[#463738] uppercase tracking-wider">Mot de passe</label>
                                                <button type="button" className="text-xs font-bold text-[#F26322] hover:underline">Mot de passe oublié ?</button>
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-[#E3E1DB]/30 border border-[#A39D98]/40 rounded-xl px-4 py-3.5 text-[#463738] font-bold outline-none focus:border-[#F26322] focus:ring-4 focus:ring-[#F26322]/10 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-orange-50/50 border border-orange-200 p-3 rounded-lg mb-4 text-center">
                                        <button
                                            type="button"
                                            onClick={() => setShowDemoAccounts(v => !v)}
                                            className="w-full flex items-center justify-between text-[12px] font-bold text-[#A39D98]"
                                        >
                                            <span className="flex items-center gap-1.5">💡 Comptes de Démonstration (Mot de passe&nbsp;: <span className="text-[#F26322]">COR-123</span>)</span>
                                            {showDemoAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        {showDemoAccounts && (
                                            <div className="mt-3 space-y-1.5 text-left border-t border-orange-200 pt-3">
                                                {DEMO_ACCOUNTS.map((acc) => (
                                                    <button
                                                        key={acc.usercount}
                                                        type="button"
                                                        onClick={() => { setEmail(acc.usercount); setPassword(DEFAULT_PASSWORD); setShowDemoAccounts(false); }}
                                                        className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-orange-100 transition-colors group"
                                                    >
                                                        <div className="text-left">
                                                            <p className="text-[11px] font-bold text-[#463738] group-hover:text-[#F26322] transition-colors">{acc.role}</p>
                                                            <p className="text-[10px] text-[#A39D98] font-mono">{acc.nom}</p>
                                                        </div>
                                                        <ExternalLink size={10} className="text-[#A39D98] group-hover:text-[#F26322] shrink-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-[#463738] text-white font-bold text-[15px] py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#342828] shadow-lg shadow-[#463738]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2"><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>Authentification...</span>
                                        ) : (
                                            'Connexion à mon espace'
                                        )}
                                    </button>

                                    <p className="text-xs text-center text-[#A39D98] mt-6 font-medium">
                                        Vous n'avez pas de PC Corica attribué ? <br /><button onClick={() => setMode('KIOSK')} className="text-[#F26322] font-bold hover:underline mt-1">Basculez sur l'accès Smartphone</button>
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handlePasswordReset} className="w-full animate-in zoom-in-95 duration-300">
                                    <div className="bg-[#F26322]/10 border border-[#F26322]/30 p-5 rounded-2xl mb-6 text-center">
                                        <div className="w-14 h-14 bg-[#F26322] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-white">
                                            <KeySquare size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#F26322] mb-1">Sécurisation du Compte</h3>
                                        <p className="text-xs text-[#463738] font-medium leading-relaxed">
                                            Bonjour ! C'est votre première connexion.<br /> Vous devez réinitialiser le mot de passe temporaire fourni par le système.
                                        </p>
                                    </div>

                                    {errorMsg && (
                                        <div className="mb-4 bg-red-50 text-red-600 text-sm font-bold p-3 rounded-lg border border-red-200 text-center">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <label className="block text-xs font-bold text-[#463738] uppercase tracking-wider mb-2">Nouveau mot de passe</label>
                                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8 caractères minimum" className="w-full bg-[#E3E1DB]/30 border border-[#A39D98]/40 rounded-xl px-4 py-3.5 text-[#463738] font-bold outline-none focus:border-[#F26322] focus:ring-4 focus:ring-[#F26322]/10 transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-[#463738] uppercase tracking-wider mb-2">Confirmez le mot de passe</label>
                                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Saisissez à nouveau" className="w-full bg-[#E3E1DB]/30 border border-[#A39D98]/40 rounded-xl px-4 py-3.5 text-[#463738] font-bold outline-none focus:border-[#F26322] focus:ring-4 focus:ring-[#F26322]/10 transition-all" />
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-[#F26322] text-white font-bold text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#F26322]/20 hover:bg-[#E35414] hover:-translate-y-0.5 transition-all">
                                        Enregistrer et Continuer <LogOut className="rotate-180" size={18} />
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
