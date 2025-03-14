import { useState } from "react"
import Header from "../components/header"
import QuizMenu from "../components/quiz/quizMenu"
import QuizPlay from "../components/quiz/quizPlay"
import QuizResults from "../components/quiz/quizResults"
import Dialogue from "../components/dialogue"
import { useNavigate } from "react-router"
import { checkAllDone } from "../components/lesson/lessonContent"
// import styles from './quiz.module.css'

export default function Quiz() {
    const navigate = useNavigate()
    const [promptMsg, setPromptMsg] = useState(true)

    // quiz states: menu, play, results
    const [quizMode, setQuizMode] = useState('menu')
    const [points, setPoints] = useState(0)
    const [skippedLetters, setSkippedLetters] = useState(new Set())

    const incrementPoints = () => setPoints((prevPoints) => prevPoints + 1)
    const dialogueProps = {
        desc: 'Do you want to proceed with the quiz without going through the lessons first?',
        left: 'Proceed',
        right: 'Return',
        leftHandler: () => setPromptMsg(false),
        rightHandler: () => navigate('/'),
        withModal: true
    }

    return (
    <>
        <Header/>
        {!checkAllDone() && promptMsg && <Dialogue {...dialogueProps}/>}
        {quizMode == 'menu' && <QuizMenu setMode={setQuizMode}/>}
        {(quizMode == 'play') && <QuizPlay mode={quizMode} setSkippedLetters={setSkippedLetters} setMode={setQuizMode} points={points} incrementPoints={incrementPoints}/>}
        {quizMode == 'results' && <QuizResults setMode={setQuizMode} points={points} setPoints={setPoints} skippedLetters={skippedLetters} setSkippedLetters={setSkippedLetters}/>}
    </>
    )
}

