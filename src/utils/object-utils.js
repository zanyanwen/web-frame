import { getObservableProps, MobxAdministrationSymbol } from '@/utils/mobx-utils';

const getOwnProps = object => {
  if (object[MobxAdministrationSymbol]) {
    return getObservableProps(object);
  }
  return Object.getOwnPropertyNames(object);
};

export const copy = (target, source, properties) => {
  let props = properties;
  if (!Array.isArray(props)) {
    props = getOwnProps(target);
  }

  props.forEach(k => {
    if (source.hasOwnProperty(k)) target[k] = source[k];
  });
};

export const isObject = object => Object.prototype.toString.call(object) === '[object Object]';

export const splitPath = name => name.split(/(\.|\[\d+])/g).filter(v => !!v && v !== '.');

/**
 * @param object {Object}
 * @param name {String}
 * @param value {any}
 * @example {
 *   const obj = { a: 1, b: [2, { c: 3 }] };
 *   set(obj, 'b[1].c', { v: null, x: 2 }); // obj: {"a":1,"b":[2,{"c":{"v":null,"x":2}}]}
 *   set(obj, 'b[1].c.x', 5); // obj: {"a":1,"b":[2,{"c":{"v":null,"x":5}}]}
 * }
 */
export const set = (object, name, value) => {
  const namePath = splitPath(name);
  const arrayPath = /^(\[(?<index>\d+)]|(?<null>.*))$/;
  namePath.reduce((a, n, i, arr) => {
    if (!a) return;
    const { null: p, index = p } = n.match(arrayPath).groups;
    if (i === arr.length - 1) {
      a[index] = value;
    }

    return a[index];
  }, object);
};

/**
 * @param object {Object}
 * @param name {String}
 * @returns {any}
 * @example {
 *   const obj = { a: 1, b: [2, { c: 3 }] };
 *   get(obj, 'b[1].c'); // 3
 * }
 */
export const get = (object, name) => {
  const namePath = splitPath(name);
  const arrayPath = /^(\[(?<index>\d+)]|(?<null>.*))$/;
  return namePath.reduce((a, n) => {
    if (!a) return undefined;
    const { null: p, index = p } = n.match(arrayPath).groups;
    return a[index];
  }, object);
};

const ObjectUtils = {
  copy,
};

export default ObjectUtils;
