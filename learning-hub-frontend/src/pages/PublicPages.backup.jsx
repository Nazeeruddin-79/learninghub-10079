import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Play, Sparkles, Users, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Home() {
  const { user } = useAuth()
  return (
    <div className="public-page">
      <header className="public-nav wrap">
        <Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={22} /></span><span>learn<span className="brand-accent">hub</span></span></Link>
        <nav><a href="#features">Why LearnHub</a><a href="#how">How it works</a></nav>
        <div className="nav-cta">
          {user ? <Link className="button button-primary button-small" to={user.role === 'instructor' ? '/instructor' : '/student'}>Open dashboard <ArrowRight size={16}/></Link> : <Link className="button button-primary button-small" to="/login">Get started <ArrowRight size={16}/></Link>}
        </div>
      </header>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Make room for<br/><span>what's next.</span></h1>
          <p className="hero-text">A little curiosity can take you a long way. Learn new skills, find your rhythm, and turn your goals into progress.</p>
          <div className="hero-actions"><Link to="/login" className="button button-primary">Start learning <ArrowRight size={18}/></Link><a href="#how" className="button button-quiet"><Play size={16}/> See how it works</a></div>
          <div className="hero-proof"><div className="avatar-stack"><span>J</span><span>M</span><span>A</span><span>+</span></div><span><strong>Learn at your pace.</strong><br/>Grow one lesson at a time.</span></div>
        </div>
        <div className="hero-visual">
          <div className="hero-blob" />
          <div className="floating-note note-top"><span className="note-icon">✦</span><div><strong>You're doing great!</strong><small>Keep your momentum</small></div></div>
          <div className="learning-window">
            <div className="window-head"><span/><span/><span/><small>YOUR LEARNING SPACE</small></div>
            <div className="window-content">
              <div className="window-welcome">Good things take practice <span>✦</span></div>
              <div className="window-course">
                <div className="window-course-art">⚛️</div>
                <div><small>CONTINUE LEARNING</small><strong>React Foundations</strong><span>12 of 18 lessons</span></div>
              </div>
              <div className="window-progress"><span/></div>
              <div className="window-stats"><div><strong>68%</strong><small>Course progress</small></div><div><strong>4.8h</strong><small>Time invested</small></div></div>
              <div className="window-next"><span>UP NEXT</span><strong>Build your first component</strong><Play size={16}/></div>
            </div>
          </div>
          <div className="floating-note note-bottom"><span className="streak-icon">🔥</span><div><strong>3 day streak</strong><small>You're building a habit</small></div></div>
        </div>
      </section>
      <section className="feature-strip wrap" id="features">
        <div><BookOpen/><strong>Learn by doing</strong><span>Lessons that move you forward</span></div>
        <div><Zap/><strong>Your own pace</strong><span>Progress that fits your life</span></div>
        <div><Users/><strong>Made for growth</strong><span>A space to keep improving</span></div>
      </section>
      <section className="how-section wrap" id="how">
        <div className="section-heading"><div className="eyebrow">A SIMPLE WAY TO GROW</div><h2>Learning that feels<br/>like <span>your kind of progress.</span></h2></div>
        <div className="how-grid"><article><b>01</b><h3>Find your subject</h3><p>Explore courses and choose a skill you want to build.</p></article><article><b>02</b><h3>Learn a little daily</h3><p>Watch lessons, try quizzes, and keep moving forward.</p></article><article><b>03</b><h3>See how far you've come</h3><p>Your progress makes every small win visible.</p></article></div>
      </section>
      <footer className="public-footer wrap"><Link to="/" className="brand"><span className="brand-mark"><GraduationCap size={20}/></span><span>learn<span className="brand-accent">hub</span></span></Link><span>Made for curious minds. © 2026 Learning Hub</span></footer>
    </div>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { demoLogin } = useAuth()
  function enterDemo(role) {
    demoLogin(role)
    navigate(role === 'instructor' ? '/instructor' : '/student')
  }
  return (
    <div className="auth-page">
      <Link to="/" className="brand auth-brand"><span className="brand-mark"><GraduationCap size={22}/></span><span>learn<span className="brand-accent">hub</span></span></Link>
      <div className="auth-card">
        <div className="auth-icon"><GraduationCap size={25}/></div>
        <div className="eyebrow">WELCOME TO YOUR NEXT CHAPTER</div>
        <h1>Good to see you.</h1>
        <p className="muted">Choose a demo space to explore the frontend.</p>
        <button className="button button-primary button-full" onClick={() => enterDemo('student')}>Continue as student <ArrowRight size={17}/></button>
        <button className="button button-outline button-full" onClick={() => enterDemo('instructor')}>Continue as instructor <ArrowRight size={17}/></button>
        <div className="demo-note"><CheckCircle2 size={16}/> Demo mode only — real authentication will be connected in Level 2.</div>
        <Link to="/" className="back-link">← Back to home</Link>
      </div>
    </div>
  )
}
