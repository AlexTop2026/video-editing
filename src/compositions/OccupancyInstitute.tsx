import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

const COLORS = {
  navy: "#1a2744",
  navyLight: "#243459",
  cream: "#f5f0e8",
  gold: "#c9a84c",
  goldLight: "#e0c068",
  green: "#5a8a6e",
  greenLight: "#6fa882",
  white: "#ffffff",
  overlay: "rgba(26, 39, 68, 0.85)",
};

const FPS = 30;
const W = 1080;
const H = 1920;

// Smooth fade-in helper
function useFadeIn(startFrame: number, durationFrames = 20) {
  const frame = useCurrentFrame();
  return interpolate(frame - startFrame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// Spring-based slide up
function useSlideUp(startFrame: number, fps: number) {
  const frame = useCurrentFrame();
  const progress = spring({
    fps,
    frame: frame - startFrame,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });
  const y = interpolate(progress, [0, 1], [60, 0]);
  const opacity = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  return { y, opacity };
}

// Background gradient
function Background({ variant = "navy" }: { variant?: "navy" | "green" | "cta" }) {
  const gradients = {
    navy: `linear-gradient(175deg, ${COLORS.navyLight} 0%, ${COLORS.navy} 60%, #0d1829 100%)`,
    green: `linear-gradient(175deg, ${COLORS.navy} 0%, #1e3d2f 60%, #0d2218 100%)`,
    cta: `linear-gradient(175deg, ${COLORS.navyLight} 0%, ${COLORS.navy} 40%, #2a1a44 100%)`,
  };
  return (
    <AbsoluteFill style={{ background: gradients[variant] }} />
  );
}

// Decorative gold accent line
function GoldLine({ top, opacity = 1 }: { top: number; opacity?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 60,
        right: 60,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        opacity,
      }}
    />
  );
}

// Small label pill
function Label({ text, color = COLORS.gold }: { text: string; color?: string }) {
  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 28px",
        background: `${color}22`,
        border: `1.5px solid ${color}`,
        borderRadius: 100,
        color: color,
        fontSize: 28,
        fontFamily: "Georgia, serif",
        letterSpacing: 3,
        textTransform: "uppercase" as const,
      }}
    >
      {text}
    </div>
  );
}

// ─── HOOK SECTION (0–4s, frames 0–120) ──────────────────────────────────────
function HookSection() {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const labelSlide = useSlideUp(0, fps);
  const line1Slide = useSlideUp(8, fps);
  const line2Slide = useSlideUp(18, fps);
  const line3Slide = useSlideUp(28, fps);
  const subSlide = useSlideUp(45, fps);

  // Pulse on the question mark
  const pulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 2),
    [-1, 1],
    [0.95, 1.05]
  );

  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Ambient circle glow */}
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}18 0%, transparent 70%)`,
          top: H * 0.15,
          left: W / 2 - 350,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 72px",
        }}
      >
        {/* Label */}
        <div
          style={{
            transform: `translateY(${labelSlide.y}px)`,
            opacity: labelSlide.opacity,
            marginBottom: 56,
          }}
        >
          <Label text="Occupancy Institute" />
        </div>

        {/* Headline */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          {[
            { text: "Still waiting on", delay: 8 },
            { text: "referrals to fill", delay: 18 },
            { text: "your rooms?", delay: 28, gold: true, pulse: true },
          ].map((line, i) => {
            const slides = [line1Slide, line2Slide, line3Slide][i];
            return (
              <div
                key={i}
                style={{
                  transform: `translateY(${slides.y}px) scale(${line.pulse ? pulse : 1})`,
                  opacity: slides.opacity,
                  color: line.gold ? COLORS.gold : COLORS.cream,
                  fontSize: line.gold ? 92 : 88,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: "bold",
                  lineHeight: 1.15,
                  textShadow: line.gold ? `0 0 40px ${COLORS.gold}66` : "none",
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>

        <GoldLine top={0} opacity={0} />

        {/* Sub-line */}
        <div
          style={{
            transform: `translateY(${subSlide.y}px)`,
            opacity: subSlide.opacity,
            color: `${COLORS.cream}99`,
            fontSize: 34,
            fontFamily: "Georgia, serif",
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          You're not alone — and there's a better way.
        </div>
      </AbsoluteFill>

      {/* Bottom decorative line */}
      <div style={{ position: "absolute", bottom: 120 }}>
        <GoldLine top={0} opacity={interpolate(frame, [60, 90], [0, 0.4], { extrapolateRight: "clamp" })} />
      </div>
    </AbsoluteFill>
  );
}

// ─── PROBLEM SECTION (4–10s, frames 120–300) ─────────────────────────────────
function ProblemItem({
  icon,
  title,
  subtitle,
  startFrame,
  fps,
}: {
  icon: string;
  title: string;
  subtitle: string;
  startFrame: number;
  fps: number;
}) {
  const slide = useSlideUp(startFrame, fps);
  return (
    <div
      style={{
        transform: `translateY(${slide.y}px)`,
        opacity: slide.opacity,
        display: "flex",
        alignItems: "flex-start",
        gap: 28,
        padding: "36px 44px",
        background: `${COLORS.cream}08`,
        border: `1px solid ${COLORS.cream}18`,
        borderRadius: 20,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontSize: 52,
          lineHeight: 1,
          filter: "grayscale(0.2)",
          flexShrink: 0,
          marginTop: 4,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            color: COLORS.cream,
            fontSize: 40,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: `${COLORS.cream}88`,
            fontSize: 30,
            fontFamily: "Georgia, serif",
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  const { fps } = useVideoConfig();
  const headerSlide = useSlideUp(0, fps);

  return (
    <AbsoluteFill>
      <Background variant="navy" />

      {/* Dark overlay stripe */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
        }}
      >
        {/* Section header */}
        <div
          style={{
            transform: `translateY(${headerSlide.y}px)`,
            opacity: headerSlide.opacity,
            marginBottom: 52,
            textAlign: "center",
          }}
        >
          <Label text="The Problem" color={`${COLORS.cream}cc`} />
          <div
            style={{
              color: COLORS.cream,
              fontSize: 62,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              marginTop: 24,
              lineHeight: 1.2,
            }}
          >
            Sound familiar?
          </div>
        </div>

        <ProblemItem
          icon="🚪"
          title="Empty rooms"
          subtitle="Census stays unpredictable month after month"
          startFrame={12}
          fps={fps}
        />
        <ProblemItem
          icon="📉"
          title="Inconsistent inquiries"
          subtitle="No reliable pipeline of qualified families"
          startFrame={28}
          fps={fps}
        />
        <ProblemItem
          icon="🤝"
          title="Placement agents"
          subtitle="Paying 30–50% fees with zero control"
          startFrame={44}
          fps={fps}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── SOLUTION SECTION (10–22s, frames 300–660) ────────────────────────────────
function FeatureItem({
  icon,
  title,
  desc,
  startFrame,
  fps,
  accent = COLORS.gold,
}: {
  icon: string;
  title: string;
  desc: string;
  startFrame: number;
  fps: number;
  accent?: string;
}) {
  const slide = useSlideUp(startFrame, fps);
  return (
    <div
      style={{
        transform: `translateY(${slide.y}px)`,
        opacity: slide.opacity,
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        marginBottom: 30,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: `${accent}22`,
          border: `1.5px solid ${accent}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: COLORS.cream,
            fontSize: 36,
            fontFamily: "Georgia, serif",
            fontWeight: "bold",
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: `${COLORS.cream}99`,
            fontSize: 28,
            fontFamily: "Georgia, serif",
            lineHeight: 1.4,
            marginTop: 4,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

function SolutionSection() {
  const { fps } = useVideoConfig();
  const headerSlide = useSlideUp(0, fps);
  const badgeSlide = useSlideUp(6, fps);
  const frame = useCurrentFrame();

  const glowOpacity = interpolate(
    Math.sin((frame / fps) * Math.PI),
    [-1, 1],
    [0.3, 0.6]
  );

  return (
    <AbsoluteFill>
      <Background variant="green" />

      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.green}44 0%, transparent 70%)`,
          top: 200,
          right: -200,
          opacity: glowOpacity,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 72px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            transform: `translateY(${badgeSlide.y}px)`,
            opacity: badgeSlide.opacity,
            marginBottom: 28,
          }}
        >
          <Label text="The Solution" color={COLORS.greenLight} />
        </div>

        {/* Title */}
        <div
          style={{
            transform: `translateY(${headerSlide.y}px)`,
            opacity: headerSlide.opacity,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              color: COLORS.gold,
              fontSize: 64,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              lineHeight: 1.15,
              textShadow: `0 0 60px ${COLORS.gold}44`,
            }}
          >
            Resident Growth
          </div>
          <div
            style={{
              color: COLORS.cream,
              fontSize: 64,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              lineHeight: 1.15,
            }}
          >
            System
          </div>
          <div
            style={{
              width: 80,
              height: 3,
              background: COLORS.gold,
              borderRadius: 2,
              marginTop: 16,
            }}
          />
        </div>

        <FeatureItem
          icon="🌐"
          title="Website Funnel"
          desc="Converts visitors into qualified inquiries"
          startFrame={20}
          fps={fps}
          accent={COLORS.gold}
        />
        <FeatureItem
          icon="📋"
          title="Family Quiz"
          desc="Pre-qualifies leads before your team calls"
          startFrame={36}
          fps={fps}
          accent={COLORS.goldLight}
        />
        <FeatureItem
          icon="🤖"
          title="AI Follow-Up"
          desc="Nurtures families 24/7 — automatically"
          startFrame={52}
          fps={fps}
          accent={COLORS.greenLight}
        />
        <FeatureItem
          icon="📊"
          title="CRM Pipeline"
          desc="Track every lead from inquiry to move-in"
          startFrame={68}
          fps={fps}
          accent={COLORS.gold}
        />
        <FeatureItem
          icon="🗓️"
          title="Tour Reminders"
          desc="Reduce no-shows and keep momentum"
          startFrame={84}
          fps={fps}
          accent={COLORS.greenLight}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ─── CTA SECTION (22–30s, frames 660–900) ────────────────────────────────────
function CTASection() {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  const titleSlide = useSlideUp(0, fps);
  const subSlide = useSlideUp(14, fps);
  const btnSlide = useSlideUp(24, fps);
  const logoSlide = useSlideUp(38, fps);

  // Subtle pulsing button
  const btnScale = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.5),
    [-1, 1],
    [0.97, 1.03]
  );

  const glowOpacity = interpolate(frame, [0, 30, 60, 90, 120], [0, 0.6, 0.4, 0.6, 0.4]);

  return (
    <AbsoluteFill>
      <Background variant="cta" />

      {/* Gold glow center */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}1a 0%, transparent 70%)`,
          top: H / 2 - 400,
          left: W / 2 - 400,
          opacity: glowOpacity,
        }}
      />

      {/* Top accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 72px",
          textAlign: "center",
        }}
      >
        {/* Main CTA Text */}
        <div
          style={{
            transform: `translateY(${titleSlide.y}px)`,
            opacity: titleSlide.opacity,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              color: COLORS.cream,
              fontSize: 72,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            Book a demo and see
          </div>
          <div
            style={{
              color: COLORS.cream,
              fontSize: 72,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              lineHeight: 1.2,
              marginBottom: 12,
            }}
          >
            how the
          </div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 76,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              lineHeight: 1.2,
              textShadow: `0 0 60px ${COLORS.gold}55`,
            }}
          >
            Resident Growth
          </div>
          <div
            style={{
              color: COLORS.gold,
              fontSize: 76,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              lineHeight: 1.2,
              textShadow: `0 0 60px ${COLORS.gold}55`,
            }}
          >
            System works.
          </div>
        </div>

        {/* Sub-copy */}
        <div
          style={{
            transform: `translateY(${subSlide.y}px)`,
            opacity: subSlide.opacity,
            color: `${COLORS.cream}bb`,
            fontSize: 34,
            fontFamily: "Georgia, serif",
            lineHeight: 1.5,
            marginBottom: 64,
            maxWidth: 800,
          }}
        >
          Fill your rooms with qualified residents — without placement agents.
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `translateY(${btnSlide.y}px) scale(${btnScale})`,
            opacity: btnSlide.opacity,
            marginBottom: 72,
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
              color: COLORS.navy,
              fontSize: 38,
              fontFamily: "Georgia, serif",
              fontWeight: "bold",
              padding: "32px 80px",
              borderRadius: 100,
              boxShadow: `0 8px 40px ${COLORS.gold}44, 0 2px 8px rgba(0,0,0,0.3)`,
              letterSpacing: 0.5,
            }}
          >
            Book Your Free Demo
          </div>
        </div>

        <GoldLine top={0} opacity={0} />

        {/* Logo / Brand */}
        <div
          style={{
            transform: `translateY(${logoSlide.y}px)`,
            opacity: logoSlide.opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 48,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            }}
          />
          <div
            style={{
              color: `${COLORS.cream}cc`,
              fontSize: 30,
              fontFamily: "Georgia, serif",
              letterSpacing: 3,
              textTransform: "uppercase" as const,
            }}
          >
            Occupancy Institute
          </div>
          <div
            style={{
              color: `${COLORS.cream}66`,
              fontSize: 24,
              fontFamily: "Georgia, serif",
              letterSpacing: 1,
            }}
          >
            occupancyinstitute.com
          </div>
        </div>
      </AbsoluteFill>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
}

// ─── TRANSITION OVERLAY ───────────────────────────────────────────────────────
function FadeTransition({ startFrame, endFrame }: { startFrame: number; endFrame: number }) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        background: COLORS.navy,
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

// ─── ROOT COMPOSITION ─────────────────────────────────────────────────────────
export const OccupancyInstitute: React.FC = () => {
  const { fps } = useVideoConfig();

  // Section timings (frames at 30fps)
  const HOOK_START = 0;
  const HOOK_END = 4 * fps;       // frame 120
  const PROB_START = 4 * fps;     // frame 120
  const PROB_END = 10 * fps;      // frame 300
  const SOL_START = 10 * fps;     // frame 300
  const SOL_END = 22 * fps;       // frame 660
  const CTA_START = 22 * fps;     // frame 660
  const TOTAL = 30 * fps;         // frame 900

  return (
    <AbsoluteFill style={{ background: COLORS.navy, fontFamily: "Georgia, serif" }}>
      {/* HOOK */}
      <Sequence from={HOOK_START} durationInFrames={HOOK_END - HOOK_START + 15}>
        <HookSection />
      </Sequence>

      {/* PROBLEM */}
      <Sequence from={PROB_START} durationInFrames={PROB_END - PROB_START + 15}>
        <ProblemSection />
      </Sequence>

      {/* SOLUTION */}
      <Sequence from={SOL_START} durationInFrames={SOL_END - SOL_START + 15}>
        <SolutionSection />
      </Sequence>

      {/* CTA */}
      <Sequence from={CTA_START} durationInFrames={TOTAL - CTA_START}>
        <CTASection />
      </Sequence>

      {/* Cross-fade transitions */}
      <Sequence from={HOOK_END - 8} durationInFrames={16}>
        <FadeTransition startFrame={0} endFrame={8} />
      </Sequence>
      <Sequence from={PROB_END - 8} durationInFrames={16}>
        <FadeTransition startFrame={0} endFrame={8} />
      </Sequence>
      <Sequence from={SOL_END - 8} durationInFrames={16}>
        <FadeTransition startFrame={0} endFrame={8} />
      </Sequence>
    </AbsoluteFill>
  );
};
