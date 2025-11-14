import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export default function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const spring = useSpring(value, { 
    mass: 0.8, 
    stiffness: 75, 
    damping: 15
  });

  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      spring.set(value);
      prevValue.current = value;
    }
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return <motion.span className={className}>{displayValue}</motion.span>;
}
