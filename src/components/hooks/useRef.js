import { useCallback, useState } from 'react';

const useRef = (inputs = []) => {
  const [node, setNode] = useState(null);
  const ref = useCallback(setNode, inputs);
  return [ref, node];
};

export default useRef;
