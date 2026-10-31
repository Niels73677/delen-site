"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fafaf8", color: "#171717", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.02em" }}>Something went wrong.</h1>
          <button onClick={reset} style={{ marginTop: 24, padding: "14px 28px", background: "#171717", color: "#fafaf8", border: 0, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 12, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
