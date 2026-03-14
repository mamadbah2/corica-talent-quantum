"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NavButtonsProps {
    onPrev: () => void;
    onNext: () => void;
    prevLabel?: string;
    nextLabel?: string;
}

export function NavButtons({ onPrev, onNext, prevLabel = 'Vue précédente', nextLabel = 'Vue suivante' }: NavButtonsProps) {
    return (
        <div className="flex items-center bg-[#F5F3F0] rounded-xl p-1 mr-3 border border-[#A39D98]/25 shadow-inner gap-0.5">
            <button
                onClick={onPrev}
                title={prevLabel}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#463738] font-bold text-xs transition-all duration-150 hover:bg-white hover:shadow-md hover:text-[#F26322] active:scale-95"
            >
                <ChevronLeft
                    size={15}
                    className="transition-transform duration-150 group-hover:-translate-x-0.5"
                    strokeWidth={2.5}
                />
                <span className="hidden sm:inline tracking-wide">Précédent</span>
            </button>
            <div className="w-px h-4 bg-[#A39D98]/30 mx-0.5" />
            <button
                onClick={onNext}
                title={nextLabel}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#463738] font-bold text-xs transition-all duration-150 hover:bg-white hover:shadow-md hover:text-[#F26322] active:scale-95"
            >
                <span className="hidden sm:inline tracking-wide">Suivant</span>
                <ChevronRight
                    size={15}
                    className="transition-transform duration-150 group-hover:translate-x-0.5"
                    strokeWidth={2.5}
                />
            </button>
        </div>
    );
}
