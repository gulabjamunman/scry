import { useMemo, useState, useRef, useEffect } from "react";
import type { Article } from "@/lib/types";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface ColorScheme {
  bg: string;
  underline: string;
  label: string;
  dot: string;
}

interface HighlightEntry {
  phrase: string;
  section: string;
  reason: string;
  color: ColorScheme;
}

interface Segment {
  type: "text" | "highlight";
  text: string;
  entry?: HighlightEntry;
}

// ─────────────────────────────────────────────
// SECTION → COLOUR MAP
// ─────────────────────────────────────────────

const SECTION_COLORS: Record<string, ColorScheme> = {
  "LANGUAGE INTENSITY": {
    bg: "rgba(245, 158, 11, 0.12)",
    underline: "#f59e0b",
    dot: "#f59e0b",
    label: "LANGUAGE INTENSITY",
  },
  "EMOTIONAL TRIGGERS": {
    bg: "rgba(239, 68, 68, 0.10)",
    underline: "#ef4444",
    dot: "#ef4444",
    label: "EMOTIONAL TRIGGER",
  },
  "FRAMING": {
    bg: "rgba(59, 130, 246, 0.10)",
    underline: "#3b82f6",
    dot: "#3b82f6",
    label: "FRAMING",
  },
  "SENSATIONALISM": {
    bg: "rgba(249, 115, 22, 0.10)",
    underline: "#f97316",
    dot: "#f97316",
    label: "SENSATIONALISM",
  },
  "SOCIAL AND IDENTITY CUES": {
    bg: "rgba(234, 179, 8, 0.12)",
    underline: "#eab308",
    dot: "#eab308",
    label: "SOCIAL & IDENTITY",
  },
  "SOCIAL & IDENTITY CUES": {
    bg: "rgba(234, 179, 8, 0.12)",
    underline: "#eab308",
    dot: "#eab308",
    label: "SOCIAL & IDENTITY",
  },
  "MOTIVATION AND ACTION SIGNALS": {
    bg: "rgba(168, 85, 247, 0.10)",
    underline: "#a855f7",
    dot: "#a855f7",
    label: "MOTIVATION & ACTION",
  },
  "MOTIVATION & ACTION SIGNALS": {
    bg: "rgba(168, 85, 247, 0.10)",
    underline: "#a855f7",
    dot: "#a855f7",
    label: "MOTIVATION & ACTION",
  },
  "ATTENTION AND SALIENCE": {
    bg: "rgba(16, 185, 129, 0.10)",
    underline: "#10b981",
    dot: "#10b981",
    label: "ATTENTION & SALIENCE",
  },
  "ATTENTION & SALIENCE": {
    bg: "rgba(16, 185, 129, 0.10)",
    underline: "#10b981",
    dot: "#10b981",
    label: "ATTENTION & SALIENCE",
  },
  "OVERALL INTERPRETATION": {
    bg: "rgba(99, 102, 241, 0.10)",
    underline: "#6366f1",
    dot: "#6366f1",
    label: "OVERALL",
  },
  "OVERALL BEHAVIOURAL INTERPRETATION": {
    bg: "rgba(99, 102, 241, 0.10)",
    underline: "#6366f1",
    dot: "#6366f1",
    label: "OVERALL",
  },
};

const FALLBACK_COLOR: ColorScheme = {
  bg: "rgba(148, 163, 184, 0.10)",
  underline: "#94a3b8",
  dot: "#94a3b8",
  label: "FLAGGED",
};

// ─────────────────────────────────────────────
// PARSER
// ─────────────────────────────────────────────

const SECTION_PATTERN = new RegExp(
  `(FRAMING|LANGUAGE INTENSITY|SENSATIONALISM|OVERALL INTERPRETATION|` +
  `ATTENTION AND SALIENCE|ATTENTION & SALIENCE|EMOTIONAL TRIGGERS|` +
  `SOCIAL & IDENTITY CUES|SOCIAL AND IDENTITY CUES|MOTIVATION & ACTION SIGNALS|` +
  `MOTIVATION AND ACTION SIGNALS|OVERALL BEHAVIOURAL INTERPRETATION)`,
  "g"
);

function splitIntoSections(text: string): { section: string; body: string }[] {
  const parts = text.split(SECTION_PATTERN);
  const result: { section: string; body: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    result.push({ section: parts[i].trim(), body: (parts[i + 1] || "").trim() });
  }
  return result;
}

function extractQuotedPhrases(body: string): string[] {
  const matches: string[] = [];

  // Explicit Unicode escapes to avoid encoding issues in the source file.
  // \u201c = \u201d = curly double quotes (GPT\u2019s default output)
  // \u2018 = \u2019 = curly single quotes
  // \u0022 = straight double  \u0027 = straight single
  const OPEN  = "[\u201c\u2018\u0022\u0027]";
  const CLOSE = "[\u201d\u2019\u0022\u0027]";
  const re = new RegExp(
    OPEN + "([^\u201c\u201d\u2018\u2019\u0022\u0027]{2,60})" + CLOSE,
    "g"
  );

  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const phrase = m[1].trim();
    if (phrase.length >= 2) matches.push(phrase);
  }
  return matches;
}

// Extract a short contextual reason — the clause immediately surrounding
// where the phrase is mentioned in the analysis text.
function extractReason(phrase: string, body: string): string {
  const lower = phrase.toLowerCase();
  const idx = body.toLowerCase().indexOf(lower);

  if (idx === -1) {
    // Phrase is paraphrased — return the first sentence of the section
    const stop = body.search(/[.!?]/);
    return stop > 0 ? body.slice(0, stop).trim() : body.slice(0, 120).trim();
  }

  // Walk back to the nearest sentence boundary
  let start = idx;
  while (start > 0 && !/[.!?\n]/.test(body[start - 1])) start--;

  // Walk forward to the end of that sentence
  const afterPhrase = body.slice(idx + phrase.length);
  const stopMatch = afterPhrase.search(/[.!?\n]/);
  const end = idx + phrase.length + (stopMatch >= 0 ? stopMatch : Math.min(120, afterPhrase.length));

  let snippet = body.slice(start, end).trim();

  // Trim to 160 chars max at a word boundary
  if (snippet.length > 160) {
    snippet = snippet.slice(0, 160).replace(/\s\S+$/, "") + "…";
  }

  return snippet;
}

function parseHighlights(analysisText: string): HighlightEntry[] {
  if (!analysisText) return [];
  const sections = splitIntoSections(analysisText);
  const seen = new Set<string>();
  const entries: HighlightEntry[] = [];

  for (const { section, body } of sections) {
    const color = SECTION_COLORS[section] || FALLBACK_COLOR;
    const phrases = extractQuotedPhrases(body);

    for (const phrase of phrases) {
      const key = phrase.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({ phrase, section, reason: extractReason(phrase, body), color });
    }
  }

  return entries;
}

// ─────────────────────────────────────────────
// SEGMENTER
// ─────────────────────────────────────────────

function buildSegments(content: string, highlights: HighlightEntry[]): Segment[] {
  if (!highlights.length) return [{ type: "text", text: content }];

  const sorted = [...highlights].sort((a, b) => b.phrase.length - a.phrase.length);
  const matches: { start: number; end: number; entry: HighlightEntry }[] = [];

  for (const entry of sorted) {
    const escaped = entry.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(escaped, "gi");
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (!matches.some(ex => start < ex.end && end > ex.start)) {
        matches.push({ start, end, entry });
      }
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const segments: Segment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ type: "text", text: content.slice(cursor, match.start) });
    }
    segments.push({ type: "highlight", text: content.slice(match.start, match.end), entry: match.entry });
    cursor = match.end;
  }
  if (cursor < content.length) segments.push({ type: "text", text: content.slice(cursor) });

  return segments;
}

// ─────────────────────────────────────────────
// TOOLTIP
// ─────────────────────────────────────────────

function PhraseTooltip({ entry, children }: { entry: HighlightEntry; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<"above" | "below">("above");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos(rect.top < 160 ? "below" : "above");
    }
  }, [open]);

  return (
    <span
      ref={ref}
      style={{ position: "relative", display: "inline" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          style={{
            position: "absolute",
            ...(pos === "above" ? { bottom: "calc(100% + 10px)" } : { top: "calc(100% + 10px)" }),
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ffffff",
            borderRadius: "8px",
            padding: "10px 13px",
            width: "240px",
            zIndex: 100,
            boxShadow: "0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
            pointerEvents: "none",
          }}
        >
          {/* ALL CAPS coloured label — matches section headers on the page */}
          <span
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color: entry.color.underline,
              fontFamily: "system-ui, sans-serif",
              marginBottom: "5px",
            }}
          >
            {entry.color.label}
          </span>

          {/* Short contextual reason */}
          <span
            style={{
              display: "block",
              fontSize: "12px",
              lineHeight: "1.55",
              color: "#64748b",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {entry.reason}
          </span>

          {/* Caret arrow */}
          <span
            style={{
              position: "absolute",
              ...(pos === "above"
                ? { bottom: -5, borderTop: "none", borderLeft: "none" }
                : { top: -5, borderBottom: "none", borderRight: "none" }),
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 8,
              height: 8,
              background: "#ffffff",
              border: "1px solid #e2e8f0",
            }}
          />
        </span>
      )}
    </span>
  );
}

// ─────────────────────────────────────────────
// LEGEND
// ─────────────────────────────────────────────

function Legend({ activeSections }: { activeSections: Set<string> }) {
  const shown = Object.entries(SECTION_COLORS).filter(([key]) => activeSections.has(key));
  if (!shown.length) return null;

  const seen = new Set<string>();
  const unique = shown.filter(([, c]) => {
    if (seen.has(c.label)) return false;
    seen.add(c.label);
    return true;
  });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", marginBottom: "14px" }}>
      {unique.map(([, color]) => (
        <span
          key={color.label}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.05em",
            color: "#64748b",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color.dot,
              flexShrink: 0,
            }}
          />
          {color.label}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

interface Props {
  article: Article;
}

export function ArticleHighlighter({ article }: Props) {
  const highlights = useMemo(() => {
    const fromBias = parseHighlights(article.biasExplanation || "");
    const fromBehaviour = parseHighlights(article.behaviouralAnalysis || "");

    const seen = new Set<string>();
    const merged: HighlightEntry[] = [];
    for (const h of [...fromBias, ...fromBehaviour]) {
      const key = h.phrase.toLowerCase();
      if (!seen.has(key)) { seen.add(key); merged.push(h); }
    }
    return merged;
  }, [article.biasExplanation, article.behaviouralAnalysis]);

  const segments = useMemo(
    () => buildSegments(article.content || "", highlights),
    [article.content, highlights]
  );

  const activeSections = useMemo(
    () => new Set(highlights.map(h => h.section)),
    [highlights]
  );

  if (!article.content) return null;

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">

      {/* Header — same style as "Bias Explanation", "Analysis Scores" */}
      <h2 className="text-sm font-semibold text-card-foreground" style={{ marginBottom: "4px" }}>
        Influence Map
      </h2>
      <p className="text-xs text-muted-foreground" style={{ marginBottom: "14px" }}>
        {highlights.length > 0
          ? `${highlights.length} influential phrases detected — hover to see why each was flagged`
          : "No influential phrases found in analysis"}
      </p>

      {/* Legend */}
      <Legend activeSections={activeSections} />

      {/* Subtle divider */}
      <div style={{ borderTop: "1px solid #f1f5f9", marginBottom: "16px" }} />

      {/* Article body with inline highlights */}
      <div className="text-sm text-card-foreground" style={{ lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
        {segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={i}>{seg.text}</span>
          ) : (
            <PhraseTooltip key={i} entry={seg.entry!}>
              <mark
                style={{
                  background: seg.entry!.color.bg,
                  borderBottom: `2px solid ${seg.entry!.color.underline}`,
                  borderRadius: "2px",
                  padding: "0 1px",
                  cursor: "help",
                  font: "inherit",
                  color: "inherit",
                }}
              >
                {seg.text}
              </mark>
            </PhraseTooltip>
          )
        )}
      </div>

    </div>
  );
}