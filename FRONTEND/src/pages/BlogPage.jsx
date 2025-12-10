import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { blogPosts } from '../data/mockData'

const API_URL = 'https://backend-tau-lime-64.vercel.app/api/blog'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  if (loading) return <div className="section-container py-12 text-center"><p className="text-slate-600">Loading...</p></div>

  return (
    <div className="section-container py-12 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Blog</p>
          <h1 className="text-3xl font-bold text-slate-900">Insights and resources</h1>
          <p className="text-sm text-slate-600">Tips on applications, essays, and visas from our advisors.</p>
        </div>
        <Link to="/contact" className="btn-secondary">Ask a question</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="card-surface p-5 flex flex-col gap-3">
            <p className="text-xs text-slate-500">{post.date}</p>
            <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
            <p className="text-sm text-slate-600 line-clamp-3">{post.excerpt}</p>
            <Link className="text-sky-700 font-semibold hover:text-sky-800" to={`/blog/${post.id}`}>
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

