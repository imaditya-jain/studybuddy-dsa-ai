import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, RotateCcw, Sparkles } from "lucide-react";
import { DAYS, PROBLEMS, TOTAL, problemsByDay, type Difficulty, type Platform } from "@/data/plan";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "14-Day DSA Practice Dashboard" },
      { name: "description", content: "92 hand-picked LeetCode & HackerRank problems organized into a 14-day plan, with an AI tutor for hints, code review and optimal solutions." },
      { property: "og:title", content: "14-Day DSA Practice Dashboard" },
      { property: "og:description", content: "92 problems · AI tutor · visual explanations of every algorithm." },
    ],
  }),
  component: Dashboard,
});

const DIFFICULTIES: ("All" | Difficulty)[] = ["All", "Easy", "Medium", "Hard"];
const PLATFORMS: ("All" | Platform)[] = ["All", "LeetCode", "HackerRank"];
const STATUSES = ["All", "To-do", "Done"] as const;

function Dashboard() {
  const { progress, toggle, resetAll, isDone } = useProgress();
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("All");
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [search, setSearch] = useState("");
  const [activeDayFilter, setActiveDayFilter] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const completedCount = useMemo(
    () => PROBLEMS.filter((p) => progress[p.id]?.done).length,
    [progress],
  );

  const stats = useMemo(() => {
    const easy = PROBLEMS.filter((p) => p.difficulty === "Easy").length;
    const medium = PROBLEMS.filter((p) => p.difficulty === "Medium").length;
    const hard = PROBLEMS.filter((p) => p.difficulty === "Hard").length;
    return { easy, medium, hard };
  }, []);

  const matches = (id: string) => {
    const p = PROBLEMS.find((x) => x.id === id)!;
    if (platform !== "All" && p.platform !== platform) return false;
    if (difficulty !== "All" && p.difficulty !== difficulty) return false;
    if (status === "Done" && !isDone(p.id)) return false;
    if (status === "To-do" && isDone(p.id)) return false;
    if (search && !`${p.title} ${p.topic} ${p.platformId ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeDayFilter && p.day !== activeDayFilter) return false;
    return true;
  };

  const pct = Math.round((completedCount / TOTAL) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1180px] px-6 py-8 pb-16">
        <header className="mb-6">
          <h1 className="text-[22px] font-[650] tracking-tight">14-Day DSA Practice Plan</h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            {TOTAL} problems · two-pointers through backtracking, plus two mock assessment days. Click any problem to open the AI tutor — hints, code review, optimal solution with diagrams.
          </p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-5">
          <Stat num={TOTAL} label="Total" />
          <Stat num={completedCount} label="Completed" accent="primary" />
          <Stat num={stats.easy} label="Easy" accent="easy" />
          <Stat num={stats.medium} label="Medium" accent="medium" />
          <Stat num={stats.hard} label="Hard" accent="hard" />
        </div>

        {/* Overall progress */}
        <div className="rounded-[10px] border border-border bg-card p-4 mb-5">
          <div className="flex justify-between items-baseline mb-2.5">
            <div className="font-semibold text-[14px]">Overall Progress</div>
            <div className="text-primary font-[650] text-[14px]">{pct}%</div>
          </div>
          <div className="h-2.5 bg-secondary rounded-md overflow-hidden">
            <div
              className="h-full transition-[width] duration-300"
              style={{
                width: `${pct}%`,
                background: "linear-gradient(90deg, oklch(0.62 0.18 260), oklch(0.78 0.13 260))",
              }}
            />
          </div>
          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 mt-3.5">
            {DAYS.map((d) => {
              const dayProbs = problemsByDay(d.day);
              const dayDone = dayProbs.filter((p) => isDone(p.id)).length;
              const dayPct = (dayDone / dayProbs.length) * 100;
              const active = activeDayFilter === d.day;
              return (
                <button
                  key={d.day}
                  onClick={() => setActiveDayFilter(active ? null : d.day)}
                  className={`relative h-7 rounded-md border text-[10.5px] font-medium overflow-hidden transition-colors ${
                    active
                      ? "border-primary bg-primary/30 text-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                  title={`Day ${d.day}: ${d.title} (${dayDone}/${dayProbs.length})`}
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to right, oklch(0.78 0.16 155 / 0.25) ${dayPct}%, transparent ${dayPct}%)`,
                    }}
                  />
                  <span className="relative">D{d.day}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 items-center mb-5 bg-card border border-border rounded-[10px] p-3">
          <ChipGroup
            label="Platform"
            options={PLATFORMS}
            value={platform}
            onChange={(v) => setPlatform(v as typeof platform)}
          />
          <ChipGroup
            label="Difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(v) => setDifficulty(v as typeof difficulty)}
            colorize
          />
          <ChipGroup
            label="Status"
            options={STATUSES as unknown as string[]}
            value={status}
            onChange={(v) => setStatus(v as typeof status)}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems…"
            className="flex-1 min-w-[180px] bg-secondary border border-border rounded-lg px-3 py-1.5 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          <button
            onClick={() => {
              if (confirm("Reset all progress?")) resetAll();
              setPlatform("All");
              setDifficulty("All");
              setStatus("All");
              setActiveDayFilter(null);
              setSearch("");
            }}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground text-[12px] hover:text-foreground hover:border-muted-foreground"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        {/* Day sections */}
        {DAYS.map((d) => {
          const dayProbs = problemsByDay(d.day);
          const visible = dayProbs.filter((p) => matches(p.id));
          if (visible.length === 0 && activeDayFilter !== d.day && (platform !== "All" || difficulty !== "All" || status !== "All" || search || activeDayFilter)) {
            return null;
          }
          const dayDone = dayProbs.filter((p) => isDone(p.id)).length;
          const dayPct = Math.round((dayDone / dayProbs.length) * 100);
          const isCollapsed = collapsed[d.day];
          return (
            <section key={d.day} className="mb-3 bg-card border border-border rounded-[10px] overflow-hidden">
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [d.day]: !c[d.day] }))}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary text-left"
              >
                <div className="w-[34px] h-[34px] rounded-lg bg-secondary border border-border flex items-center justify-center font-[650] text-[13px] text-primary flex-shrink-0">
                  D{d.day}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[14.5px]">{d.title}</div>
                  <div className="text-[12px] text-muted-foreground truncate">{d.focus}</div>
                </div>
                <div className="w-[90px] flex-shrink-0 hidden sm:block">
                  <div className="h-1.5 bg-secondary rounded overflow-hidden">
                    <div className="h-full transition-[width]" style={{ width: `${dayPct}%`, background: "oklch(0.78 0.16 155)" }} />
                  </div>
                  <div className="text-[11px] text-muted-foreground text-right mt-1">{dayDone}/{dayProbs.length}</div>
                </div>
                <ChevronDown size={18} className={`text-muted-foreground transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
              </button>
              {!isCollapsed && (
                <div className="border-t border-border">
                  {visible.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-[13.5px]">No problems match the current filters.</div>
                  ) : (
                    visible.map((p) => (
                      <div key={p.id} className="grid grid-cols-[28px_1fr_auto_auto] sm:grid-cols-[28px_1fr_auto_auto_auto] gap-3 items-center px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-secondary/60">
                        <button
                          onClick={() => toggle(p.id)}
                          className={`w-[18px] h-[18px] rounded-[5px] border-[1.5px] flex items-center justify-center flex-shrink-0 ${
                            isDone(p.id) ? "bg-[oklch(0.78_0.16_155)] border-[oklch(0.78_0.16_155)]" : "bg-secondary border-border"
                          }`}
                          aria-label="Toggle done"
                        >
                          {isDone(p.id) && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                              <path d="M5 13l4 4L19 7" stroke="#0f1117" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                        <Link
                          to="/problem/$id"
                          params={{ id: p.id }}
                          className="min-w-0 group"
                        >
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-muted-foreground text-[12px] tabular-nums">{p.platformId}</span>
                            <span className={`font-medium text-[13.5px] group-hover:text-primary ${isDone(p.id) ? "line-through text-muted-foreground" : ""}`}>
                              {p.title}
                            </span>
                          </div>
                          <div className="text-muted-foreground text-[12px] mt-0.5">{p.topic} · {p.strategy}</div>
                        </Link>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold hidden sm:inline ${p.platform === "LeetCode" ? "text-[var(--leetcode)] bg-[var(--leetcode)]/15" : "text-[var(--hackerrank)] bg-[var(--hackerrank)]/15"}`}>
                          {p.platform === "LeetCode" ? "LC" : "HR"}
                        </span>
                        <DiffTag diff={p.difficulty} />
                        <span className="text-[11px] text-muted-foreground tabular-nums hidden sm:inline min-w-[56px] text-right">{p.timeComplexity}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          );
        })}

        <p className="text-center text-[12px] text-muted-foreground mt-8">
          <Sparkles size={12} className="inline mr-1 -mt-0.5" />
          Tip: click any problem title to open the AI tutor. Progress is saved in this browser.
        </p>
      </div>
    </div>
  );
}

function Stat({ num, label, accent }: { num: number; label: string; accent?: "primary" | "easy" | "medium" | "hard" }) {
  const color =
    accent === "primary" ? "text-primary"
    : accent === "easy" ? "text-[oklch(0.78_0.16_155)]"
    : accent === "medium" ? "text-[oklch(0.82_0.15_75)]"
    : accent === "hard" ? "text-[oklch(0.7_0.21_22)]"
    : "";
  return (
    <div className="bg-card border border-border rounded-[10px] p-3.5">
      <div className={`text-[24px] font-[650] tracking-tight ${color}`}>{num}</div>
      <div className="text-[11.5px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function DiffTag({ diff }: { diff: Difficulty }) {
  const map = {
    Easy: "text-[oklch(0.78_0.16_155)] bg-[oklch(0.78_0.16_155)]/15",
    Medium: "text-[oklch(0.82_0.15_75)] bg-[oklch(0.82_0.15_75)]/15",
    Hard: "text-[oklch(0.7_0.21_22)] bg-[oklch(0.7_0.21_22)]/15",
  };
  return <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-[650] whitespace-nowrap ${map[diff]}`}>{diff}</span>;
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  colorize,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  colorize?: boolean;
}) {
  return (
    <div className="flex gap-1.5 items-center">
      <span className="text-[11.5px] uppercase tracking-wider text-muted-foreground mr-1">{label}</span>
      {options.map((o) => {
        const active = value === o;
        const cls = active
          ? colorize && o === "Easy"
            ? "bg-[oklch(0.78_0.16_155)] border-[oklch(0.78_0.16_155)] text-[oklch(0.18_0.02_265)]"
            : colorize && o === "Medium"
              ? "bg-[oklch(0.82_0.15_75)] border-[oklch(0.82_0.15_75)] text-[oklch(0.18_0.02_265)]"
              : colorize && o === "Hard"
                ? "bg-[oklch(0.7_0.21_22)] border-[oklch(0.7_0.21_22)] text-white"
                : "bg-primary border-primary text-primary-foreground"
          : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-primary";
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1 rounded-full border text-[12.5px] font-medium transition-colors ${cls}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

export { ExternalLink };
