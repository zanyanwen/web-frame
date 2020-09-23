import { MobxAdministrationSymbol, MobxObservableValueConstructor } from '@/utils/mobx-utils';
import { set, splitPath } from '@/utils/object-utils';
import PropTypes from 'prop-types';
import React from 'react';
import { getMobxData, MobxFormCtx } from './context';
import Effect from './Effect';
import Item from './Item';
import Show from './Show';
import Value from './Value';

/**
 * mobx双向绑定组件
 * @desc 默认mobx对象的 action(change/reset/submit)也会绑定到表单事件中
 */
function MobxForm({ onChange, onReset, onSubmit, data = {}, resetOnMount = false, ...props }) {
  const handleChange = e => {
    const { bind: formBind } = e.currentTarget.dataset;
    const { bind: dataBind = null, name: dataName, value: dataValue, skipObserverCheck = false } = e.target.dataset;
    const { type, name: tarName = null, checked = false, value: elValue = null } = e.target;
    const tarValue = ['checkbox', 'radio'].indexOf(type) > -1 ? checked : elValue;
    const currentData = getMobxData(data, formBind, dataBind);

    // 确保是observable字段再给他赋值
    let name =
      currentData[MobxAdministrationSymbol] &&
      [dataName, tarName].find(n => {
        if (!n) return false;
        const [firstPath] = splitPath(n);
        const dataTarget = currentData[MobxAdministrationSymbol].values.get(firstPath);
        return dataTarget && dataTarget.constructor === MobxObservableValueConstructor;
      });
    if (!name && !skipObserverCheck) return;
    name = name || dataName || tarName;
    const value = dataValue || tarValue;
    set(currentData, name, value);

    //监听是否更改
    if (['name', 'idCard', 'detailAddress', 'issueAuthority', 'validDate'].indexOf(name) != -1) {
      set(currentData, 'isChange', true);
    }

    if (typeof currentData.change === 'function') {
      currentData.change(name, value);
    }

    if (typeof onChange === 'function') {
      onChange(e, { name, value });
    }
  };

  const handleReset = e => {
    e.preventDefault();
    const { bind: formBind } = e.currentTarget.dataset;
    const { bind: dataBind = null } = e.target.dataset;
    const currentData = getMobxData(data, formBind, dataBind);

    if (typeof currentData.reset === 'function') {
      currentData.reset();
    }

    if (typeof onReset === 'function') {
      onReset(e);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const { bind: formBind } = e.currentTarget.dataset;
    const { bind: dataBind = null } = e.target.dataset;
    const currentData = getMobxData(data, formBind, dataBind);

    if (typeof currentData.submit === 'function') {
      currentData.submit();
    }

    if (typeof onSubmit === 'function') {
      onSubmit(e, data);
    }
  };

  React.useEffect(() => {
    if (resetOnMount) {
      if (typeof onReset === 'function') {
        onReset();
      }

      const formData = getMobxData(data, props['data-bind']);
      if (resetOnMount === true && typeof formData.reset === 'function') {
        formData.reset();
      } else if (Array.isArray(resetOnMount)) {
        resetOnMount.forEach(key => {
          if (data[key] && typeof data[key].reset === 'function') data[key].reset;
        });
      } else if (typeof resetOnMount === 'string') {
        if (data[resetOnMount] && typeof data[resetOnMount].reset === 'function') {
          data[resetOnMount].reset();
        }
      } else if (typeof resetOnMount.reset === 'function') {
        resetOnMount.reset();
      }
    }
  }, [resetOnMount]);

  return (
    <MobxFormCtx.Provider value={{ data, bind: props['data-bind'] }}>
      <form {...props} onChange={handleChange} onReset={handleReset} onSubmit={handleSubmit}>
        {props.children}
        <input type='submit' hidden />
      </form>
    </MobxFormCtx.Provider>
  );
}

MobxForm.propTypes = {
  /**
   * change 事件 (Event, change) => void
   * @param {Event}
   * @params {{ name: string, value: any }} 改变的字段
   */
  onChange: PropTypes.func,

  /**
   * reset 事件 () => void
   */
  onReset: PropTypes.func,

  /**
   * submit 事件 (Event, data) => void
   * @param {Event}
   * @param {any} data参数
   */
  onSubmit: PropTypes.func,

  /**
   * mobx对象/包含mobx对象的object
   */
  data: PropTypes.any.isRequired,

  /**
   * 默认绑定的 data 属性名 (如果传入的是包含mobx对象的object)
   */
  'data-bind': PropTypes.string,

  /**
   * 第一次渲染是否触发 reset 事件
   */
  resetOnMount: PropTypes.bool,
};

MobxForm.Item = Item;
MobxForm.Value = Value;
MobxForm.Show = Show;
MobxForm.Effect = Effect;
MobxForm.Provider = MobxFormCtx.Provider;

/**
 * 集合了对mobx store操作的组件
 */
export default MobxForm;
export {
  Item as MobxFormItem,
  Value as MobxFormValue,
  Show as MobxFormShow,
  Effect as MobxFormEffect,
  MobxFormCtx,
  getMobxData,
};
