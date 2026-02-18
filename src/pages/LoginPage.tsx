import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, LogIn, UserPlus } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);
    setError(null);

    try {

      await signIn(email, password);

      navigate("/reviewer");

    }
    catch (err: any) {

      setError(err.message || "Login failed");

    }
    finally {

      setLoading(false);

    }

  }

  return (

    <div className="flex min-h-screen items-center justify-center p-6">

      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center">

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-bold">
            SCRY Reviewer Login
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Access the perception measurement console
          </p>

        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>

            <label className="text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

          <div>

            <label className="text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50"
          >

            <LogIn className="h-4 w-4" />

            {loading ? "Signing in..." : "Sign In"}

          </button>

        </form>

        {/* Sign Up Button */}
        <button
          onClick={() => navigate("/signup")}
          className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted flex items-center justify-center gap-2"
        >

          <UserPlus className="h-4 w-4" />

          Create Reviewer Account

        </button>

        <p className="text-center text-xs text-muted-foreground">
          Access restricted to calibrated reviewers
        </p>

      </div>

    </div>

  );

}
