'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase'

export default function SignupPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSignup = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const { data,error } = await supabase.auth.signUp({
            email: email,
            password:password,
        })
        setLoading(false)

        if(error){
            setError(error.message)
        }else{
            router.push('/login')
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form
                onSubmit={handleSignup}
                className="bg-white p-8 rounded-lg shadow-md w-96"
            >
                <h1 className='text-2x1 font-bold mb-6 text-center'>Sign Up</h1>
                {error && (
                  <p className='text-red-500 text-sm mb-4'>{error}</p>
                )}

                <div className='mb-4'>
                    <label className='block text-sm font-medium mb-1'>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'creating account...' :'Sign Up'}
                </button>  
            </form>
        </div>
    )
}