import { useState, useEffect } from 'react'

export default function Timer({ duration }) {
    const [time, setTime] = useState(duration);  // The total time in MINUTES that has to pass
    
    useEffect(() => {
        setTimeout(() => {
            setTime(time - 1)  // Total time in MINUTES - 1 MINUTE
        }, 60000)  // 1000 ms = 1s, I need the timer to change every MINUTE so 1000 ms * 60 s
    }, [time]);

    const getFormattedTime = (minutes) => {
        const total_hours = Math.floor(minutes / 60);
        const total_minutes = minutes % 60;

        if (total_hours > 0) return `Time left: ${total_hours}hr ${total_minutes}min`;
        return `Time left: ${total_minutes}min`
    };

    return (
        <div>{getFormattedTime(time)}</div>
    )
}