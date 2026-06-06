/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Brain, MapPin, Eye, Edit3, Trash2, Sliders, Calendar, Download, ChevronDown, ChevronUp, HelpCircle, BookOpen, Layers, Volume2, ShieldCheck, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
  const [showFAQ, setShowFAQ] = useState(false);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const handleExportCorpus = () => {
    if (dreams.length === 0) return;
    let md = `# SOMNIA Subconscious Corpus - Dream Journal Data\n`;
    md += `Exported: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}\n\n`;
    md += `This document is specifically structured for ingestion into Google's NotebookLM (https://notebooklm.google) to generate deep-dive analyses, psychological metaphor summaries, and conversational sound host podcasts discussing your subconscious.\n\n`;
    md += `## Suggested NotebookLM Ingest Prompts:\n`;
    md += `1. "Analyze my dream database. What are my most recurring symbols, elements, and emotions?"\n`;
    md += `2. "Identify any progress or patterns over time in my dreams, explaining what they could mean psychologically."\n`;
    md += `3. "Generate an active audio podcast script or brief conversation summarizing the narrative threads present herein."\n\n`;
    md += `---\n\n`;
    md += `## ARCHIVE REVERIES\n\n`;

    dreams.forEach((dream) => {
      md += `### Dream: ${dream.title}\n`;
      md += `* **Date Logged**: ${dream.date} (${dream.timestamp})\n`;
      md += `* **Visual Art Style**: ${dream.visuals.style}\n`;
      md += `* **Dominant Emotion**: ${dream.details.emotion}\n`;
      md += `* **Clarity Level**: ${dream.details.clarity}\n`;
      md += `* **Control Rating**: ${dream.details.control}\n`;
      md += `* **Physical Location Context**: ${dream.details.spatialContext}\n`;
      md += `* **Recognized Entities/Shadows**: ${dream.details.entities.join(", ") || "None highlighted"}\n`;
      md += `* **Tags**: ${dream.details.tags.join(", ") || "None"}\n\n`;
      md += `#### Transcribed Sleep Dictation:\n`;
      md += `> ${dream.text}\n\n`;
      md += `***\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `somnia_subconscious_corpus_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      {/* NotebookLM Integration Sync Panel */}
      <div className="glass-panel border border-secondary/20 bg-gradient-to-r from-secondary-container/5 via-black/30 to-background p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-44 h-44 bg-secondary/5 rounded-full blur-[40px] group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#ca9eff] animate-pulse drop-shadow-[0_0_8px_rgba(202,158,255,0.7)]" />
            <h4 className="text-sm font-semibold text-secondary tracking-widest font-label-caps uppercase">
              Co-Host a Podcast on Google NotebookLM
            </h4>
          </div>
          <p className="text-xs text-on-surface-variant/90 leading-relaxed">
            Ready to listen to a full deep-dive podcast discussing your dreams? Export your complete subconscious journal as a structured data packet. Upload this downloaded document as an index source inside Google's free **NotebookLM (notebooklm.google)** to generate an automated dynamic audio discussion, analyze recurring archetypes, and unravel emotional correlations!
          </p>
        </div>
        <button
          onClick={handleExportCorpus}
          className="px-5 py-2.5 bg-gradient-to-tr from-[#9efffc] to-[#ca9eff] text-[#0b0d1f] hover:brightness-110 rounded-full text-xs font-semibold tracking-wider font-label-caps flex items-center gap-2 shadow-[0_0_15px_rgba(158,255,252,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" />
          Download Podcast Source Document (.md)
        </button>
      </div>

      {/* Interactive FAQ / Handbook Dropdown */}
      <div className="glass-panel border border-white/5 bg-[#0f1122]/70 rounded-2xl p-4 text-left transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <button
          onClick={() => setShowFAQ(!showFAQ)}
          className="w-full flex items-center justify-between py-1 text-xs font-bold tracking-widest font-label-caps text-[#ca9eff] cursor-pointer hover:opacity-90 focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#ca9eff] animate-pulse" />
            <span>SOMNIA HANDBOOK & FEATURES HANDBOOK</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant text-[10px]">
            <span>{showFAQ ? "Collapse" : "Explore Guide"}</span>
            {showFAQ ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        <AnimatePresence>
          {showFAQ && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 mt-3 select-text">
                {[
                  {
                    title: "What is the Subconscious Corpus?",
                    icon: <BookOpen className="w-4 h-4 text-secondary shrink-0 mt-0.5" />,
                    desc: "An archive tool designed to compile your exact REM symbols, emotion indexes, visual styles, and waking life contexts into a high-density Markdown document. You can upload this directly to Google's NotebookLM (notebooklm.google) to generate smart audio podcasts and conversational host discussions about your dream habits."
                  },
                  {
                    title: "How do active Reality Anchor Tests function?",
                    icon: <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />,
                    desc: "Reality checks are cognitive exercises to establish wakefulness. Pausing to examine physical constants (such as whether your finger passes through your opposite palm, or if gravity is absolute) builds mental reflexes in waking. These reflexes carry over to sleep, alerting you to the fact that you are currently dreaming."
                  },
                  {
                    title: "What are Bedrock Correlations (Milestones & Beds)?",
                    icon: <Layers className="w-4 h-4 text-[#ca9eff] shrink-0 mt-0.5" />,
                    desc: "Your sleep environment and active life triggers heavily shape REM structures. Somnia matches your dreams with current waking life chapters (e.g. relation transitions, career stressors) and physical bed familiarity (e.g. home bed, travel/temporary mattresses) to chart how physical realities map to inner mindscapes."
                  },
                  {
                    title: "What are Binaural Entrainment carrier waves?",
                    icon: <Volume2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />,
                    desc: "By playing slightly offset, low-frequency soundscapes in each ear (e.g., 136Hz in the left and 141.5Hz in the right), your auditory cortex synthesizes a deep 5.5Hz Theta wave. This differential wave matches the natural hypnagogic and dream entry neural patterns, facilitating vividness and dream control."
                  },
                  {
                    title: "How does the Sleep-Learning REM Study Loop work?",
                    icon: <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />,
                    desc: "Our study loop matches standard spaced-repetition models with quiet nighttime theta wave carry tracks. By selection of a curated course (like medical suffixes, SAT terms, or languages) or paste of chapter notes, the system loops quiet whispers while you rest, supporting vocabulary retention."
                  },
                  {
                    title: "How does Somnia select Dream Meanings?",
                    icon: <Brain className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />,
                    desc: "When editing or playing any dream within the workspace, you can select 'Seek Interpretation' to invoke our server-side psychological model. It analyzes emotional currents, correlates life milestones, and allows you to chat about recurring symbols in real-time."
                  }
                ].map((faq, fIdx) => (
                  <div key={fIdx} className="p-3 bg-black/15 border border-white/5 rounded-xl space-y-1 text-left">
                    <h5 className="text-xs font-semibold text-on-surface flex items-start gap-2 leading-tight">
                      {faq.icon}
                      <span>{faq.title}</span>
                    </h5>
                    <p className="text-[11px] text-on-surface-variant/85 leading-relaxed pl-6">
                      {faq.desc}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

                {/* Highly conspicuous button to trigger Video / Image Editor & Subconscious Guide */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDream(dream);
                  }}
                  className="mt-4 w-full py-2 bg-[#ca9eff]/10 hover:bg-gradient-to-r hover:from-[#9efffc] hover:to-[#ca9eff] hover:text-[#0b0d1f] border border-[#ca9eff]/30 rounded-lg text-[10px] font-bold font-label-caps tracking-widest text-[#ca9eff] flex items-center justify-center gap-2 transition-all relative z-10 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-secondary" />
                  OPEN CREATIVE VIDEO EDITOR & SYMBOL GUIDE
                </button>
              </div>

              {/* Keep underlying hover backdrop click cover for standard ease of navigation */}
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
