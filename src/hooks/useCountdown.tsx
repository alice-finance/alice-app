import { useEffect, useState } from "react";

const useCountdown = (until: Date) => {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const handle = setInterval(() => {
            requestAnimationFrame(() => {
                const timeLeft = until.getTime() - Date.now();
                setHours(Math.floor(timeLeft / (1000 * 60 * 60)));
                setMinutes(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)));
                setSeconds(Math.floor((timeLeft % (1000 * 60)) / 1000));
            });
        }, 1000);
        return () => clearInterval(handle);
    }, [until]);
    return { hours, minutes, seconds };
};
export default useCountdown;
