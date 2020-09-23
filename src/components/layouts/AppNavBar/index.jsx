import { useHistoryIndex } from '@/components/contexts/HistoryStack';
import { HOME_PAGE } from '@/constants/link';
import { Icon, NavBar } from 'antd-mobile';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import React from 'react';
import { findDOMNode } from 'react-dom';
import { useHistory, useLocation } from 'react-router-dom';
import styles from './index.less';

const AppNavBar = ({ steps = 1, className, position = 'fixed', mode = 'light', transparent = false, isSetTransparent = true, ...props }) => {
  const historyIndex = useHistoryIndex();
  const history = useHistory();
  const location = useLocation();
  const index = historyIndex.get();
  const [height, setHeight] = React.useState(0);
  const [node, setRef] = React.useState(null);
  const ref = React.useCallback(setRef, []);
  const klassName = clsx(className, styles.navbar, styles[position], { [styles.transparent]: transparent });
  const newProps = { ref, className: klassName };

  React.useEffect(() => {
    if (isSetTransparent) {
      document.addEventListener('deviceready', onDeviceReady, false);
      function onDeviceReady() {
        if (cordova.platformId == 'android') {
          StatusBar.backgroundColorByHexString('#333');
        } else {
          StatusBar.overlaysWebView(true);
          if (mode == 'light') {
            StatusBar.styleDefault(); //黑字
          } else {
            StatusBar.styleLightContent(); //白字
          }
        }
      }
    }

    const onResize = () => {
      if (position === 'fixed' && node) {
        const el = findDOMNode(node);
        setHeight(el.getBoundingClientRect ? el.getBoundingClientRect().height : el.offsetHeight);
      }
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [node, position]);

  if (index > 1 || (location && location.pathname !== HOME_PAGE)) {
    const onLeftClick = () => {
      if (index > 1) {
        history.go(0 - steps);
      } else if (history.length > 1) {
        history.go(0 - steps);
        // setTimeout(() => {
        //   if (history.location === location) {
        //     history.replace(HOME_PAGE);
        //   }
        // });
      } else {
        history.replace(HOME_PAGE);
      }
    };

    newProps.icon = <Icon type='left' />;
    newProps.onLeftClick = onLeftClick;
  }

  return (
    <>
      <NavBar mode={mode} {...newProps} {...props} />
      {position === 'fixed' && <div style={{ height }} />}
    </>
  );
};

AppNavBar.porpTypes = {
  /**
   * css的position
   */
  position: PropTypes.oneOf(['static', 'fixed']),

  /**
   * 透明的NavBar
   */
  transparent: PropTypes.bool,
};

export default AppNavBar;
