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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-zinc-5
