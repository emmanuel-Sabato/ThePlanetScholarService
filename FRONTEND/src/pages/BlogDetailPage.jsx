import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Calendar, User, ArrowLeft, BookOpen, Loader2 } from 'lucide-react'

const API_URL = 'https://backend-tau-lime-64.vercel.app/api/blog'

export default function BlogDetailPage() {
  const { id } = useParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API_URL)
      .then(r => r.json())
      .then(data => { setPosts(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const post = posts.find((p) => p.id === id)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="section-container">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Article Not Found</h2>
            <p className="text-slate-600 mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="section-container py-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-sky-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>

      <article className="section-container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
              {post.author && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-xl text-slate-600 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm">
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 leading-relaxed space-y-4">
                <p className="text-lg">{post.content}</p>
                <p className="text-lg">
                  Remember to tailor your submissions to each scholarship. Highlight measurable impact, stay authentic, and keep your documents consistent across applications.
                </p>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Link
              to="/blog"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Articles
            </Link>
          </div>
        </div>
      </article>
    </div>
  )
}

