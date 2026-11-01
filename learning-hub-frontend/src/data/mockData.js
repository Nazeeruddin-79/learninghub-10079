export const courses = [
  {
    id: 'react-foundations',
    title: 'React Foundations',
    category: 'Development',
    instructor: 'Maya Chen',
    level: 'Beginner',
    duration: '6h 20m',
    lessons: 18,
    progress: 68,
    color: 'lavender',
    emoji: '⚛️',
    description: 'Build a strong foundation in modern React, components, props, state, and the patterns used to create real-world interfaces.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'ui-design',
    title: 'UI Design Essentials',
    category: 'Design',
    instructor: 'Jordan Lee',
    level: 'Beginner',
    duration: '4h 10m',
    lessons: 12,
    progress: 35,
    color: 'peach',
    emoji: '🎨',
    description: 'Learn visual hierarchy, spacing, color, typography, and how to turn ideas into clear digital experiences.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'javascript',
    title: 'JavaScript: From Zero',
    category: 'Development',
    instructor: 'Alex Morgan',
    level: 'Beginner',
    duration: '8h 45m',
    lessons: 24,
    progress: 100,
    color: 'mint',
    emoji: '✨',
    description: 'Understand the language of the web, from variables and functions to arrays, objects, and asynchronous code.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  },
  {
    id: 'productivity',
    title: 'Study Smarter',
    category: 'Personal growth',
    instructor: 'Sam Rivera',
    level: 'All levels',
    duration: '2h 30m',
    lessons: 8,
    progress: 0,
    color: 'blue',
    emoji: '🚀',
    description: 'Build better study habits, plan focused sessions, and make learning feel more manageable.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  }
]

export const lessons = [
  { id: 'lesson-1', title: 'Welcome to the course', duration: '04:32', completed: true },
  { id: 'lesson-2', title: 'How React thinks', duration: '12:08', completed: true },
  { id: 'lesson-3', title: 'Your first component', duration: '16:45', completed: false },
  { id: 'lesson-4', title: 'Props and reusable UI', duration: '18:20', completed: false },
  { id: 'lesson-5', title: 'State and interaction', duration: '21:10', completed: false }
]

export const quizQuestions = [
  {
    question: 'What is a React component?',
    options: ['A reusable piece of UI', 'A database', 'A CSS property', 'A web browser'],
    answer: 0
  },
  {
    question: 'Which hook is commonly used to manage local component state?',
    options: ['useRoute', 'useState', 'useStyle', 'useServer'],
    answer: 1
  },
  {
    question: 'What does JSX allow you to write?',
    options: ['SQL inside CSS', 'HTML-like syntax in JavaScript', 'Only JSON', 'Server configuration'],
    answer: 1
  }
]
