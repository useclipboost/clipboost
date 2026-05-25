import { useState } from 'react';

export default function ClipBoost() {
  const [videoIdea, setVideoIdea] = useState('');
  const examples = [
    'I Tried AI Side Hustles For 7 Days',
    'This Website Makes Thumbnails In Seconds',
    'How Small Creators Are Going Viral Fast',
    'The Secret To Better YouTube Clicks',
  ];

  return (
    <div className="min-h-screen bg-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">ClipBoost</h1>
          <p className="text-zinc-400 text-xl max-w-3xl mx-auto mb-10">
            Generate viral YouTube titles, thumbnail text, hooks, and video ideas instantly.
          </p>
          <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <input
              type="text"
              value={videoIdea}
              onChange={(e) => setVideoIdea(e.target.value)}
              placeholder="Enter your video idea..."
              className="w-full bg-black border border-zinc-700 rounded-2xl px-5 py-4 text-lg mb-4 text-white focus:outline-none"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <button onClick={() => videoIdea ? alert(`AI titles connected for: "${videoIdea}"`) : alert('Enter an idea!')} className="bg-white text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition">
                Generate Viral Titles
              </button>
              <button onClick={() => videoIdea ? alert(`Thumbnail generator running for: "${videoIdea}"`) : alert('Enter an idea!')} className="bg-zinc-800 font-bold py-4 rounded-2xl hover:bg-zinc-700 transition">
                Generate Thumbnail Text
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}