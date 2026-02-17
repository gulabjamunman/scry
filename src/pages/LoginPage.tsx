import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — no real auth
    navigate('/reviewer');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Reviewer Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access the review platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="reviewer@biaswatch.org"
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" /> Sign In
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Demo mode — any credentials will work
        </p>
      </div>
    </div>
  );
}
