import React, { useState, useEffect, useRef } from 'react';
import { Mail, CheckCircle, AtSign, Zap, ExternalLink, Settings, Download, Copy, FileText, Delete, RefreshCw } from 'lucide-react';
import { generateVariations } from './utils/generator';

function App() {
  const [email, setEmail] = useState('');
  const [options, setOptions] = useState({
    dot: true,
    alias: true,
    googlemail: true,
    limitEnabled: false
  });
  
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, target: 0, live: 0 });
  const [metrics, setMetrics] = useState({ count: 0, elapsed: 0 });
  
  const stopFnRef = useRef(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('gmail_email');
    const savedOptions = localStorage.getItem('gmail_options');
    if (savedEmail) setEmail(savedEmail);
    if (savedOptions) setOptions(JSON.parse(savedOptions));
  }, []);

  const handleOptionChange = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearInput = () => {
    setEmail('');
  };

  const handleToggleGenerate = () => {
    if (generating) {
      if (stopFnRef.current) stopFnRef.current();
      setGenerating(false);
      return;
    }

    if (!email || !email.includes('@gmail.com')) {
      alert('Masukkan email valid (berakhiran @gmail.com)');
      return;
    }

    setGenerating(true);
    setResults([]);
    setProgress({ current: 0, target: 0, live: 0 });
    
    stopFnRef.current = generateVariations(
      { email, ...options },
      (prog) => setProgress({ current: prog.progressCurrent, target: prog.progressTarget, live: prog.liveCount }),
      (finishData) => {
        setGenerating(false);
        if (finishData.error) {
           alert(finishData.error);
        } else if (finishData.stopped) {
           // handled
        } else {
          setResults(finishData.results);
          setMetrics({ count: finishData.count, elapsed: finishData.elapsed });
          
          localStorage.setItem('gmail_email', email);
          localStorage.setItem('gmail_options', JSON.stringify(options));
        }
      }
    );
  };

  const copyToClipboard = () => {
    if (!results.length) return;
    navigator.clipboard.writeText(results.join('\n'))
      .then(() => alert('Disalin ke clipboard!'));
  };

  const exportFile = (type) => {
    if (!results.length) return;
    const content = results.join('\n');
    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gmail_variations.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const progressPercent = progress.target ? (progress.current / progress.target) * 100 : 0;

  return (
    <>
      {/* Floating 3D Icons Placeholder - Smaller sizes */}
      <Mail id="icon-yt" className="floating-icon text-red-500 bg-white rounded-xl p-2 w-10 h-10 shadow-xl" />
      <AtSign id="icon-tiktok" className="floating-icon text-white bg-blue-500 rounded-xl p-2 w-8 h-8 shadow-xl" />
      <CheckCircle id="icon-sora" className="floating-icon text-white bg-green-500 rounded-xl p-2 w-12 h-12 shadow-xl" />
      <Zap id="icon-fb" className="floating-icon text-indigo-900 bg-yellow-400 rounded-xl p-1.5 w-9 h-9 shadow-xl" />
      <Settings id="icon-ig" className="floating-icon text-white bg-pink-500 rounded-xl p-2 w-11 h-11 shadow-xl" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          Gmail <span>Dot</span>
        </div>
        <div className="nav-links">
          <a href="https://dj.kastudio.my.id" target="_blank" rel="noreferrer">Sora Downloader</a>
          <a href="https://prompt.kastudio.my.id" target="_blank" rel="noreferrer">Sora Prompt</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">
        <h1>
          Gmail Dot<br/>
          <span>Generator</span>
        </h1>
        <p>
          Temukan ribuan variasi alamat email kamu dalam kedipan mata. Sistem otomatis mendeteksi format dan memproses titik, alias, ekstensi googlemail, dan merangkumnya.
        </p>

        <div className="input-group-container">
          
          {/* Options Tabs */}
          <div className="service-tabs">
            <div 
              className={`service-tab ${options.dot ? 'active' : ''}`}
              onClick={() => handleOptionChange('dot')}
            >
              <CheckCircle size={18} className="icon-check" />
              Variasi Titik (.)
            </div>
            <div 
              className={`service-tab ${options.alias ? 'active' : ''}`}
              onClick={() => handleOptionChange('alias')}
            >
              <CheckCircle size={18} className="icon-check" />
              Variasi Alias (+)
            </div>
            <div 
              className={`service-tab ${options.googlemail ? 'active' : ''}`}
              onClick={() => handleOptionChange('googlemail')}
            >
              <CheckCircle size={18} className="icon-check" />
              Gunakan Googlemail
            </div>
            <div 
              className={`service-tab ${options.limitEnabled ? 'active' : ''}`}
              onClick={() => handleOptionChange('limitEnabled')}
            >
              <CheckCircle size={18} className="icon-check" />
              Batasi 1000
            </div>
          </div>

          <div className="input-group">
            <div className="input-main">
              <Mail size={24} className="lucide" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email (contoh: nama@gmail.com)"
                disabled={generating}
              />
              <button className="paste-btn" onClick={clearInput} title="Bersihkan">
                <RefreshCw size={18} /> Clear
              </button>
            </div>
            <button 
              className="download-btn"
              onClick={handleToggleGenerate}
              disabled={generating && stopFnRef.current === null}
            >
              {generating && (
                <div className="progress-bar-bg" style={{ width: `${progressPercent}%` }}></div>
              )}
              <span className="btn-text">
                {generating ? 'Berhenti' : 'Generate'}
              </span>
            </button>
          </div>

          {generating && (
            <div style={{ color: 'var(--white)', marginTop: '0.5rem', fontWeight: 600 }}>
              Sedang memproses... {progress.live} email ditemukan.
            </div>
          )}

          {/* Results Area */}
          {results.length > 0 && (
            <div className="result-card">
              <div className="result-content">
                <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Hasil Generate ({metrics.count} email)</h3>
                  <div style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 600 }}>Dibutuhkan {metrics.elapsed}s</div>
                </div>
                
                <textarea 
                  className="textarea-result" 
                  readOnly 
                  value={results.join('\n')}
                />
                
                <div className="download-options">
                  <button className="dl-link" onClick={copyToClipboard}>
                    <Copy size={16} /> Salin Semua
                  </button>
                  <button className="dl-link" onClick={() => exportFile('txt')}>
                    <FileText size={16} /> Simpan TXT
                  </button>
                  <button className="dl-link" onClick={() => exportFile('csv')}>
                    <Download size={16} /> Simpan CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tool Cards Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            <a 
              href="https://dj.kastudio.my.id" 
              target="_blank" 
              rel="noreferrer"
              className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-yellow-400 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <Download size={24} className="text-indigo-900" />
              </div>
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                Sora Downloader <ExternalLink size={16} className="opacity-50" />
              </h4>
              <p className="text-indigo-100/70 text-sm leading-relaxed">
                Unduh video Sora favoritmu dengan mudah dan cepat tanpa watermark.
              </p>
            </a>

            <a 
              href="https://prompt.kastudio.my.id" 
              target="_blank" 
              rel="noreferrer"
              className="group p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-blue-500 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
                <FileText size={24} className="text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                Sora Prompt Gen <ExternalLink size={16} className="opacity-50" />
              </h4>
              <p className="text-indigo-100/70 text-sm leading-relaxed">
                Buat prompt video Sora yang kreatif dan efektif dengan generator kami.
              </p>
            </a>
          </div>

        </div>
      </main>

      {/* Footer / Histats */}
      <footer className="mt-auto py-8 text-center border-t border-white/10">
        <p className="text-indigo-200/50 text-sm mb-4">
          Made with ❤️ by Kang Adit &copy; 2025
        </p>
        <div id="visual_histats" className="flex justify-center flex-col items-center gap-2">
           <div id="histats_counter"></div>
           <noscript>
             <a href="/" target="_blank">
               <img src="//sstatic1.histats.com/0.gif?4943847&101" alt="Histats" border="0" />
             </a>
           </noscript>
        </div>
      </footer>
    </>
  );
}

export default App;
