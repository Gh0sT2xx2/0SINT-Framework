import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Monitor } from 'lucide-react';
import { createOSINTChart } from './chart';

function App() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [background, setBackground] = useState<'grid' | 'circuits'>('grid'); // Only grid and circuits

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && chartRef.current) {
      createOSINTChart(chartRef.current);
    }
  }, [loading]);

  const backgrounds = {
    grid: "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCI+PHBhdGggZD0iTTAgMGg1MHY1MGgtNTB6IiBmaWxsPSIjMDAwIi8+PGxpbmUgeDE9IjAiIHkxPSIwIiB4Mj0iNTAiIHkyPSIwIiBzdHJva2U9IiMwMGZmMDAiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+PGxpbmUgeDE9IjAiIHkxPSIyNSIgeDI9IjUwIiB5Mj0iMjUiIHN0cm9rZT0iIzAwZmYwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48bGluZSB4MT0iMCIgeTE9IjUwIiB4Mj0iNTAiIHkyPSI1MCIgc3Ryb2tlPSIjMDBmZjAwIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSI1MCIgc3Ryb2tlPSIjMDBmZjAwIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjxsaW5lIHgxPSIyNSIgeTE9IjAiIHgyPSIyNSIgeTI9IjUwIiBzdHJva2U9IiMwMGZmMDAiIHN0cm9rZS13aWR0aD0iMC41IiBzdHJva2Utb3BhY2l0eT0iMC4xIi8+PGxpbmUgeDE9IjUwIiB5MT0iMCIgeDI9IjUwIiB5Mj0iNTAiIHN0cm9rZT0iIzAwZmYwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] bg-repeat",
    circuits: "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwMCIvPjxwYXRoIGQ9Ik0xMCAxMEw5MCA5ME0yMCAyMEw4MCA4ME0zMCAzMEw3MCA3MCIgc3Ryb2tlPSIjMDBmZjAwIiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIiIGZpbGw9IiMwMGZmMDAiIGZpbGwtb3BhY2l0eT0iMC4yIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSI4MCIgcj0iMiIgZmlsbD0iIzAwZmYwMCIgZmlsbC1vcGFjaXR5PSIwLjIiLz48Y2lyY2xlIGN4PSI4MCIgY3k9IjIwIiByPSIyIiBmaWxsPSIjMDBmZjAwIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] bg-repeat"
  };

  return (
    <>
      {loading ? (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
          <div className="text-[#00ff00] font-mono text-4xl mb-8 typewriter">
            [ OSINT FRAMEWORK ]
          </div>
          <div className="w-full max-w-md">
            <div className="mb-2 text-[#00ff00] font-mono text-sm">
              Initializing OSINT Framework... {loadingProgress}%
            </div>
            <div className="w-full bg-[#001100] h-2 rounded-sm overflow-hidden">
              <div 
                className="h-full bg-[#00ff00] transition-all duration-200 glow-bar"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="mt-4 text-[#00ff00] font-mono text-xs terminal-text">
              {'>'} Loading modules...
              {loadingProgress > 30 && <div>{'>'} Initializing database connections...</div>}
              {loadingProgress > 60 && <div>{'>'} Configuring security protocols...</div>}
              {loadingProgress > 90 && <div>{'>'} System ready...</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className={`min-h-screen bg-black text-[#00ff00] relative ${backgrounds[background]}`}>
          {/* Control buttons */}
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
              onClick={() => setBackground(prev => prev === 'grid' ? 'circuits' : 'grid')} // Toggle between grid and circuits
              className="bg-black hover:bg-[#001100] text-[#00ff00] px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-300 border border-[#00ff00] hover:shadow-[0_0_10px_#00ff00]"
            >
              <Monitor size={16} />
              <span>Change Background</span>
            </button>
            <button
              id="expand-all"
              className="bg-black hover:bg-[#001100] text-[#00ff00] px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-300 border border-[#00ff00] hover:shadow-[0_0_10px_#00ff00]"
            >
              <Maximize2 size={16} />
              <span>Expand All</span>
            </button>
            <button
              id="collapse-all"
              className="bg-black hover:bg-[#001100] text-[#00ff00] px-4 py-2 rounded-none flex items-center gap-2 transition-all duration-300 border border-[#00ff00] hover:shadow-[0_0_10px_#00ff00]"
            >
              <Minimize2 size={16} />
              <span>Collapse All</span>
            </button>
          </div>

          {/* Tool info panel */}
          <div
            id="tool-info"
            className="fixed bottom-4 left-4 bg-black/90 p-4 border border-[#00ff00] text-[#00ff00] backdrop-blur-sm hidden max-w-md font-mono"
          >
            <h3 id="tool-name" className="text-lg font-bold mb-2"></h3>
            <p id="tool-description" className="text-sm"></p>
          </div>

          {/* Node tooltip */}
          <div
            id="node-tooltip"
            className="fixed pointer-events-none bg-black/90 px-3 py-2 border border-[#00ff00] text-[#00ff00] text-sm backdrop-blur-sm hidden font-mono"
          ></div>

          {/* Chart container */}
          <div ref={chartRef} id="chart" className="w-full h-screen"></div>
        </div>
      )}
    </>
  );
}

export default App;