import { useRouter } from 'next/router';
import Link from 'next/link';
import Map from '../components/ResultsMap';
import { useEffect, useState } from 'react';
import './game.css';

function Results() {
    const [currentImage, setCurrentImage] = useState<{ file: string, lat: number | null, lng: number | null, time: string | null }>({ file: '', lat: null, lng: null, time: null }); 
    useEffect(() => {
        const storedImage = localStorage.getItem('currentImage');
        if (storedImage) {
            setCurrentImage(JSON.parse(storedImage));
        }
    }, []);
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
        const scoreAdded = localStorage.getItem('scoreAdded');

        if (!scoreAdded) {
            scores.push(totalScore);
            localStorage.setItem('scores', JSON.stringify(scores));
            localStorage.setItem('scoreAdded', 'true');
        }
    }, [totalScore]);

    return (
        <main style={{padding: '20px'}}>
            <h2>Round {round-1} Results</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <p style={{ fontSize: '28px', marginBottom: '0.5em'}}> <strong>Score: </strong>{totalScore}/{2 * maxScore}</p>
                <progress value={totalScore} max={2 * maxScore} style={{ width: '50%', height: '36px' }}></progress>
            </div>   
            <div className='results-div'>             
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '36px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {
                            (() => {  
                                return currentImage && currentImage.file && (
                                    <div style={{ position: 'relative', width: '45vw', height: '45vh' }}>
                                        <img
                                            src={`/images/${currentImage.file}`}
                                            alt="Game Image"
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                );
                            })()
                        }
                        <p style={{fontSize: '24px'}}>You were <strong>{timeErr} days </strong>off &mdash; {timeScore}/{maxScore} pts</p>
                        <p style={{fontSize: '20px'}}>
                            Guessed: {userTime.substring(4)}
                            <span style={{ marginLeft: '2em' }}>Actual: {correctTime.substring(4)}</span>
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Map userLat={userLat} userLng={userLng} correctLat={correctLat} correctLng={correctLng}/>
                        <p style={{fontSize: '24px'}}>You were <strong>{distanceErr} miles</strong> away &mdash; {distanceScore}/{maxScore} pts</p>
                    </div>
                </div>
                
                <div style={{ position: 'fixed', right: '20px', bottom: '20px', padding: '10px' }}>
                    {round <= 5 ? (
                        <Link 
                            href="/game" 
                            style={{ fontSize: '24px'}}
                            onClick={() => localStorage.removeItem('currentImage')}
                        >
                            Next Round
                        </Link>
                    ) : (
                        <Link 
                            href="/overallResults" 
                            style={{ fontSize: '24px'}}
                            onClick={() => localStorage.removeItem('currentImage')}
                        >
                            Overall Results
                        </Link>
                    )}
                </div>

            </div>
        </main>
        
    );
}

export default Results;