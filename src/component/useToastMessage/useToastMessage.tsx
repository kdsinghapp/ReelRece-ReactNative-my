// useToastMessage.ts
import { useState } from 'react';

const useToastMessage = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastGreen, setToastGreen] = useState(false);

  const showToast = ({ message = '', green = false }) => {
    setToastMessage(message);
    setToastGreen(green);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
      setToastMessage('');
      setToastGreen(false);
    }, 2000);
  };

  return {
    toastVisible,
    toastMessage,
    toastGreen,
    showToast,
  };
};

export default useToastMessage;
