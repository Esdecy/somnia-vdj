/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PenTool, Sparkles, Send, Keyboard, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RecordViewProps {
  onDreamSubmit: (
    text: string,
    tags: {
      emotion: string;
      location: string;
      characters: string;
      date: string;
      renderMode: "video" | "still";
      style: string;
    }
  ) => void;
}

export default function RecordView({ onDreamSubmit }: RecordViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [manualText, setManualText] = useState("");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  
  // Custom states matching the journal parameters
  const [emotion, setEmotion] = useState("Awe");
  const [location, setLocation] = useState("Unknown Realm");
  const [characters, setCharacters] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [renderMode, setRenderMode] = useState<"video" | "still">("video");
  const [style, setStyle] = useState("Synthwave");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // MOCK speech recognition phrases that toggle to add flavor when dictating is checked
  const sleepPhrases = [
    "I was flying over an endless neon city...",
    "There was a glowing red staircase that descended towards the bottomless ocean of glass...",
    "Massive translucent bioluminescent jellies started drifting between the skyscrapers...",
  ];

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleStartStopMic = () => {
    if (isRecording) {
      // Stopped: inject matching dream speech phrase
      setIsRecording(false);
      const randomPhrase = sleepPhrases[Math.floor(Math.random() * sleepPhrases.length)];
      setManualText((prev) => (prev ? prev + " " + randomPhrase : randomPhrase));
      setInputMode("text"); // slide open text to let them refine
    } else {
      setIsRecording(true);
    }
  };

  const submitDreamEntry = () => {
    if (!manualText.trim()) return;
    onDreamSubmit(manualText, {
      emotion,
      location: location || "Unknown Realm",
      characters: characters || "Unfamiliar guides",
      date,
      renderMode,
      style,
    });
  };

  const presetLocations = ["Unknown Realm", "Childhood Home", "Submerged Cathedral", "Infinite Spire", "Prismatic Ocean"];
  const presetEmotions = ["Awe", "Introspection", "Dread", "Peace", "Levity"];

  return (
    <div className="flex-1 flex flex-col items-center justify-center z-10 px-4 max-w-2xl mx-auto w-full relative pb-20 select-none">
      
      {/* Top Slider switcher mode */}
      <div className="flex items-center gap-1.5 p-1 glass-panel rounded-full relative z-20 mb-8 border border-white/5 shadow-lg">
        <button
          onClick={() => setInputMode("voice")}
          className={`px-4 py-2 rounded-full font-label-caps text-[10px] tracking-wider transition-all ${
            inputMode === "voice"
              ? "bg-secondary-container text-on-primary shadow-sm"
              : "text-on-surface-variant/75 hover:text-white"
          }`}
        >
          Sleepy Voice
        </button>
        <button
          onClick={() => setInputMode("text")}
          className={`px-4 py-2 rounded-full font-label-caps text-[10px] tracking-wider transition-all ${
            inputMode === "text"
              ? "bg-secondary-container text-on-primary shadow-sm"
              : "text-on-surface-variant/75 hover:text-white"
          }`}
        >
          Journal Text
        </button>
      </div>

      <AnimatePresence mode="wait">
        {inputMode === "voice" ? (
          <motion.div
            key="voice-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col items-center justify-center w-full py-6 relative"
          >
            {/* Subtle state tracker */}
            <div className="flex flex-col items-center gap-2 mb-8">
              <span className="font-label-caps text-xs text-secondary tracking-widest uppercase transition-all duration-300">
                {isRecording ? "LISTENING TO TRANSCRIBE..." : "Awaiting Input"}
              </span>
              <span className="font-title-md text-2xl text-on-surface-variant font-mono">
                {formatTimer(timer)}
              </span>
            </div>

            {/* Pulsating Interaction Circle Button */}
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Radial animations */}
              <AnimatePresence>
                {isRecording && (
                  <>
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0.3 }}
                      animate={{ scale: 1.8, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 rounded-full bg-secondary opacity-20 pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.4 }}
                      animate={{ scale: 1.4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                      className="absolute inset-6 rounded-full bg-tertiary-fixed-dim/20 pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>
              <div className="absolute inset-8 rounded-full bg-secondary-container/20 opacity-30 animate-pulse pointer-events-none" />
              <div className="absolute inset-12 rounded-full bg-tertiary-fixed-dim/10 blur-xl pointer-events-none" />

              {/* Central Mic Interactive core */}
              <button
                onClick={handleStartStopMic}
                className={`relative z-20 w-48 h-48 rounded-full bg-surface-container/60 backdrop-blur-md border shadow-[0_0_40px_rgba(207,92,255,0.2),inset_0_2px_10px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center group active:scale-95 transition-all duration-500 hover:shadow-[0_0_60px_rgba(207,92,255,0.45)] hover:bg-surface-container/85 hover:border-secondary/60 ${
                  isRecording ? "border-[#00dbe9] shadow-[0_0_40px_rgba(0,183,233,0.3)]" : "border-secondary/30"
                }`}
                id="mic-pulse-btn"
              >
                {isRecording ? (
                  <MicOff className="w-14 h-14 text-tertiary mb-3 animate-[pulse_1.5s_infinite] drop-shadow-[0_0_15px_rgba(0,219,233,0.8)]" />
                ) : (
                  <Mic className="w-14 h-14 text-secondary mb-3 group-hover:text-tertiary transition-colors drop-shadow-[0_0_15px_rgba(236,178,255,0.8)]" />
                )}
                <span className="font-title-md text-sm text-on-surface tracking-wider drop-shadow-md uppercase font-semibold">
                  {isRecording ? "TAP TO FINISH" : "TAP TO RECORD"}
                </span>
                <span className="text-[10px] text-on-surface-variant/70 font-mono mt-1 lowercase">
                  dictating sleepily
                </span>
              </button>
            </div>

            {/* Live sound bar animations */}
            <div className="flex items-end justify-center gap-1.5 h-16 w-full max-w-[200px] mt-8 opacity-80 mix-blend-screen">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={`wave-${i}`}
                  className="w-1 rounded-full bg-tertiary transition-all duration-300 shadow-[0_0_8px_#00dbe9]"
                  style={{
                    height: isRecording ? `${Math.max(15, Math.floor(Math.random() * 95))}%` : "12%",
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: isRecording ? "0.8s" : "0s",
                  }}
                />
              ))}
            </div>

            <p className="font-body-sm text-center text-xs text-on-surface-variant/70 mt-6 max-w-xs leading-relaxed italic">
              *Tapping speaks standard dream outlines. Voice coordinates dictation transcripts directly inside your bed.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="text-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full flex flex-col gap-5 pt-2"
          >
            {/* Main Dream Writer Pad */}
            <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-xl flex flex-col gap-4 text-left">
              <label className="font-label-caps text-xs text-secondary tracking-widest flex items-center gap-2">
                <PenTool className="w-4 h-4" /> JOURNAL TRANSCRIPT
              </label>
              
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Close your eyes... What did you see? Describe the colors, characters, symbols, and atmosphere that drifted in the depths..."
                className="w-full bg-black/20 border border-white/10 rounded-lg p-4 font-body-sm text-on-surface text-sm focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/50 outline-none resize-none h-44"
                id="manual-dream-textarea"
              />

              {/* Grid selectors for tagging details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Emotion picker */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Emotion Accent</span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetEmotions.map((emo) => (
                      <button
                        key={emo}
                        onClick={() => setEmotion(emo)}
                        className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                          emotion === emo
                            ? "bg-secondary/15 border-secondary text-secondary font-semibold"
                            : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location context setting */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Spatial Location</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="E.g. Sapphire City"
                    className="w-full bg-black/20 border border-white/10 rounded-full px-4 py-1.5 text-xs text-on-surface focus:border-tertiary outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1 shrink-0">
                    {presetLocations.slice(0, 3).map((loc) => (
                      <button
                        key={loc}
                        onClick={() => setLocation(loc)}
                        className="text-[9px] bg-white/5 border border-white/5 hover:text-white transition-colors text-on-surface-variant px-2 py-0.5 rounded-full"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shadow Entities Characters Input */}
              <div className="flex flex-col gap-1.5 mt-2 text-left">
                <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Entities / Shadows present</span>
                <input
                  type="text"
                  value={characters}
                  onChange={(e) => setCharacters(e.target.value)}
                  placeholder="Characters (e.g. Talking mirror reflection, hooded figures)"
                  className="w-full bg-black/20 border border-white/10 rounded-full px-4 py-2.5 text-xs text-on-surface focus:border-tertiary outline-none"
                />
              </div>

              {/* Upload Old Dreams Date Picker & Render Format Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                
                {/* Historical Date Backing (Upload Old Dreams) */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Reverie Date (Upload Old Dreams)</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full bg-black/25 border border-white/15 rounded-xl px-4 py-2 text-xs text-[#00dbe9] focus:border-tertiary outline-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/60">
                    Choose any past date to record and backdate an old dream.
                  </p>
                </div>

                {/* Synthesis Format Toggle: Video Loop vs Still Frame */}
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Synthesis Mode</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRenderMode("video")}
                      className={`py-2 px-3 rounded-xl text-center text-[10px] font-semibold tracking-wide border transition-all ${
                        renderMode === "video"
                          ? "bg-secondary/15 border-secondary text-secondary font-bold shadow-[0_0_10px_rgba(236,178,255,0.15)]"
                          : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      Video Loop
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenderMode("still")}
                      className={`py-2 px-3 rounded-xl text-center text-[10px] font-semibold tracking-wide border transition-all ${
                        renderMode === "still"
                          ? "bg-tertiary/15 border-tertiary text-tertiary font-bold shadow-[0_0_10px_rgba(0,219,233,0.15)]"
                          : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      Still Frame
                    </button>
                  </div>
                  <p className="text-[10px] text-on-surface-variant/60">
                    {renderMode === "video" ? "Generates 3-4s motion dream sequence." : "Generates a budget-friendly high-res still image."}
                  </p>
                </div>

              </div>

              {/* Extended Cinematic Style Preset Selector */}
              <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4 text-left">
                <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant">Cinematic Dream Art Style (Not all Cartoonish)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
                  {[
                    { id: "Synthwave", label: "Synthwave" },
                    { id: "Ghibli", label: "Anime/Ghibli" },
                    { id: "Noir", label: "Noir (Mono)" },
                    { id: "Hyper-real", label: "Hyper-real" },
                    { id: "Oil Painting", label: "Oil Painting" },
                    { id: "Cinematic", label: "3D Cinematic" },
                    { id: "Surrealism", label: "Surreal Collage" },
                    { id: "Cyberpunk", label: "Cyberpunk" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setStyle(preset.id)}
                      className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-semibold border transition-all ${
                        style === preset.id
                          ? "bg-secondary/15 border-secondary text-secondary font-bold"
                          : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Synthesize Submit Trigger */}
              <button
                onClick={submitDreamEntry}
                disabled={!manualText.trim()}
                className={`w-full py-3.5 mt-4 rounded-full font-label-caps text-xs tracking-wider font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
                  manualText.trim()
                    ? "bg-gradient-to-r from-secondary-container to-tertiary text-on-primary hover:opacity-90 active:scale-[0.99] cursor-pointer"
                    : "bg-surface-container-high border border-white/5 text-on-surface-variant/40 cursor-not-allowed"
                }`}
                id="synthesize-dreamscape-btn"
              >
                <Sparkles className="w-4 h-4 animate-pulse fill-current" />
                SYNTHESIZE SUBCONSCIOUS DREAMSCAPE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
