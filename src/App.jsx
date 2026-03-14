import { useMemo, useState } from 'react'
import './App.css'
import { exams, questionBank } from './data/questionBank'

const letters = ['A', 'B', 'C', 'D', 'E', 'F']

function App() {
  const [selectedExamId, setSelectedExamId] = useState('sie')
  const [cardIndex, setCardIndex] = useState(0)
  const [incorrectChoices, setIncorrectChoices] = useState([])
  const [correctChoiceIndex, setCorrectChoiceIndex] = useState(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const cards = useMemo(() => questionBank[selectedExamId] ?? [], [selectedExamId])
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

  const resetRun = () => {
    setCardIndex(0)
    setIncorrectChoices([])
    setCorrectChoiceIndex(null)
    setScore(0)
    setShowResults(false)
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
