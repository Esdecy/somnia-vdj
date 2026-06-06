/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RefreshCw, Volume2, Maximize, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Dream } from "../types";

interface DreamPlayerProps {
  dream: Dream;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onTogglePlay: () => void;
  isRendering?: boolean;
}

export default function DreamPlayer({
  dream,
  currentTime,
  isPlaying,
  onTimeUpdate,
  onTogglePlay,
  isRendering = false,
}: DreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active track properties based on current timeline tracker
  const activeVisual = dream.tracks.visuals.find(
    (c) => currentTime >= c.start && currentTime <= c.start + c.duration
  );
  const activeAtmosphere = dream.tracks.atmosphere.find(
    (c) => currentTime >= c.start && currentTime <= c.start + c.duration
  );
  const activeLighting = dream.tracks.lighting.find(
    (c) => currentTime >= c.start && currentTime <= c.start + c.duration
  );

  // Sound/visual oscillators for simulated dream wave motion
  const [swayX, setSwayX] = useState(0);
  const [swayY, setSwayY] = useState(0);

  // Voice player and Synthesizer sound refs
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{
    droneOsc?: OscillatorNode;
    chimeOscs?: OscillatorNode[];
    droneGain?: GainNode;
    chimeGain?: GainNode;
    filter?: BiquadFilterNode;
    pulseInterval?: NodeJS.Timeout;
  }>({});

  useEffect(() => {
    let theta = 0;
    const interval = setInterval(() => {
      if (isPlaying) {
        theta += 0.05;
        setSwayX(Math.sin(theta) * 15);
        setSwayY(Math.cos(theta * 0.7) * 10);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sycned narration player
  useEffect(() => {
    if (dream.voiceUrl) {
      if (!narrationRef.current) {
        narrationRef.current = new Audio(dream.voiceUrl);
      }
      narrationRef.current.loop = false;

      if (isPlaying) {
        narrationRef.current.currentTime = currentTime;
        narrationRef.current.play().catch((e) => console.warn("Narration playback deferred by browser context", e));
      } else {
        narrationRef.current.pause();
      }
    }
  }, [isPlaying, dream.voiceUrl]);

  // Sync narration on scrub/drift
  useEffect(() => {
    if (dream.voiceUrl && narrationRef.current) {
      if (Math.abs(narrationRef.current.currentTime - currentTime) > 0.6) {
        narrationRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime, dream.voiceUrl]);

  // Ethereal Web Audio Sleep Synthesizer Drone
  useEffect(() => {
    const cleanupSynth = () => {
      const s = synthNodesRef.current;
      if (s.droneOsc) {
        try { s.droneOsc.stop(); } catch {}
        s.droneOsc.disconnect();
        s.droneOsc = undefined;
      }
      if (s.chimeOscs) {
        s.chimeOscs.forEach((osc) => {
          try { osc.stop(); } catch {}
          osc.disconnect();
        });
        s.chimeOscs = [];
      }
      if (s.droneGain) {
        s.droneGain.disconnect();
        s.droneGain = undefined;
      }
      if (s.chimeGain) {
        s.chimeGain.disconnect();
        s.chimeGain = undefined;
      }
      if (s.filter) {
        s.filter.disconnect();
        s.filter = undefined;
      }
      if (s.pulseInterval) {
        clearInterval(s.pulseInterval);
        s.pulseInterval = undefined;
      }
    };

    if (!isPlaying || !activeAtmosphere) {
      cleanupSynth();
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = audioCtxRef.current || new AudioCtxClass();
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      cleanupSynth();

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(1, ctx.currentTime);
      filter.connect(ctx.destination);
      synthNodesRef.current.filter = filter;

      const name = activeAtmosphere.name.toLowerCase();

      // Nightmare Heartbeat pulse
      if (
        name.includes("heartbeat") ||
        name.includes("dread") ||
        name.includes("nightmare") ||
        dream.details.emotion.toLowerCase().includes("dread")
      ) {
        const triggerHeartbeat = () => {
          if (ctx.state === "suspended") return;

          // Heartbeat beat 1
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.type = "sine";
          osc1.frequency.setValueAtTime(55, ctx.currentTime);
          osc1.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          gain1.gain.setValueAtTime(0.5, ctx.currentTime);
          gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc1.start();
          osc1.stop(ctx.currentTime + 0.35);

          // Heartbeat beat 2
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          setTimeout(() => {
            if (!isPlaying || ctx.state === "suspended") return;
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.type = "sine";
            osc2.frequency.setValueAtTime(50, ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            gain2.gain.setValueAtTime(0.5, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc2.start();
            osc2.stop(ctx.currentTime + 0.35);
          }, 300);
        };

        triggerHeartbeat();
        synthNodesRef.current.pulseInterval = setInterval(triggerHeartbeat, 1600);
      }
      // Glass Chimes
      else if (
        name.includes("glass") ||
        name.includes("crystal") ||
        name.includes("oracle") ||
        name.includes("whisper")
      ) {
        const droneOsc = ctx.createOscillator();
        const droneGain = ctx.createGain();
        droneOsc.type = "triangle";
        droneOsc.frequency.setValueAtTime(110, ctx.currentTime);
        droneGain.gain.setValueAtTime(0.12, ctx.currentTime);
        droneOsc.connect(droneGain);
        droneGain.connect(filter);
        droneOsc.start();
        synthNodesRef.current.droneOsc = droneOsc;
        synthNodesRef.current.droneGain = droneGain;

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0.05, ctx.currentTime);
        chimeGain.connect(ctx.destination);
        synthNodesRef.current.chimeGain = chimeGain;

        const playChime = () => {
          if (!isPlaying || ctx.state === "suspended") return;
          const rootNotes = [440, 554.37, 659.25, 880];
          const note = rootNotes[Math.floor(Math.random() * rootNotes.length)];
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(note, ctx.currentTime);

          const individualGain = ctx.createGain();
          individualGain.gain.setValueAtTime(0.06, ctx.currentTime);
          individualGain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 1.8);

          osc.connect(individualGain);
          individualGain.connect(chimeGain);
          osc.start();
          osc.stop(ctx.currentTime + 2);
        };

        playChime();
        synthNodesRef.current.pulseInterval = setInterval(playChime, 2500);
      }
      // Ethereal drone
      else {
        const droneOsc = ctx.createOscillator();
        const droneGain = ctx.createGain();
        droneOsc.type = "triangle";
        droneOsc.frequency.setValueAtTime(146.83, ctx.currentTime);

        droneOsc.frequency.linearRampToValueAtTime(155, ctx.currentTime + 5);
        droneOsc.frequency.linearRampToValueAtTime(146.83, ctx.currentTime + 10);

        droneGain.gain.setValueAtTime(0.15, ctx.currentTime);
        droneOsc.connect(droneGain);
        droneGain.connect(filter);
        droneOsc.start();
        synthNodesRef.current.droneOsc = droneOsc;
        synthNodesRef.current.droneGain = droneGain;
      }
    } catch (e) {
      console.warn("Web Audio compilation blocked", e);
    }

    return () => cleanupSynth();
  }, [isPlaying, activeAtmosphere?.id]);

  // Clean playheads on unmount
  useEffect(() => {
    return () => {
      if (narrationRef.current) {
        narrationRef.current.pause();
        narrationRef.current = null;
      }
    };
  }, []);

  // Handle continuous playhead logic
  useEffect(() => {
    const handleFrame = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        const nextTime = currentTime + delta;
        if (nextTime >= dream.duration) {
          onTimeUpdate(0);
          onTogglePlay(); // stop at end
        } else {
          onTimeUpdate(nextTime);
        }
      }
      requestRef.current = requestAnimationFrame(handleFrame);
    };

    requestRef.current = requestAnimationFrame(handleFrame);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, currentTime, dream.duration, onTimeUpdate, onTogglePlay]);

  // Listen to change playing status to reset tick reference
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = 0;
    }
  }, [isPlaying]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", checkFullscreen);
    return () => document.removeEventListener("fullscreenchange", checkFullscreen);
  }, []);

  // Format time utilities (00:00)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    const ms = Math.floor((seconds % 1) * 100).toString().padStart(2, "0");
    return `${mins}:${secs}:${ms}`;
  };

  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const progress = Math.min(1, Math.max(0, x / rect.width));
    onTimeUpdate(progress * dream.duration);
  };

  // Compute atmosphere coloring based on active items
  const getAtmosphericStyles = () => {
    if (!activeAtmosphere) return "rgba(0, 0, 0, 0)";
    
    const text = activeAtmosphere.name.toLowerCase();
    if (text.includes("purple") || text.includes("fog") || text.includes("clouds")) {
      return "radial-gradient(circle at 50% 50%, rgba(207, 92, 255, 0.25) 0%, rgba(16, 18, 37, 0.4) 100%)";
    }
    if (text.includes("teal") || text.includes("water") || text.includes("mist")) {
      return "radial-gradient(circle at 10% 20%, rgba(0, 219, 233, 0.2) 0%, rgba(16, 18, 37, 0.2) 70%)";
    }
    if (text.includes("gold") || text.includes("warm") || text.includes("fire")) {
      return "radial-gradient(circle at 80% 80%, rgba(248, 216, 255, 0.15) 0%, rgba(16, 18, 37, 0.3) 100%)";
    }
    return "radial-gradient(circle at 50% 50%, rgba(202, 194, 225, 0.1) 0%, rgba(0,0,0,0) 80%)";
  };

  // Compute lighting overlay styles
  const getLightingStyles = () => {
    if (!activeLighting) return "opacity-0";
    const name = activeLighting.name.toLowerCase();
    if (name.includes("glow") || name.includes("aurora") || name.includes("pulse")) {
      // undulating scale pulse
      return `opacity-30 bg-gradient-to-tr from-secondary/15 via-tertiary/10 to-transparent animate-pulse`;
    }
    if (name.includes("flash") || name.includes("flicker")) {
      // rhythmic rapid strobe
      return `opacity-20 bg-white/25 mix-blend-color-dodge transition-all duration-75 ${
        Math.floor(currentTime * 10) % 3 === 0 ? "opacity-40" : "opacity-0"
      }`;
    }
    if (name.includes("rim") || name.includes("soft")) {
      return `opacity-50 ring-1 ring-inset ring-secondary/30 shadow-[inset_0_0_50px_rgba(207,92,255,0.25)]`;
    }
    return "opacity-0";
  };

  return (
    <div
      ref={containerRef}
      id="dream-player-wrapper"
      className="relative w-full aspect-video md:h-[400px] rounded-xl overflow-hidden glass-panel border border-white/10 flex flex-col items-center justify-center bg-[#0b0d1f] shadow-2xl group select-none"
    >
      {/* Background Static Stars */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] z-0"></div>

      {isRendering ? (
        <div className="absolute inset-0 bg-[#0b0d1f]/95 z-30 flex flex-col items-center justify-center gap-4 text-center p-6">
          <Loader2 className="w-12 h-12 text-secondary animate-spin" />
          <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-widest neon-glow-text">
            RENDERING SUBCONSCIOUS
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
            Synthesizing neural pixels and vector tracks into cinematic light fields...
          </p>
        </div>
      ) : (
        <>
          {/* Main Dream Visual (Translational sway simulates active hand-held camera drift) */}
          <div
            className="absolute inset-0 w-full h-full z-0 transition-transform duration-700 ease-out flex items-center justify-center"
            style={{
              transform: `scale(1.08) translate(${swayX}px, ${swayY}px)`,
            }}
          >
            <img
              referrerPolicy="no-referrer"
              src={dream.visuals.imageUrl}
              alt="Dream Visual Playback"
              className="w-full h-full object-cover select-none"
            />
          </div>

          {/* Layer 1: Simulated Dream Fog (Atmosphere Track Overlay) */}
          <div
            className="absolute inset-0 z-1 pointer-events-none transition-all duration-1000 mix-blend-screen"
            style={{ background: getAtmosphericStyles() }}
          />

          {/* Layer 2: Lighting Track Filter Overlay */}
          <div
            className={`absolute inset-0 z-2 pointer-events-none transition-all duration-300 ${getLightingStyles()}`}
          />

          {/* Layer 3: Particle Space Drift Engine (Always floating during playback) */}
          <AnimatePresence>
            {isPlaying && (
              <div className="absolute inset-0 z-3 pointer-events-none overflow-hidden mix-blend-additive">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={`p-${i}`}
                    className="absolute rounded-full bg-secondary-container/20 blur-[1px]"
                    style={{
                      width: Math.random() * 8 + 4,
                      height: Math.random() * 8 + 4,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [-25, -120],
                      x: [0, (Math.random() - 0.5) * 50],
                      opacity: [0, 0.8, 0],
                      scale: [0.8, 1.3, 0.5],
                    }}
                    transition={{
                      duration: Math.random() * 4 + 3,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Central Play/Pause Splash Overlay (Fade out when running) */}
          <AnimatePresence>
            {!isPlaying && !isRendering && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onTogglePlay}
                className="absolute z-10 w-20 h-20 rounded-full border border-secondary/40 bg-surface-container/60 backdrop-blur-md flex items-center justify-center text-secondary hover:text-tertiary shadow-[0_0_30px_rgba(207,92,255,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 pointer-events-auto"
                id="splash-play-btn"
              >
                <Play className="w-8 h-8 fill-current ml-1 drop-shadow-[0_0_10px_rgba(236,178,255,0.8)]" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Top-Right Tag Info */}
          <div className="absolute top-4 right-4 z-10 flex gap-2 pointer-events-none">
            <span className="glass-panel text-tertiary px-3 py-1 text-[10px] rounded border border-tertiary/20 font-label-caps uppercase tracking-widest bg-background/50 backdrop-blur-md">
              {dream.visuals.style}
            </span>
            <span className="glass-panel text-secondary px-3 py-1 text-[10px] rounded border border-secondary/20 font-label-caps uppercase tracking-widest bg-background/50 backdrop-blur-md">
              {dream.details.emotion}
            </span>
          </div>

          {/* Top-Left Rendering Sequencer Metadata String */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-0.5">
            <span className="font-label-caps text-[9px] tracking-widest text-[#00dbe9] bg-background/60 backdrop-blur-md px-2 py-0.5 rounded border border-[#00dbe9]/20">
              ● RENDER LIVE
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant/70 italic text-left pl-1">
              {dream.visuals.videoSequence}
            </span>
          </div>

          {/* Bottom Metabar Overlay */}
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none flex flex-col font-mono text-[10px] text-left gap-0.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded border border-white/5">
            <div className="text-secondary font-semibold uppercase tracking-wider text-[9px] flex items-center gap-1.5">
              Active Visual: {activeVisual?.name || "Null Frame"}
              {dream.voiceUrl && (
                <span className="text-[8px] tracking-widest text-[#00dbe9] bg-[#00dbe9]/10 px-1 rounded animate-pulse">
                  VOICEOVER SYNCED
                </span>
              )}
            </div>
            <div className="text-tertiary">
              Atmo: {activeAtmosphere?.name || "None"} | Light: {activeLighting?.name || "Darkness"}
            </div>
          </div>

          {/* Player Controller Utility Rail */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-3 pointer-events-auto">
            {/* Playback Progress Track Scrubber */}
            <div
              onClick={handleScrub}
              className="h-1.5 bg-white/15 rounded-full w-full relative cursor-pointer group/scrub"
              id="player-scrubber"
            >
              <div
                className="absolute top-0 left-0 h-full bg-[#00dbe9] rounded-full transition-all duration-75"
                style={{ width: `${(currentTime / dream.duration) * 100}%` }}
              />
              <div
                className="absolute top-1/2 w-3.5 h-3.5 bg-white rounded-full -translate-y-1/2 -translate-x-1/2 shadow-[0_0_12px_#00dbe9] scale-0 group-hover/scrub:scale-100 transition-transform pointer-events-none"
                style={{ left: `${(currentTime / dream.duration) * 100}%` }}
              />
            </div>

            {/* Controlling Rails */}
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <button
                  onClick={onTogglePlay}
                  id="ctrl-play-pause"
                  className="hover:text-tertiary transition-colors focus:outline-none cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current" />
                  )}
                </button>
                <span className="font-mono text-xs tracking-wider text-white/80">
                  {formatTime(currentTime)} / {formatTime(dream.duration)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button className="hover:text-secondary text-white/70 transition-colors cursor-pointer">
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="hover:text-secondary text-white/70 transition-colors cursor-pointer"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
