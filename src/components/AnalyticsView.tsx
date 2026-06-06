/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Dream } from "../types";
import { TrendingUp, Award, Brain, Compass, HelpCircle, Eye, Moon, Activity, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface AnalyticsViewProps {
  dreams: Dream[];
  onNavigateToRecord: () => void;
}

export default function AnalyticsView({ dreams, onNavigateToRecord }: AnalyticsViewProps) {
  const [selectedEpochFilter, setSelectedEpochFilter] = useState<string>("All Epochs");

  // Get list of unique life epochs
  const lifeEpochs = ["All Epochs", ...Array.from(new Set(dreams.map(d => d.lifeEpoch).filter(Boolean))) as string[]];

  // Filter dreams by selected life epoch
  const filteredDreams = selectedEpochFilter === "All Epochs"
    ? dreams
    : dreams.filter(d => d.lifeEpoch === selectedEpochFilter);

  // Computations
  const totalCount = filteredDreams.length;

  // Emotion occurrences
  const emotionMap: { [key: string]: number } = {};
  filteredDreams.forEach((d) => {
    const emo = d.details.emotion || "Introspection";
    // standardise some titles
    let category = "Introspection";
    if (emo.toLowerCase().includes("awe") || emo.toLowerCase().includes("wonder")) category = "Awe & Wonder";
    else if (emo.toLowerCase().includes("dread") || emo.toLowerCase().includes("terror") || d.details.tags.includes("#Nightmare")) category = "Dread / Nightmare";
    else if (emo.toLowerCase().includes("lucid")) category = "Lucid Control";
    else if (emo.toLowerCase().includes("nostalgia") || emo.toLowerCase().includes("peace")) category = "Nostalgic Peace";
    else category = "Introspective Calm";

    emotionMap[category] = (emotionMap[category] || 0) + 1;
  });

  const emotionStats = Object.keys(emotionMap).map(key => ({
    name: key,
    count: emotionMap[key],
    percent: totalCount > 0 ? Math.round((emotionMap[key] / totalCount) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Environmental Bed correlation analysis
  const envRecallMap: { [key: string]: { lucid: number; nightmare: number; total: number } } = {
    "Home Bed": { lucid: 0, nightmare: 0, total: 0 },
    "Nap Context": { lucid: 0, nightmare: 0, total: 0 },
    "Traveling/Hotel": { lucid: 0, nightmare: 0, total: 0 },
    "Friend's Bed": { lucid: 0, nightmare: 0, total: 0 }
  };

  filteredDreams.forEach((d) => {
    const rawEnv = d.sleepEnvironment || "Home Bed";
    let env = "Home Bed";
    if (rawEnv.toLowerCase().includes("nap")) env = "Nap Context";
    else if (rawEnv.toLowerCase().includes("travel") || rawEnv.toLowerCase().includes("hotel")) env = "Traveling/Hotel";
    else if (rawEnv.toLowerCase().includes("friend")) env = "Friend's Bed";

    if (!envRecallMap[env]) {
      envRecallMap[env] = { lucid: 0, nightmare: 0, total: 0 };
    }

    envRecallMap[env].total += 1;
    if (d.details.tags.includes("#Lucid") || (d.details.clarity && d.details.clarity.toLowerCase().includes("high"))) {
      envRecallMap[env].lucid += 1;
    }
    if (d.details.tags.includes("#Nightmare") || d.details.emotion.toLowerCase().includes("dread") || d.details.emotion.toLowerCase().includes("terror")) {
      envRecallMap[env].nightmare += 1;
    }
  });

  const environmentCorrelations = Object.keys(envRecallMap).map(env => {
    const stats = envRecallMap[env];
    return {
      environment: env,
      totalEntries: stats.total,
      lucidRatio: stats.total > 0 ? Math.round((stats.lucid / stats.total) * 100) : 0,
      nightmareRatio: stats.total > 0 ? Math.round((stats.nightmare / stats.total) * 100) : 0
    };
  });

  // Calculate Lucid vs Nightmare percentages of overall selected
  const overallLucidCount = filteredDreams.filter(d => d.details.tags.includes("#Lucid") || d.details.control.includes("High") || d.details.control.includes("Full")).length;
  const overallNightmareCount = filteredDreams.filter(d => d.details.tags.includes("#Nightmare") || d.details.emotion.toLowerCase().includes("dread") || d.details.emotion.toLowerCase().includes("terror")).length;
  const overallRecurringCount = filteredDreams.filter(d => d.details.tags.includes("#Recurring")).length;

  const statsRatio = {
    lucid: totalCount > 0 ? Math.round((overallLucidCount / totalCount) * 100) : 0,
    nightmare: totalCount > 0 ? Math.round((overallNightmareCount / totalCount) * 100) : 0,
    recurring: totalCount > 0 ? Math.round((overallRecurringCount / totalCount) * 100) : 0
  };

  return (
    <div className="w-full flex flex-col pt-4 pb-24 px-4 max-w-4xl mx-auto space-y-6 text-left">
      
      {/* Top Welcome profile user badge */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-secondary-container to-tertiary-container flex items-center justify-center border border-white/10 shadow-lg text-white font-bold text-xl uppercase">
            ES
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-lg text-lg font-bold tracking-wide text-on-surface">Subconscious Explorer</h2>
              <span className="text-[9px] font-mono tracking-widest text-[#00dbe9] bg-[#00dbe9]/10 border border-[#00dbe9]/30 rounded px-1.5 py-0.5 uppercase">
                Adept dreamer
              </span>
            </div>
            <p className="font-mono text-xs text-on-surface-variant/75 mt-0.5">esdecyofficial@gmail.com</p>
          </div>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-2 gap-2 text-center md:text-right">
          <div className="bg-black/25 px-4 py-2 rounded-xl border border-white/5">
            <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase">Recall Score</span>
            <span className="font-title-md text-sm font-bold text-[#00dbe9] block">94%</span>
          </div>
          <div className="bg-black/25 px-4 py-2 rounded-xl border border-white/5">
            <span className="font-mono text-[9px] text-on-surface-variant/70 uppercase">REM Stages</span>
            <span className="font-title-md text-sm font-bold text-secondary block">Class 4</span>
          </div>
        </div>
      </div>

      {/* Interactive Segment Filter: Filter everything by Life milestones (career change, wedding prep) */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3.5 bg-[#14162e]/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold font-label-caps tracking-widest text-[#ca9eff] flex items-center gap-1.5 uppercase">
              <Calendar className="w-5 h-5 text-secondary" /> Life Chapters Selector
            </h3>
            <p className="text-xs text-[#cac5e4]/90">
              Filter your dynamic dream trends by major life chapters (e.g. college exams, new job, traveling) to see how themes shifting.
            </p>
          </div>
          <select
            value={selectedEpochFilter}
            onChange={(e) => setSelectedEpochFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-on-surface focus:border-secondary outline-none cursor-pointer max-w-xs shrink-0"
          >
            {lifeEpochs.map(epoch => (
              <option key={epoch} value={epoch}>
                {epoch === "All Epochs" ? "All Life Chapters Combined" : `Chapter: ${epoch}`}
              </option>
            ))}
          </select>
        </div>

        {/* Slicer quick insight banner */}
        <div className="p-3 bg-black/20 rounded-xl border border-white/5 text-xs text-on-surface-variant/90 leading-relaxed">
          {selectedEpochFilter === "All Epochs" ? (
            <span>Currently showing patterns aggregated across <strong>all cataloged lifespans and chapters</strong>. Select an entry to filter a specific time frame.</span>
          ) : (
            <span>Isolating dreams recorded during <strong>{selectedEpochFilter}</strong> ({totalCount} sessions). See how waking environments shaped your dreams compared to other life chapters.</span>
          )}
        </div>
      </div>

      {/* Cognitive Ratio Dist & Emotion breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Custom Cognitive Ratio progress bars */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-title-md text-xs tracking-widest uppercase font-bold text-on-surface border-b border-white/5 pb-2.5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#ca9eff]" /> Dream Theme & Awareness Distribution ({selectedEpochFilter})
          </h3>

          <div className="space-y-4 pt-1">
            {/* Lucid */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-mono text-on-surface-variant">
                <span className="flex items-center gap-1.5"><Brain className="w-4 h-4 text-[#00dbe9] animate-pulse" /> Lucid Rem Control</span>
                <span className="text-[#00dbe9] font-bold">{statsRatio.lucid}%</span>
              </div>
              <div className="h-2 w-full bg-[#1b1c34] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-tertiary to-[#9efffc] rounded-full shadow-[0_0_8px_#00dbe9]" style={{ width: `${statsRatio.lucid}%` }} />
              </div>
            </div>

            {/* Nightmare */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-mono text-on-surface-variant">
                <span className="flex items-center gap-1.5"><Moon className="w-4 h-4 text-red-400" /> Dread / Nightmares</span>
                <span className="text-red-400 font-bold">{statsRatio.nightmare}%</span>
              </div>
              <div className="h-2 w-full bg-[#1b1c34] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-300 rounded-full shadow-[0_0_8px_#ffb4ab]" style={{ width: `${statsRatio.nightmare}%` }} />
              </div>
            </div>

            {/* Recurring */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-mono text-on-surface-variant">
                <span className="flex items-center gap-1.5"><Compass className="w-4 h-4 text-secondary" /> Cyclic Recurring Loops</span>
                <span className="text-secondary font-bold">{statsRatio.recurring}%</span>
              </div>
              <div className="h-2 w-full bg-[#1b1c34] rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-secondary to-secondary-container rounded-full shadow-[0_0_8px_#ecb2ff]" style={{ width: `${statsRatio.recurring}%` }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-on-surface-variant/60 leading-normal font-mono">
            * Cognitive index measured based on conscious agency, pre-sleep intentions and waking delta offsets.
          </p>
        </div>

        {/* Emotion Distribution custom SVG/Bar layout */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
          <h3 className="font-title-md text-xs tracking-widest uppercase font-bold text-on-surface border-b border-white/5 pb-2.5 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#00dbe9]" /> Primary Emotion Distribution
          </h3>

          <div className="space-y-3.5 pt-1">
            {totalCount === 0 ? (
              <div className="text-center py-10 text-xs text-on-surface-variant/40">
                No active reveries stored for this filter path.
              </div>
            ) : (
              emotionStats.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs font-mono font-medium text-on-surface">
                    <span>{item.name}</span>
                    <span className="text-on-surface-variant/85">{item.count} dreams ({item.percent}%)</span>
                  </div>
                  <div className="relative h-4 w-full bg-black/25 rounded-md overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-md transition-all duration-500 ${
                        item.name.includes("Awe")
                          ? "bg-[#00dbe9]/60"
                          : item.name.includes("Dread")
                          ? "bg-red-400/60"
                          : item.name.includes("Lucid")
                          ? "bg-[#ca9eff]/60"
                          : "bg-surface-tint/60"
                      }`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bed sleep / Environment lucidity correlations! Options (Sleep Environment Analysis) */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h3 className="font-title-md text-xs tracking-widest uppercase font-bold text-on-surface border-b border-white/5 pb-2.5 flex items-center gap-2">
            <Brain className="w-4 h-4 text-tertiary" /> Sleep Bed & Environmental Correlations
          </h3>
          <p className="text-[11px] text-on-surface-variant/80 mt-1">
            Different bedrooms and nap structures profoundly alter sensory inputs and melatonin levels (the First-Night Effect). Below is your active correlation index:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
          {environmentCorrelations.map((item, idx) => (
            <div key={idx} className="bg-black/35 p-4 rounded-xl border border-white/5 space-y-2.5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] text-white font-bold tracking-wide uppercase block">
                  {item.environment}
                </span>
                <span className="text-[9px] font-mono text-on-surface-variant/60 block mt-0.5">
                  {item.totalEntries} logged sessions
                </span>
              </div>

              {item.totalEntries === 0 ? (
                <div className="text-[10px] text-on-surface-variant/40 py-2">
                  No data points yet.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="space-y-0.5">
                    <div className="flex justify-between font-mono text-[9px] text-[#00dbe9]">
                      <span>LUCID FREQ</span>
                      <span>{item.lucidRatio}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1c1e32] rounded">
                      <div className="h-full bg-[#00dbe9] rounded" style={{ width: `${item.lucidRatio}%` }} />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between font-mono text-[9px] text-red-400">
                      <span>NIGHTMARE FIRES</span>
                      <span>{item.nightmareRatio}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1c1e32] rounded">
                      <div className="h-full bg-red-400/80 rounded" style={{ width: `${item.nightmareRatio}%` }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Cognitive takeaway tag */}
              {item.totalEntries > 0 && (
                <div className="text-[9px] font-mono p-1 bg-white/5 border border-white/5 rounded text-left text-on-surface-variant">
                  {item.environment === "Home Bed" && "Stable baseline REM waves."}
                  {item.environment === "Nap Context" && "High hypnagogia entry chance!"}
                  {item.environment === "Traveling/Hotel" && "First-night alert triggers recall."}
                  {item.environment === "Friend's Bed" && "Elevated sensory reactivity."}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subconscious dream keywords lists */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left space-y-4">
        <h4 className="font-title-md text-xs tracking-widest uppercase text-[#cac2e1] font-semibold flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-tertiary" /> Active Subconscious Theme Clusters ({selectedEpochFilter})
        </h4>
        <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
          {filteredDreams.length === 0 ? (
            <span className="text-on-surface-variant/40">No keywords extracted.</span>
          ) : (
            filteredDreams.flatMap(d => d.details.entities).slice(0, 8).map((word, idx) => (
              <span key={idx} className="bg-gradient-to-r from-secondary-container/10 to-[#00dbe9]/10 border border-white/5 text-on-surface-variant font-mono text-[10px] px-3 py-1 rounded-full text-[#ca9eff]">
                # {word}
              </span>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
