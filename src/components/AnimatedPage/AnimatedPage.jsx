import React from 'react';
import { motion as Motion, useReducedMotion } from 'framer-motion';

// Định nghĩa các trạng thái của animation
const animations = {
    initial: { opacity: 0, x: -50 }, // Bắt đầu: mờ, lệch sang trái
    animate: { opacity: 1, x: 0 },    // Kết thúc: rõ, ở vị trí chính
    exit: { opacity: 0, x: 50 },      // Rời đi: mờ, lệch sang phải
};

const AnimatedPage = ({ children }) => {
    const reducedMotion = useReducedMotion();

    return (
        <Motion.div
            variants={animations}
            initial={reducedMotion ? false : 'initial'}
            animate="animate"
            exit="exit"
            transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeInOut" }}
        >
            {children}
        </Motion.div>
    );
};

export default AnimatedPage;
