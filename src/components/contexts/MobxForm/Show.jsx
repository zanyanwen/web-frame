import { getMobxData, MobxFormCtx } from '@/components/contexts/MobxForm/context';
import { Observer } from 'mobx-react-lite';
import { get } from '@/utils/object-utils';
import React from 'react';

const MobxFormShow = ({ name, 'data-name': dataName, bind, 'data-bind': dataBind, children, getValue = v => v }) => (
  <MobxFormCtx.Consumer>
    {({ data, bind: formBind }) => (
      <Observer>
        {() => {
          const value = getValue(get(getMobxData(data, formBind, dataBind || bind), dataName || name));
          return typeof children === 'function' ? children(value) : value ? children : null;
        }}
      </Observer>
    )}
  </MobxFormCtx.Consumer>
);
export default MobxFormShow;
