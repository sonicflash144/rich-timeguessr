import { useRouter } from 'next/router';
import Link from 'next/link';
import Map from '../components/ResultsMap';
import { useEffect, useState } from 'react';
import './game.css';

function Results() {
    const [round, setRound] = useState(1);
    useEffect(() => {
        const storedRound = localStorage.getItem('round');
        const roundNumber = storedRound ? parseInt(storedRound) : 1;
        setRound(roundNumber);
    }, []);
    const router = useRouter();
    const result = decodeURIComponent(router.query.result as string);

    const words = result.split(' ');
    const userLat = parseFloat(words[1]);
    const userLng = parseFloat(words[2]);
    const correctLat = parseFloat(words[9]);
    const correctLng = parseFloat(words[10]);
    const userTime = `${words[4]} ${words[5]} ${words[6]} ${words[7]}`;
    const correctTime = `${words[12]} ${words[13]} ${words[14]} ${words[15]}`;

    const maxScore =  500;
    const maxDistanceError = 2000; 
    const maxTimeError = 700; 
    const distanceErr = parseFloat(words[words.length - 4]);
    const timeErr = parseInt(words[words.length - 2]);
    const distanceScore = Math.round(Math.max(0, maxScore - (distanceErr / maxDistanceError) * maxScore));
    const timeScore = Math.round(Math.max(0, maxScore - (timeErr / maxTimeError) * maxScore));
    const totalScore = distanceScore + timeScore;

    useEffect(() => {
        const storedScores = localStorage.getItem('scores');
        const scores = storedScores ? JSON.parse(storedScores) : [];
        scores.push(totalScore);
        localStorage.setItem('scores', JSON.stringify(scores));
    }, [totalScore]);

    return (
        <main className='results-div'>
            <div style={{padding: '10px'}}>
                <h2>Round {round-1} Results</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <p style={{fontSize: '24px'}}>You were <strong>{distanceErr}</strong> miles away and <strong>{timeErr}</strong> days off.</p>
                        
                        <p style={{fontSize: '20px'}}>
                            Guessed: {userTime.substring(4)}
                            <span style={{ marginLeft: '2em' }}>Actual: {correctTime.substring(4)}</span>
                        </p>
                    </div>
                            
                    <div>
                        <p style={{ fontSize: '28px', marginBottom: '10px' }}> Score: <strong>{totalScore}</strong>/{2 * maxScore}</p>
                        <progress value={totalScore} max={2 * maxScore} style={{ width: '100%', height: '36px' }}></progress>
                    </div>
                </div>

                <Map userLat={userLat} userLng={userLng} correctLat={correctLat} correctLng={correctLng}/>

                <p style={{fontSize: '20px'}}>
                    Distance: <strong>{distanceScore}</strong>/{maxScore} 
                    <span style={{ marginLeft: '2em' }}>Time: <strong>{timeScore}</strong>/{maxScore}</span>
                </p>
                
                <div style={{ position: 'fixed', right: '20px', bottom: '20px', padding: '10px' }}>
                {round <= 5 ? (
                    <Link href="/game" style={{ fontSize: '24px'}}>Next</Link>
                ) : (
                    <Link href="/overallResults" style={{ fontSize: '24px'}}>Overall Results</Link>
                )}
            </div>

            </div>
        </main>
        
    );
}

export default Results;