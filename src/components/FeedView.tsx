/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Brain, MapPin, Eye, Edit3, Trash2, Sliders, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { Dream } from "../types";

interface FeedViewProps {
  dreams: Dream[];
  onSelectDream: (dream: Dream) => void;
  onDeleteDream: (id: string) => void;
  onNavigateToRecord: () => void;
}

export default function FeedView({
  dreams,
  onSelectDream,
  onDeleteDream,
  onNavigateToRecord,
}: FeedViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Filter dreams based on query + quick chip
  const filteredDreams = dreams.filter((dream) => {
    const query = searchQuery.toLowerCase();
    const searchMatch =
      query === "" ||
      dream.title.toLowerCase().includes(query) ||
      dream.text.toLowerCase().includes(query) ||
      dream.details.emotion.toLowerCase().includes(query) ||
      dream.details.spatialContext.toLowerCase().includes(query) ||
      dream.details.entities.some((e) => e.toLowerCase().includes(query));

    const chipMatch =
      !activeChip ||
      dream.details.tags.some((t) => t.toLowerCase().includes(activeChip.toLowerCase())) ||
      dream.visuals.style.toLowerCase() === activeChip.toLowerCase() ||
      dream.details.emotion.toLowerCase().includes(activeChip.toLowerCase());

    return searchMatch && chipMatch;
  });

  const quickFilterChips = [
    { label: "#Lucid", value: "#Lucid", type: "lucid" },
    { label: "#Nightmare", value: "#Nightmare", type: "nightmare" },
    { label: "#Recurring", value: "#Recurring", type: "recurring" },
    { label: "Flight", value: "Flight", type: "default" },
    { label: "Synthwave", value: "Synthwave", type: "default" },
    { label: "Noir", value: "Noir", type: "default" },
  ];

  const getChipClass = (type: string, isSelected: boolean) => {
    const base = "px-3 py-1.5 rounded-full font-label-caps text-xs chip transition-all cursor-pointer select-none ";
    if (isSelected) {
      if (type === "lucid") return base + "border-tertiary bg-tertiary/20 text-tertiary shadow-[0_0_10px_rgba(0,219,233,0.3)]";
      if (type === "nightmare") return base + "border-error bg-error/20 text-error shadow-[0_0_10px_rgba(255,180,171,0.3)]";
      if (type === "recurring") return base + "border-secondary bg-secondary/20 text-secondary shadow-[0_0_10px_rgba(236,178,255,0.3)]";
      return base + "border-[#cac2e1] bg-[#cac2e1]/20 text-[#cac2e1] shadow-[0_0_10px_rgba(202,194,225,0.3)]";
    } else {
      if (type === "lucid") return base + "hover:border-tertiary/50 hover:text-tertiary";
      if (type === "nightmare") return base + "hover:border-error/50 hover:text-error";
      if (type === "recurring") return base + "hover:border-secondary/50 hover:text-secondary";
      return base + "hover:border-white/30 hover:text-white";
    }
  };

  return (
    <div className="w-full flex flex-col pt-4 pb-20 px-4 md:px-0 max-w-4xl mx-auto space-y-6">
      {/* Search Header Container card */}
      <section className="relative z-10 w-full mb-4">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-input rounded-full py-4 pl-12 pr-12 text-on-surface font-body-lg text-body-lg placeholder-on-surface-variant/40 transition-all focus:outline-none"
            placeholder="Search the subconscious..."
            id="search-subconscious"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-tertiary hover:text-white focus:outline-none"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Quick Filter Tag Chips row */}
        <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 snap-x scrollbar-none scroll-smooth">
          {quickFilterChips.map((chip, idx) => {
            const isSelected = activeChip === chip.value;
            return (
              <div
                key={`chip-${idx}`}
                onClick={() => setActiveChip(isSelected ? null : chip.value)}
                className={`${getChipClass(chip.type, isSelected)} snap-start`}
              >
                {chip.label}
              </div>
            );
          })}
        </div>
      </section>

      {/* Grid listing */}
      {filteredDreams.length === 0 ? (
        <div className="glass-panel rounded-xl py-16 px-6 text-center space-y-4">
          <Brain className="w-12 h-12 text-secondary-fixed-dim mx-auto animate-pulse" />
          <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-widest font-thin">
            No Reveries Matched
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mx-auto">
            The subconscious lies quiet. Try broadening your query terms or dictate a new dream to materialize it!
          </p>
          <button
            onClick={onNavigateToRecord}
            className="px-6 py-2 rounded-full border border-secondary/30 hover:border-secondary/60 text-secondary text-xs font-semibold bg-secondary/10 transition-colors"
          >
            Log First Dream
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          {filteredDreams.map((dream, idx) => (
            <motion.article
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              key={dream.id}
              className="glass-panel rounded-xl overflow-hidden flex flex-col hover:-translate-y-1 transition-all duration-300 group border border-white/5 relative"
            >
              <div className="relative h-48 w-full overflow-hidden shrink-0">
                <img
                  referrerPolicy="no-referrer"
                  alt={dream.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={dream.visuals.imageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1e32] via-[#1c1e32]/40 to-transparent opacity-85" />
                
                {/* Chip Badges */}
                <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
                  {dream.details.tags.map((tag, tIdx) => {
                    const isNightmare = tag.toLowerCase().includes("nightmare");
                    const isLucid = tag.toLowerCase().includes("lucid");
                    const isRecurring = tag.toLowerCase().includes("recurring");
                    
                    let cls = "chip px-3 py-1 rounded-full font-label-caps text-[9px] uppercase tracking-wider ";
                    if (isNightmare) cls += "chip-nightmare text-error";
                    else if (isLucid) cls += "chip-lucid text-tertiary";
                    else if (isRecurring) cls += "chip-recurring text-secondary";
                    else cls += "text-on-surface border-white/10";
                    
                    return (
                      <span key={`tag-${tIdx}`} className={cls}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
                
                {/* Trigger buttons hovered */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDream(dream.id);
                    }}
                    className="p-1.5 rounded-full bg-black/50 text-error hover:bg-error hover:text-white transition-colors focus:outline-none"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start gap-2">
                    <h2 className="font-headline-lg-mobile text-xl text-on-surface line-clamp-1 group-hover:text-secondary transition-colors text-left font-semibold">
                      {dream.title}
                    </h2>
                    <span className="text-on-surface-variant/70 font-mono text-[11px] whitespace-nowrap bg-white/5 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-secondary-fixed-dim" />
                      {dream.date}
                    </span>
                  </div>
                  
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 text-left">
                    {dream.text}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/5 mt-5 text-[11px] text-on-surface-variant/85 font-mono">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Brain className="w-3.5 h-3.5 text-secondary shrink-0" />
                    <span className="truncate">{dream.details.clarity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0 text-right">
                    <MapPin className="w-3.5 h-3.5 text-tertiary shrink-0" />
                    <span className="truncate">{dream.details.entities[0] || "Deep mind"}</span>
                  </div>
                </div>
              </div>

              {/* Floating editor trigger button cover click */}
              <div 
                onClick={() => onSelectDream(dream)}
                className="absolute inset-0 cursor-pointer z-0 opacity-0 bg-transparent"
              />
            </motion.article>
          ))}
        </section>
      )}
    </div>
  );
}
