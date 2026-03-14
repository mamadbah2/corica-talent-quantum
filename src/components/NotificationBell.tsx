"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useUser, CoricaNotification } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
        if (!isOpen && unreadCount > 0) {
            // Optionnel: on pourrait marquer comme lu ici, ou via un bouton
        }
    };

    const formatDate = (ts: number) => {
        const date = new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleNotificationClick = (n: CoricaNotification) => {
        markAsRead(n.id);
        setIsOpen(false);
        if (n.link) {
            router.push(n.link);
        }
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Cloche avec Badge */}
            <button
                onClick={handleBellClick}
                className="relative p-2 text-[#A39D98] hover:text-[#F26322] transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
                title="Notifications"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-[#F26322] text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in-50 duration-300">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Menu Déroulant */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-[320px] bg-white rounded-2xl shadow-2xl border border-[#A39D98]/20 z-[100] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-[#463738] p-4 text-white flex items-center justify-between">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <div className="flex gap-2">
                            {notifications.length > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[10px] font-bold uppercase tracking-wider hover:text-[#F26322] flex items-center gap-1"
                                    title="Tout marquer comme lu"
                                >
                                    <Check size={12} /> Tout lire
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Liste */}
                    <div className="max-h-[380px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`p-4 flex gap-3 transition-colors cursor-pointer hover:bg-gray-50 ${n.read ? 'bg-white opacity-70' : 'bg-orange-50/30'}`}
                                    >
                                        <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                            n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                            n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {n.type === 'success' ? <Check size={16} /> :
                                             n.type === 'warning' ? <AlertTriangle size={16} /> :
                                             <Info size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[13px] leading-snug ${n.read ? 'text-gray-600' : 'text-[#463738] font-bold'}`}>
                                                {n.message}
                                            </p>
                                            <span className="text-[10px] text-[#A39D98] font-medium block mt-1">
                                                Aujourd'hui, {formatDate(n.timestamp)}
                                            </span>
                                        </div>
                                        {!n.read && <div className="w-2 h-2 bg-[#F26322] rounded-full mt-2 shrink-0"></div>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <Bell size={40} className="mx-auto text-[#E3E1DB] mb-3" />
                                <p className="text-sm text-[#A39D98] font-medium">Aucune notification pour le moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="bg-gray-50 p-3 border-t border-gray-100 flex justify-center">
                            <button
                                onClick={clearNotifications}
                                className="text-[11px] font-bold text-[#A39D98] hover:text-red-500 flex items-center gap-1.5 transition-colors"
                            >
                                <Trash2 size={13} /> Effacer toutes les notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
