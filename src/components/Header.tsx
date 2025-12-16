import { Sprout } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full py-6 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/20 backdrop-blur-sm p-3 rounded-2xl border border-green-400/30">
            <Sprout className="w-8 h-8 text-green-400" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500">
              AGRI AI
            </span>
          </h1>
        </div>
      </div>
    </header>
  );
}
