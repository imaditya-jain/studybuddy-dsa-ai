import { useEffect, useId, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

let mermaidInit = false;
function ensureMermaid() {
  if (mermaidInit) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "ui-sans-serif, system-ui, sans-serif",
    themeVariables: {
      background: "#1a1d29",
      primaryColor: "#2a3550",
      primaryTextColor: "#e8e9ed",
      primaryBorderColor: "#3a4a7a",
      lineColor: "#7c9eff",
      secondaryColor: "#1e2230",
      tertiaryColor: "#171a23",
    },
  });
  mermaidInit = true;
}

function Mermaid({ code }: { code: string }) {
  const id = useId().replace(/:/g, "_");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    ensureMermaid();
    let cancelled = false;
    (async () => {
      try {
        const { svg } = await mermaid.render(`m-${id}`, code);
        if (!cancelled && ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<pre style="color:#ff6b6b;font-size:12px">Diagram error:\n${(e as Error).message}</pre>`;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  return (
    <div
      ref={ref}
      className="my-3 rounded-lg border border-border bg-card p-3 overflow-x-auto flex justify-center"
    />
  );
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-dsa">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...rest }) {
            const text = String(children ?? "").replace(/\n$/, "");
            const lang = /language-(\w+)/.exec(className ?? "")?.[1];
            if (lang === "mermaid") return <Mermaid code={text} />;
            // inline vs block: react-markdown v9 sets no `inline`, distinguishes via parent
            if (!className) return <code {...rest}>{children}</code>;
            return (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}