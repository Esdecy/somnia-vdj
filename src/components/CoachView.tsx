/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Brain, Sparkles, CheckSquare, Eye, ShieldAlert, Award, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function CoachView() {
  const [realityAnchorTesting, setRealityAnchorTesting] = useState(false);
  const [realityCheckResult, setRealityCheckResult] = useState<string | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<string>("mild");

  // Local storage recall tracker
  const [checklist, setChecklist] = useState({
    journalToday: false,
    realityChecked3Times: false,
    sleepIntentionSet: false,
    affirmationRecorded: false,
    wbtbScheduled: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("SOMNIA_COACH_CHECKLIST");
    if (saved) {
      try { setChecklist(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const toggleCheck = (key: keyof typeof checklist) => {
    const next = { ...checklist, [key]: !checklist[key] };
    setChecklist(next);
    localStorage.setItem("SOMNIA_COACH_CHECKLIST", JSON.stringify(next));
  };

  const handleRealityAnchorTest = () => {
    setRealityAnchorTesting(true);
    setRealityCheckResult(null);
    
    // Simulate high tech bio feedback check
    setTimeout(() => {
      const tipChoice = trainingTips[Math.floor(Math.random() * trainingTips.length)];
      setRealityCheckResult(
        `REALITY CHECK STABILIZED. Active Cognitive Test: [${tipChoice.title}] - ${tipChoice.desc}`
      );
      setRealityAnchorTesting(false);
    }, 1850);
  };

  const trainingTips = [
    {
      title: "Pinch-Nose Breathing Anchor",
      category: "Somatic Check",
      desc: "Pinch your nostrils shut with your fingers and try to take a gentle inhale. In physical waking reality, you obviously cannot. However, in REM dreams, your lungs can still 'breathe' because the sensation is a cortical simulation. Testing this periodically trains your brain to trigger it automatically mid-dream."
    },
    {
      title: "Digital Watch Typo Shift",
      category: "Cognitive Check",
      desc: "Look at your watch or phone screen, turn your head away for two seconds, and look back. In modern dreaming, numbers, fonts, and electronic symbols shift rapidly or warp because your brain is poor at generating static typographical layouts across updates."
    },
    {
      title: "The Retrograde Step Trace",
      category: "Memory Anchor",
      desc: "Trace back your footsteps. Ask yourself: 'How did I arrive in this exact room?' Focus on the physical transitions. Dreaming completely lacks rational sequential entry; your subconscious drops you straight into active scenes. Memory audits build deep awareness."
    },
    {
      title: "Fluid Solid Palm Press",
      category: "Somatic Check",
      desc: "Push your index finger firmly into the palm of your opposite hand with the absolute expectation that it might slide through. In the fluid, non-solid canvas of an active dream state, objects easily pass through surfaces like digital holograms."
    },
    {
      title: "The Gravity Shift Leap",
      category: "Physics Check",
      desc: "Focus on gravity. In waking physics, gravity is constant. In a dream, any minor jump or shift can cause you to float, glide, or take high vertical leaps. Always pause and ask: does your weight feel absolute?"
    },
    {
      title: "Reading & Wording Stabilizer",
      category: "Cognitive Check",
      desc: "Try to read this line of text, look at an object nearby, then look back at the text. In dreaming, text shifts, rearranges parameters, or completely transforms because your linguistic centers are mostly offline during deep sleep."
    },
    {
      title: "The Light Switch Circuit Check",
      category: "Physics Check",
      desc: "In dreams, light switches rarely work as expected because your mind doesn't easily compute ambient changes in lighting logic in real-time. Flipped switches with zero result are classic dream-state anomalies."
    },
    {
      title: "The Mirror Shadow Reflection",
      category: "Somatic Check",
      desc: "Find a mirror and study your reflection. In dreaming, your mirrored self may look blurry, shifted, represent an earlier version of you, or present high-clarity modifications. This is a powerful, instant lucid trigger."
    },
    {
      title: "The Sound Familiarity Test",
      category: "Sensory Check",
      desc: "Listen carefully to background hums. True physical sounds have acoustic directional decay. In dreaming, sounds feel projected directly into your frontal lobes. Check: does volume decay when pivoting?"
    },
    {
      title: "The Daily Objects Audit",
      category: "Memory Anchor",
      desc: "Choose one distinct physical item (like a green ring or black token) to carry at all times. Touch it and say, 'This is my physical anchor.' This establishes an awake-association that your mind will eventually trigger in REM sleep."
    },
    {
      title: "The Bed Context Contrast Check",
      category: "Environment Check",
      desc: "Observe your physical location. Dream landscapes are often combinations of old childhood rooms and unfamiliar hotels. Waking check: Does this mattress, ceiling height, and floor material match your Home Bed?"
    },
    {
      title: "The Sensory Touch Test",
      category: "Sensory Check",
      desc: "Run your fingers along a nearby wall or desk surface. Notice the fine temperature and texture. Dream tactility is often simplified; your brain doesn't simulate full high-resolution friction unless you focus on it."
    },
    {
      title: "Companion Presence Check",
      category: "Cognitive Check",
      desc: "Are you talking with someone who lives far away, or a figure whose face is shadowed? In dreams, long-distance friends or absolute strangers appear as immediate companions. Check if their physical proximity makes logical sense."
    },
    {
      title: "Memory Continuity Ledger",
      category: "Memory Anchor",
      desc: "Before writing, ask: What was I doing three hours ago? Waking life has continuous sequential memory chains. REM sleep exists in isolated bubble scenarios, devoid of pre-sleep events."
    },
    {
      title: "Emotional Spike Audit",
      category: "Cognitive Check",
      desc: "Dreams amplify your active waking emotional undertones. If you experience intense frustration, escape instincts, or profound awe, pause and ask: What active stress or milestone does this mirror?"
    }
  ];

  const [tipIndex, setTipIndex] = useState(0);

  const protocols = [
    {
      id: "mild",
      name: "MILD Protocol (Mnemonic Induction)",
      level: "Beginner",
      duration: "10 mins before sleep",
      desc: "Train prospective memory by repeating a verbal intention. Right before sleeping, lock your focus onto a specific phrase and visualize yourself realizing you are in a dream.",
      steps: [
        "Write down your recent dream in Somnia in high detail.",
        "As you fall asleep, repeat: 'Next time I am dreaming, I will remember that I am dreaming.'",
        "Visualize yourself returning to the dream scene and identifying a strange anomaly (e.g. blue glass towers).",
        "Maintain this intent until the transition into sleep occurs."
      ]
    },
    {
      id: "wild",
      name: "WILD Protocol (Wake-Initiated)",
      level: "Advanced",
      duration: "30-40 mins at 4 AM",
      desc: "Perform a conscious transition from the waking state directly into REM sleep, bypassing unconsciousness. Requires absolute physical stillness while keeping the mind alert.",
      steps: [
        "Wake up after 4.5 hours of sleep using a quiet Somnia audio chime.",
        "Lie flat on your back in complete comfort. Do not move a single muscle, ignore minor tickles.",
        "Relax your body section by section while keeping your internal awareness active.",
        "Watch the hypnagogic light patterns unfold; wait until they solidify into a full dream scene, then step inside."
      ]
    },
    {
      id: "wbtb",
      name: "WBTB Technique (Wake Back to Bed)",
      level: "Intermediate",
      duration: "15 mins awake",
      desc: "Waking up mid-sleep raises brain alertness while maintaining high REM sleep pressure. This is the most effective booster for recall and vivid control ratios.",
      steps: [
        "Set an alarm for 5 hours after your bedtime.",
        "Stay awake for 15 minutes, reading your Somnia Dream Log or checking your sleep metrics database.",
        "Avoid high-contrast blue screens. Keep overhead lights extremely soft.",
        "Return to bed with MILD visualization to easily drift straight into high-vividity lucid dreams."
      ]
    }
  ];

  const currentProto = protocols.find(p => p.id === selectedProtocol) || protocols[0];

  return (
    <div className="w-full flex flex-col pt-4 pb-24 px-4 max-w-4xl mx-auto space-y-6">
      
      {/* Title block */}
      <div className="text-left">
        <h2 className="text-xl font-bold tracking-widest text-[#ca9eff] font-label-caps uppercase flex items-center gap-2">
          <Brain className="w-5 h-5 animate-pulse text-[#ca9eff]" />
          SOMNIA INDUCTION COACH
        </h2>
        <p className="text-xs text-on-surface-variant/80 mt-1">
          Harness neurological cues, cognitive anchors, and proven subconscious exercises to boost dream control ratio and recall depth.
        </p>
      </div>

      {/* Grid: Checklists and Live reality check anchor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lucid recall checked tracker */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left space-y-4">
          <h3 className="text-xs font-bold font-label-caps tracking-widest text-secondary flex items-center gap-2 border-b border-white/5 pb-2">
            <CheckSquare className="w-4 h-4 text-secondary" /> Daily Induction Tasks
          </h3>
          <p className="text-[11px] text-on-surface-variant/70 leading-normal">
            Complete these exercises daily to tune your brain's retrospection mechanics for REM sleep recall.
          </p>

          <div className="space-y-3 pt-1">
            {[
              { id: "journalToday", label: "Logged last night's dreamscape first thing" },
              { id: "realityChecked3Times", label: "Performed 3 conscious reality checks today" },
              { id: "sleepIntentionSet", label: "Selected active dream style and intention" },
              { id: "affirmationRecorded", label: "Created or updated dream-wake affirmation" },
              { id: "wbtbScheduled", label: "Primed sleep frequencies for midnight" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id as any)}
                className="w-full flex items-center gap-3 text-left p-2.5 rounded-lg bg-black/15 border border-white/5 hover:border-white/10 hover:bg-black/20 transition-all cursor-pointer group"
              >
                <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${
                  checklist[item.id as keyof typeof checklist]
                    ? "bg-secondary border-secondary text-black"
                    : "border-white/20 group-hover:border-white/40"
                }`}>
                  {checklist[item.id as keyof typeof checklist] && (
                    <span className="text-[10px] font-bold">✓</span>
                  )}
                </div>
                <span className={`text-xs ${
                  checklist[item.id as keyof typeof checklist] ? "text-on-surface line-through decoration-white/20 opacity-60" : "text-on-surface-variant group-hover:text-white"
                }`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>

          {/* Core progress badge */}
          {Object.values(checklist).filter(Boolean).length === 5 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-3 rounded-xl bg-gradient-to-r from-secondary-container/10 via-[#00dbe9]/10 to-background border border-[#00dbe9]/20 flex items-center gap-3 text-xs"
            >
              <Award className="w-5 h-5 text-[#00dbe9] animate-bounce" />
              <span className="text-[#00dbe9] font-semibold tracking-wide">
                ASTRAL CONGRUENCE MET: recall score primed for +30% boost tonight!
              </span>
            </motion.div>
          )}
        </div>

        {/* Live Reality Anchor Testing Terminal */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00dbe9]/5 rounded-full blur-[30px] pointer-events-none" />
          
          <div className="space-y-2">
            <h3 className="text-xs font-bold font-label-caps tracking-widest text-[#00dbe9] flex items-center gap-2 border-b border-white/5 pb-2">
              <Eye className="w-4 h-4 text-[#00dbe9]" /> Live Reality Anchor Test
            </h3>
            <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
              Reality checks train your mind to verify surroundings when you are asleep. Press the anchor button. Watch the console grid warp and drift to perform an active cognitive anchor check.
            </p>
          </div>

          {/* Interactive terminal readout box */}
          <div className="relative bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-[11px] h-36 flex flex-col justify-center items-center text-center overflow-hidden">
            
            <AnimatePresence mode="wait">
              {realityAnchorTesting ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 text-secondary"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-secondary animate-spin" />
                  <span className="text-[10px] tracking-wider animate-pulse font-bold">
                    CORRELATING SPATIAL INTEGRITY...
                  </span>
                </motion.div>
              ) : realityCheckResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 text-[#00dbe9]"
                >
                  <ShieldAlert className="w-5 h-5 mx-auto text-secondary animate-bounce" />
                  <p className="text-[10px] text-on-surface leading-relaxed max-w-[280px]">
                    {realityCheckResult}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="ready" className="text-on-surface-variant/60 font-medium">
                  [ ANCHOR IDLE — CONNECT TO INITIATE COGNITIVE SCAN ]
                </motion.div>
              )}
            </AnimatePresence>

            {/* Warping grid background visual effect on state testing */}
            {realityAnchorTesting && (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#9efffc]/10 to-transparent animate-pulse pointer-events-none" />
            )}
          </div>

          <button
            onClick={handleRealityAnchorTest}
            disabled={realityAnchorTesting}
            className="w-full py-2.5 bg-gradient-to-tr from-[#00dbe9] to-[#9efffc] text-[#05060f] font-bold tracking-widest font-label-caps text-xs rounded-xl shadow-[0_0_15px_rgba(0,219,233,0.3)] hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
          >
            TRIGGER ASTRAL ANCHOR TEST
          </button>
        </div>
      </div>

      {/* Subconscious Training Library Browser */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-white/5 pb-2">
          <h3 className="text-xs font-bold font-label-caps tracking-widest text-[#ca9eff] flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#ca9eff]" /> Reality Testing Training Database
          </h3>
          <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded text-on-surface-variant font-mono">
            COGNITIVE STEP {tipIndex + 1} OF {trainingTips.length}
          </span>
        </div>

        <div className="bg-black/15 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center gap-4 justify-between min-h-[140px]">
          <div className="space-y-1.5 flex-1 select-text">
            <span className="text-[9px] bg-[#00dbe9]/10 border border-[#00dbe9]/20 text-[#00dbe9] px-2 py-0.5 rounded font-mono uppercase">
              {trainingTips[tipIndex].category}
            </span>
            <h4 className="text-sm font-semibold text-on-surface flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> {trainingTips[tipIndex].title}
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {trainingTips[tipIndex].desc}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <button
            onClick={() => setTipIndex((prev) => (prev > 0 ? prev - 1 : trainingTips.length - 1))}
            className="px-3.5 py-1.5 text-[10px] font-bold font-label-caps bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-all border border-white/5"
          >
            ← Previous Concept
          </button>
          
          <div className="hidden sm:flex gap-1">
            {trainingTips.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setTipIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all ${idx === tipIndex ? 'bg-[#ca9eff]' : 'bg-white/10'}`}
              />
            ))}
          </div>

          <button
            onClick={() => setTipIndex((prev) => (prev < trainingTips.length - 1 ? prev + 1 : 0))}
            className="px-3.5 py-1.5 text-[10px] font-bold font-label-caps bg-[#ca9eff]/10 border border-[#ca9eff]/20 hover:bg-[#ca9eff]/15 text-[#ca9eff] rounded-lg cursor-pointer transition-all"
          >
            Next Concept →
          </button>
        </div>
      </div>

      {/* Protocol Selection Carousel */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 text-left space-y-4">
        <h3 className="text-xs font-bold font-label-caps tracking-widest text-[#ca9eff] flex items-center gap-2 border-b border-white/5 pb-2">
          <Sparkles className="w-4 h-4 text-[#ca9eff]" /> Step-by-Step Induction Training Protocols
        </h3>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-2">
          {protocols.map((proto) => (
            <button
              key={proto.id}
              onClick={() => setSelectedProtocol(proto.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                selectedProtocol === proto.id
                  ? "bg-secondary/15 border-secondary text-secondary font-bold"
                  : "bg-surface-container/20 border-white/5 text-on-surface-variant hover:text-white"
              }`}
            >
              {proto.name}
            </button>
          ))}
        </div>

        {/* Current Protocol parameters */}
        <div className="bg-black/25 p-4 rounded-xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-[10px] text-tertiary uppercase bg-tertiary/10 border border-tertiary/20 px-2.5 py-0.5 rounded">
              Level: {currentProto.level}
            </span>
            <span className="font-mono text-[10px] text-[#ca9eff] uppercase bg-[#ca9eff]/10 border border-[#ca9eff]/20 px-2.5 py-0.5 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" /> {currentProto.duration}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-on-surface font-headline-md">{currentProto.name}</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {currentProto.desc}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <h5 className="font-mono text-[10px] text-[#00dbe9] tracking-wider uppercase font-semibold">Execution Pathway:</h5>
            <ol className="list-decimal pl-5 space-y-2 text-xs text-on-surface-variant/90 leading-relaxed">
              {currentProto.steps.map((step, idx) => (
                <li key={idx} className="marker:text-secondary marker:font-bold">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

    </div>
  );
}
