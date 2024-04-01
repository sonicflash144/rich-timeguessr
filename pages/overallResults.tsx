import { useEffect, useState } from 'react';
import Link from 'next/link';
import './game.css';

function OverallResults() {
    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        const storedScores = localStorage.getItem('scores');
        const scores = storedScores ? JSON.parse(storedScores) : [];
        const sum = scores.reduce((a: number, b: number) => a + b, 0);
        setTotalScore(sum);
    }, []);

    const playAgain = () => {
        localStorage.setItem('round', '1');
    };

    return (
        <div style={{padding: '10px'}}>
            <h2>Overall Results</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <p style={{ fontSize: '32px' }}>You scored <strong>{totalScore}</strong> out of 5000</p>
                <progress value={totalScore} max={5000} style={{ height: '50px', width: '80%' }}></progress>
            </div>
            <div style={{ marginTop: '10px', padding: '10px', textAlign: 'right' }}>
                <Link href="/game" onClick={playAgain} style={{ fontSize: '24px' }}>
                    Play Again
                </Link>
            </div>
        </div>
    );
}

export default OverallResults;