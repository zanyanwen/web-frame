import React from 'react';

const MobxFormValue = ({ bind, action, value = null, component: Comp = React.Fragment, ...props }) =>
  Comp === React.Fragment ? value : <Comp {...props}>{value}</Comp>;

export default MobxFormValue;
