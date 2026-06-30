export async function streamImage(
  url: string,
  prompt: string,
  onFrame: (dataUrl: string, final: boolean) => void,
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok || !res.body) throw new Error(await res.text());

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

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
        const json = JSON.parse(payload);
        const b64 =
          json?.data?.[0]?.b64_json ||
          json?.partial_image_b64 ||
          json?.b64_json;
        const isFinal = json?.type === "image_generation.completed" || !!json?.data;
        if (b64) onFrame(`data:image/png;base64,${b64}`, isFinal);
      } catch {
        // ignore non-JSON keepalives
      }
    }
  }
}