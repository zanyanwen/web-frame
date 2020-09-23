/**
 * 对象转为url参数字符串
 * @param param {Object} 参数
 * @return {string} url参数字符串
 * @example urlEncode({userId: 'wxid_2019', userName: '李四'}); // 'userId=wxid_2019&userName=%E6%9D%8E%E5%9B%9B'
 */
export const urlEncode = param => {
  return Object.keys(param)
    .reduce((all, name) => {
      all += `&${name}=${encodeURIComponent(param[name])}`;
      return all;
    }, '')
    .substr(1);
};

/**
 * 将query字符串转为对象
 * @example urlDecode('?userId=1024') // { userId: '1024' }
 * @example urlDecode(location.search)
 * @param paramString {String}
 * @return {Object}
 */
export const urlDecode = paramString => {
  let string = paramString;
  if (string.indexOf('?') > -1) {
    string = string.substr(string.indexOf('?') + 1);
  }

  if (string.indexOf('#') > -1) {
    string = string.substr(0, string.indexOf('#'));
  }
  return string.split('&').reduce((a, i) => {
    a = a || {};
    const [name, value] = i.split('=');
    a[name] = typeof value === 'undefined' ? true : decodeURIComponent(value);
    return a;
  }, {});
};

/**
 * 转换为金额格式
 * @param num {Number} 金额
 * @param prefix = '￥' {String} 前缀
 * @param precision = 2 {Number} 小数点后位数
 * @return {string|null} 金额格式字符串
 * @example formatMoney(123456789.56789); // '￥ 123,456,789.57'
 */
export const formatMoney = (num, prefix = '￥ ', precision = 2) => {
  if (Number.isNaN(Number(num))) return null;
  let negative = ''

  let [before, after] = parseFloat(num)
    .toFixed(precision)
    .split('.');

  if (before[0] === '-') {
    negative = '-';
    before = before.slice(1);
  }

  if (before) {
    const beforeArr = [];
    do {
      const cutIndex = Math.max(before.length - 3, 0);
      const temp = before.substr(cutIndex, 3);
      if (temp) beforeArr.unshift(temp);
      before = before.substring(0, cutIndex);
    } while (before);
    before = beforeArr.join(',');
  }

  return `${prefix}${negative}${before}.${after}`;
};

/**
 * 敏感数据替换字符
 * @param text {String} 原始字符串
 * @param prefix = 3 {Number} 前缀保留长度
 * @param suffix = 3 {Number} 后缀保留长度
 * @param char = '*' {String} 替换字符
 * @returns {String|null}
 * @example sensitiveMask(13512345678)  // '123*****678'
 */
export const sensitiveMask = (text, prefix = 3, suffix = 3, char = '*') => {
  if (typeof text !== 'string' || !text) return null;
  const rex = new RegExp(`^(.{${prefix}}).*(.{${suffix}})$`);
  const repeat = text.length - prefix - suffix;

  if (repeat < 0) throw new Error('StringUtils.sensitiveMask: 原始字符长度小于前缀加后缀长度');
  if (char.length !== 1) throw new Error('StringUtils.sensitiveMask: 替换字符长度必须为1');

  return text.replace(rex, (t, pre, suf) => `${pre}${char.repeat(repeat)}${suf}`);
};

/**
 * 替换path中的参数
 * @param path {String} 路由匹配的路径
 * @param params {Object} 参数对象
 * @returns {String} 填入参数的url
 * @example replaceParams('/:channel/items/:id', { channel: 'piccmall', id: '1000' }) // '/piccmall/items/1000';
 */
export const replaceParams = (path, params) => {
  let result = path;
  Object.keys(params).map(key => {
    result = result.replace(new RegExp(`:${key}(?=\/|$)`, 'g'), params[key] || 'null');
  });
  return result;
};

const Utils = {
  urlEncode,
  urlDecode,
  formatMoney,
  sensitiveMask,
  replaceParams,
};

export default Utils;
