import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import AppModal from '@/components/layouts/AppModal';
import store from './store';
import { observer } from 'mobx-react';
import { EmInputItem, EmList } from '@/components/layouts/EmList/EmList';
import { Button, InputItem, WhiteSpace, WingBlank } from 'antd-mobile';
import MobxForm from '@/components/contexts/MobxForm';

const Address = React.forwardRef(({ resolve, ...props }, ref) => {
  useEffect(() => {
    store.reset();
    store.getAddress();
  }, []);

  return (
    <div className={styles.container}>
      {store.provinceName && (
        <div className={styles.selAddress}>
          <div>已选择：</div>
          <div>
            <span onClick={() => store.resetStep(1)}>{store.provinceName}</span>
            <span onClick={() => store.resetStep(2)}>{store.cityName}</span>
            <span>{store.areaName}</span>
          </div>
        </div>
      )}

      <div style={{ display: store.step === 1 ? 'block' : 'none' }} className={styles.address}>
        <div className={styles.note}>选择省份/地区：</div>
        <div className={styles.area}>
          {store.provinceList.map((item, index) => (
            <div onClick={() => store.getNext(item.id, item.cnName, item.code, 1, resolve)} key={index}>
              {item.cnName}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: store.step === 2 ? 'block' : 'none' }} className={styles.address}>
        <div className={styles.note}>选择城市：</div>
        <div className={styles.area}>
          {store.cityList.map((item, index) => (
            <div onClick={() => store.getNext(item.id, item.cnName, item.code, 2, resolve)} key={index}>
              {item.cnName}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: store.step === 3 ? 'block' : 'none' }} className={styles.address}>
        <div className={styles.note}>选择区/县：</div>
        <div className={styles.area}>
          {store.areaList.map((item, index) => (
            <div onClick={() => store.getNext(item.id, item.cnName, item.code, 3, resolve)} key={index}>
              {item.cnName}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: store.step === 4 ? 'block' : 'none' }} className={styles.address}>
        <MobxForm data={store}>
          <EmList>
            <MobxForm.Item>
              <EmInputItem name='detailsAddress' placeholder='请输入详细地址'>
                详细地址
              </EmInputItem>
            </MobxForm.Item>
          </EmList>
        </MobxForm>
        <WhiteSpace />
        <Button type='primary' onClick={() => store.submit(resolve)}>
          保存
        </Button>
      </div>
    </div>
  );
});

Address.displayName = 'Address';

const openAdress = (success, err) => {
  AppModal.open({
    path: '~address',
    component: observer(Address),
    props: { success, err },
    modalProps: { popup: true, animationType: 'slide-up', className: styles.modal },
    navBarProps: { title: '选择地址' },
  }).then(data => {
    success(data);
  });
};

export default openAdress;
