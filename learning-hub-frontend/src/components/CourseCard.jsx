import { ArrowUpRight, Clock3, PlayCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function CourseCard({ course, showProgress = true }) {
  const courseId = course?.id || course?._id
  const progress = Math.min(
    100,
    Math.max(
      0,
      Number(course?.progressPercent ?? course?.progress ?? 0)
    )
  )

  const instructor =
    course?.instructorName ||
    course?.instructor?.name ||
    course?.instructor ||
    'Learning Hub instructor'

  const duration = course?.duration
    ? course.duration
    : course?.totalLessons
      ? `${course.totalLessons} lessons`
      : course?.lessonCount
        ? `${course.lessonCount} lessons`
        : 'Self-paced'

  const category = course?.category || 'General'
  const level = course?.level || 'Beginner'
  const title = course?.title || 'Untitled course'

  const colorClasses = ['purple', 'blue', 'green', 'orange']
  const color = colorClasses[
    Math.abs(
      String(courseId || title)
        .split('')
        .reduce((total, character) => total + character.charCodeAt(0), 0)
    ) % colorClasses.length
  ]

  return (
    <article className="course-card">
      <div className={`course-art ${color}`}>
        <span className="course-emoji">
          {course?.emoji || '📘'}
        </span>

        <span className="course-category">{category}</span>

        <span className="art-orbit orbit-one" />
        <span className="art-orbit orbit-two" />
      </div>

      <div className="course-card-body">
        <div className="course-meta">
          <span>{level}</span>

          <span>
            <Clock3 size={14} />
            {duration}
          </span>
        </div>

        <h3>{title}</h3>

        <p className="muted small">By {instructor}</p>

        {showProgress && (
          <div className="course-progress">
            <div className="progress-label">
              <span>Your progress</span>
              <strong>{progress}%</strong>
            </div>

            <ProgressBar value={progress} />
          </div>
        )}

        {courseId ? (
          <Link
            className="card-link"
            to={`/student/course/${courseId}`}
          >
            {progress === 100 ? 'Review course' : 'Continue learning'}

            {progress > 0 ? (
              <PlayCircle size={17} />
            ) : (
              <ArrowUpRight size={17} />
            )}
          </Link>
        ) : (
          <span className="card-link" aria-disabled="true">
            Course details unavailable
          </span>
        )}
      </div>
    </article>
  )
}