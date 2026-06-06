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
  Headphones,
  Edit3,
  Mic,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Dream } from "./types";
import { loadDreams, saveDreams, generateAnalyticFallback } from "./data";
import FeedView from "./components/FeedView";
import RecordView from "./components/RecordView";
import SleepMicView from "./components/SleepMicView";
import ProcessingView from "./components/ProcessingView";
import EditorView from "./components/EditorView";
import CoachView from "./components/CoachView";
import SynthesizerView from "./components/SynthesizerView";
import AnalyticsView from "./components/AnalyticsView";

export default function App() {
  // Global application states
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [currentTab, setCurrentTab] = useState<"feed" | "sleep-mic" | "record" | "editor" | "profile" | "coach" | "synth">("feed");
  const [viewState, setViewState] = useState<"tabs" | "processing">("tabs");
  
  // Selected details for editor launch or processing
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [draftText, setDraftText] = useState("");
  const [draftVoiceUrl, setDraftVoiceUrl] = useState<string | undefined>(undefined);
  const [extractedDetails, setExtractedDetails] = useState({
    emotion: "Awe",
    location: "Unknown Realm",
    characters: "Unfamiliar guides",
    date: new Date().toISOString().split("T")[0],
    renderMode: "video" as "video" | "still",
    style: "Synthwave",
    lifeEpoch: "Ordinary Life",
    sleepEnvironment: "Home Bed",
  });

  // Global Tour Guide states
  const [showGlobalTour, setShowGlobalTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  const globalTourSteps = [
    {
      title: "🌌 Welcome to Somnia — Subconscious Oracle",
      text: "Somnia synchronization connects physical environments, sleep parameters, and waking focus challenges. Let's take a 60-second tour to master its capabilities!",
    },
    {
      title: "📖 1. The Subconscious Feed & Journal Logs",
      text: "Log daily dreams in the Journal, tag details, and search items. Tap 'Download Podcast Source Document' inside your Feed to export a high-density index format specifically formatted to co-host a podcast inside Google's free NotebookLM (notebooklm.google)!",
    },
    {
      title: "🎙️ 2. Nocturnal Somniloquy Threshold Mic",
      text: "The 'Sleep Mic' activates threshold listening when you fall asleep. Speak or dictate your waking thoughts half-awake; the mic registers the sound dynamically without recording silence.",
    },
    {
      title: "🎬 3. Creative Video Studio (Your Editor)",
      text: "Select any dream to open the timeline track. Fine-tune transition clips, refine art prompts (Anime/Noir or Cyberpunk), and expand the right-hand Chat sidebar to consult the Subconscious Guide.",
    },
    {
      title: "🎧 4. Sleep-Learning loops & Binaural Beats",
      text: "The 'Synth' tab features dual pathways: Play True Binaural Waves awake for focus/meditation. As you rest, load study courses (SAT vocabulary, French conversational keys, or custom textbooks) to whisper softly under Alpha waves.",
    },
    {
      title: "🧭 5. Reality Check Coach & challenges",
      text: "Under the 'Coach' tab, train your awake reflexes (e.g. thumb pressure tests, clock triggers). Doing reality tests awake helps your mind repeat these checks while asleep, inducing lucid dreaming!",
    },
    {
      title: "📊 6. Bedrock correlations & analytics",
      text: "Examine beautiful analytics correlation reports charts in the 'Analytics' tab. Track how physical bed parameters (home bed/nap context) or active life milestones correlate directly to REM states.",
    }
  ];

  // Preload initial dreams from storage & trigger first onboarding tour
  useEffect(() => {
    setDreams(loadDreams());
    
    const hasCompletedTour = localStorage.getItem("somnia_global_tour_completed");
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        setShowGlobalTour(true);
        localStorage.setItem("somnia_global_tour_completed", "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const persistDreams = (updated: Dream[]) => {
    setDreams(updated);
    saveDreams(updated);
  };

  const handleSelectDream = (dream: Dream) => {
    setSelectedDream(dream);
    setCurrentTab("editor");
  };

  const handleDeleteDream = (id: string) => {
    const updated = dreams.filter((d) => d.id !== id);
    persistDreams(updated);
  };

  // Submit recorded or typed dream to progress toward Subconscious extraction
  const handleDreamSubmit = async (
    text: string,
    tags: {
      emotion: string;
      location: string;
      characters: string;
      date: string;
      renderMode: "video" | "still";
      style: string;
      lifeEpoch?: string;
      sleepEnvironment?: string;
    },
    voiceUrl?: string
  ) => {
    setDraftText(text);
    setExtractedDetails({
      ...tags,
      lifeEpoch: tags.lifeEpoch || "Ordinary Life",
      sleepEnvironment: tags.sleepEnvironment || "Home Bed"
    });
    setDraftVoiceUrl(voiceUrl);
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
            style: extractedDetails.style || item.style || "Synthwave",
            refinePrompt: item.refinePrompt || draftText,
            videoSequence: `Sequence ${Math.floor(Math.random() * 15 + 1).toString().padStart(2, '0')}_C`,
            renderMode: extractedDetails.renderMode,
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
      dreamConfig.visuals = {
        imageUrl: dreamConfig.visuals?.imageUrl || "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80&w=800",
        style: extractedDetails.style || "Synthwave",
        refinePrompt: draftText,
        videoSequence: `Sequence 01_C`,
        renderMode: extractedDetails.renderMode,
      };
    }

    // Format custom historical date selectively to allow backdating
    let customDateString = "";
    let customTimestamp = "";
    try {
      const parsedDate = new Date(extractedDetails.date + "T12:00:00");
      customDateString = parsedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      customTimestamp = parsedDate.toISOString();
    } catch {
      customDateString = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      customTimestamp = new Date().toISOString();
    }

    // Append standard parameters
    const newDream: Dream = {
      id: `dream-${Date.now()}`,
      title: dreamConfig.title || "The Shadow Mirage",
      date: customDateString,
      timestamp: customTimestamp,
      text: draftText,
      voiceUrl: draftVoiceUrl,
      duration: dreamConfig.duration || 35,
      visuals: dreamConfig.visuals!,
      details: dreamConfig.details!,
      tracks: dreamConfig.tracks!,
      lifeEpoch: extractedDetails.lifeEpoch || "Ordinary Life",
      sleepEnvironment: extractedDetails.sleepEnvironment || "Home Bed",
    };

    // Sort chronologically descending so old dreams slide perfectly into their correct place!
    const updated = [newDream, ...dreams].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    persistDreams(updated);
    setSelectedDream(newDream);
    setViewState("tabs");
    setCurrentTab("editor");
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
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => {
                  setShowGlobalTour(true);
                  setCurrentTourStep(0);
                }}
                className="p-1 px-2 text-[#00dbe9] hover:text-white bg-[#00dbe9]/10 border border-[#00dbe9]/35 rounded-full transition-all focus:outline-none cursor-pointer flex items-center gap-1 text-[10px] uppercase font-bold font-mono shrink-0 mr-1 shadow-[0_0_8px_rgba(0,219,233,0.1)]"
                title="Start Somnia App Walkthrough"
              >
                <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
                <span>Guide Tour</span>
              </button>

              <button 
                onClick={() => setCurrentTab("profile")}
                className="text-on-surface-variant hover:text-tertiary p-2 rounded-full hover:bg-white/5 transition-all focus:outline-none"
              >
                <User className="w-5 h-5 text-secondary-fixed-dim" />
              </button>
            </div>
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

            {currentTab === "sleep-mic" && (
              <SleepMicView onDreamSubmit={handleDreamSubmit} />
            )}

            {currentTab === "record" && (
              <RecordView onDreamSubmit={handleDreamSubmit} />
            )}

            {currentTab === "editor" && (
              selectedDream || dreams[0] ? (
                <EditorView
                  dream={selectedDream || dreams[0]}
                  onNavigateBack={() => setCurrentTab("feed")}
                  onSaveDream={handleSaveDreamEditor}
                  onTriggerGeminiGenerate={handleEditorGenerateVisual}
                />
              ) : (
                <div className="glass-panel rounded-xl py-16 px-6 text-center space-y-4 max-w-xl mx-auto mt-12">
                  <Moon className="w-12 h-12 text-[#ca9eff] mx-auto animate-pulse" />
                  <h3 className="font-headline-lg-mobile text-xl text-primary tracking-widest font-thin uppercase">No Active Dream Chosen</h3>
                  <p className="font-body-sm text-xs text-on-surface-variant max-w-xs mx-auto">
                    Please log your first dream or choose an existing dream record from the Feed to load it into the Creative Editor Studio!
                  </p>
                  <button
                    onClick={() => setCurrentTab("record")}
                    className="px-6 py-2 rounded-full border border-secondary/30 hover:border-secondary/60 text-secondary text-xs font-semibold bg-secondary/10 transition-colors cursor-pointer"
                  >
                    Log New Dream
                  </button>
                </div>
              )
            )}

            {currentTab === "coach" && (
              <CoachView />
            )}

            {currentTab === "synth" && (
              <SynthesizerView />
            )}

            {currentTab === "profile" && (
              <AnalyticsView dreams={dreams} onNavigateToRecord={() => setCurrentTab("record")} />
            )}
          </main>

          {/* Bottom Shared Floating Action Button for recording (Only inside Feed) */}
          {currentTab === "feed" && (
            <button
              onClick={() => setCurrentTab("sleep-mic")}
              className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-secondary-container to-tertiary-container text-on-primary flex items-center justify-center shadow-[0_0_25px_rgba(207,92,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto border-none focus:outline-none focus:ring-0"
              id="fab-speak-trigger"
              title="Speak Dream Outlines"
            >
              <Mic className="w-6 h-6 animate-pulse" />
            </button>
          )}

          {/* Bottom Nav Bar layout matching mock standard tabs selection */}
          <nav className="fixed bottom-0 w-full z-45 bg-[#1c1e32]/85 backdrop-blur-2xl border-t border-white/5 shadow-[0_-8px_32px_0_rgba(207,92,255,0.12)] flex justify-around items-center px-1 py-3 pb-safe">
            
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
              onClick={() => setCurrentTab("sleep-mic")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-[#00dbe9] group transition-colors focus:outline-none ${
                currentTab === "sleep-mic"
                  ? "text-[#00dbe9] font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <Mic className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Sleep Mic</span>
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
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Journal</span>
            </button>

            <button
              onClick={() => {
                if (!selectedDream && dreams.length > 0) {
                  setSelectedDream(dreams[0]);
                }
                setCurrentTab("editor");
              }}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-secondary group transition-colors focus:outline-none ${
                currentTab === "editor"
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <Edit3 className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Studio</span>
            </button>

            <button
              onClick={() => setCurrentTab("coach")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-secondary group transition-colors focus:outline-none ${
                currentTab === "coach"
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <Brain className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Coach</span>
            </button>

            <button
              onClick={() => setCurrentTab("synth")}
              className={`flex flex-col items-center justify-center py-1 bg-transparent hover:text-secondary group transition-colors focus:outline-none ${
                currentTab === "synth"
                  ? "text-secondary font-bold"
                  : "text-on-surface-variant/50"
              }`}
            >
              <Headphones className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
              <span className="font-label-caps text-[9px] tracking-wider uppercase font-bold">Synth</span>
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
              <span className="font-label-caps text-[9px] tracking-wider uppercase">Analytics</span>
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

      {/* Global Tour Guide Dialogue Overlay */}
      <AnimatePresence>
        {showGlobalTour && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#0e1121] border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(202,158,255,0.15)] space-y-4 focus:outline-none relative"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#00dbe9] font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#00dbe9] animate-pulse" />
                  Somnia Oracle Manual ({currentTourStep + 1}/{globalTourSteps.length})
                </span>
                <button
                  onClick={() => setShowGlobalTour(false)}
                  className="p-1 px-2 text-[10px] text-on-surface-variant hover:text-white rounded bg-white/5 hover:bg-white/10 transition-all uppercase tracking-wider font-mono cursor-pointer"
                  title="Close Walkthrough"
                >
                  ✕ Skip
                </button>
              </div>

              <div className="space-y-2 text-left">
                <h3 className="font-display-lg text-lg text-[#ca9eff] font-bold tracking-wide">
                  {globalTourSteps[currentTourStep].title}
                </h3>
                <p className="font-body-sm text-sm text-on-surface-variant/90 leading-relaxed">
                  {globalTourSteps[currentTourStep].text}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <button
                  disabled={currentTourStep === 0}
                  onClick={() => setCurrentTourStep(prev => prev - 1)}
                  className="px-4 py-1.5 text-xs text-on-surface-variant hover:text-white bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed rounded-full transition-all uppercase font-semibold border-none cursor-pointer"
                >
                  ← Back
                </button>
                
                <div className="flex gap-1">
                  {globalTourSteps.map((_, idx) => (
                    <div
                      key={`global-dot-${idx}`}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentTourStep ? "bg-[#00dbe9] scale-125" : "bg-white/15"
                      }`}
                    />
                  ))}
                </div>

                {currentTourStep < globalTourSteps.length - 1 ? (
                  <button
                    onClick={() => setCurrentTourStep(prev => prev + 1)}
                    className="px-4 py-1.5 text-xs bg-gradient-to-r from-[#9efffc] to-[#ca9eff] text-[#0b0d1f] hover:brightness-110 rounded-full font-bold transition-all uppercase border-none cursor-pointer"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowGlobalTour(false);
                      setCurrentTourStep(0);
                    }}
                    className="px-4 py-1.5 text-xs bg-[#ca9eff]/20 hover:bg-[#ca9eff]/30 border border-[#ca9eff]/40 text-[#ca9eff] font-bold rounded-full transition-all uppercase cursor-pointer"
                  >
                    Finish Guide
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
