'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
const router = useRouter()

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [error, setError] = useState('')
const [loading, setLoading] = useState(false)

const handleLogin = async (e) => {
e.preventDefault()

```
setError('')
setLoading(true)

const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

setLoading(false)

if (error) {
  setError(error.message)
  return
}

router.push('/dashboard')
```

}

return ( <div className="flex min-h-screen items-center justify-center bg-gray-100"> <form
     onSubmit={handleLogin}
     className="w-96 rounded-lg bg-white p-8 shadow-md"
   > <h1 className="mb-6 text-center text-2xl font-bold text-black">
Login </h1>

    {error && (
      <p className="mb-4 text-sm text-red-500">
        {error}
      </p>
    )}

    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-black">
        Email
      </label>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="mb-6">
      <label className="mb-1 block text-sm font-medium text-black">
        Password
      </label>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Logging in...' : 'Login'}
    </button>

    <p className="mt-4 text-center text-sm text-black">
      Don&apos;t have an account?{' '}
      <Link
        href="/signup"
        className="font-medium text-blue-600 hover:underline"
      >
        Sign Up
      </Link>
    </p>
  </form>
</div>

)
}
