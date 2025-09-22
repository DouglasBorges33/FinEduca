import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateAvatar } from '../services/geminiService';
import { THEMES, Theme } from '../themes';
import Spinner from './Spinner';

interface ProfileModalProps {
  onClose: () => void;
  onSave: (imageDataUrl: string) => void;
  currentImage: string | null;
  activeTheme: Theme;
  onThemeChange: (themeId: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onSave, currentImage, activeTheme, onThemeChange }) => {
  type Mode = 'select' | 'camera' | 'generate' | 'theme';
  const [mode, setMode] = useState<Mode>('select');
  const [error, setError] = useState<string | null>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Generator state
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [mode, stopCamera]);

  const startCamera = async () => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
      setMode('select');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);
    try {
        const base64Bytes = await generateAvatar(prompt);
        setGeneratedImage(`data:image/png;base64,${base64Bytes}`);
    } catch (err) {
        setError("Falha ao gerar imagem. Tente um prompt diferente.");
    } finally {
        setIsGenerating(false);
    }
  };

  const handleBackToSelect = () => {
    stopCamera();
    setCapturedImage(null);
    setGeneratedImage(null);
    setError(null);
    setMode('select');
  };

  const renderContent = () => {
    switch (mode) {
      case 'camera':
        return (
          <div>
            <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-square mb-4">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
              )}
               <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            {capturedImage ? (
                 <div className="flex space-x-2">
                    <button onClick={() => { startCamera(); }} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors">Tirar Outra</button>
                    <button onClick={() => onSave(capturedImage)} className="w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold py-2 px-4 rounded-md transition-colors">Salvar Foto</button>
                 </div>
            ) : (
                <button onClick={capturePhoto} disabled={!stream} className="w-full bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-light))] text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600">Capturar</button>
            )}
          </div>
        );
      case 'generate':
        return (
            <div>
                <p className="text-slate-400 mb-2">Descreva o avatar que você quer criar.</p>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: um leão sábio de óculos..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] mb-2"
                    rows={2}
                />
                <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="w-full bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent-light))] text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-slate-600 flex items-center justify-center">
                    {isGenerating && <Spinner />}
                    {isGenerating ? 'Gerando...' : 'Gerar Avatar'}
                </button>
                 {generatedImage && (
                    <div className="mt-4">
                        <img src={generatedImage} alt="Generated avatar" className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-slate-600" />
                        <button onClick={() => onSave(generatedImage)} className="mt-4 w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold py-2 px-4 rounded-md transition-colors">Usar esta imagem</button>
                    </div>
                )}
            </div>
        );
       case 'theme':
        return (
            <div>
                <p className="text-slate-400 mb-4">Escolha uma paleta de cores para personalizar sua experiência.</p>
                <div className="grid grid-cols-2 gap-4">
                    {THEMES.map(theme => (
                        <button key={theme.id} onClick={() => onThemeChange(theme.id)} className={`p-4 rounded-lg border-2 transition-colors ${activeTheme.id === theme.id ? 'border-[rgb(var(--color-primary))]' : 'border-slate-600 hover:border-slate-500'}`}>
                            <div className="flex space-x-2">
                                <div style={{ backgroundColor: `rgb(${theme.colors['--color-primary']})` }} className="w-6 h-6 rounded-full"></div>
                                <div style={{ backgroundColor: `rgb(${theme.colors['--color-accent']})` }} className="w-6 h-6 rounded-full"></div>
                            </div>
                            <p className="mt-2 font-semibold text-left text-white">{theme.name}</p>
                        </button>
                    ))}
                </div>
            </div>
        );
      case 'select':
      default:
        return (
          <div className="space-y-4">
             <button onClick={() => { setMode('camera'); startCamera(); }} className="w-full text-left p-4 rounded-lg bg-slate-700 hover:bg-slate-600/80 transition-colors flex items-center space-x-4">
                <span className="text-3xl">📸</span>
                <div>
                    <h3 className="font-bold text-white">Tirar Foto</h3>
                    <p className="text-sm text-slate-400">Use sua câmera para uma nova foto de perfil.</p>
                </div>
            </button>
             <button onClick={() => setMode('generate')} className="w-full text-left p-4 rounded-lg bg-slate-700 hover:bg-slate-600/80 transition-colors flex items-center space-x-4">
                <span className="text-3xl">🎨</span>
                <div>
                    <h3 className="font-bold text-white">Gerar com IA</h3>
                    <p className="text-sm text-slate-400">Crie um avatar único com uma descrição.</p>
                </div>
            </button>
            <button onClick={() => setMode('theme')} className="w-full text-left p-4 rounded-lg bg-slate-700 hover:bg-slate-600/80 transition-colors flex items-center space-x-4">
                <span className="text-3xl">🖌️</span>
                <div>
                    <h3 className="font-bold text-white">Personalizar Tema</h3>
                    <p className="text-sm text-slate-400">Escolha sua paleta de cores favorita.</p>
                </div>
            </button>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch(mode) {
        case 'camera': return 'Tirar Foto';
        case 'generate': return 'Gerar Avatar';
        case 'theme': return 'Escolher Tema';
        case 'select':
        default: return 'Opções de Perfil';
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-lg p-6 w-full max-w-md animate-fade-in-up relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            {mode !== 'select' && 
              <button onClick={handleBackToSelect} className="mr-3 text-slate-400 hover:text-white transition-colors text-2xl -mt-1" aria-label="Back">&larr;</button>
            }
            {getTitle()}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-3xl" aria-label="Close">&times;</button>
        </div>
        {error && <p className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</p>}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default ProfileModal;
