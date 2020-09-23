import { MobxFormCtx, MobxFormItem } from '@/components/contexts/MobxForm';
import commonStore from '@/store/commonStore';
import { Button } from 'antd-mobile';
import PropTypes from 'prop-types';
import React from 'react';

const SmsButtonComponent = ({ component: Comp, name, 'data-action': action, value, ...props }) =>
  value > 0 ? (
    <Comp disabled {...props}>
      {value}秒
    </Comp>
  ) : (
    <Comp {...props}>发送</Comp>
  );

/**
 * 信发送按钮
 */
const SmsButton = ({ data = {}, phoneProp, sceneProp, onClick, onSent, ...props }) => {
  const { [phoneProp]: phone1, [sceneProp]: scene1, ...rest } = props;
  const click = (...args) => {
    const { [phoneProp]: phone2, [sceneProp]: scene2 } = data;
    const phone = phone1 || phone2;
    const scene = scene1 || scene2;
    const pms = commonStore.sendSms(phone, scene);
    if (typeof onClick === 'function') onClick(...args);
    if (typeof onSent === 'function') {
      if (pms.then) return pms.then(onSent);
      onSent(pms);
    }
  };

  return (
    <MobxFormCtx.Provider value={{ data: commonStore }}>
      <MobxFormItem value={v => v[scene1 || data[sceneProp]] || 0}>
        <SmsButtonComponent {...rest} data-name='smsRemainSecond' onClick={click} />
      </MobxFormItem>
    </MobxFormCtx.Provider>
  );
};

SmsButton.defaultProps = {
  phoneProp: 'phone',
  sceneProp: 'scene',
  component: Button,
};

SmsButton.propTypes = {
  /**
   * 传递phone,scene参数的对象, 可以是mobx对象
   */
  data: PropTypes.object,

  /**
   * phone 的字段名, 用来从 props/data 取值
   */
  phoneProp: PropTypes.string.isRequired,

  /**
   * scene 的字段名, 用来从 props/data 取值
   */
  sceneProp: PropTypes.string.isRequired,

  /**
   * 短信发送成功的回调事件, 参数是接口返回的data
   */
  onSent: PropTypes.func,

  /**
   * 按钮的替代渲染组件 接收 children/disabled/onClick 参数, 默认用 antd-mobile/Button 渲染
   * SmsButton 的其余参数会传透到这个组件里
   */
  component: PropTypes.elementType,
};

// store {
//   onePhone: ,
//   towPhone: ''
//   scene：''
// }

// <SmsButton data={store} phoneProp='onePhone' onSent={data => proccess.env.ENV !== 'prod' && store.smsCode = data}/>
export default SmsButton;
