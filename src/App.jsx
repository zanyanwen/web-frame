import HistoryStack from '@/components/contexts/HistoryStack';
import React, { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Routes from './Routes';
import commonStore from './store/commonStore';

const Router = HashRouter;

const App = () => {
  useEffect(() => {
    if (!commonStore.resetPayPassMark) commonStore.setLogout()
  }, [])

  return (
    <Router>
      <HistoryStack />
      <Routes />
    </Router>
  );
};

export default App;
