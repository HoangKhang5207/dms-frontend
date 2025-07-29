import { useEffect, useState, useRef } from 'react';

export const useInView = (options) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // Kích hoạt khi component xuất hiện trên màn hình
      if (entry.isIntersecting) {
        setInView(true);
        // Ngừng quan sát sau khi đã kích hoạt để không lặp lại animation
        observer.unobserve(entry.target);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, inView];
};