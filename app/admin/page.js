'use client'

import { useState, useEffect } from 'react'

const REPO = 'arkhandyman/ark-handyman'
const BRANCH = 'main'
const CATEGORIES = ['Home Maintenance', 'Drywall Tips', 'Painting Tips', 'Tile Tips', 'Local Community']

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  const data = {}
  match[1].split('\n').forEach(line => {
    const colon = line.indexOf(': ')
    if (colon === -1) return
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 2).trim().replace(/^["']|["']$/g, '')
    data[key] = val
  })
  return { data, body: match[2].trim() }
}

function buildMarkdown(data, body) {
  const lines = [
    '---',
    `title: "${(data.title || '').replace(/"/g, '\\"')}"`,
    `date: "${data.date || new Date().toISOString().split('T')[0]}"`,
    `description: "${(data.description || '').replace(/"/g, '\\"')}"`,
    `category: "${data.category || 'Home Maintenance'}"`,
  ]
  if (data.image) lines.push(`image: "${data.image}"`)
  if (data.imageAlt) lines.push(`imageAlt: "${(data.imageAlt || '').replace(/"/g, '\\"')}"`)
  lines.push('---', '', body)
  return lines.join('\n')
}

async function ghApi(token, path, opts = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub error ${res.status}`)
  }
  return res.json()
}

const s = {
  page: { fontFamily: 'system-ui,sans-serif', maxWidth: 860, margin: '0 auto', padding: 24, color: '#1B3A5F' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 16, borderBottom: '3px solid #F2A922' },
  h1: { margin: 0, fontSize: 22, color: '#1B3A5F' },
  btn: { background: '#1B3A5F', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 14 },
  btnGold: { background: '#F2A922', color: '#1B3A5F', fontWeight: 700, border: 'none', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 14 },
  btnOutline: { background: 'transparent', color: '#1B3A5F', border: '1.5px solid #1B3A5F', padding: '9px 18px', borderRadius: 7, cursor: 'pointer', fontSize: 14 },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: '#f4f5f7', borderRadius: 9, marginBottom: 10, cursor: 'pointer' },
  field: { marginBottom: 18 },
  label: { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 13, color: '#1B3A5F' },
  input: { width: '100%', padding: '9px 13px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 14, boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '9px 13px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 14, fontFamily: 'monospace', boxSizing: 'border-box', minHeight: 420, lineHeight: 1.6 },
  select: { width: '100%', padding: '9px 13px', border: '1.5px solid #ddd', borderRadius: 7, fontSize: 14, boxSizing: 'border-box', background: '#fff' },
  banner: { padding: '11px 16px', borderRadius: 7, marginBottom: 18, fontSize: 14 },
}

export default function AdminPage() {
  const [token, setToken] = useState(null)
  const [view, setView] = useState('list')
  const [posts, setPosts] = useState([])
  const [current, setCurrent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#token=')) {
      const t = decodeURIComponent(hash.slice(7))
      localStorage.setItem('gh_token', t)
      setToken(t)
      history.replaceState(null, '', window.location.pathname)
      return
    }
    const error = new URLSearchParams(window.location.search).get('error')
    if (error) setMsg({ type: 'error', text: 'Login failed: ' + error })
    const stored = localStorage.getItem('gh_token')
    if (stored) setToken(stored)
  }, [])

  useEffect(() => {
    if (!token || view !== 'list') return
    setLoading(true)
    ghApi(token, 'contents/content/blog')
      .then(files => {
        setPosts(files.filter(f => f.name.endsWith('.md')).sort((a, b) => b.name.localeCompare(a.name)))
        setLoading(false)
      })
      .catch(e => {
        if (e.message.includes('401') || e.message.includes('Bad credentials')) {
          localStorage.removeItem('gh_token')
          setToken(null)
        } else {
          setMsg({ type: 'error', text: 'Could not load posts: ' + e.message })
        }
        setLoading(false)
      })
  }, [token, view])

  async function openPost(file) {
    setLoading(true)
    try {
      const fileData = await ghApi(token, `contents/content/blog/${file.name}`)
      const raw = decodeURIComponent(escape(atob(fileData.content.replace(/\s/g, ''))))
      const { data, body } = parseFrontmatter(raw)
      setCurrent({ slug: file.name.replace('.md', ''), sha: fileData.sha, data, body })
      setView('edit')
    } catch (e) {
      setMsg({ type: 'error', text: 'Could not open post: ' + e.message })
    }
    setLoading(false)
  }

  function newPost() {
    setCurrent({
      slug: '',
      sha: null,
      data: { title: '', date: new Date().toISOString().split('T')[0], description: '', category: 'Home Maintenance', image: '', imageAlt: '' },
      body: '',
    })
    setMsg(null)
    setView('new')
  }

  async function savePost() {
    if (!current.data.title) return setMsg({ type: 'error', text: 'Title is required.' })
    setSaving(true)
    setMsg(null)
    try {
      const slug = current.slug || current.data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const md = buildMarkdown(current.data, current.body)
      const content = btoa(unescape(encodeURIComponent(md)))
      await ghApi(token, `contents/content/blog/${slug}.md`, {
        method: 'PUT',
        body: JSON.stringify({
          message: `${current.sha ? 'Update' : 'Add'} post: ${current.data.title}`,
          content,
          branch: BRANCH,
          ...(current.sha ? { sha: current.sha } : {}),
        }),
      })
      setMsg({ type: 'success', text: '✅ Published! Your site will update in about 60 seconds.' })
      setView('list')
    } catch (e) {
      setMsg({ type: 'error', text: 'Save failed: ' + e.message })
    }
    setSaving(false)
  }

  async function uploadImage(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1]
          const ext = file.name.split('.').pop()
          const filename = `${Date.now()}.${ext}`
          await ghApi(token, `contents/public/uploads/${filename}`, {
            method: 'PUT',
            body: JSON.stringify({ message: `Upload image: ${filename}`, content: base64, branch: BRANCH }),
          })
          resolve(`/uploads/${filename}`)
        } catch (e) { reject(e) }
      }
      reader.readAsDataURL(file)
    })
  }

  const update = (field, val) => setCurrent(c => ({ ...c, data: { ...c.data, [field]: val } }))

  if (!token) {
    return (
      <div style={{ ...s.page, textAlign: 'center', paddingTop: 100 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
        <h1 style={{ color: '#1B3A5F', marginBottom: 8 }}>Ark Handyman Blog</h1>
        <p style={{ color: '#666', marginBottom: 36 }}>Sign in with GitHub to write and publish blog posts.</p>
        {msg && <div style={{ ...s.banner, background: '#fdecea', color: '#c0392b', marginBottom: 24 }}>{msg.text}</div>}
        <button style={{ ...s.btnGold, fontSize: 16, padding: '13px 36px' }} onClick={() => window.location.href = '/api/oauth/authorize?provider=github'}>
          Login with GitHub
        </button>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.h1}>🛠️ Blog Posts</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={s.btnGold} onClick={newPost}>+ New Post</button>
            <button style={s.btnOutline} onClick={() => { localStorage.removeItem('gh_token'); setToken(null) }}>Logout</button>
          </div>
        </div>
        {msg && <div style={{ ...s.banner, background: msg.type === 'error' ? '#fdecea' : '#e8f5e9', color: msg.type === 'error' ? '#c0392b' : '#2e7d32' }}>{msg.text}</div>}
        {loading && <p style={{ color: '#888' }}>Loading posts…</p>}
        {posts.map(p => (
          <div key={p.name} style={s.row} onClick={() => openPost(p)}>
            <span style={{ fontWeight: 600 }}>{p.name.replace('.md', '')}</span>
            <button style={s.btn} onClick={e => { e.stopPropagation(); openPost(p) }}>Edit →</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.h1}>{view === 'new' ? '✏️ New Post' : '✏️ Edit Post'}</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={s.btnOutline} onClick={() => { setView('list'); setMsg(null) }}>← All Posts</button>
          <button style={s.btnGold} onClick={savePost} disabled={saving}>{saving ? 'Saving…' : 'Save & Publish'}</button>
        </div>
      </div>
      {msg && <div style={{ ...s.banner, background: msg.type === 'error' ? '#fdecea' : '#e8f5e9', color: msg.type === 'error' ? '#c0392b' : '#2e7d32' }}>{msg.text}</div>}

      {view === 'new' && (
        <div style={s.field}>
          <label style={s.label}>URL Slug (leave blank to auto-generate from title)</label>
          <input style={s.input} value={current.slug} onChange={e => setCurrent(c => ({ ...c, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="my-post-title" />
        </div>
      )}

      <div style={s.field}>
        <label style={s.label}>Title *</label>
        <input style={s.input} value={current.data.title || ''} onChange={e => update('title', e.target.value)} placeholder="Enter post title" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={s.field}>
          <label style={s.label}>Publish Date</label>
          <input type="date" style={s.input} value={current.data.date || ''} onChange={e => update('date', e.target.value)} />
        </div>
        <div style={s.field}>
          <label style={s.label}>Category</label>
          <select style={s.select} value={current.data.category || 'Home Maintenance'} onChange={e => update('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div style={s.field}>
        <label style={s.label}>Short Description (shown in blog list & Google search)</label>
        <input style={s.input} value={current.data.description || ''} onChange={e => update('description', e.target.value)} placeholder="A one-sentence summary of this post" />
      </div>

      <div style={s.field}>
        <label style={s.label}>Featured Image</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input style={s.input} value={current.data.image || ''} onChange={e => update('image', e.target.value)} placeholder="/uploads/my-image.jpg" />
          <label style={{ ...s.btn, whiteSpace: 'nowrap', cursor: 'pointer' }}>
            Upload Image
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
              const file = e.target.files[0]
              if (!file) return
              setMsg({ type: 'success', text: 'Uploading image…' })
              try {
                const url = await uploadImage(file)
                update('image', url)
                setMsg({ type: 'success', text: '✅ Image uploaded!' })
              } catch (err) {
                setMsg({ type: 'error', text: 'Upload failed: ' + err.message })
              }
            }} />
          </label>
        </div>
        {current.data.image && <img src={current.data.image} alt="preview" style={{ marginTop: 10, maxHeight: 160, borderRadius: 7 }} />}
      </div>

      <div style={s.field}>
        <label style={s.label}>Image Alt Text</label>
        <input style={s.input} value={current.data.imageAlt || ''} onChange={e => update('imageAlt', e.target.value)} placeholder="Describe the image for Google and accessibility" />
      </div>

      <div style={s.field}>
        <label style={s.label}>Post Content</label>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px' }}>Use ## for headings, **bold**, *italic*, - for bullet points. Paste a YouTube URL on its own line to embed a video.</p>
        <textarea style={s.textarea} value={current.body || ''} onChange={e => setCurrent(c => ({ ...c, body: e.target.value }))} placeholder="Write your post content here…" />
      </div>

      <button style={{ ...s.btnGold, width: '100%', padding: 15, fontSize: 16, marginTop: 8 }} onClick={savePost} disabled={saving}>
        {saving ? 'Saving…' : '✅ Save & Publish'}
      </button>
    </div>
  )
}
