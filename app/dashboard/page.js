'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS = {
  Food: '#3b82f6',
  Travel: '#f59e0b',
  Shopping: '#ec4899',
  Bills: '#10b981',
  Other: '#8b5cf6',
}

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState('')
  const [formError, setFormError] = useState('')

  const [editingId, setEditingId] = useState(null)

  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        setLoading(false)
        fetchExpenses()
      }
    }

    checkUser()
  }, [router])

  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false })

    if (!error) {
      setExpenses(data)
    }
  }

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('Food')
    setDate('')
    setEditingId(null)
    setFormError('')
  }

  const handleEditClick = (exp) => {
    setEditingId(exp.id)
    setTitle(exp.title)
    setAmount(exp.amount)
    setCategory(exp.category)
    setDate(exp.date)
  }

  const handleDelete = async (id) => {
    const confirmDelete = confirm('Are you sure you want to delete this expense?')
    if (!confirmDelete) return

    const { error } = await supabase.from('expenses').delete().eq('id', id)

    if (!error) {
      fetchExpenses()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!title || !amount || !date) {
      setFormError('Please fill in all fields')
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from('expenses')
        .update({
          title: title,
          amount: parseFloat(amount),
          category: category,
          date: date,
        })
        .eq('id', editingId)

      if (error) {
        setFormError(error.message)
        return
      }
    } else {
      const { data: { session } } = await supabase.auth.getSession()

      const { error } = await supabase.from('expenses').insert({
        title: title,
        amount: parseFloat(amount),
        category: category,
        date: date,
        user_id: session.user.id,
      })

      if (error) {
        setFormError(error.message)
        return
      }
    }

    resetForm()
    fetchExpenses()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ---- STATS CALCULATIONS ----

  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthExpense = expenses
    .filter((exp) => {
      const expDate = new Date(exp.date)
      return (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      )
    })
    .reduce((sum, exp) => sum + Number(exp.amount), 0)

  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount)
    return acc
  }, {})

  const chartData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: categoryTotals[cat],
  }))

  // ---- END STATS CALCULATIONS ----

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Expense Tracker</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="p-6 max-w-3xl mx-auto">

        {/* Add / Edit Expense Form */}
        <h2 className="text-2xl font-bold mb-4">
          {editingId ? 'Edit Expense' : 'Add New Expense'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {formError && (
            <p className="text-red-500 text-sm md:col-span-2">{formError}</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
              placeholder="e.g. 500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
            >
              <option>Food</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-900"
            />
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {editingId ? 'Update Expense' : 'Add Expense'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Expense List */}
        <h2 className="text-2xl font-bold mb-4">Your Expenses</h2>

        <div className="bg-white rounded-lg shadow overflow-x-auto mb-8">
          {expenses.length === 0 ? (
            <p className="p-6 text-gray-500">No expenses added yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-sm font-medium text-gray-900">Title</th>
                  <th className="p-3 text-sm font-medium text-gray-900">Category</th>
                  <th className="p-3 text-sm font-medium text-gray-900">Date</th>
                  <th className="p-3 text-sm font-medium text-gray-900">Amount</th>
                  <th className="p-3 text-sm font-medium text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-t">
                    <td className="p-3 text-gray-900">{exp.title}</td>
                    <td className="p-3 text-gray-900">{exp.category}</td>
                    <td className="p-3 text-gray-900">{exp.date}</td>
                    <td className="p-3 text-gray-900">₹{exp.amount}</td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => handleEditClick(exp)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats Cards */}
        <h2 className="text-2xl font-bold mb-4">Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Expense</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹{totalExpense.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">This Month</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{thisMonthExpense.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Category Breakdown Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ₹${value.toFixed(0)}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  )
}