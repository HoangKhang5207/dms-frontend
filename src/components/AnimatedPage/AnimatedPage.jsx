import React from 'react';
import { motion } from 'framer-motion';

// Định nghĩa các trạng thái của animation
const animations = {
    initial: { opacity: 0, x: -50 }, // Bắt đầu: mờ, lệch sang trái
    animate: { opacity: 1, x: 0 },    // Kết thúc: rõ, ở vị trí chính
    exit: { opacity: 0, x: 50 },      // Rời đi: mờ, lệch sang phải
};

const AnimatedPage = ({ children }) => {
    return (
        <motion.div
            variants={animations}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: "easeInOut" }} // Thời gian và kiểu chuyển động
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;