export default function ClipBoost() {
  const examples = [
    "I Tried AI Side Hustles For 7 Days",
    "This Website Makes Thumbnails In Seconds",
    "How Small Creators Are Going Viral Fast",
    "The Secret To Better YouTube Clicks"
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", padding: 30 }}>
      <h1 style={{ fontSize: 50, fontWeight: "bold" }}>ClipBoost</h1>

      <p style={{ color: "#aaa", maxWidth: 600 }}>
        Generate viral YouTube titles, hooks, and thumbnail text instantly.
      </p>

      <input
        placeholder="Enter video idea..."
        style={{ width: "100%", padding: 15, marginTop: 20, marginBottom: 10 }}
      />

      <button
        onClick={() => alert("AI not connected yet — next step is backend")}
        style={{ padding: 15, marginRight: 10 }}
      >
        Generate Titles
      </button>

      <button
        onClick={() => alert("Thumbnail generator coming next")}
        style={{ padding: 15 }}
      >
        Generate Thumbnail Text
      </button>

      <h2 style={{ marginTop: 40 }}>Examples</h2>
      {examples.map((t, i) => (
        <div key={i} style={{ padding: 10, border: "1px solid #333", marginTop: 10 }}>
          {t}
        </div>
      ))}
    </div>
  );
}
