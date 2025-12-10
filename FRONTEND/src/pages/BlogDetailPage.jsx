import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

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

  if (!post) {
    return (
      <div className="section-container py-12">
        <div className="card-surface p-6 text-center">
          <p className="text-lg font-semibold text-slate-900">Article not found</p>
          <Link to="/blog" className="btn-primary mt-4 inline-flex">
            Back to blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="section-container py-12 space-y-6 max-w-3xl">
      <p className="text-sm text-slate-500">{post.date}</p>
      <h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
      <p className="text-sm text-slate-600">By {post.author}</p>
      <div className="card-surface p-6 space-y-4">
        <p className="text-slate-700 leading-relaxed">{post.content}</p>
        <p className="text-slate-700 leading-relaxed">
          Remember to tailor your submissions to each scholarship. Highlight measurable impact, stay authentic, and keep your documents consistent across applications.
        </p>
      </div>
      <Link to="/blog" className="btn-secondary inline-flex">Back to articles</Link>
    </div>
  )
}

