import { ActivityIndicator, Flex } from 'antd-mobile';
import React from 'react';
import ReactLoadable from 'react-loadable';

const Loadable = loader =>
  ReactLoadable({
    loader,
    loading() {
      return (
        <Flex style={{ minHeight: '50vh', height: '100%', width: '100%' }} justify='center' align='center'>
          <ActivityIndicator size='large' />
        </Flex>
      );
    },
  });

export default Loadable;
