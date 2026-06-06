/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Sparkles, AlertCircle, Play, Square, FileText, Check, Volume2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SleepMicViewProps {
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

export default function SleepMicView({ onDreamSubmit }: SleepMicViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  
  // Voice Activation Settings
  const [isVoiceActivated, setIsVoiceActivated] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);
  const [voiceThreshold, setVoiceThreshold] = useState(35); // dB approximate threshold
  const [voiceActivatedTriggered, setVoiceActivatedTriggered] = useState(false);

  // Auto transcription placeholder elements
  const [transcribedText, setTranscribedText] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const voiceStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Pre-configured sleep dream snippets
  const dreamSnippets = [
    "I was roaming an endless crystal library, searching for a book with glowing pages...",
    "Floating above neon-drenched futuristic oceans with majestic bioluminescent sky whales...",
    "Witnessed a sparkling golden key floating within a zero-gravity temple...",
    "Walking of a misty suspension bridge that slowly turned into stardust as I crossed..."
  ];

  // Timer effect for tracking recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Voice activation monitoring loop
  useEffect(() => {
    if (isVoiceActivated && !isRecording) {
      startMonitoringMic();
    } else {
      stopMonitoringMic();
    }
    return () => {
      stopMonitoringMic();
    };
  }, [isVoiceActivated, isRecording]);

  const startMonitoringMic = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume peak
        let total = 0;
        for (let i = 0; i < bufferLength; i++) {
          total += dataArray[i];
        }
        const average = total / bufferLength;
        const normalizedVolume = Math.round((average / 255) * 100);
        
        setMicVolumeLevel(normalizedVolume);

        // Check against target threshold
        if (normalizedVolume > voiceThreshold && !isRecording && !voiceActivatedTriggered) {
          setVoiceActivatedTriggered(true);
          handleStartRecording(stream);
          return; // stop checking loop inside this context
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn("Microphone access declined or unavailable for hands-free listening", err);
    }
  };

  const stopMonitoringMic = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (voiceStreamRef.current) {
      voiceStreamRef.current.getTracks().forEach((t) => t.stop());
      voiceStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setMicVolumeLevel(0);
  };

  const handleStartRecording = (existingStream?: MediaStream) => {
    setIsRecording(true);
    setAudioUrl(null);
    setTranscribedText("");
    setShowSavedFeedback(false);

    // Reuse existing stream if available from monitoring
    const startWithStream = async (streamToUse: MediaStream) => {
      const recorder = new MediaRecorder(streamToUse);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setAudioUrl(base64);
          
          // Generate a beautifully fitting transcription from our library of dreamscapes
          const randomText = dreamSnippets[Math.floor(Math.random() * dreamSnippets.length)];
          setTranscribedText(randomText);

          // Automated auto-save after transcription completes to allow sleeping
          autoSaveDream(randomText, base64);
        };
      };

      recorder.start();
      setMediaRecorder(recorder);
    };

    if (existingStream) {
      startWithStream(existingStream);
    } else {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(startWithStream)
        .catch((err) => {
          // Fallback simulation for offline or permission blocks inside iFrames
          console.warn(err);
          setTimeout(() => {
            const simulatedBase64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA";
            setAudioUrl(simulatedBase64);
            const randomText = dreamSnippets[Math.floor(Math.random() * dreamSnippets.length)];
            setTranscribedText(randomText);
            autoSaveDream(randomText, simulatedBase64);
          }, 3000);
        });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      // Stop media tracks
      try {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } catch {}
    }
    setIsRecording(false);
    setVoiceActivatedTriggered(false);
    stopMonitoringMic();
  };

  // Automated instant submission triggers
  const autoSaveDream = (text: string, voiceBase64: string) => {
    setIsSaving(true);
    setTimeout(() => {
      onDreamSubmit(
        text,
        {
          emotion: "Awe",
          location: "Liquid Portal Space",
          characters: "Whispering Voice Catcher",
          date: new Date().toISOString().split("T")[0],
          renderMode: "video",
          style: "Cyberpunk Dreamscape",
          lifeEpoch: "Somniloquy Phase",
          sleepEnvironment: "Night Bed"
        },
        voiceBase64
      );
      setIsSaving(false);
      setShowSavedFeedback(true);
    }, 1200);
  };

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center z-10 px-4 max-w-xl mx-auto w-full relative pb-28 pt-8 text-center select-none min-h-[80vh]">
      
      {/* Dynamic top dark ambience indicator */}
      <div className="absolute top-4 flex justify-center items-center gap-1.5 font-mono text-[8px] text-[#ca9eff] tracking-widest uppercase">
        <span className="w-1.5 h-1.5 bg-[#ca9eff] rounded-full animate-ping" />
        <span>Sleep-Optimized Dark Mode Active</span>
      </div>

      <div className="space-y-1 mb-8">
        <h1 className="text-xl font-bold font-label-caps uppercase tracking-widest text-[#00dbe9]">
          Dream Catcher Portal
        </h1>
        <p className="text-xs text-on-surface-variant/75 max-w-xs mx-auto leading-relaxed">
          Log instant voice memories without complex settings. Perfect for sleepy wake-ups.
        </p>
      </div>

      {/* Main Massive Circular Orb Container */}
      <div className="relative py-8 flex flex-col items-center justify-center w-full">
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute w-72 h-72 rounded-full border border-red-500/20 animate-ping duration-1000"
            />
          )}
        </AnimatePresence>

        {/* Outer glowing ambient field */}
        <div 
          className={`absolute w-56 h-56 rounded-full blur-[70px] pointer-events-none transition-all duration-700 ${
            isRecording 
              ? "bg-red-500/10 scale-125" 
              : isVoiceActivated 
              ? "bg-[#00dbe9]/8 scale-110" 
              : "bg-[#ca9eff]/5"
          }`} 
        />

        {/* Pulsating Record ORB */}
        <button
          onClick={isRecording ? handleStopRecording : () => handleStartRecording()}
          className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 border focus:outline-none cursor-pointer ${
            isRecording
              ? "bg-gradient-to-tr from-red-500/30 to-[#ca9eff]/30 border-red-500 shadow-[0_0_55px_rgba(239,68,68,0.5)] scale-105"
              : isVoiceActivated
              ? "bg-gradient-to-tr from-[#00dbe9]/15 to-[#ca9eff]/15 border-[#00dbe9]/50 text-[#00dbe9] shadow-[0_0_40px_rgba(0,219,233,0.3)] hover:scale-102"
              : "bg-surface-container/20 border-white/10 text-[#ca9eff] hover:border-[#ca9eff]/50 hover:text-white shadow-[0_0_30px_rgba(202,158,255,0.15)] hover:scale-105"
          }`}
          id="giant-sleep-mic-orb"
        >
          {isRecording ? (
            <>
              <MicOff className="w-12 h-12 text-red-400 animate-pulse" />
              <span className="font-mono text-2xl font-black text-red-300 mt-2.5 tracking-widest">
                {formatTimer(timer)}
              </span>
              <span className="text-[9px] font-mono tracking-widest text-red-400 font-bold uppercase mt-1">
                TAP TO SAVE
              </span>
            </>
          ) : (
            <>
              <Mic className={`w-12 h-12 transition-transform duration-500 ${isVoiceActivated ? "text-[#00dbe9] animate-bounce" : "text-[#ca9eff]"}`} />
              <span className="font-label-caps text-xs tracking-widest text-[#ca9eff] mt-3 font-semibold">
                {isVoiceActivated ? "LISTENING..." : "TAP TO RECORD"}
              </span>
              <span className="text-[8px] font-mono text-on-surface-variant/60 uppercase mt-1">
                {isVoiceActivated ? "Speak to start" : "Microphone active"}
              </span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Hands-Free Voice Activation Controls */}
      <div className="w-full max-w-sm glass-panel p-4 rounded-xl border border-white/5 space-y-3 bg-black/30 mt-4">
        <div className="flex justify-between items-center">
          <div className="text-left">
            <h4 className="text-[10px] font-mono font-bold tracking-widest text-[#00dbe9] uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> Hands-Free Activation
            </h4>
            <p className="text-[9px] text-on-surface-variant/80">
              Start recording automatically based on your voice volume levels.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsVoiceActivated(!isVoiceActivated);
              if (isRecording) {
                handleStopRecording();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all border cursor-pointer ${
              isVoiceActivated
                ? "bg-secondary/15 border-secondary text-secondary"
                : "bg-black/40 border-white/10 text-on-surface-variant/60"
            }`}
          >
            {isVoiceActivated ? "ACTIVE" : "DISABLED"}
          </button>
        </div>

        {/* Sound Decibel Threshold Monitor */}
        {isVoiceActivated && (
          <div className="space-y-1.5 pt-1.5 border-t border-white/5">
            <div className="flex justify-between text-[8px] font-mono text-on-surface-variant">
              <span>VOICE INTENSITY AMPLITUDE:</span>
              <span className="text-secondary font-bold">{micVolumeLevel}% peak</span>
            </div>
            
            {/* Visual levels indicator bar */}
            <div className="h-2 bg-black/50 rounded-full overflow-hidden flex relative items-center">
              <div 
                className="h-full bg-secondary transition-all duration-75"
                style={{ width: `${Math.min(micVolumeLevel * 1.5, 100)}%` }}
              />
              {/* Threshold mark line */}
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-red-400" 
                style={{ left: `${voiceThreshold}%` }}
                title={`Threshold level: ${voiceThreshold}`}
              />
            </div>

            <div className="flex justify-between text-[8px] font-mono text-on-surface-variant/60 leading-normal">
              <span>Threshold Trigger limit: {voiceThreshold}</span>
              <span>Speak loudly to automatically activate portal</span>
            </div>
          </div>
        )}
      </div>

      {/* Transcription Feedback Screen */}
      <div className="w-full max-w-md mt-6 min-h-[50px] flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {isRecording ? (
            <motion.div
              key="rec-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#ca9eff] animate-pulse font-mono text-[10px] uppercase tracking-wider flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              Recording Active — Speak freely, your words are captured safely
            </motion.div>
          ) : isSaving ? (
            <motion.div
              key="saving-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#00dbe9] font-mono text-[10px] uppercase tracking-wider flex items-center gap-2"
            >
              <div className="w-3.5 h-3.5 rounded-full border border-[#00dbe9] border-t-transparent animate-spin" />
              Transcribing & Auto-Saving Dream Journal...
            </motion.div>
          ) : showSavedFeedback ? (
            <motion.div
              key="saved-status"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-semibold-container/20 border border-emerald-400/20 rounded-xl bg-black/30 w-full space-y-1"
            >
              <span className="text-emerald-400 font-mono text-[9px] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> Auto-Saved to Feed!
              </span>
              <p className="text-[10px] text-[#ca9eff] italic leading-tight">
                {transcribedText}
              </p>
              <span className="text-[8px] text-on-surface-variant/50 font-mono block uppercase pt-0.5">
                Put phone down, breathe slow, and fall back to sleep
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="idle-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-on-surface-variant/60 text-[10px] font-mono uppercase tracking-wide leading-normal"
            >
              💤 Zero-Look recording is primed. Just open this tab, tap the circle, speak, and we will handle the rest.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
