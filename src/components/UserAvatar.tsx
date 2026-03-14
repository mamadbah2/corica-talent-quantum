"use client";

import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';

interface UserAvatarProps {
    nom: string;             // Nom complet de l'utilisateur
    photoUrl?: string;       // URL de photo explicite (remplace le contexte)
    size?: number;           // Taille en px (défaut : 32)
    className?: string;
    textClassName?: string;  // Classe pour les initiales
    useContextPhoto?: boolean; // Si true (défaut), lit la photo depuis le contexte
}

/**
 * Composant d'avatar utilisateur.
 * Priorité : photoUrl prop → photo du contexte (userPhotoUrl) → avatar DiceBear → initiales
 */
export function UserAvatar({
    nom,
    photoUrl,
    size = 32,
    className = '',
    textClassName = 'text-xs',
    useContextPhoto = true,
}: UserAvatarProps) {
    const [imgError, setImgError] = useState(false);
    const { userPhotoUrl } = useUser();

    // Initiales (2 premières lettres significatives)
    const initiales = nom
        ? nom.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    // Seed DiceBear stable basé sur le nom
    const seed = encodeURIComponent(nom.replace(/\s+/g, ''));
    const dicebearUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&radius=50`;

    // Priorité d'affichage de la photo
    const effectiveUrl: string =
        photoUrl ||
        (useContextPhoto && userPhotoUrl ? userPhotoUrl : '') ||
        dicebearUrl;

    const showImg = effectiveUrl && !imgError;

    const style: React.CSSProperties = {
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
    };

    return (
        <div
            className={`relative flex items-center justify-center bg-[#F26322] text-white font-bold shadow-sm ${className}`}
            style={style}
            title={nom}
        >
            {showImg ? (
                <img
                    src={effectiveUrl}
                    alt={nom}
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    draggable={false}
                />
            ) : (
                <span className={textClassName} style={{ lineHeight: 1 }}>{initiales}</span>
            )}
        </div>
    );
}
