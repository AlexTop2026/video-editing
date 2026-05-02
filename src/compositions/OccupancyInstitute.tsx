import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  OffthreadVideo,
  staticFile,
} from "remotion";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  white: "#ffffff",
  cream: "#f5f0e8",
  gold: "#c9a84c",
  goldLight: "#e0c068",
  navy: "#0f1624",
};

// Source video is 10.033s = ~300 frames at 30fps; we loop it 3× across 900f
const SRC_FRAMES = 300;

// ─── SCRIPTED CAPTIONS ───────────────────────────────────────────────────────
// Timed to the narrative arc. Swap with Whisper SRT output for true audio sync.
const CAPTIONS: Array<{
  from: number;
  to: number;
  text: string;
  emphasis?: string[];
}> = [
  // Hook 0–4s
  { from: 5,   to: 60,  text: "Still relying on referrals",        emphasis: ["referrals"] },
  { from: 62,  to: 115, text: "to fill your rooms every month?",   emphasis: ["fill", "rooms"] },
  // Problem 4–10s
  { from: 125, to: 185, text: "Empty rooms. Unpredictable census.", emphasis: ["Empty", "rooms"] },
  { from: 188, to: 245, text: "No reliable pipeline of inquiries.", emphasis: ["reliable", "pipeline"] },
  { from: 248, to: 295, text: "Placement fees eating your margin.", emphasis: ["fees", "margin"] },
  // Solution 10–22s
  { from: 308, to: 390, text: "The Resident Growth System fixes this.", emphasis: ["Resident", "Growth", "System"] },
  { from: 393, to: 460, text: "Website funnel → qualified inquiries.", emphasis: ["funnel", "inquiries"] },
  { from: 463, to: 530, text: "Family quiz pre-qualifies every lead.", emphasis: ["pre-qualifies"] },
  { from: 533, to: 595, text: "AI follow-up. 24/7. No manual work.",  emphasis: ["AI", "24/7"] },
  { from: 598, to: 655, text: "CRM pipeline. Tour reminders. Done.",   emphasis: ["CRM", "Done"] },
  // CTA 22–30s
  { from: 668, to: 755, text: "Book a demo. See it in action.",       emphasis: ["Book", "demo"] },
  { from: 758, to: 875, text: "Fill your rooms — without agents.",    emphasis: ["Fill", "rooms"] },
];

// ─── SHARED PRIMITIVES ───────────────────────────────────────────────────────

// Word-by-word spring reveal
function WordReveal({
  text,
  startFrame,
  wordGap = 5,
  style,
  wordStyle,
  emphasisWords = [],
}: {
  text: string;
  startFrame: number;
  wordGap?: number;
  style?: React.CSSProperties;
  wordStyle?: React.CSSProperties;
  emphasisWords?: string[];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0 10px", ...style }}>
      {text.split(" ").map((word, i) => {
        const p = spring({
          fps,
          frame: frame - (startFrame + i * wordGap),
          config: { damping: 28, stiffness: 240, mass: 0.5 },
        });
        const isEm = emphasisWords.some(
          (e) => word.replace(/[.,!?:→]/g, "") === e
        );
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(p, [0, 0.25], [0, 1], {
                extrapolateRight: "clamp",
              }),
              transform: `translateY(${interpolate(p, [0, 1], [22, 0])}px)`,
              color: isEm ? C.gold : "inherit",
              fontWeight: isEm ? "bold" : "inherit",
              ...wordStyle,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

// Bold impact punch-in with spring overshoot
function ImpactText({
  text,
  startFrame,
  style,
  color = C.white,
}: {
  text: string;
  startFrame: number;
  style?: React.CSSProperties;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame: frame - startFrame,
    config: { damping: 9, stiffness: 310, mass: 1.15 },
  });
  const scale = interpolate(p, [0, 0.45, 0.78, 1], [0.55, 1.1, 0.96, 1.0]);
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity: interpolate(p, [0, 0.12], [0, 1], {
          extrapolateRight: "clamp",
        }),
        color,
        ...style,
      }}
    >
      {text}
    </div>
  );
}

// Gold underline that draws left-to-right
function DrawLine({
  startFrame,
  width = 120,
  color = C.gold,
}: {
  startFrame: number;
  width?: number;
  color?: string;
}) {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        height: 2,
        width: p * width,
        background: color,
        borderRadius: 2,
        marginTop: 12,
      }}
    />
  );
}

// Cinematic vignette
function Vignette({ strength = 0.55 }: { strength?: number }) {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 85% 85% at 50% 45%, transparent 28%, rgba(0,0,0,${strength}) 100%)`,
        pointerEvents: "none",
      }}
    />
  );
}

// Top gradient for overlay readability
function TopScrim({ opacity = 1 }: { opacity?: number }) {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.28) 24%, transparent 48%)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// Bottom gradient for caption readability
function BottomScrim({ opacity = 1 }: { opacity?: number }) {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 20%, transparent 42%)",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// OCCUPANCY INSTITUTE brand badge — top left
function BrandBadge({ startFrame = 0 }: { startFrame?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame: frame - startFrame,
    config: { damping: 22, stiffness: 160 },
  });
  return (
    <div
      style={{
        position: "absolute",
        top: 108,
        left: 56,
        opacity: interpolate(p, [0, 0.3], [0, 1], {
          extrapolateRight: "clamp",
        }),
        transform: `translateY(${interpolate(p, [0, 1], [-18, 0])}px)`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{ width: 3, height: 30, background: C.gold, borderRadius: 2 }}
      />
      <div
        style={{
          color: C.cream,
          fontSize: 24,
          fontFamily: "Georgia, serif",
          letterSpacing: 2.5,
          opacity: 0.92,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
        }}
      >
        OCCUPANCY INSTITUTE
      </div>
    </div>
  );
}

// ─── VIDEO BACKGROUND — loops the 10s source 3× with Ken Burns per section ──
function VideoBackground() {
  const frame = useCurrentFrame(); // absolute frame (root context)

  // Ken Burns: direction changes each section for visual variety
  let scale = 1.0;
  let tx = 0;
  let ty = 0;

  if (frame < 120) {
    // Hook: slow zoom in, centre
    const t = frame / 120;
    scale = interpolate(t, [0, 1], [1.0, 1.06]);
  } else if (frame < 300) {
    // Problem: hold, slight pan right
    const t = (frame - 120) / 180;
    scale = 1.055;
    tx = interpolate(t, [0, 1], [0, -18]);
  } else if (frame < 660) {
    // Solution: zoom out, pan back
    const t = (frame - 300) / 360;
    scale = interpolate(t, [0, 1], [1.06, 1.0]);
    tx = interpolate(t, [0, 1], [-18, 0]);
  } else {
    // CTA: zoom in tighter
    const t = (frame - 660) / 240;
    scale = interpolate(t, [0, 1], [1.0, 1.07]);
    ty = interpolate(t, [0, 1], [0, -12]);
  }

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          transformOrigin: "50% 45%",
        }}
      >
        {/* Loop 1: frames 0–299 */}
        <Sequence from={0} durationInFrames={SRC_FRAMES}>
          <OffthreadVideo
            src={staticFile("IMG_4308.mov")}
            startFrom={0}
            style={videoStyle}
            volume={0}
          />
        </Sequence>
        {/* Loop 2: frames 300–599 */}
        <Sequence from={SRC_FRAMES} durationInFrames={SRC_FRAMES}>
          <OffthreadVideo
            src={staticFile("IMG_4308.mov")}
            startFrom={0}
            style={videoStyle}
            volume={0}
          />
        </Sequence>
        {/* Loop 3: frames 600–899 */}
        <Sequence from={SRC_FRAMES * 2} durationInFrames={SRC_FRAMES}>
          <OffthreadVideo
            src={staticFile("IMG_4308.mov")}
            startFrom={0}
            style={videoStyle}
            volume={0}
          />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── CAPTION LAYER — scripted subtitles at the bottom ────────────────────────
function CaptionLayer() {
  const frame = useCurrentFrame(); // absolute frame
  const active = CAPTIONS.find((c) => frame >= c.from && frame <= c.to);
  if (!active) return null;

  const fadeIn = interpolate(frame, [active.from, active.from + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [active.to - 6, active.to],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 150,
        left: 44,
        right: 44,
        opacity: Math.min(fadeIn, fadeOut),
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 14px",
      }}
    >
      {active.text.split(" ").map((word, i) => {
        const isEm = (active.emphasis ?? []).includes(
          word.replace(/[.,!?:→]/g, "")
        );
        return (
          <span
            key={i}
            style={{
              fontSize: 50,
              fontFamily: "Georgia, serif",
              fontWeight: 700,
              color: isEm ? C.gold : C.white,
              textShadow:
                "0 2px 18px rgba(0,0,0,0.98), 0 0 8px rgba(0,0,0,1)",
              lineHeight: 1.3,
              letterSpacing: 0.2,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

// Thin gold progress bar
function ProgressBar() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "rgba(255,255,255,0.10)",
      }}
    >
      <div
        style={{
          width: `${(frame / durationInFrames) * 100}%`,
          height: "100%",
          background: C.gold,
          borderRadius: 2,
        }}
      />
    </div>
  );
}

// Bright flash at hard cut points (subtle — just a few frames)
function CutFlash({ atFrame }: { atFrame: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [atFrame, atFrame + 2, atFrame + 10],
    [0.28, 0.08, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return (
    <AbsoluteFill
      style={{
        background: `rgba(255,255,255,${opacity})`,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── HOOK SECTION  (0–4s, relative frames 0–119) ─────────────────────────────
function HookSection() {
  return (
    <AbsoluteFill>
      <Vignette strength={0.48} />
      <TopScrim />
      <BottomScrim />
      <BrandBadge startFrame={6} />

      {/* Centered impact headline */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 60px",
          paddingBottom: 240,
          textAlign: "center",
        }}
      >
        <ImpactText
          text="Still waiting on referrals"
          startFrame={8}
          style={{
            fontSize: 78,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            lineHeight: 1.15,
            textShadow: "0 4px 28px rgba(0,0,0,0.85)",
          }}
        />
        <ImpactText
          text="to fill your rooms?"
          startFrame={30}
          color={C.gold}
          style={{
            fontSize: 86,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            lineHeight: 1.15,
            marginTop: 6,
            textShadow: `0 0 70px rgba(201,168,76,0.55), 0 4px 28px rgba(0,0,0,0.85)`,
          }}
        />
        <DrawLine startFrame={52} width={340} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── PROBLEM SECTION  (4–10s, relative frames 0–179) ────────────────────────
function ProblemSection() {
  return (
    <AbsoluteFill>
      <Vignette strength={0.52} />
      <TopScrim />
      <BottomScrim />
      <BrandBadge startFrame={0} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "160px 64px 300px",
          gap: 36,
        }}
      >
        {/* Section label */}
        <WordReveal
          text="Sound familiar?"
          startFrame={4}
          wordGap={6}
          style={{ justifyContent: "flex-start" }}
          wordStyle={{
            fontSize: 38,
            fontFamily: "Georgia, serif",
            color: `${C.cream}bb`,
            letterSpacing: 1,
          }}
        />

        {/* Three pain points */}
        {[
          {
            text: "Empty rooms. Unpredictable census.",
            sf: 18,
            em: ["Empty", "rooms"],
          },
          {
            text: "No reliable pipeline of family inquiries.",
            sf: 68,
            em: ["reliable", "pipeline"],
          },
          {
            text: "Placement agents charging 30–50% in fees.",
            sf: 115,
            em: ["30–50%", "fees"],
          },
        ].map((item, i) => (
          <WordReveal
            key={i}
            text={item.text}
            startFrame={item.sf}
            wordGap={5}
            emphasisWords={item.em}
            style={{ justifyContent: "flex-start" }}
            wordStyle={{
              fontSize: 54,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              color: C.cream,
              textShadow: "0 2px 18px rgba(0,0,0,0.88)",
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── SOLUTION SECTION  (10–22s, relative frames 0–359) ───────────────────────
function SolutionSection() {
  return (
    <AbsoluteFill>
      <Vignette strength={0.5} />
      <TopScrim />
      <BottomScrim />
      <BrandBadge startFrame={0} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "160px 64px 300px",
        }}
      >
        {/* Title punch-in */}
        <div style={{ marginBottom: 52 }}>
          <ImpactText
            text="Resident Growth System"
            startFrame={6}
            color={C.gold}
            style={{
              fontSize: 68,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              textShadow: `0 0 60px rgba(201,168,76,0.5), 0 3px 20px rgba(0,0,0,0.88)`,
            }}
          />
          <DrawLine startFrame={20} width={520} />
        </div>

        {/* Feature list — staggered word reveals */}
        {[
          {
            n: "01",
            text: "Website funnel converts visitors into inquiries",
            sf: 38,
            em: ["converts"],
          },
          {
            n: "02",
            text: "Family quiz pre-qualifies every lead automatically",
            sf: 98,
            em: ["pre-qualifies"],
          },
          {
            n: "03",
            text: "AI follow-up nurtures families around the clock",
            sf: 158,
            em: ["AI", "follow-up"],
          },
          {
            n: "04",
            text: "CRM pipeline tracks every inquiry to move-in",
            sf: 218,
            em: ["CRM", "pipeline"],
          },
          {
            n: "05",
            text: "Tour reminders eliminate no-shows for good",
            sf: 278,
            em: ["eliminate", "no-shows"],
          },
        ].map((feat) => (
          <div
            key={feat.n}
            style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 30 }}
          >
            <WordReveal
              text={feat.n}
              startFrame={feat.sf}
              wordGap={0}
              wordStyle={{
                fontSize: 28,
                fontFamily: "Georgia, serif",
                color: C.gold,
                opacity: 0.7,
                minWidth: 44,
              }}
            />
            <WordReveal
              text={feat.text}
              startFrame={feat.sf + 2}
              wordGap={4}
              emphasisWords={feat.em}
              style={{ flex: 1 }}
              wordStyle={{
                fontSize: 42,
                fontFamily: "Georgia, serif",
                fontWeight: "bold",
                color: C.cream,
                textShadow: "0 2px 14px rgba(0,0,0,0.9)",
              }}
            />
          </div>
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── CTA SECTION  (22–30s, relative frames 0–239) ────────────────────────────
function CTASection() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const btnScale = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.6),
    [-1, 1],
    [0.985, 1.015]
  );

  return (
    <AbsoluteFill>
      <Vignette strength={0.62} />
      <TopScrim />
      <BottomScrim />
      <BrandBadge startFrame={0} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 280,
          paddingLeft: 56,
          paddingRight: 56,
          textAlign: "center",
        }}
      >
        {/* Main CTA — two-line impact */}
        <ImpactText
          text="Book a demo."
          startFrame={8}
          color={C.gold}
          style={{
            fontSize: 112,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            textShadow: `0 0 90px rgba(201,168,76,0.65), 0 4px 32px rgba(0,0,0,0.92)`,
            marginBottom: 4,
          }}
        />
        <ImpactText
          text="See how it works."
          startFrame={26}
          style={{
            fontSize: 70,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            textShadow: "0 3px 24px rgba(0,0,0,0.88)",
            marginBottom: 60,
          }}
        />

        {/* Sub-line — word reveal */}
        <WordReveal
          text="Fill your rooms — without placement agents."
          startFrame={48}
          wordGap={5}
          emphasisWords={["Fill", "rooms"]}
          style={{ justifyContent: "center", marginBottom: 56 }}
          wordStyle={{
            fontSize: 40,
            fontFamily: "Georgia, serif",
            color: `${C.cream}dd`,
            textShadow: "0 2px 14px rgba(0,0,0,0.85)",
          }}
        />

        {/* URL pill — pulsing */}
        <div
          style={{
            opacity: interpolate(frame, [64, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            transform: `scale(${btnScale})`,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldLight})`,
              color: C.navy,
              fontSize: 38,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              padding: "28px 72px",
              borderRadius: 100,
              boxShadow: `0 8px 52px rgba(201,168,76,0.55), 0 2px 14px rgba(0,0,0,0.45)`,
              letterSpacing: 0.5,
            }}
          >
            occupancyinstitute.com
          </div>
        </div>

        <DrawLine startFrame={90} width={180} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── ROOT COMPOSITION ────────────────────────────────────────────────────────
export const OccupancyInstitute: React.FC = () => {
  const { fps } = useVideoConfig();
  const HOOK_START = 0;
  const PROB_START = 4 * fps;   // 120
  const SOL_START  = 10 * fps;  // 300
  const CTA_START  = 22 * fps;  // 660
  const TOTAL      = 30 * fps;  // 900

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: "Georgia, serif" }}>
      {/* ── LAYER 1: Video + Ken Burns (loops the 10s source 3×) ── */}
      <VideoBackground />

      {/* ── LAYER 2: Section overlays (scrims + animated text) ── */}
      <Sequence from={HOOK_START} durationInFrames={PROB_START - HOOK_START}>
        <HookSection />
      </Sequence>

      <Sequence from={PROB_START} durationInFrames={SOL_START - PROB_START}>
        <ProblemSection />
      </Sequence>

      <Sequence from={SOL_START} durationInFrames={CTA_START - SOL_START}>
        <SolutionSection />
      </Sequence>

      <Sequence from={CTA_START} durationInFrames={TOTAL - CTA_START}>
        <CTASection />
      </Sequence>

      {/* ── LAYER 3: Global HUD — captions, progress, flashes ── */}
      <CaptionLayer />
      <ProgressBar />

      {/* Subtle white flash at each section cut */}
      <CutFlash atFrame={PROB_START} />
      <CutFlash atFrame={SOL_START} />
      <CutFlash atFrame={CTA_START} />
    </AbsoluteFill>
  );
};
