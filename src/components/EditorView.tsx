/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Tv,
  Edit2,
  FileText,
  Palette,
  Layers,
  Sparkles,
  Scissors,
  Copy,
  Clipboard,
  Plus,
  Play,
  Volume2,
  Eye,
  Lock,
  Compass,
  Smile,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Dream, TrackClip } from "../types";
import DreamPlayer from "./DreamPlayer";

interface EditorViewProps {
  dream: Dream;
  onNavigateBack: () => void;
  onSaveDream: (updatedDream: Dream) => void;
  onTriggerGeminiGenerate: (prompt: string, style: string) => Promise<string>;
}

export default function EditorView({
  dream,
  onNavigateBack,
  onSaveDream,
  onTriggerGeminiGenerate,
}: EditorViewProps) {
  const [activeDream, setActiveDream] = useState<Dream>(dream);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(dream.title);
  const [refinePrompt, setRefinePrompt] = useState(dream.visuals.refinePrompt);
  const [isRendering, setIsRendering] = useState(false);

  // States to implement simple undo/redo
  const [history, setHistory] = useState<Dream[]>([dream]);
  const [historyIdx, setHistoryIdx] = useState(0);

  const pushToHistory = (newDream: Dream) => {
    const updatedHistory = history.slice(0, historyIdx + 1);
    updatedHistory.push(newDream);
    setHistory(updatedHistory);
    setHistoryIdx(updatedHistory.length - 1);
    setActiveDream(newDream);
    onSaveDream(newDream);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1;
      setHistoryIdx(idx);
      setActiveDream(history[idx]);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const idx = historyIdx + 1;
      setHistoryIdx(idx);
      setActiveDream(history[idx]);
    }
  };

  // Timeline scrubber slide trigger based on timeline click
  const handleTimelineScrub = (percent: number) => {
    const time = percent * activeDream.duration;
    setCurrentTime(Math.min(activeDream.duration, Math.max(0, time)));
  };

  const selectStyle = (styleName: string) => {
    const updated = {
      ...activeDream,
      visuals: {
        ...activeDream.visuals,
        style: styleName,
      },
    };
    pushToHistory(updated);
  };

  const saveTitle = () => {
    const updated = {
      ...activeDream,
      title: titleInput || activeDream.title,
    };
    setIsEditingTitle(false);
    pushToHistory(updated);
  };

  // Triggers prompt refinements back via Gemini!
  const handleApplyPrompt = () => {
    const updated = {
      ...activeDream,
      visuals: {
        ...activeDream.visuals,
        refinePrompt,
      },
    };
    pushToHistory(updated);
  };

  const handleRenderVisual = async () => {
    setIsRendering(true);
    try {
      // Call Gemini proxy on the server-side to generate a brand new image
      const image64 = await onTriggerGeminiGenerate(refinePrompt, activeDream.visuals.style);
      if (image64) {
        const updated = {
          ...activeDream,
          visuals: {
            ...activeDream.visuals,
            imageUrl: image64,
          },
        };
        pushToHistory(updated);
      }
    } catch (e) {
      console.error("Gemini Render error, falling back to dynamic styled layer", e);
    } finally {
      setIsRendering(false);
    }
  };

  // Add standard detail tags
  const injectDetailTag = (type: "emotion" | "location") => {
    if (type === "emotion") {
      const emos = ["Sublime", "Melancholy", "Awe", "Thrilling", "Uncanny"];
      const r = emos[Math.floor(Math.random() * emos.length)];
      const updated = {
        ...activeDream,
        details: {
          ...activeDream.details,
          emotion: r,
        },
      };
      pushToHistory(updated);
    } else {
      const locs = ["Quantum Fields", "Nebula Chamber", "Shattered Colosseum", "Memory Lake"];
      const l = locs[Math.floor(Math.random() * locs.length)];
      const updated = {
        ...activeDream,
        details: {
          ...activeDream.details,
          spatialContext: l,
        },
      };
      pushToHistory(updated);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col font-body-sm text-body-sm overflow-hidden select-none relative bg-background">
      {/* Top Header toolbar matching design specs */}
      <header className="bg-background/85 backdrop-blur-xl h-16 shrink-0 border-b border-white/10 shadow-[0_0_20px_rgba(202,194,225,0.08)] flex justify-between items-center px-4 relative z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateBack}
            className="text-primary hover:text-tertiary p-2 -ml-2 rounded-full hover:bg-white/5 transition-all text-left focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-headline-lg-mobile text-lg text-primary tracking-widest hidden md:block select-none">
            Somnia
          </span>
        </div>

        {/* Dynamic Title Editor */}
        <div className="flex-1 flex justify-center items-center">
          <div className="flex items-center gap-2 glass-panel rounded-full px-4 py-1 border border-white/5 shadow-sm">
            <span className="text-on-surface-variant/75 text-xs">Editing:</span>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                  className="bg-black/40 text-sm text-[#ecb2ff] font-semibold border-b border-secondary px-2 py-0.5 focus:outline-none w-36"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-title-md text-sm text-secondary font-semibold">
                  {activeDream.title}
                </span>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="text-on-surface-variant/60 hover:text-white p-1 rounded transition-colors focus:outline-none cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Undo, Redo, Render CTA */}
        <div className="flex items-center gap-3.5">
          <button
            disabled={historyIdx === 0}
            onClick={handleUndo}
            className={`p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none ${
              historyIdx === 0 ? "opacity-30 cursor-not-allowed" : "text-primary hover:text-tertiary cursor-pointer"
            }`}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            disabled={historyIdx === history.length - 1}
            onClick={handleRedo}
            className={`p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none ${
              historyIdx === history.length - 1
                ? "opacity-30 cursor-not-allowed"
                : "text-primary hover:text-tertiary cursor-pointer"
            }`}
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleRenderVisual}
            disabled={isRendering}
            className="bg-gradient-to-tr from-secondary-container to-tertiary text-on-primary px-4 py-2 rounded-full font-label-caps text-[10px] tracking-wider flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(236,178,255,0.25)] ml-1.5 focus:outline-none cursor-pointer font-bold"
          >
            <Tv className="w-3.5 h-3.5" />
            RENDER
          </button>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Left column: Player and styling refinement boxes */}
        <section className="flex-1 flex flex-col overflow-y-auto p-4 gap-4 bg-surface-container-lowest/40 scrollbar-thin">
          {/* Active play dream screen */}
          <DreamPlayer
            dream={activeDream}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeUpdate={setCurrentTime}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            isRendering={isRendering}
          />

          {/* Contextual control boxes row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Prompt refinement column panel */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 border border-white/5 text-left">
              <div className="flex justify-between items-center text-on-surface-variant font-label-caps text-[10px] tracking-wider font-semibold">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-secondary" />
                  REFINE VISUAL PROMPT
                </span>
                <span className="text-secondary/70 font-mono">Frame 12</span>
              </div>
              <textarea
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 font-body-sm text-xs text-on-surface focus:border-tertiary/55 focus:ring-1 focus:ring-tertiary outline-none resize-none h-16 scrollbar-none"
                placeholder="Describe your adjustments..."
              />
              <button
                onClick={handleApplyPrompt}
                className="w-full py-1.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-lg border border-white/5 font-label-caps text-[9px] tracking-wider text-secondary transition-colors cursor-pointer"
              >
                Apply to Clip
              </button>
            </div>

            {/* Visual Style Selector box */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 border border-white/5 text-left">
              <span className="font-label-caps text-[10px] tracking-wider text-on-surface-variant flex items-center gap-1 font-semibold">
                <Palette className="w-3.5 h-3.5 text-tertiary" />
                GLOBAL STYLE
              </span>
              <div className="grid grid-cols-2 gap-1.5 flex-grow">
                {["Synthwave", "Ghibli", "Noir", "Hyper-real"].map((sty) => {
                  const isSel = activeDream.visuals.style === sty;
                  return (
                    <button
                      key={sty}
                      onClick={() => selectStyle(sty)}
                      className={`py-1.5 rounded text-[10px] font-semibold tracking-wide border transition-all cursor-pointer ${
                        isSel
                          ? "bg-tertiary/15 border-tertiary text-tertiary shadow-[0_0_10px_rgba(0,219,233,0.15)]"
                          : "bg-black/20 border-white/5 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      {sty}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dream Layer overlays */}
            <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 border border-white/5 text-left">
              <span className="font-label-caps text-[10px] tracking-wider text-on-surface-variant flex items-center gap-1 font-semibold">
                <Layers className="w-3.5 h-3.5 text-primary" />
                DREAM LAYERS
              </span>
              <div className="flex flex-col gap-1.5 mt-1 flex-grow justify-center">
                <button
                  onClick={() => injectDetailTag("emotion")}
                  className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-on-surface transition-colors cursor-pointer group"
                >
                  <Smile className="w-4 h-4 text-secondary group-hover:animate-bounce" />
                  <span>Shift Emotion Overlay</span>
                </button>
                <button
                  onClick={() => injectDetailTag("location")}
                  className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-on-surface transition-colors cursor-pointer group"
                >
                  <Compass className="w-4 h-4 text-tertiary group-hover:animate-spin" />
                  <span>Shift Location Context</span>
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Bottom Timeline Section (As per design Screen 4) */}
      <section className="h-[280px] bg-surface-container-high border-t border-white/10 flex flex-col relative z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] shrink-0">
        
        {/* Scrubber Tools bar bar */}
        <div className="h-10 bg-surface-variant flex items-center px-4 justify-between border-b border-white/5">
          <div className="flex items-center gap-3.5 text-on-surface-variant">
            <button className="hover:text-primary transition-colors cursor-pointer"><Scissors className="w-4 h-4" /></button>
            <button className="hover:text-primary transition-colors cursor-pointer"><Copy className="w-4 h-4" /></button>
            <button className="hover:text-primary transition-colors cursor-pointer"><Clipboard className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-white/15" />
            <span className="text-[10px] font-mono select-none">ZOOM</span>
            <input
              type="range"
              min="1"
              max="10"
              defaultValue="5"
              className="w-16 h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
          </div>
          <div className="text-[10px] font-label-caps text-secondary/7 tracking-widest font-bold uppercase select-none">
            Timeline : Sub-Conscious Tracks
          </div>
        </div>

        {/* Main draggable tracks grid split */}
        <div className="flex-grow flex overflow-hidden relative">
          
          {/* Left headers columns */}
          <div className="w-44 bg-[#181a2d] border-r border-white/10 flex flex-col shrink-0 relative z-10 shadow-[5px_0_10px_rgba(0,0,0,0.2)]">
            <div className="h-8 border-b border-white/5 flex items-center justify-end px-3">
              <span className="text-[9px] font-semibold text-on-surface-variant/50 uppercase font-mono tracking-wider">Tracks</span>
            </div>

            {/* Visuals track header */}
            <div className="h-14 border-b border-white/5 px-3 py-1 flex flex-col justify-center bg-black/10 hover:bg-black/20 transition-colors pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="font-title-md text-xs font-semibold text-on-surface">Visuals</span>
              </div>
              <div className="flex gap-2 mt-1 opacity-45">
                <Eye className="w-3.5 h-3.5 text-on-surface hover:text-white" />
                <Lock className="w-3.5 h-3.5 text-on-surface hover:text-white" />
              </div>
            </div>

            {/* Atmosphere track header */}
            <div className="h-14 border-b border-white/5 px-3 py-1 flex flex-col justify-center hover:bg-black/20 transition-colors pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-tertiary shrink-0" />
                <span className="font-title-md text-xs font-semibold text-on-surface">Atmosphere</span>
              </div>
              <div className="flex gap-2 mt-1 opacity-45">
                <Eye className="w-3.5 h-3.5 text-on-surface hover:text-white" />
                <Lock className="w-3.5 h-3.5 text-on-surface hover:text-white" />
              </div>
            </div>

            {/* Lighting track header */}
            <div className="h-14 border-b border-white/5 px-3 py-1 flex flex-col justify-center hover:bg-black/20 transition-colors pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-title-md text-xs font-semibold text-on-surface">Lighting</span>
              </div>
              <div className="flex gap-2 mt-1 opacity-45">
                <Eye className="w-3.5 h-3.5 text-on-surface hover:text-white" />
                <Lock className="w-3.5 h-3.5 text-on-surface hover:text-white" />
              </div>
            </div>

            {/* Add Track CTA */}
            <button className="h-10 px-3 flex items-center text-on-surface-variant/40 hover:text-primary transition-colors border-none bg-transparent cursor-pointer text-left focus:outline-none focus:ring-0">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-label-caps">Add Track</span>
            </button>
          </div>

          {/* Right actual scroll clips area */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden timeline-track-bg select-none relative bg-black/15">
            
            {/* Clickable Time ticks Ruler */}
            <div
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const progress = (e.clientX - rect.left) / rect.width;
                handleTimelineScrub(progress);
              }}
              className="h-8 border-b border-white/5 flex items-end relative sticky top-0 bg-surface-container-high/90 backdrop-blur-sm z-15 w-full cursor-ew-resize"
            >
              <div className="absolute inset-x-0 bottom-1 flex justify-between px-3 text-[9px] font-mono text-on-surface-variant/40 select-none">
                <span>00:00</span>
                <span>00:10</span>
                <span>00:20</span>
                <span>00:30</span>
                <span>00:40</span>
                <span>00:50</span>
              </div>
            </div>

            {/* Time vertical indicator scrubber line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-tertiary z-20 pointer-events-none"
              style={{
                left: `${(currentTime / activeDream.duration) * 100}%`,
                boxShadow: "0 0 10px #00dbe9, 0 0 4px #00dbe9",
              }}
            >
              {/* Playhead circular knob */}
              <div className="absolute -top-1.5 -left-[6px] w-3 h-3 bg-[#00dbe9] rounded-full border border-white shadow-md animate-pulse" />
            </div>

            {/* Track rows background grid */}
            <div className="w-full relative flex flex-col">
              
              {/* Row 1: Visuals Clips */}
              <div className="h-14 border-b border-white/5 relative flex items-center px-1.5">
                {activeDream.tracks.visuals.map((clip) => {
                  const isActive = currentTime >= clip.start && currentTime <= clip.start + clip.duration;
                  const left = (clip.start / activeDream.duration) * 100;
                  const width = (clip.duration / activeDream.duration) * 100;
                  
                  return (
                    <div
                      key={clip.id}
                      className={`absolute h-[76%] rounded flex items-center px-2.5 overflow-hidden transition-all text-xs border ${
                        isActive
                          ? "bg-secondary-container/20 border-secondary shadow-[0_0_12px_rgba(236,178,255,0.15)] text-white font-semibold ring-1 ring-secondary/30"
                          : "bg-[#27283c]/50 border-white/10 text-on-surface-variant/80"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <Tv className="w-3 h-3 mr-1.5 shrink-0 select-none" />
                      <span className="truncate">{clip.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Row 2: Atmosphere Clips */}
              <div className="h-14 border-b border-white/5 relative flex items-center px-1.5">
                {activeDream.tracks.atmosphere.map((clip) => {
                  const isActive = currentTime >= clip.start && currentTime <= clip.start + clip.duration;
                  const left = (clip.start / activeDream.duration) * 100;
                  const width = (clip.duration / activeDream.duration) * 100;
                  
                  return (
                    <div
                      key={clip.id}
                      className={`absolute h-[68%] rounded-full flex items-center px-3.5 overflow-hidden transition-all text-[11px] border border-dashed ${
                        isActive
                          ? "bg-tertiary-container/30 border-tertiary text-tertiary shadow-[0_0_10px_rgba(0,219,233,0.1)] font-semibold"
                          : "bg-black/20 border-white/5 text-on-surface-variant/60"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? "bg-tertiary animate-ping" : "bg-white/10"}`} />
                      <span className="truncate font-mono uppercase tracking-wider">{clip.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Row 3: Lighting Clips */}
              <div className="h-14 border-b border-white/5 relative flex items-center px-1.5">
                {activeDream.tracks.lighting.map((clip) => {
                  const isActive = currentTime >= clip.start && currentTime <= clip.start + clip.duration;
                  const left = (clip.start / activeDream.duration) * 100;
                  const width = (clip.duration / activeDream.duration) * 100;
                  
                  return (
                    <div
                      key={clip.id}
                      className={`absolute h-[54%] rounded flex items-center justify-center text-[10px] font-semibold transition-all border ${
                        isActive
                          ? "bg-[#cac2e1]/15 border-primary text-[#cac2e1]"
                          : "bg-black/10 border-white/5 text-on-surface-variant/40"
                      }`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <span className="truncate">{clip.name}</span>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
