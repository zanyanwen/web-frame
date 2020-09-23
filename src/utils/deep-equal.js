/**
 * 深度比对
 * @param a {any}
 * @param b {any}
 * @returns {boolean}
 */
const deepEqual = (a, b) => {
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }
  if (a === null || b == null) return a === b;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  let equal = true;
  for (let i = 0; equal && i < keysA.length; i++) {
    const key = keysA[i];
    equal = b.hasOwnProperty(key) && deepEqual(a[key], b[key]);
    if (!equal) break;
  }

  return equal;
};

export default deepEqual;
