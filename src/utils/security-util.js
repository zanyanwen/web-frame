import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

const { WordArray: TypedArrays } = CryptoJS.lib;
const { Utf8 } = CryptoJS.enc;
const { Pkcs7 } = CryptoJS.pad;
const { CBC } = CryptoJS.mode;
const { AES } = CryptoJS;

let encrypt = null;

let decrypt = null;

const passwordEncrypt = new JSEncrypt();
passwordEncrypt.setPublicKey(
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDJOoSaOKBxMGcqMYqmNN4zREaLA86e5z89HffwmOUvcLNpKPfgsh8P3vm1VBaPUUdfwgFbAm246W85zmfWt0WmGXBMyjwO98R3miXSv4FZRUEvGiTvNcwkT+Q+HFHyez7UfSu8QLLOz7+yYxGj3SLDSUbpxhuIw6htAlWE6YkIBQIDAQAB',
);

const iv = Utf8.parse('A-16-Byte-String');

const onReady = () => {
  const privateKey = localStorage.getItem('securityUtil.privateKey');
  const publicKey = localStorage.getItem('securityUtil.publicKey');
  if (privateKey && publicKey) {
    encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
  }
};

window.addEventListener('deviceready', onReady);
setTimeout(onReady);

/**
 * 登录密码加密
 * @param password {string}
 * @returns encrypted {string}
 */
export const encryptPassword = password => {
  return passwordEncrypt.encrypt(password);
};

/**
 * 配置密钥
 * @param string {string}
 */
export const setPrivateKey = string => {
  localStorage.setItem('securityUtil.privateKey', string);
  decrypt = new JSEncrypt();
  decrypt.setPrivateKey(string);
};

/**
 * 配置公钥
 * @param string {string}
 */
export const setPublicKey = string => {
  localStorage.setItem('securityUtil.publicKey', string);
  encrypt = new JSEncrypt();
  encrypt.setPublicKey(string);
};

/**
 * 加密请求参数
 * @param data {object}
 * @returns {{param: null, key: null}}
 */
export const encryptRequest = data => {
  let key = null,
    param = null;
  try {
    key = TypedArrays.random(16).toString();
    param = AES.encrypt(Utf8.parse(JSON.stringify(data)), Utf8.parse(key), {
      iv: Utf8.parse('A-16-Byte-String'),
      mode: CBC,
      padding: Pkcs7,
    }).toString();
    key = encrypt.encrypt(key);
  } catch (e) {
    console.error(`SecurityUtil.encryptRequest error: ${e.message}`);
  }
  return { key, param };
};

/**
 * 解密相应体
 * @param key
 * @param result
 * @returns {null|object}
 */
export const decryptResponse = ({ key = null, result = null }) => {
  let data = { code: -4, msg: '消息解密失败，您可能处于不安全的网络' };
  try {
    const decKey = decrypt.decrypt(key);
    data = JSON.parse(
      AES.decrypt(result, Utf8.parse(decKey), {
        iv: Utf8.parse('A-16-Byte-String'),
        mode: CBC,
        padding: Pkcs7,
      }).toString(Utf8),
    );
  } catch (e) {
    console.error(`SecurityUtil.decryptResponse error: ${e.message}`);
  }
  return data;
};
