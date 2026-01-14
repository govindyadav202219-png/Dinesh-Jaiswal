
import { useState, useEffect } from 'react';

export const useTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  const formattedTime = now.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit' 
  });
  
  const formattedDate = now.toLocaleDateString(undefined, { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return {
    greeting: getGreeting(),
    formattedDate,
    formattedTime,
  };
};
