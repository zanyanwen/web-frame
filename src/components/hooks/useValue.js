import React, { useEffect, useState, useCallback } from 'react';

const useValue = (valueProp, onChangeProp, asObject = false) => {
  const [value, setValue] = useState(valueProp || '');
  const [timer, setTimer] = useState(-1);

  const changeCallback = useCallback(() => {
    if (typeof value !== 'string' || valueProp !== value) setValue(valueProp);
  }, [valueProp, value]);

  useEffect(() => {
    clearTimeout(timer);
    setTimer(setTimeout(changeCallback));
  }, [valueProp]);

  const handleChange = (e, ...args) => {
    if (typeof onChangeProp === 'function') return onChangeProp(e, ...args);
    setValue(e.target.value);
  };

  if (asObject) {
    return { value, onChange: handleChange };
  }

  return [value, handleChange];
};

export default useValue;
