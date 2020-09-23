import { get } from '@/utils/object-utils';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';
import { getMobxData, MobxFormCtx } from './context';

@observer
class Children extends React.Component {
  static propTypes = {
    children: PropTypes.any,
    valueProp: PropTypes.string,
    value: PropTypes.any,
  };

  static defaultProps = { valueProp: 'value' };

  static contextType = MobxFormCtx;

  render() {
    const { data, bind: formBind } = this.context;
    const { children, valueProp, value } = this.props;

    if (!React.isValidElement(children)) return children;
    const newProps = {};
    const {
      name: tarName,
      bind: tarBind,
      action: tarAction,
      'data-bind': dataBind,
      'data-name': dataName,
      'data-action': dataAction,
      'data-each': dataEach = false,
      'data-key': dataKey = 'id',
      onClick,
    } = children.props;
    const name = dataName || tarName;
    const action = dataAction || tarAction;
    const bind = dataBind || tarBind;
    const currentData = getMobxData(data, formBind, bind);

    if (typeof name === 'string') {
      newProps[valueProp] = typeof value === 'function' ? value(get(currentData, name), name) : get(currentData, name);
    }

    if (typeof action === 'string' && typeof currentData[action] === 'function') {
      newProps.onClick = (...args) => {
        currentData[action](...args);
        if (typeof onClick === 'function') {
          onClick(...args);
        }
      };
    }

    if (dataEach && Array.isArray(newProps[valueProp])) {
      return newProps[valueProp].map((item, index) =>
        React.cloneElement(children, {
          ...newProps,
          [valueProp]: item,
          'data-index': index,
          key: (item && item[dataKey]) || index.toString(),
        }),
      );
    }

    if (['input', 'select'].indexOf(children.type) > -1 && !children.props.hasOwnProperty('onChange')) {
      newProps.onChange = () => {};
    }

    return React.cloneElement(children, newProps);
  }
}

/**
 * 绑定子组件
 * @desc 子元素的 data-bind 绑定mobx对象(同MobxForm的data-bind)
 * <br> 子元素的 name|data-name 绑定mobx对象的数据 传给子元素的`value`属性
 * <br> 子元素的 data-action 绑定mobx对象的action 传给子元素的`onClick`属性
 */
const MobxFormItem = ({ children, ...props }) =>
  React.Children.count(children) > 0
    ? React.Children.map(children, elem => <Children {...props} children={elem} />)
    : null;

MobxFormItem.propTypes = {
  /**
   * 绑定值传给子元素的参数名  默认传给 `value`
   * @example <MobxFormItem valueProp='extra'><List.Item data-name='userName'>用户名</List.Item></MobxFormItem>
   *   相当于绑定后的 <List.Item extra={store.userName}>用户名</List.Item>
   */
  valueProp: PropTypes.string,

  /**
   * 转换传递的值
   * @example: <MobxFormItem value={sensitiveMask} /> // 这样子节点拿到的value就是脱敏后的值
   * @example: <MobxFormItem value={v => v && `欢迎: ${v}`} /> // 如果值非空，子节点拿到的value就会在前面加了 '欢迎：'
   */
  value: PropTypes.func,
};

export default MobxFormItem;
