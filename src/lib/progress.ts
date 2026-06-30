import { useEffect, useState, useSyncExternalStore } from "react";

const KEY = "dsa14:v1";
const SUB_KEY = "dsa14:submissions:v1";

type ProgressMap = Record<string, { done: boolean; ts: number }>;

function read(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function write(p: ProgressMap) {
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("dsa14:progress"));
}

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("dsa14:progress", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("dsa14:progress", cb);
    window.removeEventListener("storage", cb);
  };
}

export function useProgress() {
  const progress = useSyncExternalStore(subscribe, read, () => ({}) as ProgressMap);

  function toggle(id: string) {
    const p = read();
    if (p[id]?.done) delete p[id];
    else p[id] = { done: true, ts: Date.now() };
    write(p);
  }

  function set(id: string, done: boolean) {
    const p = read();
    if (done) p[id] = { done: true, ts: Date.now() };
    else delete p[id];
    write(p);
  }

  function resetAll() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(KEY);
      window.dispatchEvent(new Event("dsa14:progress"));
    }
  }

  return { progress, toggle, set, resetAll, isDone: (id: string) => !!progress[id]?.done };
}

// ---------- Submissions (per problem code + AI feedback cache) ----------

export type SubmissionRecord = {
  code: string;
  language: string;
  feedback?: string;
  optimal?: string;
  ts: number;
};

type SubMap = Record<string, SubmissionRecord>;

function readSubs(): SubMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(SUB_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function useSubmission(id: string) {
  const [rec, setRec] = useState<SubmissionRecord | null>(null);
  useEffect(() => {
    setRec(readSubs()[id] ?? null);
  }, [id]);
  function save(next: Partial<SubmissionRecord>) {
    const all = readSubs();
    const prev = all[id] ?? { code: "", language: "javascript", ts: 0 };
    const merged: SubmissionRecord = { ...prev, ...next, ts: Date.now() };
    all[id] = merged;
    window.localStorage.setItem(SUB_KEY, JSON.stringify(all));
    setRec(merged);
  }
  return { rec, save };
}