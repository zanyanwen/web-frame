import commonStore from '@/store/commonStore';
import { Toast } from 'antd-mobile';
import axios from 'axios';
import { decryptResponse, encryptRequest } from './security-util';

let counter = 0;
const loadingSet = new Set();
let loadingShowed = false;

const allDoneCallbacks = [];

const checkAllHided = () => {
  if (loadingSet.size === 0) {
    while (allDoneCallbacks.length) {
      allDoneCallbacks.shift()();
    }
  }
};

/**
 * 等待当前有loading框的请求完成
 * @returns {Promise<void>}
 */
export const getAllLoadingHided = () =>
  new Promise(res => {
    allDoneCallbacks.push(res);
    setTimeout(checkAllHided);
  });

const CODES = {
  SUCCESS: '000',
  UNKNOWN_ERROR: '100',
  TOKEN_EXPIRE: '999',
  REQUIRE_ACCESS: '998',
  SECURE_ERROR: '120',
  DECRYPT_FAIL: -4,
  CANCELED: -3,
  SERVER_ERROR: -2,
  NETWORK_ERROR: -1,
};

const { CancelToken: __OriginCancelToken } = axios;

axios.__OriginCancelToken = __OriginCancelToken;
axios.CancelToken = class CancelToken extends __OriginCancelToken {
  constructor(executor) {
    super(cancel => {
      executor(msg => {
        if (this.__config) {
          cancel({ config: this.__config, msg });
        } else {
          cancel({ message: msg });
        }
      });
    });
  }
};

axios.defaults.baseURL = process.env.BASE_URL || '/';

/**
 * AxiosRequestConfig 附加的字段
 * @param hideMsg {Boolean} 隐藏错误
 * @param hideLoading {Boolean} 隐藏loading模态框
 * @param access {String} 支付密码的验证签名
 * @param secure {Boolean} 使用非对称加密回话
 */
axios.interceptors.request.use(async config => {
  const reqId = (config.__reqId = counter++);
  config.originalData = config.data;
  console.log(`(${reqId}) 请求开始 ${config.method} ${config.url}`);
  console.log(`(${reqId}) 请求参数 ${JSON.stringify(config.data)}`);

  if (!config.hideLoading) {
    loadingSet.add(reqId);
    if (!loadingShowed) {
      loadingShowed = true;
      Toast.loading('加载中...', 0);
    }
  }

  if (config.access) {
    if (typeof config.access === 'string') {
      config.headers.access = config.access;
    } else {
      if (!commonStore.payPassAccess) {
        await new Promise(res => commonStore.showPayPass(res));
      }
      config.headers.access = commonStore.payPassAccess;
    }
  }

  if (config.secure) {
    config.data = encryptRequest(config.data);
    console.log('Encrypted', JSON.stringify(config.data));
  }

  if (commonStore.accessToken) {
    config.headers.token = commonStore.accessToken;
    config.headers.channel = 'APP';
  }

  if (config.cancelToken) {
    config.cancelToken.__config = config;
  }

  return config;
});

axios.interceptors.response.use(
  r => r,
  error => {
    if (axios.isCancel(error)) {
      return Promise.resolve({
        config: error.message.config,
        request: null,
        status: -1,
        canceled: true,
        data: { code: CODES.CANCELED, msg: error.message.msg },
      });
    }

    if (!error.response) {
      return Promise.resolve({
        config: error.config,
        request: error.request,
        status: -1,
        data: { code: CODES.NETWORK_ERROR, msg: '网络连接异常' },
      });
    }

    if (error.response.data.code || error.response.config.checkBody === false) {
      return Promise.resolve(error.response);
    }

    return Promise.resolve({ ...error.response, data: { code: CODES.SERVER_ERROR, msg: '服务器未知错误' } });
  },
);

axios.interceptors.response.use(response => {
  const { config, status, canceled } = response;
  let data = response.data;

  if (!config.hideLoading) {
    loadingSet.delete(config.__reqId);
    if (loadingSet.size === 0 && loadingShowed) {
      loadingShowed = false;
      Toast.hide();
    }
    checkAllHided();
  }

  const returnLog = () => (
    console.log(`(${config.__reqId}) 请求结果 status: ${status}, data: ${JSON.stringify(data).substr(0, 200)}`),
    response
  );

  const resolveCode = () => {
    if (config.__retry) return returnLog();
    const { cancelToken, ...conf } = config;
    conf.url = config.url.replace(new RegExp(`^${config.baseURL}`), '');

    conf.__retry = true;
    if (conf.hasOwnProperty('originalData')) conf.data = conf.originalData;



    if (data.code === CODES.TOKEN_EXPIRE) {
      console.log(`(${config.__reqId}) 登录验证失败，排入队列并在登录后重试`);
      return commonStore.setLogout(true, () => {
        if (conf.data.hasOwnProperty('userId')) conf.data.userId = commonStore.uid;
        return axios(conf);
      });
    } else if (data.code === CODES.REQUIRE_ACCESS) {
      console.log(`(${config.__reqId}) access验证失效，排入队列并在验证通过后重试`);
      conf.access = true;
      return commonStore.showPayPass(() => axios(conf));
    } else if (!config.hideMsg) {

      if (config.secure && data.code === CODES.SECURE_ERROR) {
        Toast.fail('系统异常，请联系管理员', 3, null, false);
      } else {
        if (data.data && data.data.head) {
          Toast.info(data.msg + data.data.head.resMsg, 4)
        } else {
          Toast.info(data.msg || '服务器未知错误', 3, null, false);
        }
      }
    }

    return returnLog();
  };

  if (!canceled) {
    if (data.hasOwnProperty('code') && data.code !== CODES.SUCCESS) {
      return resolveCode();
    } else if (config.secure) {
      if (
        data.code !== CODES.SUCCESS &&
        !data.hasOwnProperty('key') &&
        !data.hasOwnProperty('result') &&
        typeof data.msg === 'string'
      ) {
        return resolveCode();
      }
      response.originalData = response.data;
      console.log('Original Response', JSON.stringify(response.originalData));
      response.data = decryptResponse(response.data);
      data = response.data;
      if (data.hasOwnProperty('code') && data.code !== CODES.SUCCESS) return resolveCode();
    }
  }

  return returnLog();
});

export { CODES as RESPONSE_CODES };
