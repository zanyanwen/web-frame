import { action, computed, observable } from 'mobx';

import getProvince from '@/api/common/getProvince';
import getProvinceDicNextTree from '@/api/common/getProvinceDicNextTree';
import { RESPONSE_CODES } from '@/utils/config-axios';
import { Toast } from 'antd-mobile';

class Store {
  @observable step = 1;

  @observable provinceName = '';
  @observable provinceList = [];
  @observable provinceCode = '';

  @observable cityName = '';
  @observable cityList = [];
  @observable cityCode = '';

  @observable areaName = '';
  @observable areaList = [];
  @observable areaCode = '';

  @observable detailsAddress = '';

  @action reset() {
    this.step = 1;
    this.provinceName = '';
    this.provinceList = [];
    this.provinceCode = '';
    this.cityName = '';
    this.cityList = [];
    this.cityCode = '';
    this.areaName = '';
    this.areaList = [];
    this.areaCode = '';
    this.detailsAddress = '';
  }

  @action resetStep = type => {
    if (type === 1) {
      this.step = 1;
      this.cityList = [];
      this.cityName = '';
      this.cityCode = '';
    } else {
      this.step = 2;
      this.areaCode = '';
      this.areaName = '';
      this.areaList = [];
    }
  };

  @action getAddress = async () => {
    const { data: resp } = await getProvince();
    if (resp.code === RESPONSE_CODES.SUCCESS) {
      this.provinceList = resp.data;
    }
  };

  @action getNext = async (id, name, code, type, resolve) => {
    if (type === 1) {
      this.provinceName = name;
      this.provinceCode = code;
    } else if (type === 2) {
      this.cityName = name;
      this.cityCode = code;
    } else {
      this.areaName = name;
      this.areaCode = code;
    }
    const { data: resp } = await getProvinceDicNextTree({ id });
    if (resp.code === RESPONSE_CODES.SUCCESS) {
      if (resp.data.length === 0) return (this.step = 4);

      if (type === 1) {
        this.cityList = resp.data;
        this.step = 2;
      } else if (type === 2) {
        this.areaList = resp.data;
        this.step = 3;
      }
    }
  };

  @action submit = resolve => {
    if (this.detailsAddress.length < 6) return Toast.info('请填写至少6位以上的详细地址');
    return resolve({
      provinceCode: this.provinceCode,
      provinceName: this.provinceName,
      cityCode: this.cityCode,
      cityName: this.cityName,
      areaCode: this.areaCode,
      areaName: this.areaName,
      detailsAddress: this.detailsAddress,
    });
  };
}

export default new Store();
