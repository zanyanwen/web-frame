import { ModalRoute, NormalSwitch } from '@/components/layouts/AppModal';
import { HOME_PAGE } from '@/constants/link';
import { GetLogin, SetPayPass, ToRealName } from '@/pages/passport';
import GetVerifyPayPass from '@/pages/wallet/verify-payass';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import Loadable from './components/Loadable';

export default () => (
  <>
    <NormalSwitch>
      <Route path={HOME_PAGE} exact component={Loadable(() => import('./pages/Home'))} />
    </NormalSwitch>
    <ModalRoute />
    <GetLogin />
    <ToRealName />
    <SetPayPass />
    <GetVerifyPayPass />
  </>
);
