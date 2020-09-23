const pow = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const code = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
const provinceCode = {
  11: '北京',
  12: '天津',
  13: '河北',
  14: '山西',
  15: '内蒙古',
  21: '辽宁',
  22: '吉林',
  23: '黑龙江 ',
  31: '上海',
  32: '江苏',
  33: '浙江',
  34: '安徽',
  35: '福建',
  36: '江西',
  37: '山东',
  41: '河南',
  42: '湖北',
  43: '湖南',
  44: '广东',
  45: '广西',
  46: '海南',
  50: '重庆',
  51: '四川',
  52: '贵州',
  53: '云南',
  54: '西藏 ',
  61: '陕西',
  62: '甘肃',
  63: '青海',
  64: '宁夏',
  65: '新疆',
  71: '台湾',
  81: '香港',
  82: '澳门',
  91: '国外 ',
};
const isIdCardGen2 = /^[1-9]{2}\d{4}(19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]$/;
const isIdCardGen1 = /^[1-9]{2}\d{4}\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}$/;

/**
 * 校验身份证号
 * @param string {String} 身份证号
 * @return {string|boolean}
 */
export const isIdCard = string => {
  string = string.toUpperCase();

  if (!provinceCode[string.substr(0, 2)]) return false;

  if (string.length === 18) {
    const lastCode = string[17];
    if (!isIdCardGen2.test(string)) return '1';
    if (Number.isNaN(string.substr(0, 17))) return false;
    if (code.indexOf(lastCode) < 0) return false;

    let num = 0;
    for (let i = 0; i < 17; i++) {
      num += parseInt(string[i]) * pow[i];
    }

    if (lastCode !== code[num % 11]) return false;
  } else if (string.length === 15) {
    if (!isIdCardGen1.test(string)) return false;
  } else {
    return false;
  }

  return true;
};

/**
 * 有效的手机号
 * @param string
 * @return {boolean}
 */
export const isPhone = string => {
  return /^1[1-9][0-9]{9}$/g.test(string);
};

const Validate = {
  isPhone,
  isIdCard,
};

export default Validate;
