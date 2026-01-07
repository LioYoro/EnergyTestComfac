import React, { useEffect, useState } from 'react';

const Notification = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center">
        <i className="fas fa-check-circle mr-3"></i>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Notification;

