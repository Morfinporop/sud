import { useState } from 'react';
import { DiscordIcon } from './Icons';

interface DiscordLoginProps {
  onGuestLogin: () => void;
  onDiscordLogin: () => void;
}

export const DiscordLogin = ({ onGuestLogin, onDiscordLogin }: DiscordLoginProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestClick = async () => {
    setIsLoading(true);
    try {
      await onGuestLogin();
    } catch (error) {
      console.error('Guest login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-black to-zinc-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      <div className="relative max-w-md w-full">
        <div className="bg-gradient-to-b from-zinc-900/90 to-black/90 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl mb-4 border border-zinc-700 shadow-lg">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 3l7 7-7 7M3 14l7-7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 21h18" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Онлайн Суд</h1>
            <p className="text-gray-400 text-lg">Браузерная судебная игра</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onDiscordLogin}
              className="w-full bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 border border-zinc-700 flex items-center justify-center gap-3 shadow-lg"
            >
              <DiscordIcon className="w-6 h-6" />
              Войти через Discord
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-r from-zinc-900 via-black to-zinc-900 text-gray-500">или</span>
              </div>
            </div>

            <button
              onClick={handleGuestClick}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg"
            >
              {isLoading ? 'Вход...' : 'Войти как гость'}
            </button>
            
            <div className="mt-3 text-center">
              <p className="text-gray-500 text-xs">
                Вам будет присвоено имя: <span className="text-gray-400 font-mono">Гость#{Math.floor(Math.random() * 900000000 + 100000000)}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-gray-500 text-sm">
              Общение между игроками происходит в Discord
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Discord OAuth настраивается опционально
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
