import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Map from '../components/Map';
import './game.css';

// Define the start and end dates
const startDate = new Date('2005-04-08').getTime();
const endDate = new Date('2024-04-08').getTime();
const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

export default function Game() {
    const [round, setRound] = useState(1);
    const [result, setResult] = useState('');
    const router = useRouter();
    const [currentImage, setCurrentImage] = useState<{ file: string, lat: number | null, lng: number | null, time: string | null }>({ file: '', lat: null, lng: null, time: null });
    const [userGuessLocation, setUserGuessLocation] = useState<{ lat: number | null, lng: number | null }>({ lat: null, lng: null });
    const [userGuessTime, setUserGuessTime] = useState(new Date('2024-04-08'));
    const [month, setMonth] = useState(userGuessTime.getMonth());
    const [day, setDay] = useState(userGuessTime.getDate());
    const [year, setYear] = useState(userGuessTime.getFullYear());

    useEffect(() => {
        const storedRound = localStorage.getItem('round');
        var roundNumber = storedRound ? parseInt(storedRound) : 1;
        if(roundNumber > 5) {
            roundNumber = 1;
        }
        setRound(roundNumber);

        if (roundNumber === 1) {
            localStorage.removeItem('scores');
        }
    }, []);

    const loadNewImage = async () => {
        const res = await fetch('/api/images');
        const images = await res.json();

        const shownImagesItem = localStorage.getItem('shownImages');
        let shownImages = shownImagesItem ? new Set(JSON.parse(shownImagesItem)) : new Set();

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * images.length);
        } while (shownImages.has(randomIndex));

        shownImages.add(randomIndex);
        localStorage.setItem('shownImages', JSON.stringify(Array.from(shownImages)));

        const newImage = images[randomIndex];
        localStorage.setItem('currentImage', JSON.stringify(newImage));
        setCurrentImage(newImage);

        // If all images have been shown, clear the local storage
        if (shownImages.size === images.length) {
            localStorage.removeItem('shownImages');
        }
    };

    useEffect(() => {
        const storedImage = localStorage.getItem('currentImage');
        if (storedImage) {
            setCurrentImage(JSON.parse(storedImage));
        } else {
            loadNewImage();
            localStorage.removeItem('scoreAdded');
        }
    }, []);

    const handleSliderChange = (value: number) => {
        const newGuessTime = new Date(startDate + value * 24 * 60 * 60 * 1000);
        setUserGuessTime(newGuessTime);
        setMonth(newGuessTime.getMonth());
        setDay(newGuessTime.getDate());
        setYear(newGuessTime.getFullYear());
    };
    const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = Number(event.target.value);
        const newGuessTime = new Date(userGuessTime.setMonth(newMonth));
        setUserGuessTime(newGuessTime);
        setMonth(newMonth);
    };
    const handleDayChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDay = Number(event.target.value);
        const newGuessTime = new Date(userGuessTime.setDate(newDay));
        setUserGuessTime(newGuessTime);
        setDay(newDay);
    };
    const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = Number(event.target.value);
        const newGuessTime = new Date(userGuessTime.setFullYear(newYear));
        setUserGuessTime(newGuessTime);
        setYear(newYear);
    };

    // Function to check the user's guess
    const checkGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (userGuessLocation.lat === null || userGuessLocation.lng === null) {
            console.log('No location selected');
            return;
        }

        // Correct location and time
        const correctLocation = { lat: currentImage.lat, lng: currentImage.lng };
        const correctTime = currentImage.time ? new Date(currentImage.time) : null;
        console.log(currentImage);

        if (correctLocation.lat === null || correctLocation.lng === null || correctTime === null) {
            console.log('Correct location or time is null');
            return;
        }

        const R = 3958.8; // Radius of the Earth in miles
        const dLat = (correctLocation.lat - userGuessLocation.lat) * Math.PI / 180;
        const dLng = (correctLocation.lng - userGuessLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userGuessLocation.lat * Math.PI / 180) * Math.cos(correctLocation.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // Calculate the difference in days
        userGuessTime.setDate(userGuessTime.getDate());
        correctTime.setHours(0, 0, 0, 0);
        userGuessTime.setHours(0, 0, 0, 0);
        const diffTime = Math.abs(correctTime.getTime() - userGuessTime.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const resultString = `Guess: ${userGuessLocation.lat}, ${userGuessLocation.lng} on ${userGuessTime.toDateString()} Answer: ${correctLocation.lat}, ${correctLocation.lng} on ${correctTime.toDateString()} Error: ${distance.toFixed(2)} miles, ${diffDays} days.`;        
        setResult(resultString);
        
        localStorage.setItem('round', (round + 1).toString());
        router.push(`/results?result=${encodeURIComponent(resultString)}`);
    };
    
    return (
        <main style={{ padding: '20px' }}>
            <h2>Round {round} of 5</h2>
            <div>
                {currentImage && currentImage.file && (
                    <div style={{ position: 'relative', width: '45vw', height: '45vh' }}>
                        <Image
                            src={`/images/${currentImage.file}`}
                            alt="Game Image"
                            layout="fill"
                            objectFit="contain"
                        />
                    </div>
                )}
            </div>
            <form 
                onSubmit={checkGuess} 
            >
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div className="map-container">
                        <Map setGuessLocation={setUserGuessLocation} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '32vh' }}>
                        <div className="time-container">
                        <input
                            type="range"
                            min="0"
                            max={totalDays}
                            value={(userGuessTime.getTime() - startDate) / (24 * 60 * 60 * 1000)}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleSliderChange(Number(event.target.value))}
                            style={{ width: '90%' }}
                            />
                            <div>
                                <select value={month} onChange={handleMonthChange} className="bigger-dropdown">
                                    {Array.from({ length: 12 }, (_, i) => i).map((_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(year, i, 1).toLocaleString('default', { month: 'long' })}
                                    </option>
                                    ))}
                                </select>
                                <select value={day} onChange={handleDayChange} className="bigger-dropdown">
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                    ))}
                                </select>
                                <select value={year.toString()} onChange={handleYearChange} className="bigger-dropdown">
                                    {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="button-container">
                            <button type="submit" className="guess-button">Guess</button>                        </div>
                    </div>
                </div>
            </form>
        </main>
    );
}