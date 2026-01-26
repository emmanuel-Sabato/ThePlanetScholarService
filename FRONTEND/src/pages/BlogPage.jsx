import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar, Loader2, BookOpen } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : '/api');

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/blog`)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading articles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sky-50 via-white to-slate-50 py-16 md:py-20">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <p className="text-xs uppercase tracking-wide text-sky-600 font-semibold">Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Insights and Resources
            </h1>
            <p className="text-lg text-slate-600">
              Tips on applications, essays, and visas from our expert advisors.
            </p>
            <Link
              to="/contact"
              className="btn-secondary inline-flex items-center gap-2 mt-4"
            >
              Ask a Question
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-container py-12 md:py-16">
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{post.date}</span>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-sky-600 font-semibold hover:text-sky-700 transition-colors text-sm group"
                >
                  Read more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No articles yet</h3>
            <p className="text-slate-600">Check back soon for helpful tips and insights!</p>
          </div>
        )}
      </section>
    </div>
  )
}

