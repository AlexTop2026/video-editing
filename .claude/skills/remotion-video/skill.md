# /remotion-video — Create Professional Video Ads with Remotion

You are a Remotion video production expert. When the user invokes `/remotion-video`, follow this complete workflow to create professional video ads using React and Remotion.

---

## Project Context

- **Entry point**: `src/index.ts` → registers `src/Root.tsx`
- **Compositions**: `src/compositions/` — one file per video
- **Root registry**: `src/Root.tsx` — all `<Composition>` elements live here
- **Preview**: `npx remotion studio`
- **Render**: `npx remotion render <CompositionId> out/<name>.mp4`
- **Default format**: 1080×1920 vertical (Instagram Reels, TikTok, YouTube Shorts)

---

## Workflow

### Step 1 — Gather Requirements

Ask the user (or use what they've already described):
- **Concept**: What is the video about?
- **Audience**: Who is it for?
- **Sections**: Hook → Problem → Solution → CTA (or custom)
- **Duration**: Total seconds (default: 30s = 900 frames at 30fps)
- **Style**: Colors, fonts, mood
- **Format**: Width × Height (default: 1080×1920 vertical)

### Step 2 — Plan the Composition

Break the video into timed sections. Example for a 30s ad:
| Section   | Time    | Frames (30fps) | Purpose                        |
|-----------|---------|----------------|--------------------------------|
| Hook      | 0–4s    | 0–120          | Grab attention with bold claim |
| Problem   | 4–10s   | 120–300        | Agitate the pain point         |
| Solution  | 10–22s  | 300–660        | Present your product/service   |
| CTA       | 22–30s  | 660–900        | Drive action                   |

### Step 3 — Create the Composition File

Create `src/compositions/<CompositionName>.tsx` using these Remotion primitives:

```tsx
import {
  AbsoluteFill,   // full-screen layer (position: absolute, width/height: 100%)
  Sequence,       // time-based rendering (from + durationInFrames)
  useCurrentFrame,   // current frame number (0-indexed)
  useVideoConfig,    // { fps, width, height, durationInFrames }
  interpolate,    // map frame range → value range with easing
  spring,         // physics-based spring animation
} from "remotion";
```

#### Key patterns:

**Fade in:**
```tsx
const opacity = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
});
```

**Slide up with spring:**
```tsx
const progress = spring({ fps, frame: frame - startFrame, config: { damping: 18, stiffness: 120 } });
const y = interpolate(progress, [0, 1], [60, 0]);
```

**Section timing with Sequence:**
```tsx
<Sequence from={0} durationInFrames={120}>
  <HookSection />
</Sequence>
<Sequence from={120} durationInFrames={180}>
  <ProblemSection />
</Sequence>
```

**Background gradient:**
```tsx
<AbsoluteFill style={{ background: "linear-gradient(175deg, #1a2744 0%, #0d1829 100%)" }} />
```

#### Style guidelines for professional ads:
- Use `AbsoluteFill` for every full-screen layer
- All text via inline `style` (no CSS files needed)
- Use `position: "absolute"` for overlapping elements
- Serif fonts (`Georgia, serif`) for premium feel
- Animate `opacity` + `transform` for smooth motion
- Add glow/shadow with `textShadow` and `boxShadow`
- Cross-fade between sections using a black/navy overlay `Sequence`

### Step 4 — Register in Root.tsx

Add the new composition to `src/Root.tsx`:

```tsx
import { YourComposition } from "./compositions/YourComposition";

export const Root: React.FC = () => (
  <>
    <Composition
      id="YourCompositionId"      // used in render command
      component={YourComposition}
      durationInFrames={900}      // 30s × 30fps
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  </>
);
```

### Step 5 — Preview

```bash
npx remotion studio
```

Opens Remotion Studio at `http://localhost:3000`. You can:
- Scrub through the timeline
- Inspect individual frames
- Live-edit React code (hot reload)

### Step 6 — Render to MP4

```bash
# Render a specific composition
npx remotion render OccupancyInstitute out/occupancy-institute.mp4

# With custom quality
npx remotion render OccupancyInstitute out/output.mp4 --codec=h264 --crf=18

# Render specific frame range
npx remotion render OccupancyInstitute out/output.mp4 --frames=0-90
```

Output lands in `out/` (gitignored by default).

---

## Standard Color Palettes

### Healthcare / Assisted Living (current project)
```
Navy:   #1a2744   Navy Light: #243459
Cream:  #f5f0e8   Gold:       #c9a84c
Green:  #5a8a6e   Gold Light: #e0c068
```

### SaaS / Tech
```
Dark:   #0f172a   Blue:   #3b82f6
White:  #f8fafc   Accent: #8b5cf6
```

### Wellness / Health
```
Dark:   #1a2e1a   Green:  #4ade80
Cream:  #fefce8   Warm:   #f59e0b
```

---

## Supported Video Formats

| Format              | Width | Height | FPS | Use case                          |
|---------------------|-------|--------|-----|-----------------------------------|
| Vertical (default)  | 1080  | 1920   | 30  | Instagram Reels, TikTok, YT Shorts|
| Square              | 1080  | 1080   | 30  | Instagram Feed, Facebook          |
| Landscape           | 1920  | 1080   | 30  | YouTube, LinkedIn, TV             |
| Landscape (60fps)   | 1920  | 1080   | 60  | YouTube Premium, gaming           |

---

## Common Animation Recipes

### Staggered list items
```tsx
{items.map((item, i) => {
  const progress = spring({ fps, frame: frame - (i * 15), config: { damping: 18, stiffness: 120 } });
  return (
    <div key={i} style={{ opacity: progress, transform: `translateY(${interpolate(progress, [0,1], [40,0])}px)` }}>
      {item}
    </div>
  );
})}
```

### Counter animation
```tsx
const value = Math.floor(interpolate(frame, [0, 60], [0, 100], { extrapolateRight: "clamp" }));
```

### Scale pulse
```tsx
const scale = interpolate(Math.sin((frame / fps) * Math.PI * 2), [-1, 1], [0.97, 1.03]);
```

### Typewriter effect
```tsx
const chars = Math.floor(interpolate(frame, [0, 60], [0, text.length], { extrapolateRight: "clamp" }));
const visible = text.slice(0, chars);
```

---

## File Structure Reference

```
video-editing/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # registerRoot entry point
│   ├── Root.tsx                    # <Composition> registry
│   └── compositions/
│       ├── OccupancyInstitute.tsx  # 30s vertical ad (existing)
│       └── YourNextVideo.tsx       # add new videos here
├── out/                            # rendered MP4s (gitignored)
└── .claude/
    └── skills/
        └── remotion-video/
            └── skill.md            # this file
```

---

## Rendering Environment Notes

| Environment          | Preview (`studio`) | Render to MP4        |
|----------------------|--------------------|----------------------|
| Claude Code Web      | No (no browser UI) | Yes via CLI          |
| GitHub Codespaces    | Yes (port forward) | Yes                  |
| Replit               | Yes (webview)      | Yes                  |
| Local machine        | Yes                | Yes (fastest)        |

**To render on Claude Code Web / headless:**
```bash
npx remotion render OccupancyInstitute out/occupancy-institute.mp4
```
No browser needed — renders headlessly using Puppeteer.

**To preview in Codespaces/Replit:**
```bash
npx remotion studio
# Forward port 3000 to your browser
```

---

## Quick Reference

```bash
# Preview
npx remotion studio

# Render (composition ID from Root.tsx)
npx remotion render OccupancyInstitute out/occupancy-institute.mp4

# List all compositions
npx remotion compositions src/index.ts

# Check for TypeScript errors
npx tsc --noEmit
```
