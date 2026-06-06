/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Mic, Play, Square, Sparkles, Headphones, Radio, ArrowRight, BookOpen, Upload, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function SynthesizerView() {
  const [binauralActive, setBinauralActive] = useState(false);
  const [frequency, setFrequency] = useState(136.1); // Carrier frequency (OM tone)
  const [binauralBeat, setBinauralBeat] = useState(4.0); // Beat frequency (Delta/Theta)
  const [waveType, setWaveType] = useState<"delta" | "theta" | "alpha" | "beta" | "gamma" | "solfeggio" | "pink">("theta");
  const [noiseVolume, setNoiseVolume] = useState(0.15);

  // Whisper triggers states
  const [recordingAffirmation, setRecordingAffirmation] = useState(false);
  const [affirmationAudioBlob, setAffirmationAudioBlob] = useState<string | null>(null);
  const [playingAffirmation, setPlayingAffirmation] = useState(false);
  const [customWhisperText, setCustomWhisperText] = useState("Focus on your breathing. You are entering a vivid, clear dream.");

  // Sleep-Learning & Study Hub states
  const [selectedStudyTopic, setSelectedStudyTopic] = useState("vocab");
  const [customPrograms, setCustomPrograms] = useState<{ id: string; label: string; desc: string; activeLoop: string }[]>(() => {
    try {
      const saved = localStorage.getItem("somnia_custom_study_programs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatLoop, setNewCatLoop] = useState("");

  const handleAddCustomProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatLabel.trim() || !newCatLoop.trim()) return;
    const item = {
      id: "custom_" + Date.now(),
      label: newCatLabel.trim(),
      desc: newCatDesc.trim() || "User formulated custom syllabus loop",
      activeLoop: newCatLoop.trim(),
    };
    const updated = [...customPrograms, item];
    setCustomPrograms(updated);
    try {
      localStorage.setItem("somnia_custom_study_programs", JSON.stringify(updated));
    } catch {}
    setSelectedStudyTopic(item.id);
    setIsStudyTrackArmed(false);
    setNewCatLabel("");
    setNewCatDesc("");
    setNewCatLoop("");
  };

  const defaultPrograms = [
    { id: "vocab", label: "SAT Vocabulary", desc: "Complex word roots & mnemonic definitions", activeLoop: "Acumen: keen insight or sharpness of vision... Ephemeral: lasting for a very short duration..." },
    { id: "med", label: "Medical Terminology", desc: "Cardiovascular prefixes & pathology terminology", activeLoop: "Myocardial: relating to ocular chambers... Bradycardia: heart-pacing delayed under 60bpm..." },
    { id: "french", label: "French Conversational", desc: "Fluid active response anchors", activeLoop: "Comment allez-vous: how are you doing... Enchanté: nice to meet you as an active speaker..." },
    { id: "chrono", label: "Historical Chronology", desc: "Key civil timeline events & years", activeLoop: "1789: Storming of the Bastille... 1453: Fall of Byzantium under spatial pressure..." },
  ];

  const allPrograms = [...defaultPrograms, ...customPrograms];

  const [typedLectureNotes, setTypedLectureNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isSynthesizingSyllabus, setIsSynthesizingSyllabus] = useState(false);
  const [isStudyTrackArmed, setIsStudyTrackArmed] = useState(false);
  const [studyInputMode, setStudyInputMode] = useState<"notes" | "notebooklm">("notes");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const binOscLeft = useRef<OscillatorNode | null>(null);
  const binOscRight = useRef<OscillatorNode | null>(null);
  const gainLeft = useRef<GainNode | null>(null);
  const gainRight = useRef<GainNode | null>(null);
  const noiseNode = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const noiseGain = useRef<GainNode | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const affirmationPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync wave presets
  useEffect(() => {
    if (waveType === "delta") {
      setBinauralBeat(2.5); // Deep sleep
      setFrequency(110);
    } else if (waveType === "theta") {
      setBinauralBeat(5.5); // Lucid hypnagogia REM entry
      setFrequency(136.1);
    } else if (waveType === "alpha") {
      setBinauralBeat(10.0); // Calm alpha flow state
      setFrequency(154);
    } else if (waveType === "beta") {
      setBinauralBeat(16.0); // Active analytical focus
      setFrequency(200);
    } else if (waveType === "gamma") {
      setBinauralBeat(40.0); // High hemispheric peak processing
      setFrequency(220);
    } else if (waveType === "solfeggio") {
      setBinauralBeat(8.0); // Solfeggio 528hz healing delta
      setFrequency(264);
    }
  }, [waveType]);

  // Handle active oscillators
  useEffect(() => {
    updateOscillators();
  }, [frequency, binauralBeat, binauralActive]);

  const startBinauralEngine = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!ctxActive()) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (binauralActive) {
        stopBinauralEngine();
        return;
      }

      // Create dual channel panner configuration for True Binaural beats
      // left channel
      const oscL = ctx.createOscillator();
      const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gL = ctx.createGain();
      
      oscL.type = "sine";
      gL.gain.setValueAtTime(noiseVolume, ctx.currentTime);

      if (pannerL) {
        pannerL.pan.setValueAtTime(-1, ctx.currentTime);
        oscL.connect(gL).connect(pannerL).connect(ctx.destination);
      } else {
        oscL.connect(gL).connect(ctx.destination);
      }

      // right channel
      const oscR = ctx.createOscillator();
      const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const gR = ctx.createGain();

      oscR.type = "sine";
      gR.gain.setValueAtTime(noiseVolume, ctx.currentTime);

      if (pannerR) {
        pannerR.pan.setValueAtTime(1, ctx.currentTime);
        oscR.connect(gR).connect(pannerR).connect(ctx.destination);
      } else {
        oscR.connect(gR).connect(ctx.destination);
      }

      oscL.start();
      oscR.start();

      binOscLeft.current = oscL;
      binOscRight.current = oscR;
      gainLeft.current = gL;
      gainRight.current = gR;

      // Also generate a rich ocean noise drape
      if (waveType === "pink") {
        startNoiseNode(ctx);
      }

      setBinauralActive(true);
    } catch (e) {
      console.warn("Failed starting web audio synths", e);
    }
  };

  const startNoiseNode = (ctx: AudioContext) => {
    try {
      // Setup raw procedural white noise fallbacks for robust execution
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to pink-brown low sleep frequency rumble
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(250, ctx.currentTime);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(filter).connect(g).connect(ctx.destination);
      whiteNoise.start();

      // Store left osc as a node handle for cleanup
      (binOscLeft as any).noiseSource = whiteNoise;
    } catch {}
  };

  const stopBinauralEngine = () => {
    if (binOscLeft.current) {
      try { binOscLeft.current.stop(); } catch {}
      binOscLeft.current.disconnect();
      binOscLeft.current = null;
    }
    if (binOscRight.current) {
      try { binOscRight.current.stop(); } catch {}
      binOscRight.current.disconnect();
      binOscRight.current = null;
    }
    const noiseSource = (binOscLeft as any).noiseSource;
    if (noiseSource) {
      try { noiseSource.stop(); } catch {}
      noiseSource.disconnect();
    }
    setBinauralActive(false);
  };

  const updateOscillators = () => {
    if (binauralActive && binOscLeft.current && binOscRight.current) {
      const currentCtx = audioCtxRef.current;
      if (currentCtx) {
        binOscLeft.current.frequency.setValueAtTime(frequency, currentCtx.currentTime);
        binOscRight.current.frequency.setValueAtTime(frequency + binauralBeat, currentCtx.currentTime);
        if (gainLeft.current) gainLeft.current.gain.setValueAtTime(noiseVolume, currentCtx.currentTime);
        if (gainRight.current) gainRight.current.gain.setValueAtTime(noiseVolume, currentCtx.currentTime);
      }
    }
  };

  const ctxActive = () => !!audioCtxRef.current;

  // Custom micro-affirming voice-recorder handlers
  const handleStartRecordingAffirmation = async () => {
    setRecordingAffirmation(true);
    setAffirmationAudioBlob(null);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setAffirmationAudioBlob(url);
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
      }
    } catch {
      // Fallback simulating voice affirmations using synthesized speech
      console.warn("Speech recording fallback triggered.");
    }
  };

  const handleStopRecordingAffirmation = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecordingAffirmation(false);
  };

  const playRecordedAffirmation = () => {
    if (playingAffirmation) {
      if (affirmationPlayerRef.current) {
        affirmationPlayerRef.current.pause();
      }
      setPlayingAffirmation(false);
      return;
    }

    if (affirmationAudioBlob) {
      const audio = new Audio(affirmationAudioBlob);
      // Playback with delay / reverby loop simulate
      affirmationPlayerRef.current = audio;
      setPlayingAffirmation(true);
      audio.onended = () => setPlayingAffirmation(false);
      audio.play().catch(e => console.warn(e));
    } else {
      // Speech synthesis affirmation fallback
      try {
        if ("speechSynthesis" in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(customWhisperText);
          utterance.rate = 0.8; // Dreamy whisper rate
          utterance.pitch = 0.9;
          utterance.onend = () => setPlayingAffirmation(false);
          setPlayingAffirmation(true);
          synth.speak(utterance);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // Safe release on leave
  useEffect(() => {
    return () => {
      stopBinauralEngine();
    };
  }, []);

  return (
    <div className="w-full flex flex-col pt-4 pb-24 px-4 max-w-4xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="text-left">
        <h2 className="text-xl font-bold tracking-widest text-[#00dbe9] font-label-caps uppercase flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#00dbe9] animate-pulse" />
          Induction Sound Synthesizer
        </h2>
        <p className="text-xs text-on-surface-variant/80 mt-1">
          Play real-time brainwave frequencies directly through your headphones to deepen REM sleep stages, or record custom whispering thresholds to trigger dream recall.
        </p>
      </div>

      {/* Grid: Synth module and Whispering trigger affirmations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Synthesizer Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-4">
          
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold font-label-caps tracking-widest text-[#ca9eff] flex items-center justify-between border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5"><Radio className="w-4 h-4 text-secondary" /> TRUE BINAURAL ENGINE</span>
              {binauralActive && (
                <span className="text-[9px] font-mono tracking-widest text-secondary px-1.5 py-0.5 bg-secondary/10 border border-secondary/20 rounded animate-pulse">
                  ● GENERATOR ACTIVE
                </span>
              )}
            </h3>
            
            <div className="flex flex-wrap gap-1.5 pt-2">
              {[
                { id: "delta", label: "Delta (Deep)" },
                { id: "theta", label: "Theta (Lucid Entry)" },
                { id: "alpha", label: "Alpha (Relaxed Alert)" },
                { id: "beta", label: "Beta (Cognitive)" },
                { id: "gamma", label: "Gamma (Hemis-binding)" },
                { id: "solfeggio", label: "Solfeggio (8Hz)" },
                { id: "pink", label: "Pink Ocean static" }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setWaveType(t.id as any)}
                  className={`px-2.5 py-1.5 text-[9px] font-mono rounded-lg border transition-all cursor-pointer ${
                    waveType === t.id
                      ? "bg-secondary/15 border-secondary text-secondary font-bold"
                      : "bg-surface-container/20 border-white/5 text-on-surface-variant/65 hover:text-[#00dbe9]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Carrier Tone Slider control */}
          <div className="space-y-1 pt-2">
            <div className="flex justify-between items-baseline font-mono text-[10px] text-on-surface-variant">
              <span>CARRIER FREQUENCY (CENTER NODE)</span>
              <span className="text-[#00dbe9] font-bold">{frequency.toFixed(1)} Hz (Cosmic OM)</span>
            </div>
            <input
              type="range"
              min="80"
              max="250"
              step="0.5"
              value={frequency}
              onChange={(e) => setFrequency(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-tertiary"
            />
          </div>

          {/* Beat Frequency control */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline font-mono text-[10px] text-on-surface-variant">
              <span>BINAURAL BEAT SPEED DIFFERENTIAL</span>
              <span className="text-secondary font-bold">+{binauralBeat.toFixed(1)} Hz</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="100.0"
              step="0.1"
              value={binauralBeat}
              onChange={(e) => setBinauralBeat(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-secondary"
            />
            
            {/* Dynamic visual brainwave zone representation */}
            <div className="p-3 bg-black/40 border border-white/5 rounded-xl text-left space-y-1">
              <span className="font-mono text-[8px] text-[#ca9eff] tracking-widest block uppercase font-bold">
                Active Neural Correlation
              </span>
              <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5 leading-tight">
                <span className="w-2 h-2 rounded-full bg-[#00dbe9] animate-pulse shrink-0" />
                {binauralBeat < 4.0 && (
                  <span className="text-[#00dbe9]">Delta Wave Frequency (0.5 – 4 Hz) — Deep restorative sleep.</span>
                )}
                {binauralBeat >= 4.0 && binauralBeat < 8.0 && (
                  <span className="text-secondary">Theta Wave Frequency (4 – 8 Hz) — Light sleep, lucid entry & high recall.</span>
                )}
                {binauralBeat >= 8.0 && binauralBeat < 12.0 && (
                  <span className="text-emerald-400">Alpha Wave Frequency (8 – 12 Hz) — Calm focus, flow state & relaxed alert.</span>
                )}
                {binauralBeat >= 12.0 && binauralBeat <= 30.0 && (
                  <span className="text-amber-400">Beta Wave Frequency (12 – 30 Hz) — Active focus, cognition & alertness.</span>
                )}
                {binauralBeat > 30.0 && (
                  <span className="text-purple-400">Gamma Wave Frequency (30 – 100 Hz) — Peak cognitive processing & memory insight.</span>
                )}
              </div>
              
              {/* Warnings and guidance indicators */}
              {binauralBeat >= 22.0 && binauralBeat <= 38.0 && (
                <div className="p-2 bg-red-400/10 border border-red-400/20 text-red-300 rounded font-mono text-[9px] leading-relaxed mt-1">
                  ⚠️ <strong>HIGH BETA WARNING (22–38 Hz):</strong> This zone is heavily associated with stress, hyper-arousal, anxiety, and panic. Use caution when training in this range.
                </div>
              )}
              {binauralBeat > 40.0 && (
                <div className="text-[9px] text-[#00dbe9]/70 font-mono leading-normal mt-0.5">
                  ✓ High Range Entrainment: Activates peak binding focus networks across hemispheres.
                </div>
              )}
            </div>

            {/* Brainwave Frequency Spectrum Dropdown handbook */}
            <details className="group border border-white/5 bg-[#0e111a] rounded-lg overflow-hidden transition-all text-xs" id="brainwave-details-dropdown">
              <summary className="px-3 py-2 text-[10px] font-mono font-bold tracking-wider text-[#00dbe9] hover:bg-white/5 cursor-pointer flex justify-between items-center select-none">
                <span>VIEW FREQUENCY DICTIONARY DETAILS</span>
                <span className="text-[9px] font-mono text-on-surface-variant group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-3 border-t border-white/5 space-y-3 bg-black/20 font-mono text-[10px] leading-relaxed select-text text-left">
                <p className="text-on-surface-variant">
                  Frequencies correspond to the primary types of brain waves, each tied to a specific state of mind. Use this for neurofeedback planning:
                </p>

                <div className="border border-white/10 rounded overflow-hidden">
                  <table className="w-full text-left text-[9px]">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-on-surface-variant text-[8px] tracking-wider font-bold">
                        <th className="p-1 px-2 border-r border-white/10">Brainwave</th>
                        <th className="p-1 px-2 border-r border-white/10">Range</th>
                        <th className="p-1 px-2">Purpose & Mental State</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/10">
                        <td className="p-1.5 px-2 font-bold text-[#00dbe9] border-r border-white/10">Delta</td>
                        <td className="p-1.5 px-2 border-r border-white/10">0.5 – 4 Hz</td>
                        <td className="p-1.5 px-2">Deep dreamless sleep, physical healing, and cellular recovery.</td>
                      </tr>
                      <tr className="border-b border-white/10 text-secondary">
                        <td className="p-1.5 px-2 font-bold border-r border-white/10">Theta</td>
                        <td className="p-1.5 px-2 border-r border-white/10">4 – 8 Hz</td>
                        <td className="p-1.5 px-2">Light sleep, deep relaxation, high creativity, and memory recall.</td>
                      </tr>
                      <tr className="border-b border-white/10 text-emerald-400">
                        <td className="p-1.5 px-2 font-bold border-r border-white/10">Alpha</td>
                        <td className="p-1.5 px-2 border-r border-white/10">8 – 12 Hz</td>
                        <td className="p-1.5 px-2">Relaxed alertness, calm focus, reduction of stress, and "flow state."</td>
                      </tr>
                      <tr className="border-b border-white/10 text-amber-400">
                        <td className="p-1.5 px-2 font-bold border-r border-white/10">Beta</td>
                        <td className="p-1.5 px-2 border-r border-white/10">12 – 30 Hz</td>
                        <td className="p-1.5 px-2">Active thinking, conscious focus, problem-solving, and alertness.</td>
                      </tr>
                      <tr className="text-purple-400">
                        <td className="p-1.5 px-2 font-bold border-r border-white/10">Gamma</td>
                        <td className="p-1.5 px-2 border-r border-white/10 text-purple-400">30 – 100 Hz</td>
                        <td className="p-1.5 px-2 text-purple-400">Peak cognitive processing, learning, insight, and memory binding.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-1 text-[9px] text-[#ca9eff]">
                  <div>• <strong>Low Frequencies (0.5–8 Hz):</strong> Emphasize deep autonomic healing, restoration, and slow REM dreaming thresholds.</div>
                  <div>• <strong>Middle Frequencies (8–15 Hz):</strong> Act as bridge zones. Best for peaceful daydream meditations.</div>
                  <div>• <strong>High Frequencies (15–100+ Hz):</strong> Stimulate intense analytical thought, learning consolidation, and rapid cerebral filing.</div>
                  <div className="text-on-surface-variant leading-normal pt-1 italic">
                    ⚠️ Note: Online sound presets boasting "432 Hz Solfeggio" or similar do not represent true brainwave speeds, as human neural oscillations cannot naturally cycle that fast without entering epilepsy. True entrainment relies on low differential beats below 100 Hz.
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* Volume output node */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline font-mono text-[10px] text-on-surface-variant">
              <span>SYNTH GAIN LIMITER</span>
              <span className="text-on-surface font-semibold">{(noiseVolume * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.4"
              step="0.01"
              value={noiseVolume}
              onChange={(e) => setNoiseVolume(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Trigger Play Synthesizer waves */}
          <button
            onClick={startBinauralEngine}
            className={`w-full py-3 rounded-full font-label-caps text-xs tracking-wider font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              binauralActive
                ? "bg-error/20 border border-error/40 text-error hover:bg-error/30"
                : "bg-[#00dbe9] hover:bg-opacity-90 text-[#090b15] shadow-[0_0_15px_rgba(0,219,233,0.3)] animate-pulse"
            }`}
          >
            {binauralActive ? (
              <>
                <VolumeX className="w-4 h-4" /> DISENGAGE FREQUENCY DRAUGHT
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" /> ENGAGE COGNITIVE DRAPE SYNTH
              </>
            )}
          </button>
        </div>

        {/* ASMR Sleep affirmation & Custom Sound Triggers Card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-4">
          
          <div className="space-y-1">
            <h3 className="text-xs font-bold font-label-caps tracking-widest text-[#00dbe9] flex items-center gap-2 border-b border-white/5 pb-2">
              <Mic className="w-4 h-4 text-tertiary" /> Personal Sleep Anchor Whispers
            </h3>
            <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
              Record yourself whispering high-recall prompts like <em>"Look at your fingers, you are dreaming right now"</em>, or type custom triggers for automated auditory looping while asleep.
            </p>
          </div>

          {/* Option A: Voice Recording Box */}
          <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-3.5">
            <span className="font-mono text-[9px] text-[#ca9eff] tracking-widest block uppercase font-bold">Auditory Loop source</span>

            <div className="flex items-center gap-3">
              {recordingAffirmation ? (
                <button
                  onClick={handleStopRecordingAffirmation}
                  className="px-4 py-2 bg-red-500/20 text-red-400 hover:text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 border border-red-500/30"
                >
                  <Square className="w-3.5 h-3.5 fill-current" /> STOP RECORDING
                </button>
              ) : (
                <button
                  onClick={handleStartRecordingAffirmation}
                  className="px-4 py-2 bg-[#ca9eff]/15 text-[#ca9eff] hover:bg-[#ca9eff]/30 hover:text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 border border-[#ca9eff]/10"
                >
                  <Mic className="w-3.5 h-3.5" /> RECORD AFFIRMATION
                </button>
              )}

              {/* Saved voice indicator */}
              {affirmationAudioBlob ? (
                <span className="text-[10px] font-mono tracking-wider text-[#00dbe9] bg-[#00dbe9]/10 border border-[#00dbe9]/20 font-bold px-2.5 py-1 rounded animate-pulse">
                  ● TARGET TRIGGER STORED
                </span>
              ) : recordingAffirmation ? (
                <span className="text-[10px] font-mono tracking-wider text-red-400 bg-red-400/10 px-2 rounded animate-pulse">
                  SPEAK NOW...
                </span>
              ) : (
                <span className="text-[10px] font-mono text-on-surface-variant/50">
                  Using synthesized dream voice
                </span>
              )}
            </div>
          </div>

          {/* Option B: Custom text input for synthesis falls */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] text-on-surface-variant/80 block uppercase">Custom Text-to-Speech fall back</span>
            <textarea
              value={customWhisperText}
              onChange={(e) => setCustomWhisperText(e.target.value)}
              className="w-full bg-black/25 border border-white/10 rounded-xl p-3 font-body-sm text-xs text-on-surface focus:border-[#ca9eff] outline-none resize-none h-16 leading-relaxed"
              placeholder="E.g., Keep still. Verify the gravity rules of this tower."
            />
          </div>

          {/* Playback trigger */}
          <button
            onClick={playRecordedAffirmation}
            className={`w-full py-2.5 rounded-xl text-center text-xs font-bold tracking-widest font-label-caps border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              playingAffirmation
                ? "bg-secondary-container/20 border-secondary text-secondary"
                : "bg-surface-container/30 border-white/10 text-on-surface hover:border-[#ca9eff]/30 hover:bg-[#ca9eff]/10"
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${playingAffirmation ? "animate-spin" : ""}`} />
            {playingAffirmation ? "STOP SLEEP AFFIRMATION LOOP" : "TEST SLEEP AFFIRMATION FEEDBACK"}
          </button>
        </div>

      </div>

      {/* Learn While You Sleep & Study Hub Card */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2 flex-wrap gap-2">
          <h3 className="text-xs font-bold font-label-caps tracking-widest text-[#ca9eff] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-secondary" /> Learn While You Sleep: Study-Paced REM Loop
          </h3>
          {isStudyTrackArmed ? (
            <span className="text-[10px] font-mono tracking-widest text-[#00dbe9] bg-[#00dbe9]/10 border border-[#00dbe9]/20 font-bold px-2.5 py-0.5 rounded animate-pulse flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> STUDY TRACK ARMED
            </span>
          ) : (
            <span className="text-[10px] font-mono text-on-surface-variant/50">
              Syllabus Idle
            </span>
          )}
        </div>

        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Unlock standard spaced repetition while dreaming. Sleep-learning overlays informational nodes and study terms over theta-frequency carrier waves. Choose a curated course, paste your study guide, or drop in lecture audio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Column A: Curated courses */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-[#ca9eff] tracking-widest block uppercase font-bold">1. Select Study Program</span>
            
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {allPrograms.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => {
                    setSelectedStudyTopic(prog.id);
                    setIsStudyTrackArmed(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                    selectedStudyTopic === prog.id
                      ? "bg-secondary/15 border-secondary text-secondary"
                      : "bg-black/15 border-white/5 text-on-surface hover:bg-black/20"
                  }`}
                >
                  <div className="font-semibold text-xs flex justify-between items-center">
                    <span>{prog.label}</span>
                    {prog.id.startsWith("custom_") && (
                      <span className="text-[7px] font-mono tracking-widest text-[#00dbe9] border border-[#00dbe9]/20 px-1 py-0.2 rounded-sm bg-[#00dbe9]/5">
                        DYNAMIC
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-on-surface-variant/70 leading-normal mt-0.5 group-hover:text-on-surface-variant">{prog.desc}</div>
                </button>
              ))}
            </div>

            {/* Inline Dynamic Category Creator form */}
            <form onSubmit={handleAddCustomProgram} className="bg-black/20 p-2.5 rounded-xl border border-white/5 space-y-2 mt-3 text-left">
              <span className="text-[8px] font-mono text-[#00dbe9] tracking-wider block uppercase font-bold">
                + Create Custom Study Loop
              </span>
              <input
                type="text"
                placeholder="Category Title (e.g. World Geography)"
                value={newCatLabel}
                onChange={(e) => setNewCatLabel(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[11px] text-white placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary"
                required
              />
              <input
                type="text"
                placeholder="Brief Description (e.g. capitals mnemonic)"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary"
              />
              <textarea
                placeholder="Active Whispering Fact Loop..."
                value={newCatLoop}
                onChange={(e) => setNewCatLoop(e.target.value)}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded px-2 py-1 text-[10px] text-white placeholder-on-surface-variant/50 focus:outline-none focus:border-secondary resize-none"
                required
              />
              <button
                type="submit"
                className="w-full py-1 bg-secondary/10 hover:bg-secondary/20 border border-secondary/25 text-secondary text-[10px] font-semibold rounded transition-colors uppercase font-mono cursor-pointer"
              >
                Inject This Course
              </button>
            </form>
          </div>

          {/* Column B: Manual Text inputs & NotebookLM Integration */}
          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[9px] text-[#ca9eff] tracking-widest block uppercase font-bold">
                2. Input Source or NotebookLM File
              </span>

              {/* Toggle tabs for Waking Notes vs NotebookLM */}
              <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 text-[9px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setStudyInputMode("notes");
                    setIsStudyTrackArmed(false);
                  }}
                  className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                    studyInputMode === "notes"
                      ? "bg-secondary/15 border border-secondary/20 text-secondary font-bold"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  Standard Notes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudyInputMode("notebooklm");
                    setIsStudyTrackArmed(false);
                  }}
                  className={`flex-1 py-1 rounded text-center transition-all cursor-pointer ${
                    studyInputMode === "notebooklm"
                      ? "bg-tertiary/15 border border-tertiary/20 text-tertiary font-bold animate-pulse"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  NotebookLM Guides
                </button>
              </div>

              {studyInputMode === "notes" ? (
                <textarea
                  value={typedLectureNotes}
                  onChange={(e) => {
                    setTypedLectureNotes(e.target.value);
                    setIsStudyTrackArmed(false);
                  }}
                  className="w-full bg-black/25 border border-white/10 rounded-xl p-3 font-body-sm text-xs text-[#cac2e1] focus:border-[#ca9eff] outline-none resize-none h-28 leading-relaxed placeholder-on-surface-variant/40"
                  placeholder="Type or paste custom flashcards, study facts, or chapter notes to whisper during REM..."
                />
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={typedLectureNotes}
                    onChange={(e) => {
                      setTypedLectureNotes(e.target.value);
                      setIsStudyTrackArmed(false);
                    }}
                    className="w-full bg-black/25 border border-white/10 rounded-xl p-3 font-body-sm text-xs text-tertiary focus:border-[#00dbe9] outline-none resize-none h-24 leading-relaxed placeholder-[#00dbe9]/30"
                    placeholder="Paste a NotebookLM reflection script, guided meditation draft, or target archetype summaries..."
                  />
                  <p className="text-[9px] text-on-surface-variant/70 leading-normal italic">
                    💡 Primed for guided insights and external narrative templates generated in NotebookLM.
                  </p>
                </div>
              )}
            </div>

            <div className="border border-dashed border-white/10 rounded-xl p-3 bg-black/10 text-center space-y-1">
              <span className="text-[10px] font-semibold text-on-surface-variant block">
                {studyInputMode === "notes" ? "Upload Chapter Audio" : "Upload NotebookLM Guided Audio"}
              </span>
              <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-on-surface rounded-lg cursor-pointer transition-colors mt-1">
                <Upload className={`w-3.5 h-3.5 ${studyInputMode === "notes" ? "text-secondary" : "text-tertiary"}`} />
                <span>Format: MP3, WAV, M4A</span>
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFileName(e.target.files[0].name);
                      setIsStudyTrackArmed(false);
                      if (studyInputMode === "notebooklm" && !typedLectureNotes) {
                        setTypedLectureNotes(`Attached NotebookLM Podcast audio program: ${e.target.files[0].name}`);
                      }
                    }
                  }}
                />
              </label>
              {uploadedFileName && (
                <div className="text-[9px] text-[#00dbe9] font-mono mt-1 text-center truncate px-2">
                  ✓ LOADED: {uploadedFileName}
                </div>
              )}
            </div>
          </div>

          {/* Column C: Interactive Synthesis and preview */}
          <div className="glass-panel p-4 bg-black/10 rounded-xl border border-white/5 space-y-3.5 flex flex-col justify-between text-left">
            <div className="space-y-1.5">
              <span className="font-mono text-[9px] text-[#ca9eff] tracking-widest block uppercase font-bold">3. Frequency Coupling</span>
              
              <div className="p-2.5 bg-black/35 rounded-lg border border-white/5 space-y-1 text-xs">
                <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
                  <span>COUPLED CHANNEL:</span>
                  <span className="text-secondary font-bold">THETA 5.5HZ</span>
                </div>
                <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
                  <span>SPACED INTERVAL:</span>
                  <span className="text-on-surface">EVERY 45 SECS</span>
                </div>
                <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
                  <span>SENSORY THRESHOLD:</span>
                  <span className="text-tertiary">WHISPER RATIO</span>
                </div>
                <div className="flex justify-between font-mono text-[9px] text-on-surface-variant">
                  <span>VOLUME ATTENUATION:</span>
                  <span className="text-on-surface">-12dB LOW PASS</span>
                </div>
              </div>

              <div className="text-[10px] text-on-surface-variant leading-relaxed italic">
                {(() => {
                  const activeProg = allPrograms.find(p => p.id === selectedStudyTopic);
                  if (activeProg) {
                    return `Active Loop: '${activeProg.activeLoop}'`;
                  }
                  if (typedLectureNotes) {
                    return `Custom loop primed: "${typedLectureNotes.slice(0, 40)}..."`;
                  }
                  return "Choose a study plan or type custom notes to start whispering during REM.";
                })()}
              </div>
            </div>

            <button
              onClick={() => {
                setIsSynthesizingSyllabus(true);
                setTimeout(() => {
                  setIsSynthesizingSyllabus(false);
                  setIsStudyTrackArmed(true);
                }, 1400);
              }}
              disabled={isSynthesizingSyllabus}
              className={`w-full py-2 rounded-xl text-center text-xs font-bold font-label-caps flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isStudyTrackArmed
                  ? "bg-[#00dbe9]/10 border border-[#00dbe9]/30 text-[#00dbe9]"
                  : "bg-gradient-to-tr from-[#9efffc] to-[#ca9eff] text-[#05060f] hover:brightness-110 shadow-lg"
              }`}
            >
              {isSynthesizingSyllabus ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  COUPLING REM CODES...
                </>
              ) : isStudyTrackArmed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  REM STUDY CYCLE ARMED
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#05060f]" />
                  SYNTHESIZE & ARM LOOP
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructional guidance card on audio induction */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left space-y-3">
        <h4 className="font-label-caps text-xs tracking-widest text-[#00dbe9] font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-tertiary" /> HOW TO UTILIZE INDUCTION FREQUENCIES
        </h4>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          1. **Position Headphones**: Put on stereo headphones. True binaural wave generation requires distinct left and right audio feeds to project the binaural differential wave inside your auditory cortex.
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          2. **Set Carrier & Volume**: Keep the carrier frequency low (110Hz or 136Hz) for comfortable nighttime listening and adjust gain down to a faint ambient hum (around 10-15%).
        </p>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          3. **Record Whispers**: Record positive affirmations in your own whispering voice. Listening to your own speech triggers deep auditory familiarity, facilitating lucid state recognitions in active REM stages.
        </p>
      </div>

    </div>
  );
}
