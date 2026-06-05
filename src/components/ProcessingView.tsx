/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Users, Compass, Eye, ShieldAlert, Sparkles, Loader2 } from "lucide-react";
import { motion } from "motion/react";

interface ProcessingViewProps {
  draftText: string;
  extractedDetails: {
    emotion: string;
    location: string;
    characters: string;
  };
  onProcessingCompleted: () => void;
}

export default function ProcessingView({
  draftText,
  extractedDetails,
  onProcessingCompleted,
}: ProcessingViewProps) {
  const [progress, setProgress] = useState(30);

  // Slowly increment progress bar automatically to feel highly alive and reactive
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onProcessingCompleted();
          }, 800);
          return 100;
        }
        // Random incremental hops
        const increment = Math.floor(Math.random() * 12) + 4;
        return Math.min(100, prev + increment);
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onProcessingCompleted]);

  return (
    <div className="w-full flex flex-col pt-4 pb-20 px-4 md:px-0 max-w-4xl mx-auto space-y-8 select-none">
      
      {/* Header textual overview */}
      <div className="text-center space-y-2.5">
        <h2 className="font-display-lg text-4xl text-on-surface leading-tight font-light italic">
          Materializing Subconscious
        </h2>
        <p className="font-body-lg text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed font-mono">
          Synthesizing neural pathways into visual constructs. Do not close your eyes.
        </p>
      </div>

      {/* Abstract Liquid Animation Container */}
      <section className="glass-panel rounded-xl overflow-hidden relative shadow-2xl shadow-secondary/5 border border-white/5 mx-auto w-full max-w-2xl bg-[#0b0d1f]">
        
        {/* Glow overlay rings */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/25 pointer-events-none z-10" />

        {/* Liquid Fluid Simulation Container (using moving background mesh gradients matched in design guidelines) */}
        <div className="w-full aspect-video md:h-[260px] relative overflow-hidden flex items-center justify-center bg-background pointer-events-none">
          {/* Animated Blob 1 */}
          <motion.div
            animate={{
              x: [-20, 40, -10],
              y: [-10, -50, 20],
              scale: [1, 1.25, 0.95],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute rounded-full bg-secondary/35 blur-[50px]"
            style={{ width: "220px", height: "220px", left: "15%", top: "10%" }}
          />

          {/* Animated Blob 2 */}
          <motion.div
            animate={{
              x: [30, -30, 20],
              y: [20, 50, -10],
              scale: [1.2, 0.9, 1.15],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute rounded-full bg-tertiary/20 blur-[60px]"
            style={{ width: "280px", height: "280px", right: "10%", bottom: "5%" }}
          />

          {/* Animated Blob 3 */}
          <motion.div
            animate={{
              scale: [0.8, 1.1, 0.9],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute rounded-full bg-[#cac2e1]/15 blur-[40px]"
            style={{ width: "160px", height: "160px", left: "45%", top: "30%" }}
          />

          {/* Rotating focal vector ring in center */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute z-10 w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-surface-container/20 backdrop-blur-md"
          >
            {/* Reverse ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border border-tertiary/40 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 animate-ping" />
            </motion.div>
          </motion.div>
        </div>

        {/* RENDERING ENGAGED footer panel tag */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background to-transparent flex justify-between items-end z-20">
          <div className="font-label-caps text-[10px] text-tertiary tracking-widest flex items-center gap-2 font-bold select-none">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_8px_#00dbe9]" />
            RENDERING ENGAGED
          </div>
          <div className="font-mono text-[10px] text-on-surface-variant/75">
            Sequence 04_A
          </div>
        </div>
      </section>

      {/* Progress Track Indicator */}
      <section className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
        <div className="flex justify-between items-baseline select-none">
          <span className="font-title-md text-sm text-on-surface tracking-wide uppercase font-semibold">Formation Progress</span>
          <span className="font-headline-lg text-3xl font-bold text-secondary tracking-tight neon-glow-text">
            {progress}%
          </span>
        </div>

        {/* Horizontal load line track */}
        <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] border border-white/5 relative">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary rounded-full relative transition-all duration-300 ease-out flex items-center"
            style={{ width: `${progress}%` }}
          >
            {/* Highlight bubble brush leading edge */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[2px] rounded-full opacity-90 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Bento Grid Extracting categories */}
      <section className="space-y-4 max-w-2xl mx-auto w-full text-left pt-2">
        <h3 className="font-title-md text-xs text-surface-tint tracking-widest uppercase border-b border-white/5 pb-2.5 inline-block select-none font-bold">
          Extracting Subconscious Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Entities Card */}
          <article className="glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col gap-3 border border-white/5">
            {/* Glowing scanning laser bar */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent blur-[1px] animate-[scan_3.5s_infinite_ease-in-out]" />
            
            <div className="flex items-center gap-2.5 text-secondary">
              <Users className="w-5 h-5 shrink-0" />
              <h4 className="font-title-md text-sm text-on-surface font-semibold uppercase">Entities</h4>
            </div>
            
            <p className="font-body-sm text-xs text-on-surface-variant/85 leading-relaxed flex-grow">
              {extractedDetails.characters 
                ? `Isolating: ${extractedDetails.characters}. Unlocking symbolic archetypes.` 
                : "Isolating unfamiliar humanoid silhouettes, facial details shadowed."}
            </p>
            
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded-full border border-secondary/20 bg-secondary/10 font-label-caps text-[9px] text-secondary">
                #Shadow
              </span>
              <span className="px-2 py-0.5 rounded-full border border-secondary/20 bg-secondary/10 font-label-caps text-[9px] text-secondary">
                #Guide
              </span>
            </div>
          </article>


          {/* Spatial Card */}
          <article className="glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col gap-3 border border-white/5">
            {/* Glowing scanning laser bar */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tertiary to-transparent blur-[1px] animate-[scan_3.5s_infinite_ease-in-out_1s]" />
            
            <div className="flex items-center gap-2.5 text-tertiary">
              <Compass className="w-5 h-5 shrink-0" />
              <h4 className="font-title-md text-sm text-on-surface font-semibold uppercase">Spatial Context</h4>
            </div>
            
            <p className="font-body-sm text-xs text-on-surface-variant/85 leading-relaxed flex-grow">
              {extractedDetails.location 
                ? `Structuring matrix geometry for: ${extractedDetails.location}.` 
                : "Constructing infinite structural geometry, brutalist framing."}
            </p>
            
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 rounded-full border border-tertiary/20 bg-tertiary/10 font-label-caps text-[9px] text-tertiary">
                #Liminal
              </span>
              <span className="px-2 py-0.5 rounded-full border border-tertiary/20 bg-tertiary/10 font-label-caps text-[9px] text-tertiary">
                #Fluid
              </span>
            </div>
          </article>


          {/* Atmosphere Card */}
          <article className="glass-panel rounded-xl p-5 relative overflow-hidden flex flex-col justify-between border border-white/5">
            {/* Glowing scanning laser bar */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#cac2e1] to-transparent blur-[1px] animate-[scan_3.5s_infinite_ease-in-out_2s]" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-[#cac2e1]">
                <Eye className="w-5 h-5 shrink-0" />
                <h4 className="font-title-md text-sm text-on-surface font-semibold uppercase">Atmosphere</h4>
              </div>
              
              <p className="font-body-sm text-xs text-on-surface-variant/85 leading-relaxed">
                Emotion: <span className="text-secondary font-semibold">{extractedDetails.emotion}</span>. Applying color grading parameters based on dream mood accents.
              </p>
            </div>
            
            <div className="w-full h-1 bg-gradient-to-r from-surface-variant to-secondary rounded-full mt-4" />
          </article>

        </div>
      </section>

    </div>
  );
}
