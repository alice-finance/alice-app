import { useEffect, useState } from "react";

const useCountdown = (until: Date) => {
    const [timeLeft, setTimeLeft] = useState(until.getTime() - Date.now());
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    useEffect(() => {
        const handle = setInterval(() => {
            setTimeLeft(until.getTime() - Date.now());
        }, 1000);
        return () => clearInterval(handle);
    }, [until]);
    return { hours, minutes, seconds };
};
export default useCountdown;
