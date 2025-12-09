import React, { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
    const icon = type === "success" ? (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
    ) : (
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <div className={`fixed bottom-5 right-5 ${bgColor} text-white px-6 py-4 rounded shadow-lg flex items-center z-50 transition-opacity duration-300`}>
            {icon}
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-4 focus:outline-none font-bold text-xl leading-none">&times;</button>
        </div>
    );
};

export default Toast;
