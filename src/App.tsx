/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Menu,
  Moon,
  TrendingUp,
  Brain,
  History,
  Activity,
  Award,
  LogOut,
  User,
  Sparkles,
  Layers,
  Search,
  BookOpen,
} from "lucide-react";
import { Dream } from "./types";
import { loadDreams, saveDreams, generateAnalyticFallback } from "./data";
import FeedView from "./components/FeedView";
import RecordView from "./components/RecordView";
import ProcessingView from "./components/ProcessingView";
import EditorView from "./components/EditorView";

export default function App() {
  // Global application states
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [currentTab, setCurrentTab] = useState<"feed" | "record" | "profile">("feed");
  const [viewState, setViewState] = useState<"tabs" | "processing" | "editor">("tabs");
  
  // Selected details for editor launch or processing
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [draftText, setDraftText] = useState("");
  const [extractedDetails, setExtractedDetails] = useState({
    emotion: "Awe",
    location: "Unknown Realm",
    characters: "Unfamiliar guides",
  });

  // Preload initial dreams from storage
  useEffect(() => {
    setDreams(loadDreams());
  }, []);

  const persistDreams = (updated: Dream[]) => {
    setDreams(updated);
    saveDreams(updated);
  };

  const handleSelectDream = (dream: Dream) => {
    setSelectedDream(dream);
    setViewState("editor");
  };

  const handleDeleteDream = (id: string) => {
    const updated = dreams.filter((d) => d.id !== id);
    persistDreams(updated);
  };

  // Submit recorded or typed dream to progress toward Subconscious extraction
  const handleDreamSubmit = async (
    text: string,
    tags: { emotion: string; location: string; characters: string }
  ) => {
    setDraftText(text);
    setExtractedDetails(tags);
    setViewState("processing");
  };

  // Processing ends: compiling dream profile and adding to timeline
  const handleProcessingCompleted = async () => {
    // 1. Try fetching Gemini REST analysis
    let dreamConfig: Partial<Dream> = {};
    try {
      const response = await fetch("/api/analyze-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draftText }),
      });
      const resData = await response.json();
      if (resData.status === "success" && resData.data) {
        const item = resData.data;
        dreamConfig = {
          title: item.title,
          text: draftText,
          duration: Math.max(15, Math.min(60, Math.floor(draftText.length / 5))),
          visuals: {
            imageUrl: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800",
            style: item.style || "Synthwave",
            refinePrompt: item.refinePrompt || draftText,
            videoSequence: `Sequence ${Math.floor(Math.random() * 15 + 1).toString().padStart(2, '0')}_C`,
          },
          details: {
            entities: item.characters ? [item.characters] : [extractedDetails.characters],
            entityTags: ["#Archetype", "#Visage"],
            spatialContext: item.location || extractedDetails.location,
            spatialTags: ["#Reverie", "#Focal"],
            atmosphere: `Extracted palette reflecting emotion: ${item.emotion}`,
            emotion: item.emotion || extractedDetails.emotion,
            tags: item.tags || ["#Lucid"],
            clarity: "High Clarity",
            control: "Medium Control",
          },
          tracks: {
            visuals: [
              { id: "cv-1", name: "Opening subconscious sequence", start: 0, duration: 15 },
              { id: "cv-2", name: "Dynamic camera translation", start: 15, duration: 25 },
            ],
            atmosphere: [
              { id: "ca-1", name: `${item.emotion || "Introspection"} haze`, start: 0, duration: 40 },
            ],
            lighting: [
              { id: "cl-1", name: "Bioluminescent flash sequence", start: 0, duration: 40 },
            ],
          },
        };
      } else {
        throw new Error("Triggering fallback parser");
      }
    } catch {
      // 2. Local fallback if server key is absent/not set
      dreamConfig = generateAnalyticFallback(draftText);
      // Incorporate user selectors
      dreamConfig.details = {
        ...dreamConfig.details!,
        emotion: extractedDetails.emotion,
        spatialContext: extractedDetails.location,
        entities: [extractedDetails.characters],
      };
    }

    // Append standard parameters
    const newDream: Dream = {
      id: `dream-${Date.now()}`,
      title: dreamConfig.title || "The Shadow Mirage",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      timestamp: new Date().toISOString(),
      text: draftText,
      duration: dreamConfig.duration || 35,
      visuals: dreamConfig.visuals!,
      details: dreamConfig.details!,
      tracks: dreamConfig.tracks!,
    };

    const updated = [newDream, ...dreams];
    persistDreams(updated);
    setSelectedDream(newDream);
    setViewState("editor");
  };

  // Called in editor to render prompt changes
  const handleEditorGenerateVisual = async (prompt: string, style: string) => {
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      const data = await response.json();
      if (data.imageUrl) {
        return data.imageUrl;
      }
    } catch (e) {
      console.error("Gemini image request failed, generating stylized Unsplash fallback", e);
    }
    // High-quality unsplash visual style selector
    const designTerm = encodeURIComponent(`${style} ${prompt}`);
    return `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800&sig=${Math.floor(Math.random() * 100)}`;
  };

  const handleSaveDreamEditor = (updatedDream: Dream) => {
    const updated = dreams.map((d) => (d.id === updatedDream.id ? updatedDream : d));
    persistDreams(updated);
  };

  // Profile Dream Statistics Calculation
  const getProfileStats = () => {
    const count = dreams.length;
    const lucidCount = dreams.filter((d) => d.details.tags.some((t) => t.toLowerCase().includes("lucid"))).length;
    const nightmareCount = dreams.filter((d) => d.details.tags.some((t) => t.toLowerCase().includes("nightmare"))).length;
    const recurringCount = dreams.filter((d) => d.details.tags.some((t) => t.toLowerCase().includes("recurring"))).length;

    return {
      count,
      lucidPercent: count ? Math.round((lucidCount / count) * 100) : 0,
      nightmarePercent: count ? Math.round((nightmareCount / count) * 100) : 0,
      recurringPercent: count ? Math.round((recurringCount / count) * 100) : 0,
    };
  };

  const stats = getProfileStats();

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-secondary/30 pb-12 font-sans overflow-x-hidden antialiased">
      
      {/* Background Starry Mesh Fog blurs */}
      <div className="absolute inset-x-0 top-0 h-[600px] pointer-events-none z-0 overflow-hidden mix-blend-screen opacity-40">
        <div className="absolute top-[-100px] left-[10%] w-[350px] h-[350px] rounded-full bg-secondary-container/20 blur-[100px] animate-pulse" />
        <div className="absolute top-[150px] right-[15%] w-[400px] h-[400px] rounded-full bg-tertiary-fixed-dim/15 blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      </div>

      {viewState === "tabs" && (
        <>
          {/* Top Shared Header AppBar */}
          <header className="sticky top-0 w-full z-40 bg-[#101225]/85 backdrop-blur-xl border-b border-white/10 flex justify-between items-center px-4 h-16 shadow-[0_0_20px_rgba(202,194,225,0.08)]">
            <button className="text-on-surface-variant hover:text-tertiary p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center border border-white/10 shadow-sm relative overflow-hidden group">
                <Moon className="w-4 h-4 text-secondary group-hover:rotate-45 transition-transform" />
              </div>
              <h1 className="font-display-lg text-lg text-primary tracking-widest font-normal uppercase select-none">
                Somnia
              </h1>
            </div>
            <button 
              onClick={() => setCurrentTab("profile")}
              className="text-on-surface-variant hover:text-tertiary p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none"
            >
              <User className="w-5 h-5 text-secondary-fixed-dim" />
            </button>
          </header>

          {/* Active Router views */}
          <main className="relative z-10">
            {currentTab === "feed" && (
              <FeedView
                dreams={dreams}
                onSelectDream={handleSelectDream}
                onDeleteDream={handleDeleteDream}
                onNavigateToRecord={() => setCurrentTab("record")}
              />
            )}

            {currentTab === "record" && (
              <RecordView onDreamSubmit={handleDreamSubmit} />
            )}

            {currentTab === "profile" && (
              <div className="max-w-2xl mx-auto px-4 pt-4 pb-20 space-y-6 text-left">
                {/* User Card */}
                <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-secondary-container to-tertiary-container flex items-center justify-center border border-white/10 shadow-lg text-white font-bold text-xl uppercase">
                      ES
                    </div>
                    <div>
                      <h2 className="font-headline-lg text-xl font-bold tracking-wide text-on-surface">Subconscious Explorer</h2>
                      <p className="font-mono text-xs text-on-surface-variant/75">esdecyofficial@gmail.com</p>
                    </div>
                  </div>

                  <hr className="border-white/5" />

                  {/* High level stats items */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="font-label-caps text-[9px] tracking-widest text-[#cac2e1] block">TOTAL REVERIES</span>
                      <span className="font-title-md text-xl font-bold text-secondary mt-1 block">{stats.count}</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="font-label-caps text-[9px] tracking-widest text-[#cac2e1] block">SLEEP CLARITY</span>
                      <span className="font-title-md text-xl font-bold text-tertiary mt-1 block">94%</span>
                    </div>
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      <span className="font-label-caps text-[9px] tracking-widest text-[#cac2e1] block">REM INTENS</span>
                      <span className="font-title-md text-xl font-bold text-[#ecb2ff] mt-1 block">Level 4</span>
                    </div>
                  </div>
                </div>

                {/* Analytical statistics segment */}
                <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl space-y-6">
                  <h3 className="font-title-md text-sm text-surface-tint tracking-widest uppercase font-bold flex items-center gap-1.5 border-b border-white/5 pb-2.5">
                    <TrendingUp className="w-4 h-4 text-secondary" /> COGNITIVE RATIO DISTRIBUTION
                  </h3>

                  {/* Metrical tracks */}
                  <div className="space-y-4">
                    
                    {/* Lucid */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-baseline text-xs font-mono text-on-surface-variant">
                        <span className="flex items-center gap-1"><Brain className="w-3.5 h-3.5 text-tertiary shrink-0 animate-pulse" /> Lucid Control</span>
                        <span className="text-tertiary font-bold">{stats.lucidPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-tertiary rounded-full shadow-[0_0_8px_#00dbe9]" style={{ width: `${stats.lucidPercent}%` }} />
                      </div>
                    </div>

                    {/* Nightmare */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-baseline text-xs font-mono text-on-surface-variant">
                        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-error shrink-0" /> Restless Nightmares</span>
                        <span className="text-error font-bold">{stats.nightmarePercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-error rounded-full shadow-[0_0_8px_#ffb4ab]" style={{ width: `${stats.nightmarePercent}%` }} />
                      </div>
                    </div>

                    {/* Recurring */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-baseline text-xs font-mono text-on-surface-variant">
                        <span className="flex items-center gap-1"><History className="w-3.5 h-3.5 text-secondary shrink-0" /> Cyclic Recurring Loops</span>
                        <span className="text-secondary font-bold">{stats.recurringPercent}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-secondary rounded-full shadow-[0_0_8px_#ecb2ff]" style={{ width: `${stats.recurringPercent}%` }} />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Subconscious dream keywords lists */}
                <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-xl text-left space-y-4">
                  <h4 className="font-title-md text-xs tracking-widest uppercase text-[#cac2e1] font-semibold flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-tertiary" /> Sleep Wave Activity logs
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Bioluminescent", "Glass reflection", "Endless corridors", "Brutalist spires", "Weightless flight", "Shadow guide"].map((keyword, idx) => (
                      <span key={idx} className="bg-white/5 border border-white/5 font-mono text-[11px] text-on-surface-variant px-2.5 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={() => setCurrentTab("feed")}
                    className="text-xs text-on-surface-variant/60 hover:text-white underline underline-offset-4 font-mono transition-colors focus:outline-none"
                  >
                    Return to subconscious grid
                  </button>
                </div>
              </div>
            )}
          </main>

          {/* Bottom Shared Floating Action Button for recording (Only inside Feed) */}
          {currentTab === "feed" && (
            <button
              onClick={() => setCurrentTab("record")}
              className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-secondary-container to-tertiary-container text-on-primary flex items-center justify-center shadow-[0_0_25px_rgba(207,92,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto border-none focus:outline-none focus:ring-0"
              id="fab-speak-trigger"
              title="Dictate New Dream"
            >
              <Sparkles className="w-6 h-6 animate-pulse" />
            </button>
          )}

          {/* Bottom Nav Bar layout matching mock standard tabs selection */}
          <nav className="fixed bottom-0 w-full z-45 bg-[#1c1e32]/85 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_32px_0_rgba(207,92,255,0.12)] flex justify-around items-center px-4 py-3 pb-safe">
            
            <button
              onClick={() => setCurrentTab("feed")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-secondary group transition-colors focus:outline-none ${
                currentTab === "feed"
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <Layers className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Feed</span>
            </button>

            <button
              onClick={() => setCurrentTab("record")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-secondary group transition-colors focus:outline-none ${
                currentTab === "record"
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <Moon className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Record</span>
            </button>

            <button
              onClick={() => {
                setCurrentTab("feed");
                setTimeout(() => {
                  const input = document.getElementById("search-subconscious") as HTMLInputElement;
                  if (input) input.focus();
                }, 100);
              }}
              className="flex flex-col items-center justify-center py-1 bg-transparent text-on-surface-variant/50 hover:text-secondary group transition-colors focus:outline-none"
            >
              <Search className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Search</span>
            </button>

            <button
              onClick={() => setCurrentTab("profile")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-secondary group transition-colors focus:outline-none ${
                currentTab === "profile"
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <User className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Profile</span>
            </button>
          </nav>
        </>
      )}

      {/* Subconscious processing pipeline view */}
      {viewState === "processing" && (
        <ProcessingView
          draftText={draftText}
          extractedDetails={extractedDetails}
          onProcessingCompleted={handleProcessingCompleted}
        />
      )}

      {/* Multi-track Timeline Editor screen */}
      {viewState === "editor" && selectedDream && (
        <EditorView
          dream={selectedDream}
          onNavigateBack={() => {
            setViewState("tabs");
            setCurrentTab("feed");
          }}
          onSaveDream={handleSaveDreamEditor}
          onTriggerGeminiGenerate={handleEditorGenerateVisual}
        />
      )}

    </div>
  );
}
