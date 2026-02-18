import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { BarChart3, UserPlus } from "lucide-react"

import { signUp } from "@/lib/auth"



export default function SignupPage() {

  const navigate = useNavigate()

  const [name, setName] = useState("")

  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)



  async function handleSignup(e: React.FormEvent) {

    e.preventDefault()

    setLoading(true)

    setError(null)

    try {

      await signUp(email, password, name)

      navigate("/reviewer")

    }
    catch (err: any) {

      setError(err.message || "Signup failed")

    }
    finally {

      setLoading(false)

    }

  }



  return (

    <div className="flex min-h-screen items-center justify-center p-6">

      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-bold">
            Create Reviewer Account
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Join the SCRY perception observatory
          </p>

        </div>



        <form onSubmit={handleSignup} className="space-y-4">

          <div>

            <label className="text-sm font-medium">
              Name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm"
            />

          </div>



          <div>

            <label className="text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm"
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
              onChange={e => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-sm"
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
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 flex items-center justify-center gap-2"
          >

            <UserPlus className="h-4 w-4" />

            {loading ? "Creating account..." : "Create Account"}

          </button>

        </form>



        <button
          onClick={() => navigate("/login")}
          className="w-full border rounded-lg px-4 py-2.5 text-sm hover:bg-muted"
        >

          Back to Login

        </button>

      </div>

    </div>

  )

}
