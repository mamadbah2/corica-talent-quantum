import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, useDraggable, useDroppable, DragEndEvent, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Employee, GRID_CELLS_CFG, MetricLevel } from '@/lib/data';

interface NineBoxGridProps {
    employees: Employee[];
    onSelectEmployee: (emp: Employee) => void;
    onDropEmployee?: (empId: string, newPerformance: MetricLevel, newPotential: MetricLevel) => void;
}

// Draggable Avatar (Premium Glassmorphism Theme)
function DraggableEmployee({ employee, onClick }: { employee: Employee, onClick: () => void }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: employee.id,
        data: employee
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 1,
    } : undefined;

    return (
        <motion.div
            ref={setNodeRef} style={style} {...listeners} {...attributes}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={!isDragging ? { scale: 1.02, y: -2 } : undefined}
            whileTap={!isDragging ? { scale: 0.98 } : undefined}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`
                p-2.5 rounded-xl cursor-grab active:cursor-grabbing flex items-center gap-3 relative overflow-hidden group/item w-full
                transition-all duration-300 backdrop-blur-md
                ${isDragging
                    ? 'bg-[#463738]/90 border border-[#F26322] shadow-[0_8px_30px_rgba(242,99,34,0.4)] ring-2 ring-[#F26322]/50 scale-105'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg'
                }
            `}
        >
            {/* Status Indicator Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${employee.status === 'Closed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                    employee.status === 'Draft' ? 'bg-slate-400' : 'bg-[#F26322] shadow-[0_0_10px_rgba(242,99,34,0.5)]'
                }`} />

            <div className="relative">
                <img src={employee.avatarUrl} alt={employee.name} className="w-10 h-10 rounded-full border-2 border-white/10 object-cover shrink-0 pointer-events-none group-hover/item:border-white/30 transition-colors" />
                {employee.status === 'Closed' && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#463738]" />
                )}
            </div>

            <div className="flex-1 min-w-0 pointer-events-none flex flex-col justify-center">
                <p className="text-[13px] font-bold text-white tracking-wide truncate group-hover/item:text-[#F26322] transition-colors">{employee.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-300 font-medium truncate uppercase tracking-wider">{employee.role}</span>
                </div>
            </div>
        </motion.div>
    );
}

// Droppable Cell (Premium Theme)
function DroppableCell({ cell, children, cellEmployees }: { cell: any, children: React.ReactNode, cellEmployees: Employee[] }) {
    const { isOver, setNodeRef } = useDroppable({
        id: cell.id,
        data: cell
    });

    // Premium Gradients with distinct colors matching traditional 9-Box zones but modernized
    const bgClasses: Record<string, string> = {
        '3-3': 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 hover:from-emerald-500/30 hover:to-emerald-600/10 border-emerald-500/40 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]', // Future Leader
        '3-2': 'bg-gradient-to-br from-lime-500/20 to-lime-600/5 hover:from-lime-500/30 hover:to-lime-600/10 border-lime-500/40 shadow-[inset_0_0_20px_rgba(132,204,22,0.05)]',       // Growth Employee
        '3-1': 'bg-gradient-to-br from-amber-500/20 to-amber-600/5 hover:from-amber-500/30 hover:to-amber-600/10 border-amber-500/40 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]',     // Enigma
        '2-3': 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/5 hover:from-cyan-500/30 hover:to-cyan-600/10 border-cyan-500/40 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]',           // High Impact
        '2-2': 'bg-gradient-to-br from-blue-500/20 to-blue-600/5 hover:from-blue-500/30 hover:to-blue-600/10 border-blue-500/40 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]',          // Core Employee
        '2-1': 'bg-gradient-to-br from-orange-500/20 to-orange-600/5 hover:from-orange-500/30 hover:to-orange-600/10 border-orange-500/40 shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]',// Dilemma
        '1-3': 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 hover:from-indigo-500/30 hover:to-indigo-600/10 border-indigo-500/40 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]',  // Trusted Pro
        '1-2': 'bg-gradient-to-br from-slate-500/20 to-slate-600/5 hover:from-slate-500/30 hover:to-slate-600/10 border-slate-500/40 shadow-[inset_0_0_20px_rgba(100,116,139,0.05)]',     // Effective
        '1-1': 'bg-gradient-to-br from-red-500/20 to-red-600/5 hover:from-red-500/30 hover:to-red-600/10 border-red-500/40 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]',                // Underperformer
    };

    const textClasses: Record<string, string> = {
        '3-3': 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        '3-2': 'text-lime-300 drop-shadow-[0_0_8px_rgba(132,204,22,0.5)]',
        '3-1': 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        '2-3': 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]',
        '2-2': 'text-blue-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
        '2-1': 'text-orange-300 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]',
        '1-3': 'text-indigo-300 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]',
        '1-2': 'text-slate-300 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]',
        '1-1': 'text-red-300 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
    };

    return (
        <div
            ref={setNodeRef}
            className={`
                relative flex flex-col border rounded-2xl overflow-hidden transition-all duration-300 group
                backdrop-blur-xl ${bgClasses[cell.id]} 
                ${isOver ? 'ring-2 ring-[#F26322] shadow-[0_0_30px_rgba(242,99,34,0.3)] scale-[1.02] z-10' : ''}
            `}
        >
            <div className="py-3 px-4 border-b border-white/10 bg-black/40 flex justify-between items-center backdrop-blur-md relative z-10">
                <h3 className={`font-black text-[13px] md:text-sm tracking-widest uppercase ${textClasses[cell.id]}`}>{cell.title}</h3>
                <span className={`
                    text-[11px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10 
                    shadow-inner backdrop-blur-sm transition-transform duration-300
                    ${isOver ? 'scale-110 bg-[#F26322]/20 border-[#F26322]/50 text-[#F26322]' : ''}
                `}>
                    {cellEmployees.length}
                </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-2.5 custom-scroll relative z-10">
                {children}
            </div>

            {/* Ambient Background Glow Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-t from-white/5 to-transparent`} />
        </div>
    );
}

export function NineBoxGrid({ employees, onSelectEmployee, onDropEmployee }: NineBoxGridProps) {
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id && onDropEmployee) {
            const cellData = over.data.current;
            if (cellData) {
                onDropEmployee(active.id.toString(), cellData.performance, cellData.potential);
            }
        }
    };

    const MAX_DISPLAY = 15;

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="glass-panel rounded-[2rem] p-8 lg:p-14 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-[#463738]/40 backdrop-blur-3xl">
                {/* Decorative Elements */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F26322]/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#9A9750]/20 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6 relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-[#F26322]/20 text-[#F26322] border border-[#F26322]/30 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(242,99,34,0.2)]">9-Box Assessment</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">Matrice de Calibration</h2>
                        <p className="text-white/60 text-sm md:text-base font-medium mt-2 max-w-2xl leading-relaxed">Évaluation combinée de la performance et du potentiel. Glissez-déposez les employés entre les quadrants pour ajuster leur positionnement statégique.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-[#E3E1DB] bg-black/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            <span>Clôturé</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-[#E3E1DB] bg-black/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md shadow-inner">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F26322] shadow-[0_0_10px_rgba(242,99,34,0.8)]" />
                            <span>En Révision</span>
                        </div>
                    </div>
                </div>

                <div className="relative w-full max-w-[1200px] mx-auto pb-10 pl-16 md:pl-24 z-10">
                    {/* Y-Axis Label */}
                    <div className="absolute left-0 top-0 bottom-12 w-14 md:w-20 flex flex-col justify-around text-[11px] md:text-xs text-white/50 font-black text-right pr-6 tracking-widest uppercase">
                        <span className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 min-w-max text-white/80 font-black text-sm tracking-[0.3em] drop-shadow-md">
                            POTENTIEL
                        </span>
                        <div className="relative h-full flex flex-col justify-around items-end py-10 opacity-70">
                            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">Élevé (3)</span>
                            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">Moyen (2)</span>
                            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">Faible (1)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5 lg:gap-8 lg:h-[700px] h-[600px] relative">
                        {/* Grid lines behind cells */}
                        <div className="absolute inset-x-0 -left-6 top-1/3 border-b-2 border-dashed border-white/10 -z-10" />
                        <div className="absolute inset-x-0 -left-6 top-2/3 border-b-2 border-dashed border-white/10 -z-10" />
                        <div className="absolute inset-y-0 -bottom-6 left-1/3 border-r-2 border-dashed border-white/10 -z-10" />
                        <div className="absolute inset-y-0 -bottom-6 left-2/3 border-r-2 border-dashed border-white/10 -z-10" />

                        {GRID_CELLS_CFG.map((cell) => {
                            const cellEmployees = employees.filter(e => e.potential === cell.potential && e.performance === cell.performance);
                            const displayEmployees = cellEmployees.slice(0, MAX_DISPLAY);

                            return (
                                <DroppableCell key={cell.id} cell={cell} cellEmployees={cellEmployees}>
                                    <AnimatePresence>
                                        {displayEmployees.map((emp) => (
                                            <DraggableEmployee key={emp.id} employee={emp} onClick={() => onSelectEmployee(emp)} />
                                        ))}
                                    </AnimatePresence>

                                    {cellEmployees.length > MAX_DISPLAY && (
                                        <div className="w-full text-center py-2.5 text-[11px] font-bold text-white/50 bg-black/40 rounded-xl border border-white/10 mt-2 cursor-pointer hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
                                            + {cellEmployees.length - MAX_DISPLAY} collaborateurs
                                        </div>
                                    )}
                                    {cellEmployees.length === 0 && (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm font-bold uppercase tracking-widest mix-blend-overlay">Glisser ici</div>
                                    )}
                                </DroppableCell>
                            );
                        })}
                    </div>

                    {/* X-Axis Label */}
                    <div className="mt-12 flex justify-center w-full relative z-10">
                        <span className="tracking-[0.3em] text-white/80 font-black text-sm uppercase absolute top-12 drop-shadow-md">
                            PERFORMANCE
                        </span>
                        <div className="grid grid-cols-3 w-full gap-5 text-center text-xs text-white/50 font-black tracking-widest uppercase opacity-70">
                            <div><span className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm inline-block">Faible (1)</span></div>
                            <div><span className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm inline-block">Moyen (2)</span></div>
                            <div><span className="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm inline-block">Élevé (3)</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </DndContext>
    );
}
