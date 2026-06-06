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
      lifeEpoch?: string;
      sleepEnvironment?: string;
    },
    voiceUrl?: string
  ) => void;
}

export default function RecordView({ onDreamSubmit }: RecordViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [manualText, setManualText] = useState("");
  
  // Custom states matching the journal parameters
  const [emotion, setEmotion] = useState("Awe");
  const [location, setLocation] = useState("Unknown Realm");
  const [characters, setCharacters] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [renderMode, setRenderMode] = useState<"video" | "still" | "video">("video");
  const [style, setStyle] = useState("Synthwave");
  const [lifeEpoch, setLifeEpoch] = useState("Ordinary Life");
  const [sleepEnvironment, setSleepEnvironment] = useState("Home Bed");

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const voicePlayerRef = useRef<HTMLAudioElement | null>(null);

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

  const handleStartStopMic = async () => {
    if (isRecording) {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      const randomPhrase = sleepPhrases[Math.floor(Math.random() * sleepPhrases.length)];
      setManualText((prev) => (prev ? prev + " " + randomPhrase : randomPhrase));
    } else {
      setIsRecording(true);
      setAudioUrl(null);
      setIsPlayingVoice(false);
      
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          const chunks: Blob[] = [];
          
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
              const base64data = reader.result as string;
              setAudioUrl(base64data);
            };
            // Automatically stop tracks so user's microphone turns off
            stream.getTracks().forEach(track => track.stop());
          };
          
          recorder.start();
          setMediaRecorder(recorder);
        } else {
          console.warn("Media devices or getUserMedia not supported in this frame.");
        }
      } catch (err) {
        console.warn("Microphone access declined or unavailable in sandbox frame. Running audio simulation.", err);
      }
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
      lifeEpoch,
      sleepEnvironment,
    }, audioUrl || undefined);
  };

  const handleToggleVoicePlayback = () => {
    if (!audioUrl) return;
    if (voicePlayerRef.current) {
      voicePlayerRef.current.pause();
    }
    
    if (isPlayingVoice) {
      setIsPlayingVoice(false);
    } else {
      const audio = new Audio(audioUrl);
      voicePlayerRef.current = audio;
      audio.onended = () => {
        setIsPlayingVoice(false);
      };
      audio.play().catch(e => console.warn(e));
      setIsPlayingVoice(true);
    }
  };

  const handleDeleteVoice = () => {
    if (voicePlayerRef.current) {
      voicePlayerRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlayingVoice(false);
    voicePlayerRef.current = null;
  };

  const presetLocations = ["Unknown Realm", "Childhood Home", "Submerged Cathedral", "Infinite Spire", "Prismatic Ocean"];
  const presetEmotions = ["Awe", "Introspection", "Dread", "Peace", "Levity"];

  return (
    <div className="flex-1 flex flex-col items-center justify-start z-10 px-4 max-w-2xl mx-auto w-full relative pb-24 pt-4 select-none">
      
      {/* Title Header */}
      <div className="text-left w-full mb-4">
        <h2 className="text-xl font-bold tracking-widest text-[#00dbe9] font-label-caps uppercase flex items-center gap-2">
          <PenTool className="w-5 h-5 text-secondary" />
          Subconscious Dream Journal
        </h2>
        <p className="text-xs text-on-surface-variant/80 mt-1">
          Type down your exact dream indicators or use the sleep voice dictation tool below to translate spoken memories in real-time.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        
        {/* Majestic Centered Luminous Voice Recorder Portal */}
        <div className="glass-panel p-6 rounded-2xl border border-secondary/20 bg-gradient-to-b from-[#1c1e32]/60 to-[#0b0d1f]/30 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
          {/* Neon mesh backing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ca9eff]/5 rounded-full blur-[60px] pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          
          <div className="flex flex-col items-center space-y-4 w-full relative z-10">
            <span className="font-mono text-[9px] text-[#ca9eff] tracking-widest block uppercase font-bold flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {isRecording ? "VOICE RECOVERY LOOP ENGAGED" : "PORTAL AUDIO DICTATOR"}
            </span>

            {/* Huge Pulsating Circular Recording Orb */}
            <div className="relative flex items-center justify-center py-4">
              {/* Outer wave rings */}
              {isRecording && (
                <>
                  <div className="absolute w-44 h-44 rounded-full border border-red-500/20 animate-ping" />
                  <div className="absolute w-40 h-40 rounded-full border border-secondary/30 animate-[pulse_2s_infinite]" />
                </>
              )}
              
              <button
                type="button"
                onClick={handleStartStopMic}
                className={`relative w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 border focus:outline-none cursor-pointer ${
                  isRecording
                    ? "bg-gradient-to-tr from-red-500/25 to-[#ca9eff]/25 border-red-500 shadow-[0_0_35px_rgba(239,68,68,0.4)] scale-102"
                    : "bg-surface-container/30 border-white/10 text-[#ca9eff] hover:border-[#ca9eff]/50 hover:text-white shadow-[0_0_25px_rgba(202,158,255,0.15)] hover:scale-105"
                }`}
                id="main-pulsing-record-orb"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-8 h-8 text-red-400 animate-pulse" />
                    <span className="font-mono text-sm font-black text-red-300 mt-2 tracking-wider">
                      {formatTimer(timer)}
                    </span>
                    <span className="text-[7px] font-mono tracking-widest text-red-400 font-bold uppercase mt-1">
                      STOP DICTATION
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-[#ca9eff] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                    <span className="font-label-caps text-[9px] tracking-widest text-[#ca9eff]/85 mt-2 font-bold uppercase">
                      TAP PORTAL
                    </span>
                    <span className="text-[7px] font-mono text-on-surface-variant/70 font-bold uppercase mt-1">
                      DICTATE REM
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Status / Transcribing Feedback Subpanel */}
            <div className="w-full max-w-md bg-black/30 border border-white/5 rounded-xl p-3 min-h-[44px] flex items-center justify-center text-xs">
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="transcribe-active"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-300 font-mono text-[10px] uppercase flex items-center gap-2 tracking-widest font-semibold"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    DICTATING SOUNDS IN REAL TIME... DESCRIBE THE ENTIRE MINDSCAPE
                  </motion.div>
                ) : audioUrl ? (
                  <motion.div
                    key="transcribe-ready"
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 w-full justify-between"
                  >
                    <span className="font-mono text-[9px] text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                      ✓ REM WAVE RECORDED SUCCESS
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleToggleVoicePlayback}
                        className="py-1 px-3 bg-[#ca9eff]/10 hover:bg-[#ca9eff]/20 text-[#ca9eff] rounded-lg text-[9px] font-bold transition-all cursor-pointer font-mono"
                      >
                        {isPlayingVoice ? "PAUSE PREVIEW" : "TEST PLAY REM"}
                      </button>
                      <button
                        onClick={handleDeleteVoice}
                        className="py-1 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[9px] font-bold transition-all cursor-pointer font-mono"
                      >
                        DISCARD AUDIO
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    key="transcribe-idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-on-surface-variant/75 font-mono text-[10px] leading-tight uppercase tracking-wider"
                  >
                    Tap the glowing portal above to capture verbal memories. Sound patterns will automatically stream directly into the journal pad.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            
            {/* Pulsing micro audio waves inside recording mode */}
            {isRecording && (
              <div className="flex items-end gap-1 h-4 opacity-80 select-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={`r-wave-${i}`}
                    className="w-[1.5px] rounded-full bg-[#00dbe9]"
                    style={{
                      height: `${Math.random() * 100}%`,
                      animation: "pulse 0.4s infinite ease-in-out alternate",
                      animationDelay: `${i * 0.04}s`
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Dream Writer Pad (Always Prominent!) */}
        <div className="glass-panel p-5 rounded-xl border border-white/5 shadow-xl flex flex-col gap-4 text-left">
          <div className="flex justify-between items-center">
            <label className="font-label-caps text-xs text-secondary tracking-widest flex items-center gap-2">
              <PenTool className="w-4 h-4" /> JOURNAL TRANSCRIPT WINDOW
            </label>
            {audioUrl && (
              <span className="text-[9px] font-mono tracking-widest text-[#00dbe9] bg-[#00dbe9]/10 border border-[#00dbe9]/20 rounded px-2 py-0.5">
                ● VOICE ATTACHED SUCCESSFULLY
              </span>
            )}
          </div>
          
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="Close your eyes... What did you see? Describe the colors, characters, symbols, and atmosphere that drifted in the depths..."
            className="w-full bg-black/20 border border-white/10 rounded-lg p-4 font-body-sm text-on-surface text-sm focus:border-tertiary/50 focus:ring-1 focus:ring-tertiary/50 outline-none resize-none h-40 leading-relaxed"
            id="manual-dream-textarea"
          />

          {/* Grid selectors for tagging details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emotion picker */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant font-semibold">Emotion Accent</span>
              <div className="flex flex-wrap gap-1.5">
                {presetEmotions.map((emo) => (
                  <button
                    key={emo}
                    onClick={() => setEmotion(emo)}
                    type="button"
                    className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                      emotion === emo
                        ? "bg-secondary/15 border-secondary text-secondary font-bold"
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
              <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant font-semibold">Spatial Location</span>
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
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[9px] bg-white/5 border border-white/5 hover:text-white transition-colors text-on-surface-variant px-2 py-0.5 rounded-full cursor-pointer"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shadow Entities Characters Input */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant font-semibold">Entities / Shadows present</span>
            <input
              type="text"
              value={characters}
              onChange={(e) => setCharacters(e.target.value)}
              placeholder="Characters (e.g. Talking mirror reflection, hooded figures)"
              className="w-full bg-black/20 border border-white/10 rounded-full px-4 py-2.5 text-xs text-on-surface focus:border-tertiary outline-none"
            />
          </div>

          {/* Life Milestone Context & Sleep Bed Environment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-1">
            {/* Life milestone state */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="font-label-caps text-[10px] tracking-wide text-[#ca9eff] font-semibold">Active Life Epoch / Milestone</span>
              <select
                value={lifeEpoch}
                onChange={(e) => setLifeEpoch(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:border-secondary outline-none cursor-pointer"
              >
                <option value="Ordinary Life">Ordinary/Routine Life</option>
                <option value="New Beginnings">🌱 New Job / Fresh Creative Beginning</option>
                <option value="Spiritual Awakening">🌌 Spiritual Awakening & Mindfulness Drive</option>
                <option value="Personal Triumph">🏆 Overcoming Obstacles & Self-Mastery</option>
                <option value="Creative Inspiration">🎨 High Creative Flow & Artistic Sprint</option>
                <option value="Healthy Lifestyle">🧘 Deep Reset & Healthy Rejuvenation</option>
                <option value="Career Transition">💼 Career Transition / New Direction</option>
                <option value="Relationship Shift">💖 Relationship Spark or Connection Shift</option>
                <option value="Festive Preparation">🎉 Milestone Celebration & Festive Prep</option>
                <option value="Travel / Wandering">✈️ World Travel & Wandering Adventure</option>
              </select>
              <p className="text-[9px] text-on-surface-variant/70 leading-normal">
                Maps recurring thematic structures to real-world life periods.
              </p>
            </div>

            {/* Sleep Environment setting */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="font-label-caps text-[10px] tracking-wide text-[#00dbe9] font-semibold">Sleep Bed Context</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "Home Bed", label: "Home Bed" },
                  { id: "Nap Context", label: "Quick Nap" },
                  { id: "Traveling/Hotel", label: "Travel/Hotel" },
                  { id: "Friend's Bed", label: "Other/Friend" }
                ].map((env) => (
                  <button
                    key={env.id}
                    type="button"
                    onClick={() => setSleepEnvironment(env.id)}
                    className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-semibold tracking-wide border transition-all cursor-pointer ${
                      sleepEnvironment === env.id
                        ? "bg-[#00dbe9]/15 border-[#00dbe9] text-[#00dbe9] font-bold"
                        : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
                    }`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-on-surface-variant/70 leading-normal">
                Recall and REM quality is affected by bed environment familiarity.
              </p>
            </div>
          </div>

          {/* Upload Old Dreams Date Picker & Render Format Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-1">
            
            {/* Historical Date Backing */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant font-semibold">Reverie Date (Backdate Dream)</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full bg-black/25 border border-white/15 rounded-xl px-4 py-2 text-xs text-[#00dbe9] focus:border-tertiary outline-none"
              />
              <p className="text-[10px] text-on-surface-variant/60">
                Log a dream from a past date to preserve your chronological timeline.
              </p>
            </div>

            {/* Synthesis Format Toggle: Video Loop vs Still Frame */}
            <div className="flex flex-col gap-1.5 text-left">
              <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant font-semibold">Synthesis Mode</span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setRenderMode("video")}
                  className={`py-2 px-3 rounded-xl text-center text-[10px] font-semibold tracking-wide border transition-all cursor-pointer ${
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
                  className={`py-2 px-3 rounded-xl text-center text-[10px] font-semibold tracking-wide border transition-all cursor-pointer ${
                    renderMode === "still"
                      ? "bg-tertiary/15 border-tertiary text-tertiary font-bold shadow-[0_0_10px_rgba(0,219,233,0.15)]"
                      : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
                  }`}
                >
                  Still Frame
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/60">
                {renderMode === "video" ? "Generates 3-4s cinematic looping sequence." : "Generates a budget-friendly high-res dream art frame."}
              </p>
            </div>

          </div>

          {/* Extended Cinematic Style Preset Selector */}
          <div className="flex flex-col gap-1.5 border-t border-white/5 pt-4 text-left">
            <span className="font-label-caps text-[10px] tracking-wide text-on-surface-variant font-semibold">Cinematic Dream Art Style</span>
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
                  className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-semibold border transition-all cursor-pointer ${
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
            className={`w-full py-3.5 mt-2 rounded-full font-label-caps text-xs tracking-wider font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
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

      </div>
    </div>
  );
}
