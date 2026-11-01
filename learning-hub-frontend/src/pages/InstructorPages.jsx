
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  FileQuestion,
  MoreHorizontal,
  Plus,
  UploadCloud,
  Users,
  Video
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'lh-auth-token'

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) {
    throw new Error('Your login session was not found. Please sign in again.')
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

export function InstructorDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [coursesList, setCoursesList] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    Promise.all([apiRequest('/instructor/dashboard'), apiRequest('/courses/mine')])
      .then(([d, c]) => { if (active) { setDashboard(d.dashboard || {}); setCoursesList(c.courses || []) } })
      .catch(e => { if (active) setError(e.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const lessonCount = coursesList.reduce((sum, course) => sum + (course.lessonCount || 0), 0)
  return <>
    <div className="page-heading"><div><div className="eyebrow">YOUR TEACHING SPACE ✦</div><h1>Make an impact, one lesson at a time.</h1><p className="muted">Here's what's happening in your classroom.</p></div><Link to="/instructor/create-course" className="button button-primary"><Plus size={17}/> Create a course</Link></div>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-icon lilac"><BookOpen/></span><div><strong>{loading?'—':dashboard?.courseCount||0}</strong><small>Courses created</small></div><span className="stat-foot">Your content library</span></div>
      <div className="stat-card"><span className="stat-icon peach"><Users/></span><div><strong>{loading?'—':dashboard?.studentCount||0}</strong><small>Enrolled students</small></div><span className="stat-foot">Your learners</span></div>
      <div className="stat-card"><span className="stat-icon mint"><Video/></span><div><strong>{loading?'—':lessonCount}</strong><small>Lessons created</small></div><span className="stat-foot">Ready to learn</span></div>
      <div className="stat-card"><span className="stat-icon yellow"><FileQuestion/></span><div><strong>{loading?'—':dashboard?.quizAttemptCount||0}</strong><small>Quiz attempts</small></div><span className="stat-foot">Student activity</span></div>
    </div>
    <div className="section-row"><div><h2>Your courses</h2><p className="muted">Manage the learning experiences you've created.</p></div><Link to="/instructor/courses" className="text-link">Manage all <ArrowRight size={16}/></Link></div>
    {loading?<p className="muted">Loading your courses...</p>:coursesList.length?<div className="instructor-course-list">{coursesList.slice(0,5).map(c=><div className="instructor-course-row" key={c.id}><div className="mini-course-art lilac"><BookOpen/></div><div className="instructor-course-info"><strong>{c.title}</strong><span>{c.category||'General'} · {c.lessonCount||0} lessons</span></div><span className="student-count"><Users size={15}/> {c.studentCount||0} students</span><span className={c.status==='published'?'status-live':'muted'}>{c.status}</span></div>)}</div>:<p className="muted">You haven't created any courses yet.</p>}
  </>
}

export function ManageCourses() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    apiRequest('/courses/mine')
      .then(data => {
        if (active) setItems(data.courses || [])
      })
      .catch(err => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  return <>
    <div className="page-heading">
      <div>
        <div className="eyebrow">YOUR CONTENT</div>
        <h1>Manage courses</h1>
        <p className="muted">Keep your courses fresh and organized.</p>
      </div>
      <Link to="/instructor/create-course" className="button button-primary"><Plus size={17}/> New course</Link>
    </div>

    {loading && <p className="muted">Loading your courses...</p>}
    {error && <p className="error-message">{error}</p>}
    {!loading && !error && items.length === 0 && <p className="muted">You haven't created any courses yet.</p>}

    <div className="instructor-course-list">
      {items.map(course => (
        <div className="instructor-course-row" key={course.id}>
          <div className="mini-course-art lilac"><BookOpen/></div>
          <div className="instructor-course-info">
            <strong>{course.title}</strong>
            <span>{course.category || 'General'} · {course.lessonCount || 0} lessons</span>
          </div>
          <span className="status-live">{course.status || 'draft'}</span>
        </div>
      ))}
    </div>
  </>
}

export function CreateCourse() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Development')
  const [level, setLevel] = useState('Beginner')
  const [status, setStatus] = useState('draft')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleCreateCourse(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (title.trim().length < 3) {
      setError('Course title must contain at least 3 characters.')
      return
    }

    if (description.trim().length < 10) {
      setError('Description must contain at least 10 characters.')
      return
    }

    setSaving(true)

    try {
      const data = await apiRequest('/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          level,
          status
        })
      })

      setSuccess(`Course "${data.course.title}" was created successfully!`)
      setTitle('')
      setDescription('')
      setCategory('Development')
      setLevel('Beginner')
      setStatus('draft')
    } catch (err) {
      setError(err.message || 'Could not create course.')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <div className="page-heading">
      <div>
        <div className="eyebrow">SHARE WHAT YOU KNOW</div>
        <h1>Create a course</h1>
        <p className="muted">Start with the big idea. You can add lessons next.</p>
      </div>
    </div>

    <form className="form-panel" onSubmit={handleCreateCourse}>
      <label>
        Course title
        <input required minLength="3" maxLength="140" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Introduction to web design" disabled={saving}/>
      </label>

      <label>
        Short description
        <textarea required minLength="10" maxLength="5000" rows="4" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will students learn in this course?" disabled={saving}/>
      </label>

      <label>
        Category
        <select value={category} onChange={e => setCategory(e.target.value)} disabled={saving}>
          <option>Development</option>
          <option>Design</option>
          <option>Business</option>
          <option>Personal growth</option>
        </select>
      </label>

      <label>
        Level
        <select value={level} onChange={e => setLevel(e.target.value)} disabled={saving}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>

      <label>
        Course status
        <select value={status} onChange={e => setStatus(e.target.value)} disabled={saving}>
          <option value="draft">Save as draft</option>
          <option value="published">Publish course</option>
        </select>
      </label>

      {error && <p className="error-message" role="alert">{error}</p>}
      {success && <p className="success-message" role="status">{success}</p>}

      <div className="form-actions">
        <button type="submit" className="button button-primary" disabled={saving}>
          {saving ? 'Saving course...' : 'Save course'}
          {!saving && <ArrowRight size={17}/>}
        </button>
      </div>
    </form>
  </>
}

export function ManageLessons() {
  const [instructorCourses, setInstructorCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState('1')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadCourses() {
    setLoadingCourses(true)
    setError('')

    try {
      const data = await apiRequest('/courses/mine')
      const list = data.courses || []
      setInstructorCourses(list)
      setSelectedCourse(current =>
        list.some(course => String(course.id) === current)
          ? current
          : list.length > 0 ? String(list[0].id) : ''
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingCourses(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  async function handleSaveLesson(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedCourse) {
      setError('Please create or select a course first.')
      return
    }

    if (title.trim().length < 2) {
      setError('Please enter a lesson title with at least 2 characters.')
      return
    }

    if (!Number.isInteger(Number(order)) || Number(order) < 1) {
      setError('Lesson order must be a whole number of at least 1.')
      return
    }

    if (durationMinutes !== '' && (!Number.isFinite(Number(durationMinutes)) || Number(durationMinutes) < 0)) {
      setError('Duration must be zero or a positive number.')
      return
    }

    if (selectedFile && selectedFile.size > 30 * 1024 * 1024) {
      setError('Video must be 30 MB or smaller.')
      return
    }
    setUploading(true)

    try {
      let data
      const lessonDetails = { title: title.trim(), description: description.trim(), order: Number(order), durationMinutes: Number(durationMinutes) || 0, isPreview }
      if (selectedFile) {
        const start = await apiRequest(`/lessons/course/${encodeURIComponent(selectedCourse)}/upload/start`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...lessonDetails, fileName: selectedFile.name, mimeType: selectedFile.type, fileSize: selectedFile.size }) })
        const token = localStorage.getItem(TOKEN_KEY)
        const chunkSize = start.chunkSize || 1024 * 1024
        for (let index = 0; index < start.chunkCount; index++) {
          const form = new FormData()
          form.append('chunk', selectedFile.slice(index * chunkSize, Math.min(selectedFile.size, (index + 1) * chunkSize)))
          form.append('index', String(index))
          const response = await fetch(`${API_URL}/lessons/upload/${start.uploadId}/chunk`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form })
          const result = await response.json()
          if (!response.ok || !result.success) throw new Error(result.message || `Video chunk ${index + 1} failed.`)
        }
        data = await apiRequest(`/lessons/upload/${start.uploadId}/finish`, { method: 'POST' })
      } else {
        data = await apiRequest(`/lessons/course/${encodeURIComponent(selectedCourse)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lessonDetails) })
      }

      setSuccess(selectedFile ? 'Lesson and video uploaded successfully!' : 'Lesson created successfully!')
      setTitle('')
      setDescription('')
      setDurationMinutes('')
      setIsPreview(false)
      setSelectedFile(null)
      setFileInputKey(key => key + 1)

      setInstructorCourses(current =>
        current.map(course =>
          String(course.id) === selectedCourse
            ? { ...course, lessonCount: (course.lessonCount || 0) + 1 }
            : course
        )
      )
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return <>
    <div className="page-heading">
      <div>
        <div className="eyebrow">BRING YOUR COURSE TO LIFE</div>
        <h1>Lessons & videos</h1>
        <p className="muted">Organize your lessons and upload video content.</p>
      </div>
    </div>

    <div className="two-column-panels">
      <form className="form-panel" onSubmit={handleSaveLesson}>
        <h2>Add a lesson</h2>

        <label>
          Choose course
          <select required value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} disabled={loadingCourses || uploading || instructorCourses.length === 0}>
            {loadingCourses && <option value="">Loading your courses...</option>}
            {!loadingCourses && instructorCourses.length === 0 && <option value="">No courses found</option>}
            {instructorCourses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>

        <label>
          Lesson title
          <input required minLength="2" maxLength="140" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Getting started" disabled={uploading}/>
        </label>

        <label>
          Lesson description
          <textarea rows="3" maxLength="3000" value={description} onChange={e => setDescription(e.target.value)} placeholder="What will students learn in this lesson?" disabled={uploading}/>
        </label>

        <label>
          Lesson order
          <input type="number" min="1" step="1" required value={order} onChange={e => setOrder(e.target.value)} disabled={uploading}/>
        </label>

        <label>
          Duration in minutes (optional)
          <input type="number" min="0" step="1" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="e.g. 12" disabled={uploading}/>
        </label>

        <label>
          Video file (optional)
          <div className="upload-placeholder">
            <UploadCloud size={24}/>
            <strong>{selectedFile ? selectedFile.name : 'Choose a video file'}</strong>
            <span>MP4, WebM, MOV or MKV</span>
            <input key={fileInputKey} type="file" accept=".mp4,.webm,.mov,.mkv,video/mp4,video/webm,video/quicktime,video/x-matroska" onChange={e => setSelectedFile(e.target.files?.[0] || null)} disabled={uploading}/>
          </div>
        </label>

        <label className="check-row">
          <input type="checkbox" checked={isPreview} onChange={e => setIsPreview(e.target.checked)} disabled={uploading}/>
          <span><strong>Free preview lesson</strong><small>Allow students to watch this lesson without enrolling.</small></span>
        </label>

        {error && <p className="error-message" role="alert">{error}</p>}
        {success && <p className="success-message" role="status">{success}</p>}

        <button className="button button-primary" type="submit" disabled={uploading || loadingCourses || instructorCourses.length === 0}>
          {uploading ? 'Saving lesson and uploading...' : 'Save lesson'}
          {!uploading && <ArrowRight size={17}/>}
        </button>

        {!loadingCourses && instructorCourses.length === 0 && (
          <button className="button button-outline" type="button" onClick={loadCourses}>
            Refresh course list
          </button>
        )}
      </form>

      <section className="form-panel">
        <h2>Upload checklist</h2>
        <div className="check-row"><span>01</span><div><strong>Select your course</strong><small>Choose one of your courses from the list.</small></div></div>
        <div className="check-row"><span>02</span><div><strong>Add lesson details</strong><small>Enter a title, description and lesson order.</small></div></div>
        <div className="check-row"><span>03</span><div><strong>Choose your video</strong><small>Select an MP4, WebM, MOV or MKV file.</small></div></div>
        <div className="check-row"><span>04</span><div><strong>Save your lesson</strong><small>Your lesson and video are sent to the backend together.</small></div></div>
      </section>
    </div>
  </>
}

export function ManageQuizzes() {
  const [coursesList, setCoursesList] = useState([])
  const [courseId, setCourseId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([{ prompt: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 1 }])
  const [quizzes, setQuizzes] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  async function load() {
    try {
      const [c, q] = await Promise.all([apiRequest('/courses/mine'), apiRequest('/quizzes/mine')])
      setCoursesList(c.courses || []); setQuizzes(q.quizzes || [])
      if (!courseId && c.courses?.length) setCourseId(String(c.courses[0].id))
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])
  function updateQuestion(i, patch) { setQuestions(old => old.map((q,j) => j === i ? {...q,...patch} : q)) }
  async function save(e) {
    e.preventDefault(); setError(''); setSuccess('')
    if (!courseId) return setError('Create a course first.')
    if (!questions.length || questions.some(q => !q.prompt.trim() || q.options.some(o => !o.trim()) || q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length)) return setError('Complete every question and all four options.')
    setSaving(true)
    try {
      await apiRequest(`/quizzes/course/${courseId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title,description,questions}) })
      setTitle(''); setDescription(''); setQuestions([{prompt:'',options:['','','',''],correctOptionIndex:0,points:1}]); setSuccess('Quiz saved successfully.'); await load()
    } catch(e) { setError(e.message) } finally { setSaving(false) }
  }
  async function remove(id) { if (!window.confirm('Delete this quiz and its attempts?')) return; try { await apiRequest(`/quizzes/${id}`,{method:'DELETE'}); await load() } catch(e) { setError(e.message) } }
  return <><div className="page-heading"><div><div className="eyebrow">CHECK UNDERSTANDING</div><h1>Quiz management</h1><p className="muted">Create quizzes with questions and correct answers.</p></div></div>
    <form className="form-panel" onSubmit={save}><h2>Create a quiz</h2>
      <label>Choose course<select required value={courseId} onChange={e=>setCourseId(e.target.value)}><option value="">Select a course</option>{coursesList.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></label>
      <label>Quiz title<input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. React basics"/></label>
      <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} rows="2"/></label>
      {questions.map((q,i)=><section className="form-panel" key={i}><h3>Question {i+1}</h3><label>Question text<textarea required value={q.prompt} onChange={e=>updateQuestion(i,{prompt:e.target.value})}/></label>
        {q.options.map((o,j)=><label key={j}>Option {String.fromCharCode(65+j)}<input required value={o} onChange={e=>updateQuestion(i,{options:q.options.map((v,k)=>k===j?e.target.value:v)})}/></label>)}
        <label>Correct answer<select value={q.correctOptionIndex} onChange={e=>updateQuestion(i,{correctOptionIndex:Number(e.target.value)})}>{q.options.map((o,j)=><option key={j} value={j}>Option {String.fromCharCode(65+j)}</option>)}</select></label>
        <label>Points<input type="number" min="1" max="100" value={q.points} onChange={e=>updateQuestion(i,{points:Number(e.target.value)})}/></label>
        {questions.length>1&&<button type="button" className="button button-outline" onClick={()=>setQuestions(old=>old.filter((_,j)=>j!==i))}>Remove question</button>}
      </section>)}
      <button type="button" className="button button-outline" onClick={()=>setQuestions(old=>[...old,{prompt:'',options:['','','',''],correctOptionIndex:0,points:1}])}>Add question</button>
      {error&&<p className="error-message">{error}</p>}{success&&<p className="success-message">{success}</p>}
      <button className="button button-primary" disabled={saving}>{saving?'Saving quiz...':'Save quiz'}</button>
    </form>
    <div className="section-row"><h2>Your quizzes</h2></div><div className="instructor-course-list">{quizzes.map(q=><div className="instructor-course-row" key={q.id}><div className="instructor-course-info"><strong>{q.title}</strong><span>{q.courseTitle} · {q.questions?.length||0} questions</span></div><button type="button" className="button button-outline" onClick={()=>remove(q.id)}>Delete</button></div>)}{!quizzes.length&&<p className="muted">No quizzes created yet.</p>}</div>
  </>
}

export function InstructorStudents() {
  const [data, setData] = useState({ students: [], quizResults: [] })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    apiRequest('/instructor/students').then(result => { if (active) setData({ students: result.students || [], quizResults: result.quizResults || [] }) })
      .catch(e => { if (active) setError(e.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  function exportResults() {
    const rows = [['Student','Email','Course','Quiz','Score','Percentage','Passed'], ...data.quizResults.map(r => [r.studentName,r.studentEmail,r.courseTitle,r.quizTitle,`${r.score}/${r.totalPoints}`,`${r.percentage}%`,r.passed?'Yes':'No'])]
    const csv = rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g,'""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = 'learning-hub-results.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return <><div className="page-heading"><div><div className="eyebrow">YOUR LEARNING COMMUNITY</div><h1>Students & results</h1><p className="muted">Enrolled learners and submitted quiz scores.</p></div><button type="button" className="button button-outline" onClick={exportResults} disabled={!data.quizResults.length}><ArrowDownToLine size={17}/> Export results</button></div>
    {error&&<p className="error-message" role="alert">{error}</p>}{loading&&<p className="muted">Loading student activity...</p>}
    {!loading&&<><div className="table-panel"><div className="table-head"><h2>Enrolled students</h2><span className="muted small">{data.students.length} enrollments</span></div>{data.students.length?<div className="table-scroll"><table><thead><tr><th>Student</th><th>Email</th><th>Course</th><th>Status</th></tr></thead><tbody>{data.students.map((student,index)=><tr key={`${student.studentId}-${student.courseId}-${index}`}><td>{student.name}</td><td>{student.email}</td><td>{student.courseTitle}</td><td>{student.status}</td></tr>)}</tbody></table></div>:<p className="muted">No students have enrolled in your courses yet.</p>}</div>
    <div className="table-panel"><div className="table-head"><h2>Quiz results</h2><span className="muted small">{data.quizResults.length} attempts</span></div>{data.quizResults.length?<div className="table-scroll"><table><thead><tr><th>Student</th><th>Quiz</th><th>Course</th><th>Score</th><th>Result</th></tr></thead><tbody>{data.quizResults.map(result=><tr key={result.attemptId}><td>{result.studentName}<small>{result.studentEmail}</small></td><td>{result.quizTitle}</td><td>{result.courseTitle}</td><td>{result.score}/{result.totalPoints} ({result.percentage}%)</td><td>{result.passed?'Passed':'Not passed'}</td></tr>)}</tbody></table></div>:<p className="muted">No quiz attempts have been submitted yet.</p>}</div></>}
  </>
}
