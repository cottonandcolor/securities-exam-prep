import { createClient } from '@supabase/supabase-js'
import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { exams, questionBank as baseQuestionBank } from './data/questionBank'

const letters = ['A', 'B', 'C', 'D', 'E', 'F']
const CSV_STORAGE_KEY = 'securities-app-csv-bank-v1'
const ADMIN_EMAILS = [
  'admin@flashcard.local',
  'cottonandcolor@gmail.com',
  'preetidav@gmail.com',
  'madhu.gowda@gmail.com',
]
const USER_ROLE_TABLE = 'user_roles'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

function normalizeHeader(value) {
  return value.trim().toLowerCase().replaceAll(' ', '_')
}

function parseCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      i += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

function parseCsvText(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('CSV needs a header row and at least one data row.')
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader)
  const rows = lines.slice(1).map((line) => parseCsvLine(line))

  return rows.map((rowCells) => {
    const row = {}
    headers.forEach((header, index) => {
      row[header] = (rowCells[index] ?? '').trim()
    })
    return row
  })
}

function toQuestionRecord(row, rowIndex, forcedExamId) {
  const examId = forcedExamId || row.exam?.toLowerCase()
  const topic = row.topic
  const question = row.question
  const explanation = row.explanation ?? ''
  const c1 = row.choice_a ?? row.choice1 ?? row.a ?? ''
  const c2 = row.choice_b ?? row.choice2 ?? row.b ?? ''
  const c3 = row.choice_c ?? row.choice3 ?? row.c ?? ''
  const c4 = row.choice_d ?? row.choice4 ?? row.d ?? ''
  const rawAnswer = row.answer_index ?? row.answer ?? ''

  if (!question || !c1 || !c2 || !c3 || !c4) {
    throw new Error(
      `Row ${rowIndex + 2}: missing required fields. Required: question and four choices.`,
    )
  }

  if (!exams.some((exam) => exam.id === examId)) {
    throw new Error(
      `Row ${rowIndex + 2}: exam "${examId}" not supported. Use one of: ${exams
        .map((exam) => exam.id)
        .join(', ')}.`,
    )
  }

  let answerIndex
  if (/^\d+$/.test(rawAnswer)) {
    const numeric = Number(rawAnswer)
    answerIndex = numeric >= 1 ? numeric - 1 : numeric
  } else {
    const letter = rawAnswer.trim().toUpperCase()
    answerIndex = ['A', 'B', 'C', 'D'].indexOf(letter)
  }

  if (answerIndex < 0 || answerIndex > 3) {
    throw new Error(
      `Row ${rowIndex + 2}: answer must be A-D, 0-3, or 1-4.`,
    )
  }

  return {
    examId,
    question: {
      id: `csv-${Date.now()}-${rowIndex}`,
      topic: topic || 'Uploaded',
      question,
      choices: [c1, c2, c3, c4],
      answerIndex,
      explanation: explanation || 'Imported from admin CSV.',
    },
  }
}

function getSavedCsvBank() {
  try {
    const raw = localStorage.getItem(CSV_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function App() {
  const [authUser, setAuthUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authMode, setAuthMode] = useState('login')
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [userRole, setUserRole] = useState('learner')
  const [roleLoading, setRoleLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [csvMessage, setCsvMessage] = useState('')
  const [uploadedBank, setUploadedBank] = useState(() => getSavedCsvBank())
  const [uploadExamId, setUploadExamId] = useState('sie')
  const [selectedExamId, setSelectedExamId] = useState('sie')
  const [cardIndex, setCardIndex] = useState(0)
  const [incorrectChoices, setIncorrectChoices] = useState([])
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const combinedBank = useMemo(() => {
    const merged = {}

    exams.forEach((exam) => {
      const base = baseQuestionBank[exam.id] ?? []
      const uploaded = uploadedBank[exam.id] ?? []
      merged[exam.id] = [...base, ...uploaded]
    })

    return merged
  }, [uploadedBank])

  const cards = useMemo(() => combinedBank[selectedExamId] ?? [], [combinedBank, selectedExamId])
  const currentCard = cards[cardIndex]
  const progressPercent = cards.length
    ? Math.round(((cardIndex + (showResults ? 1 : 0)) / cards.length) * 100)
    : 0
  const touchedCurrentQuestion =
    correctChoiceIndex !== null || incorrectChoices.length > 0
  const questionResolved =
    currentCard &&
    (correctChoiceIndex !== null ||
      incorrectChoices.length >= currentCard.choices.length - 1)
  const isAdmin = userRole === 'admin'

  useEffect(() => {
    localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(uploadedBank))
  }, [uploadedBank])

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false)
      return
    }

    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return
      }
      setAuthUser(data.session?.user ?? null)
      setAuthLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return
      }
      setAuthUser(session?.user ?? null)
      setAuthLoading(false)
      setAuthError('')
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!authUser || !supabase) {
      setUserRole('learner')
      return
    }

    let isMounted = true

    const resolveRole = async () => {
      setRoleLoading(true)

      const email = authUser.email?.toLowerCase() ?? ''
      const shouldForceAdmin = ADMIN_EMAILS.includes(email)
      const fallbackRole = shouldForceAdmin ? 'admin' : 'learner'

      const { data, error } = await supabase
        .from(USER_ROLE_TABLE)
        .select('role')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (!isMounted) {
        return
      }

      if (error) {
        setUserRole(fallbackRole)
        setRoleLoading(false)
        return
      }

      if (data?.role) {
        if (shouldForceAdmin && data.role !== 'admin') {
          await supabase
            .from(USER_ROLE_TABLE)
            .update({ role: 'admin' })
            .eq('user_id', authUser.id)
          setUserRole('admin')
        } else {
          setUserRole(data.role)
        }
        setRoleLoading(false)
        return
      }

      const { error: insertError } = await supabase.from(USER_ROLE_TABLE).insert({
        user_id: authUser.id,
        role: fallbackRole,
      })

      if (!isMounted) {
        return
      }

      if (insertError) {
        setUserRole(fallbackRole)
        setRoleLoading(false)
        return
      }

      setUserRole(fallbackRole)
      setRoleLoading(false)
    }

    resolveRole()

    return () => {
      isMounted = false
    }
  }, [authUser])

  const resetRun = () => {
    setCardIndex(0)
    setIncorrectChoices([])
    setCorrectChoiceIndex(null)
    setScore(0)
    setShowResults(false)
  }

  const handleEmailLogin = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setAuthError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    const email = emailInput.trim()
    const password = passwordInput.trim()

    if (!email || !password) {
      setAuthError('Enter email and password.')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setAuthError(error.message)
      return
    }

    setAuthMessage('Login successful.')
    setAuthError('')
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    if (!supabase) {
      setAuthError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Enter email and password to create an account.')
      return
    }
    if (passwordInput.length < 6) {
      setAuthError('Password should be at least 6 characters.')
      return
    }

    const { error } = await supabase.auth.signUp({
      email: emailInput.trim(),
      password: passwordInput.trim(),
      options: {
        data: {
          display_name: nameInput.trim() || emailInput.split('@')[0],
        },
      },
    })
    if (error) {
      setAuthError(error.message)
      return
    }

    setAuthError('')
    setAuthMode('login')
    setAuthMessage('Account created. Check email verification if enabled, then log in.')
  }

  const handleResetPassword = async () => {
    if (!supabase) {
      setAuthError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      return
    }
    if (!emailInput.trim()) {
      setAuthError('Enter your email first.')
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailInput.trim(), {
      redirectTo: window.location.origin,
    })
    if (error) {
      setAuthError(error.message)
      return
    }

    setAuthError('')
    setAuthMessage('Password reset email sent.')
  }

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setAuthError(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    if (error) {
      setAuthError(error.message)
    }
  }

  const signOut = async () => {
    if (!supabase) {
      setAuthUser(null)
      return
    }
    await supabase.auth.signOut()
    setAuthMessage('')
    setAuthError('')
  }

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const rows = parseCsvText(text)
      const mapped = rows.map((row, index) =>
        toQuestionRecord(row, index, uploadExamId),
      )

      const nextBank = { ...uploadedBank }
      mapped.forEach(({ examId, question }) => {
        nextBank[examId] = [...(nextBank[examId] ?? []), question]
      })
      setUploadedBank(nextBank)
      const examName =
        exams.find((exam) => exam.id === uploadExamId)?.name || uploadExamId
      setCsvMessage(`Imported ${mapped.length} questions into ${examName}.`)
      resetRun()
    } catch (error) {
      setCsvMessage(error.message)
    }
  }

  const clearUploadedQuestions = () => {
    setUploadedBank({})
    setCsvMessage('Cleared all uploaded CSV questions.')
    resetRun()
  }

  if (!authUser) {
    return (
      <div className="app-shell">
        <main className="auth-panel">
          <h1>SECURITIES EXAM PREP</h1>
          <p>
            {authLoading
              ? 'Checking session...'
              : 'Create an account or sign in to start practice quizzes.'}
          </p>

          {!supabase && (
            <p className="auth-error">
              Missing Supabase config. Set <code>VITE_SUPABASE_URL</code> and{' '}
              <code>VITE_SUPABASE_ANON_KEY</code> in your environment.
            </p>
          )}

          <div className="auth-mode-switch">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              className={authMode === 'signup' ? 'active' : ''}
              onClick={() => setAuthMode('signup')}
            >
              Create Account
            </button>
          </div>

          {authMode === 'login' && (
            <form className="auth-form" onSubmit={handleEmailLogin}>
              <label>
                Email
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder="Enter password"
                />
              </label>
              <button type="submit" className="next-button">
                Login
              </button>
            </form>
          )}

          {authMode === 'signup' && (
            <form className="auth-form" onSubmit={handleSignup}>
              <label>
                Full Name
                <input
                  type="text"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  placeholder="At least 6 characters"
                />
              </label>
              <button type="submit" className="next-button">
                Create Account
              </button>
            </form>
          )}

          <div className="auth-actions">
            <button className="google-login" onClick={handleGoogleLogin}>
              Continue with Google
            </button>
            <button className="link-btn" onClick={handleResetPassword}>
              Forgot password?
            </button>
          </div>

          <p className="auth-hint">Admin CSV upload is available for admin role only.</p>
          {authMessage && <p className="auth-success">{authMessage}</p>}
          {authError && <p className="auth-error">{authError}</p>}
        </main>
      </div>
    )
  }

  const changeExam = (examId) => {
    setSelectedExamId(examId)
    setCardIndex(0)
    setIncorrectChoices([])
    setCorrectChoiceIndex(null)
    setScore(0)
    setShowResults(false)
  }

  const goNext = () => {
    if (cardIndex >= cards.length - 1) {
      setShowResults(true)
      return
    }

    setCardIndex((prev) => prev + 1)
    setIncorrectChoices([])
    setCorrectChoiceIndex(null)
  }

  const handleChoiceClick = (index) => {
    if (questionResolved) {
      return
    }

    if (incorrectChoices.includes(index)) {
      return
    }

    if (index === currentCard.answerIndex) {
      setCorrectChoiceIndex(index)
      setScore((prev) => prev + 1)
      return
    }

    const updatedIncorrectChoices = [...incorrectChoices, index]
    setIncorrectChoices(updatedIncorrectChoices)
  }

  const choiceClassName = (index) => {
    if (index === correctChoiceIndex) {
      return 'choice correct'
    }

    if (incorrectChoices.includes(index)) {
      return 'choice incorrect'
    }

    return 'choice'
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>SECURITIES EXAM PREP</h1>
        <div className="user-row">
          <span>
            Signed in as{' '}
            <strong>{authUser.user_metadata?.display_name || authUser.email}</strong>{' '}
            ({userRole}
            {roleLoading ? '...' : ''})
          </span>
          <button className="signout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
        <div className="exam-tabs">
          {exams.map((exam) => (
            <button
              key={exam.id}
              className={exam.id === selectedExamId ? 'active' : ''}
              onClick={() => changeExam(exam.id)}
            >
              {exam.name}
            </button>
          ))}
        </div>
      </header>

      {isAdmin && (
        <section className="admin-panel">
          <h2>Admin: Upload Question CSV</h2>
          <p>
            Select an exam type below, then upload CSV with columns: <code>topic</code>,{' '}
            <code>question</code>, <code>choice_a</code>, <code>choice_b</code>,{' '}
            <code>choice_c</code>, <code>choice_d</code>, <code>answer</code> (A-D
            or 1-4), <code>explanation</code>. Optional <code>exam</code> column is
            ignored when exam type is selected.
          </p>
          <label className="exam-select">
            Exam type for this upload
            <select
              value={uploadExamId}
              onChange={(event) => setUploadExamId(event.target.value)}
            >
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-actions">
            <label className="upload-btn">
              Upload CSV
              <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} />
            </label>
            <button className="clear-btn" onClick={clearUploadedQuestions}>
              Clear Uploaded Questions
            </button>
          </div>
          {csvMessage && <p className="csv-message">{csvMessage}</p>}
        </section>
      )}

      <main className="quiz-panel">
        {!showResults && currentCard && (
          <>
            <div className="progress-bar">
              <div style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="progress-copy">
              <span>
                QUESTION {Math.min(cardIndex + 1, cards.length)} OF {cards.length}
              </span>
              <span>
                {score} / {Math.min(cardIndex + (touchedCurrentQuestion ? 1 : 0), cards.length)} CORRECT
              </span>
            </div>

            <h2>{currentCard.question}</h2>

            <div className="choice-list">
              {currentCard.choices.map((choice, index) => (
                <button
                  key={`${currentCard.id}-${index}`}
                  className={choiceClassName(index)}
                  onClick={() => handleChoiceClick(index)}
                >
                  <strong>{letters[index]}.</strong> {choice}
                </button>
              ))}
            </div>

            <p className="hint-line">
              Tap answers until correct. Then press Next Question.
            </p>

            <button
              className="next-button"
              onClick={goNext}
              disabled={!questionResolved}
            >
              Next Question →
            </button>
          </>
        )}

        {showResults && (
          <section className="results">
            <h2>Session Complete</h2>
            <p>
              You got <strong>{score}</strong> out of <strong>{cards.length}</strong>{' '}
              correct.
            </p>
            <button className="next-button" onClick={resetRun}>
              Restart Quiz
            </button>
          </section>
        )}
      </main>

      <footer className="footer-note">
        Practice content is original and based on public exam topic domains.
      </footer>
    </div>
  )
}

export default App
