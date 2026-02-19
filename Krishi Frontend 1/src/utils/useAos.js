// src/utils/useAOS.js
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function useAOS(duration = 1000, offset = 100, once = false) {
  useEffect(() => {
    AOS.init({
      duration,
      offset,
      once,
      mirror: true, // 👈 allows re-trigger when scrolling up
    });
  }, [duration, offset, once]);
}
