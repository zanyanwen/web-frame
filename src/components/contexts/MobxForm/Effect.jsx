import { get, set } from '@/utils/object-utils';
import { observer } from 'mobx-react';
import React from 'react';
import { getMobxData, MobxFormCtx } from './context';

const Copy = ({ children }) => (typeof children === 'undefined' ? null : children);

/**
 * 给store赋值的组件
 * @desc 如果该节点渲染就会给store指定的字段赋值
 *  <br> 如果节点卸载，字段会变回旧的值
 */
const MobxFormEffect = observer(({ component: Comp = Copy, ...props }) => {
  const { value, name: tarName, 'data-name': dataName, bind: tarBind, 'data-bind': dataBind } = props;
  const { bind: formBind, data } = React.useContext(MobxFormCtx);

  React.useEffect(() => {
    const name = dataName || tarName;
    const bind = dataBind || tarBind;
    if (typeof name !== 'string') return;
    const currentData = getMobxData(data, formBind, bind);
    if (!currentData) return;
    if (get(currentData, name) !== value) {
      const oldValue = get(currentData, name);
      set(currentData, name, value);
      return () => set(currentData, name, oldValue);
    }
  }, [value, dataName, tarName, dataBind, tarBind, data, formBind]);

  return <Comp {...props} />;
});

export default MobxFormEffect;
