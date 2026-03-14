import React from 'react';

/**
 * Logo Corica Mining Services — "L'Éléphant" officiel
 *
 * Source : Image officielle de la marque
 *
 * Structure exacte (7 colonnes verticales) :
 *  Tops :
 *    - Les 5 colonnes centrales (2, 3, 4, 5, 6) ont un haut plat (y=0).
 *    - Les colonnes extérieures (1 et 7) commencent plus bas (y=16).
 *  Bottoms & Gaps :
 *    - Col 4 (Centre / Trompe) : barre la plus longue, descend jusqu'à y=100.
 *    - Col 3 & 5 : barres pleines, descendent jusqu'à y=80.
 *    - Col 2 & 6 : barre supérieure jusqu'à y=56. Puis un GAP (espace vide).
 *                  Puis un bloc "Défense/Tusk" détaché de y=66 à y=80.
 *                  (Le bas de la défense s'aligne exactement avec le bas de la Col 3).
 *    - Col 1 & 7 : barres très courtes externes, s'arrêtent à y=46.
 *
 * viewBox: 0 0 96 100
 * Largeur barre = 12, Espacement = 2.
 */
export function CoricaLogo({
    className = "h-8",
    showFull = false,
    noBadge = false
}: {
    className?: string;
    showFull?: boolean;
    noBadge?: boolean;
    color?: string;
}) {
    const logoImg = (
        <img 
            src="/corica-logo-full.png" 
            alt="Corica Mining Services" 
            className="h-full w-auto object-contain"
            style={{ maxHeight: '100%' }}
        />
    );

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {noBadge ? (
                logoImg
            ) : (
                <div className="bg-white p-1.5 rounded-xl shadow-sm border border-[#A39D98]/10 flex items-center justify-center transform hover:scale-105 transition-transform duration-300 h-full">
                    {logoImg}
                </div>
            )}
            {showFull && (
                <div className="h-6 w-px bg-[#463738]/20 hidden md:block"></div>
            )}
        </div>
    );
}
