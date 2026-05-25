import { useState } from 'react';

export default function ClipBoost() {
  const [videoIdea, setVideoIdea] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const examples = [
    'I Tried AI Side Hustles For 7 Days',
    'This Website Makes Thumbnails In Seconds',
    'How Small Creators Are Going Viral Fast',
    'The Secret To Better YouTube Clicks',
  ];

  const handleGenerate = (type) => {
    if (!videoIdea.trim()) return alert('Please enter an idea first!');
    
    setLoading(true);
    
    // Simulating a real AI delay (1 second)
    setTimeout(() => {
      if (type === 'titles') {
        setResults([
          `🚀 I Tested "${videoIdea}" For 100 Hours (And Regret It)`,
          `🎯 The Lazy Way to Go Viral with ${videoIdea}`,
          `❌ Stop Making This Huge "${videoIdea}" Mistake!`,
        ]);
      } else {
        setResults([
          `Hook 1: "Most people get "${videoIdea}" completely wrong, but this 5-second trick fixes everything..."`,
          `Hook 2: "If you are still trying to figure out "${videoIdea}" in 2026, you need to watch this immediately."`,
        ]);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">ClipBoost</h1>
          <p className="text-zinc-400 text-xl max-w-3xl mx-auto mb-10">
            Generate viral YouTube titles, thumbnail text, hooks, and video ideas instantly.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl mb-8">
          <input
            type="text"
            value={videoIdea}
            onChange={(e) => setVideoIdea(e.target.value)}
            placeholder="Enter your video concept or topic..."
            className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-white mb-4"
          />
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={() => handleGenerate('titles')} 
              className="bg-white text-black font-bold py-3 px-4 rounded-2xl hover:bg-zinc-200 transition"
            >
              {loading ? 'Generating...' : 'Titles'}
            </button>
            <button 
              onClick={() => handleGenerate('hooks')} 
              className="bg-zinc-800 text-white font-bold py-3 px-4 rounded-2xl border border-zinc-700 hover:bg-zinc-700 transition"
            >
              {loading ? 'Generating...' : 'Hooks'}
            </button>
          </div>
          <div>
            <p className="text-zinc-500 text-sm font-semibold uppercase tracking-wider mb-3">Examples</p>
            <div className="space-y-2">
              {examples.map((ex, i) => (
                <button key={i} onClick={() => setVideoIdea(ex)} className="w-full text-left bg-zinc-950 border border-zinc-800/50 rounded-xl px-4 py-3 text-zinc-400 hover:text-white hover:border-zinc-700 transition text-sm">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Brand New On-Screen Results Panel */}
        {results.length > 0 && (
          <div className="max-w-3xl mx-auto bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 shadow-2xl animate-fade-in">
            <h3 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider mb-4">Generated Options</h3>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white font-medium">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
