import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Image as ImageIcon, Loader2, Send, Sparkles } from "lucide-react";
import { getProblem, type Problem } from "@/data/plan";
import { useProgress, useSubmission } from "@/lib/progress";
import { Markdown } from "@/components/Markdown";
import { streamImage } from "@/lib/streamImage";

export const Route = createFileRoute("/problem/$id")({
  head: ({ params }) => {
    const p = getProblem(params.id);
    const title = p ? `${p.platformId} — ${p.title}` : "Problem";
    return {
      meta: [
        { title: `${title} · DSA Tutor` },
        { name: "description", content: p ? `${p.difficulty} · ${p.topic}. AI tutor explains, reviews your code, and shows the optimal solution.` : "DSA problem" },
      ],
    };
  },
  component: ProblemPage,
  notFoundComponent: () => <div className="p-8 text-center text-muted-foreground">Problem not found.</div>,
});

type Mode = "problem" | "hint" | "review" | "optimal" | "chat";

type Section = {
  mode: Mode;
  title: string;
  content: string;
  loading?: boolean;
  error?: string;
};

function ProblemPage() {
  const { id } = useParams({ from: "/problem/$id" });
  const p = getProblem(id);
  if (!p) return <div className="p-8 text-center text-muted-foreground">Problem not found.</div>;
  const { isDone, toggle } = useProgress();
  const { rec, save } = useSubmission(id);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<string>("javascript");
  const [submitted, setSubmitted] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [busy, setBusy] = useState<Mode | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [image, setImage] = useState<{ src: string; final: boolean } | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate persisted code
  useEffect(() => {
    if (rec?.code && !code) setCode(rec.code);
    if (rec?.language) setLanguage(rec.language);
    if (rec?.code) setSubmitted(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rec?.code]);

  async function runStream(mode: Mode, userMessage?: string) {
    if (busy) return;
    setBusy(mode);
    const sectionTitle =
      mode === "problem" ? "Problem statement"
      : mode === "hint" ? "Hints (no spoilers)"
      : mode === "review" ? "Code review"
      : mode === "optimal" ? "Optimal solution"
      : (userMessage ?? "Question");

    const newSection: Section = { mode, title: sectionTitle, content: "", loading: true };
    setSections((s) => [...s, newSection]);
    const idx = sections.length;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const uiMessages =
      mode === "chat"
        ? [{ id: `u-${Date.now()}`, role: "user", parts: [{ type: "text", text: userMessage ?? "" }] }]
        : [{
            id: `u-${Date.now()}`,
            role: "user",
            parts: [{
              type: "text",
              text:
                mode === "problem" ? "Show me the problem statement, examples, and constraints. Do not solve it yet."
                : mode === "hint" ? "Give me hints — how to think about this. Don't show the solution."
                : mode === "review" ? "Review my submission below. Tell me what's right, what's wrong, and what to improve."
                : "Show me the optimal solution with intuition, diagrams, dry-run, code, and complexity.",
            }],
          }];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: uiMessages,
          mode,
          problem: p,
          userCode: (mode === "review" || mode === "optimal") ? code : undefined,
          language,
        }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const evt = JSON.parse(payload);
            // AI SDK UI stream: text-delta events
            if (evt.type === "text-delta" && typeof evt.delta === "string") {
              acc += evt.delta;
            } else if (evt.type === "text" && typeof evt.text === "string") {
              acc += evt.text;
            }
            setSections((s) => s.map((sec, i) => i === idx ? { ...sec, content: acc, loading: true } : sec));
          } catch { /* ignore */ }
        }
      }
      setSections((s) => s.map((sec, i) => i === idx ? { ...sec, content: acc, loading: false } : sec));
      if (mode === "review") save({ feedback: acc, code, language });
      if (mode === "optimal") save({ optimal: acc, code, language });
    } catch (e) {
      const msg = (e as Error).message || "Stream error";
      setSections((s) => s.map((sec, i) => i === idx ? { ...sec, content: `❌ ${msg}`, loading: false, error: msg } : sec));
    } finally {
      setBusy(null);
    }
  }

  async function generateVisual() {
    if (imgLoading) return;
    setImgLoading(true);
    setImage(null);
    try {
      await streamImage(
        "/api/generate-image",
        `Diagram explaining the algorithm/data structure for: "${p.title}" (${p.topic}). Show ${p.strategy}. Labeled boxes, arrows, simple, no extra text decoration.`,
        (src, final) => setImage({ src, final }),
      );
    } catch (e) {
      alert("Image generation failed: " + (e as Error).message);
    } finally {
      setImgLoading(false);
    }
  }

  function handleSubmitCode() {
    if (!code.trim()) return;
    setSubmitted(true);
    save({ code, language });
    runStream("review");
  }

  function handleChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || busy) return;
    const msg = chatInput.trim();
    setChatInput("");
    runStream("chat", msg);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-6 py-6 pb-20">
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <ProblemHeader p={p} done={isDone(p.id)} onToggle={() => toggle(p.id)} />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-5 mt-5">
          {/* LEFT: AI tutor panel */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <ActionBtn
                label="📄 Show problem"
                onClick={() => runStream("problem")}
                loading={busy === "problem"}
              />
              <ActionBtn
                label="💡 Hint"
                onClick={() => runStream("hint")}
                loading={busy === "hint"}
              />
              <ActionBtn
                label={submitted ? "✅ Optimal solution" : "🔒 Submit first to unlock optimal"}
                onClick={() => runStream("optimal")}
                loading={busy === "optimal"}
                disabled={!submitted}
              />
              <ActionBtn
                label={imgLoading ? "Generating…" : "🖼️ Visualize"}
                onClick={generateVisual}
                loading={imgLoading}
                icon={<ImageIcon size={13} />}
              />
            </div>

            {image && (
              <div className="rounded-[10px] border border-border bg-card p-2 flex justify-center">
                <img
                  src={image.src}
                  alt="Algorithm visualization"
                  className={`max-w-full rounded transition-[filter] duration-300 ${image.final ? "blur-0" : "blur-md"}`}
                />
              </div>
            )}

            {sections.length === 0 && (
              <div className="rounded-[10px] border border-border bg-card p-5 text-center text-[13.5px] text-muted-foreground">
                <Sparkles size={18} className="mx-auto mb-2 text-primary" />
                Click <b>Show problem</b> to load the full statement, or <b>Hint</b> for guidance.<br />
                Write your code on the right, then <b>Submit</b> to get an AI review.
              </div>
            )}

            {sections.map((s, i) => (
              <details key={i} open className="rounded-[10px] border border-border bg-card overflow-hidden">
                <summary className="px-4 py-2.5 cursor-pointer font-semibold text-[13.5px] flex items-center justify-between hover:bg-secondary">
                  <span>{s.title}</span>
                  {s.loading && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                </summary>
                <div className="px-4 pb-4">
                  {s.content ? <Markdown>{s.content}</Markdown> : <div className="text-muted-foreground text-[13px] py-2">Thinking…</div>}
                </div>
              </details>
            ))}

            {/* Chat box */}
            <form onSubmit={handleChat} className="flex gap-2 sticky bottom-3">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up about this problem…"
                disabled={!!busy}
                className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-[13.5px] placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || !!busy}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {busy === "chat" ? <Loader2 size={14} className="animate-spin" /> : <Send size={13} />}
                Ask
              </button>
            </form>
          </div>

          {/* RIGHT: Code editor */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-[10px] border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="font-semibold text-[13.5px]">Your solution</div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-secondary border border-border rounded px-2 py-1 text-[12px]"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Write your ${language} solution here.\n// Plan first on paper — then code.`}
                spellCheck={false}
                className="w-full min-h-[340px] bg-[oklch(0.14_0.02_265)] border-0 px-4 py-3 text-[13px] font-mono leading-[1.55] focus:outline-none resize-y"
              />
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border">
                <div className="text-[11.5px] text-muted-foreground">
                  {submitted ? <><Check size={12} className="inline" /> Submitted — optimal solution unlocked</> : "Submit to get AI review and unlock the optimal solution."}
                </div>
                <button
                  onClick={handleSubmitCode}
                  disabled={!code.trim() || !!busy}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {busy === "review" ? <Loader2 size={13} className="animate-spin" /> : <Send size={12} />}
                  Submit code
                </button>
              </div>
            </div>

            {/* Problem meta card */}
            <div className="mt-4 rounded-[10px] border border-border bg-card p-4">
              <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground mb-2">Target complexity</div>
              <div className="text-[14px] font-mono">Time: {p.timeComplexity}</div>
              <div className="text-[14px] font-mono">Space: {p.spaceComplexity}</div>
              <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground mt-3 mb-2">Pattern</div>
              <div className="text-[13.5px]">{p.strategy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemHeader({ p, done, onToggle }: { p: Problem; done: boolean; onToggle: () => void }) {
  const diffColor = {
    Easy: "text-[oklch(0.78_0.16_155)] bg-[oklch(0.78_0.16_155)]/15",
    Medium: "text-[oklch(0.82_0.15_75)] bg-[oklch(0.82_0.15_75)]/15",
    Hard: "text-[oklch(0.7_0.21_22)] bg-[oklch(0.7_0.21_22)]/15",
  }[p.difficulty];
  return (
    <div className="flex items-start gap-3">
      <button
        onClick={onToggle}
        className={`mt-1 w-[22px] h-[22px] rounded border-[1.5px] flex items-center justify-center flex-shrink-0 ${
          done ? "bg-[oklch(0.78_0.16_155)] border-[oklch(0.78_0.16_155)]" : "bg-secondary border-border"
        }`}
      >
        {done && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#0f1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-[12px] text-muted-foreground">
          <span>Day {p.day}</span>
          <span>·</span>
          <span>{p.topic}</span>
          <span>·</span>
          <span className="font-mono">{p.platformId}</span>
        </div>
        <h1 className="text-[22px] font-[650] tracking-tight mt-1">{p.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-[650] ${diffColor}`}>{p.difficulty}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${p.platform === "LeetCode" ? "text-[var(--leetcode)] bg-[var(--leetcode)]/15" : "text-[var(--hackerrank)] bg-[var(--hackerrank)]/15"}`}>{p.platform}</span>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  label, onClick, loading, disabled, icon,
}: { label: string; onClick: () => void; loading?: boolean; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="px-3 py-1.5 rounded-lg border border-border bg-card text-[13px] font-medium hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}