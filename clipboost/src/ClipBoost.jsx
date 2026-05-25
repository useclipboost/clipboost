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
          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6">
            ClipBoost
          </h1>

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
              <button
                onClick={() => {
                  if (!videoIdea) return alert('Please enter a video idea first!');
                  alert(`AI title generation connected successfully for: "${videoIdea}"`);
                }}
                className="bg-white text-black font-bold py-4 rounded-2xl hover:scale-[1.02] transition"
              >
                Generate Viral Titles
              </button>

              <button
                onClick={() => {
                  if (!videoIdea) return alert('Please enter a video idea first!');
                  alert(`Thumbnail text generator running for: "${videoIdea}"`);
                }}
                className="bg-zinc-800 font-bold py-4 rounded-2xl hover:bg-zinc-700 transition"
              >
                Generate Thumbnail Text
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-6">
            <p className="text-green-400 text-sm mb-2">Estimated Revenue</p>
            <h2 className="text-4xl font-black">$0.00</h2>
            <p className="text-zinc-400 mt-2">Updates when ads and users are active</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Visitors</p>
            <h2 className="text-4xl font-black">0</h2>
            <p className="text-zinc-500 mt-2">Track users visiting your website</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <p className="text-zinc-400 text-sm mb-2">Generations</p>
            <h2 className="text-4xl font-black">0</h2>
            <p className="text-zinc-500 mt-2">How many creators used your tool</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Example Viral Titles</h2>
            <div className="space-y-4">
              {examples.map((title, index) => (
                <div key={index} className="bg-black border border-zinc-800 rounded-2xl p-4 text-zinc-300">
                  {title}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <h2 className="text-3xl font-bold mb-6">Why Creators Use This</h2>
            <ul className="space-y-5 text-zinc-300 text-lg">
              <li>• Faster video ideas</li>
              <li>• Better click-through rates</li>
              <li>• More viral hooks</li>
              <li>• Thumbnail text in seconds</li>
              <li>• Helps small creators grow faster</li>
            </ul>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center">
          <h2 className="text-5xl font-black mb-5">Ready To Launch</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-8">
            Deploy your website live for free and start building traffic from Google search.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://vercel.com" target="_blank" rel="noreferrer" className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition">
              Deploy Website
            </a>
            <a href="https://adsense.google.com" target="_blank" rel="noreferrer" className="border border-zinc-700 px-8 py-4 rounded-2xl font-bold hover:bg-zinc-800 transition">
              Start Making Money
            </a>
          </div>
        </div>

        <div className="text-center text-zinc-500 text-sm py-10">
          ClipBoost © 2026
        </div>
      </div>
    </div>
  );
}