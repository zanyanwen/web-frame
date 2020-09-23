import { createContext } from 'react';

export const getMobxData = (data, formBind, elementBind) => {
  if (typeof elementBind === 'function') return elementBind(data);
  const formData = typeof formBind === 'string' ? data[formBind] : data;
  return typeof elementBind === 'string' ? data[elementBind] : formData;
};

/**
 * @desc 有时候视图渲染需要绑定store但不需要表单时 可以用
 *  <br> <MobxForm.Provider value={{ data: store }}>{...}</MobxForm.Provider>
 *  <br> 然后后子节点中用`MobxForm.Item`即可绑定对应的value到视图组件上
 */
export const MobxFormCtx = createContext({ data: {} });
MobxFormCtx.displayName = 'MobxFormContext';
