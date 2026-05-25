import { useState } from 'react';

export default function ClipBoost() {
  const [videoIdea, setVideoIdea] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState('');
  const [tone, setTone] = useState('sensational');
  const [copiedIndex, setCopiedIndex] = useState(null);

  const examples = [
    'I Tried AI Side Hustles For 7 Days',
    'This Website Makes Thumbnails In Seconds',
    'How Small Creators Are Going Viral Fast',
    'The Secret To Better YouTube Clicks',
  ];

  const handleGenerate = (type) => {
    if (!videoIdea.trim()) return alert('Please enter an idea first!');
    
    setLoading(true);
    setActiveType(type);
    setResults([]);
    setCopiedIndex(null);
    
    setTimeout(() => {
      if (type === 'titles') {
        if (tone === 'sensational') {
          setResults([
            `🚀 I Tested "${videoIdea}" For 100 Hours (And Regret It)`,
            `🎯 The Lazy Way to Go Viral with: ${videoIdea}`,
            `❌ Stop Making This Huge "${videoIdea}" Mistake!`,
          ]);
        } else if (tone === 'professional') {
          setResults([
            `📈 Complete Data Analysis: Understanding ${videoIdea}`,
            `🧠 The Strategy Behind ${videoIdea} Explained`,
            `💡 Step-by-Step Guide: Optimizing Your ${videoIdea}`,
          ]);
        } else {
          setResults([
            `The truth about ${videoIdea.toLowerCase()}.`,
            `How to master ${videoIdea.toLowerCase()}`,
            `Rethinking ${videoIdea.toLowerCase()}`,
          ]);
        }
      } else {
        setResults([
          `🔥 Hook 1: "Most people get '${videoIdea}' completely wrong, but this 5-second trick fixes everything..."`,
          `👀 Hook 2: "If you are still trying to figure out '${videoIdea}' in 2026, you need to stop and watch this immediately."`,
          `🧠 Hook 3: "This is the hidden psychological secret behind '${videoIdea}' that nobody is talking about."`,
        ]);
      }
      setLoading(false);
    }, 800);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8 font-sans antialiased selection:bg-white selection:text-black">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Header */}
        <div className="text-center py-20 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-zinc-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            ClipBoost
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Generate viral YouTube titles, thumbnail text, hooks, and video ideas instantly.
          </p>
        </div>
        
        {/* Main Interface Wrapper */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl mb-8 relative">
          
          {/* Tone Selector Tabs */}
          <div className="flex gap-2 p-1 bg-black/50 rounded-xl max-w-sm mb-6 border border-zinc-800/60">
            {['sensational', 'professional', 'minimalist'].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`flex-1 text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-lg transition-all ${
                  tone === t ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* User Input field */}
          <input
            type="text"
            value={videoIdea}
            onChange={(e) => setVideoIdea(e.target.value)}
            placeholder="Enter your video concept or topic..."
            className="w-full bg-black border border-zinc-800 rounded-2xl px-5 py-4 text-white text-lg placeholder-zinc-600 focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 mb-5 transition-all"
          />

          {/* Call to Actions */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => handleGenerate('titles')} 
              disabled={loading}
              className="bg-white text-black font-extrabold text-base py-4 px-6 rounded-2xl hover:bg-zinc-200 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-white/5"
            >
              {loading && activeType === 'titles' ? 'Generating...' : 'Generate Titles'}
            </button>
            <button 
              onClick={() => handleGenerate('hooks')} 
              disabled={loading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-base py-4 px-6 rounded-2xl border border-zinc-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading && activeType === 'hooks' ? 'Generating...' : 'Generate Hooks'}
            </button>
          </div>

          {/* Fast Examples */}
          <div className="border-t border-zinc-800/60 pt-6">
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Inspiration Sandbox</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {examples.map((ex, i) => (
                <button 
                  key={i} 
                  onClick={() => setVideoIdea(ex)} 
                  className="w-full text-left bg-zinc-950/40 border border-zinc-800/40 rounded-xl px-4 py-3 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-950/80 transition-all text-sm truncate"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Output Panel with Clipboard Integration */}
        {results.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                System Output ({activeType} • {tone})
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div 
                  key={idx} 
                  onClick={() => copyToClipboard(result, idx)}
                  className="group relative bg-black border border-zinc-800/80 rounded-xl p-5 text-white font-medium hover:border-zinc-600 transition-all cursor-pointer flex justify-between items-center overflow-hidden"
                >
                  <span className="pr-12 text-sm md:text-base leading-relaxed">{result}</span>
                  <button className="absolute right-4 opacity-0 group-hover:opacity-100 bg-zinc-800 text-xs text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 transition-all shadow-md">
                    {copiedIndex === idx ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
