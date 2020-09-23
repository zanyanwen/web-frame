import AppNavBar from '@/components/layouts/AppNavBar';
import Loadable from '@/components/Loadable';
import commonStore from '@/store/commonStore';
import { Flex, Icon, Modal } from 'antd-mobile';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';
import deepEqual from '@/utils/deep-equal';
import React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { shouldUpdate } from 'recompose';

const join = (...args) => args.join('/').replace(/\/{2,}/g, '/');

const AppModalCtx = React.createContext({ isModal: false });

const NavBarComp = ({ setNavBarProps, ...props }) => {
  React.useEffect(() => {
    if (typeof setNavBarProps === 'function') setNavBarProps(props);
  });
  return null;
};
const _NavBar = ({ children: t = title, title, ...props }) => (
  <AppModalCtx.Consumer children={ctx => <NavBarComp title={t} {...props} setNavBarProps={ctx.setNavBarProps} />} />
);
const ModalComp = ({ setModalProps, ...props }) => {
  React.useEffect(() => {
    if (typeof setModalProps === 'function') setModalProps(props);
  });
  return null;
};
const _Modal = props => (
  <AppModalCtx.Consumer children={ctx => <ModalComp {...props} setModalProps={ctx.setModalProps} />} />
);


const ModalHelper = (function (bodyCls) {
  var scrollTop;
  return {
    afterOpen: function () {
      scrollTop = document.scrollingElement.scrollTop;
      document.body.classList.add(bodyCls);
      document.body.style.top = -scrollTop + 'px';
    },
    beforeClose: function () {
      document.body.classList.remove(bodyCls);
      // scrollTop lost after set position:fixed, restore it back.
      document.scrollingElement.scrollTop = scrollTop;
    }
  };
})('modalOpen');

const fixedBody = () => {
  var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
  document.body.style.cssText += 'overflow:hidden;position:fixed;top:-' + scrollTop + 'px;';
}

const looseBody = () => {
  var body = document.body;
  body.style.position = 'static';
  var top = body.style.top;
  document.body.scrollTop = document.documentElement.scrollTop = -parseInt(top);
  body.style.top = '';
  body.style.overflow = 'auto'
}

const AppModal = new (class {
  @observable location = null;

  @observable normalLocation = null;

  @observable _lastPath = sessionStorage.getItem('AppModal.lastPath') || '';

  set lastPath(path) {
    sessionStorage.setItem('AppModal.lastPath', path);
    this._lastPath = path;
  }

  get lastPath() {
    return this._lastPath;
  }

  @observable _stack = parseInt(sessionStorage.getItem('AppModal.stack') || '0');

  set stack(stack) {
    sessionStorage.setItem('AppModal.stack', stack);
    this._stack = stack;
  }

  get stack() {
    return this._stack;
  }

  @observable routes = [];

  @observable push = [];



  /**
   * 打开基于路由的模态框
   * @param path {string} Route.path
   * @param component {Function|Class} Route.component
   * @param openPath {string} 实际url (默认=path)
   * @param navBarProps {object} 传递给AppNavBar的参数 (title => children, hide => 不渲染NavBar)
   * @param modalProps {object} 传递给modal的参数
   * @param props {object} 传递给component的参数
   */
  @action open({ path, component, openPath = path, navBarProps = {},  modalProps = {}, ...props }) {
    const { pathname } = this.location || { pathname: '/' };
    // document.body.style.position = 'fixed'
    // document.body.style.overflow = 'hidden'
    // ModalHelper.afterOpen();
    // fixedBody()
    // return
    return new Promise(resolve => {
      let result;
      // propResolve 只保存返回值，不结束promise
      const propResolve = r => (typeof r !== 'undefined' ? (result = r) : void 0);
      // 当路径从store.routes删除并已经更新时
      const routeResolve = () => {
        // ModalHelper.beforeClose();
        resolve(result)
      };
      this.routes.push({
        routeResolve,
        path: join(pathname, path),
        component,
        props: {
          resolve: propResolve,
          navBarProps,
          modalProps,
          isModal: true,
          ...props,
        },
      });

      this.push.push(join(pathname, openPath));
    });
  }

  getAgreeTOC = (name, code = 'bhtAPP', props) => {
    return this.open({
      component: Loadable(() => import('./AgreeTOC')),
      path: '/toc/:code/:name',
      openPath: `/toc/${code}/${name}`,
      navBarProps: {
        title: '协议内容',
      },
      // wait: 10,
      // userId: commonStore.uid,
      ...props,
    });
  };

  Modal = _Modal;

  NavBar = _NavBar;
})();

const Children = ({
  component: Comp,
  navBarProps: _navBarProps,
  modalProps: _modalProps = {},
  resolve: _resolve,
  isSetTransparent:isSetTransparent,
  ...props
}) => {
  const store = AppModal;
  const history = useHistory();
  const [children, setChild] = React.useState(null);
  const [navBarProps, _setNavBarProps] = React.useState(_navBarProps);
  const [modalProps, _setModalProps] = React.useState(_modalProps);
  const [open, setOpen] = React.useState(true);
  const [resolved, setResolved] = React.useState(false);
  const [mounted, setMount] = React.useState(false);

  const setNavBarProps = newState => {
    _setNavBarProps({ ..._navBarProps, ...newState });
  };

  const setModalProps = newState => {
    _setModalProps({ ..._modalProps, ...newState });
  };

  const resolve = result => {
    setOpen(false);
    if (!resolved) {
      setResolved(true);
      _resolve(result);
    }
  };

  const { match } = props;
  const compProps = { ...props, setNavBarProps, setModalProps, resolve };

  React.useEffect(() => {
    setMount(true);
    return () => setMount(false);
  }, []);

  React.useEffect(() => {
    if (match && resolved) {
      history.goBack();
    }
  }, [match, resolved]);

  React.useEffect(() => {
    if (match && !children) {
      setChild(
        <AppModalCtx.Provider value={{ setModalProps, setNavBarProps, isModal: true }}>
          {React.cloneElement(<Comp {...compProps} />)}
        </AppModalCtx.Provider>,
      );
    }

    if (!match && mounted && open) {
      setOpen(false);
    }
  }, [match, mounted, open]);

  const afterClose = React.useCallback(
    (...args) => {
      if (!resolved) _resolve();

      // 模态框关闭就移除路径，routeResolve在更新周期结束后执行
      setTimeout(store.routes.pop().routeResolve);

      if (typeof modalProps.afterClose === 'function') {
        modalProps.afterClose(...args);
      }
    },
    [resolved],
  );

  return (
    <Modal {...modalProps} visible={match && open} afterClose={afterClose}>
      <Flex align='stretch' direction='column' style={{ height: '100%' }}>
        {!navBarProps.hide && (
          <AppNavBar
            isSetTransparent={isSetTransparent}
            position='static'
            icon={<Icon type='cross' />}
            {...navBarProps}
            children={navBarProps.title || 'Modal Title'}
          />
        )}
        <Flex.Item style={{ overflow: 'scroll' }}>{children}</Flex.Item>
      </Flex>
    </Modal>
  );
};

export const ModalRoute = observer(() => {
  const store = AppModal;
  const location = useLocation();
  const history = useHistory();
  const [routeCount, setRouteCount] = React.useState(0);

  React.useEffect(() => {
    const { stack, lastPath } = store;
    store.stack = 0;
    if (stack > 0 && location.pathname === lastPath) {
      history.go(-stack);
    }
  }, []);

  React.useEffect(() => {
    if (location !== store.location) store.location = location;

    if (store.routes.length === 0 && !deepEqual(store.normalLocation, location)) {
      store.normalLocation = location;
    }

    let last = store.push.pop();
    while (last) {
      history.push(last);
      last = store.push.pop();
    }

    if (routeCount !== store.routes.length) {
      store.stack += store.routes.length - routeCount;
      setRouteCount(store.routes.length);
    }

    if (store.routes.length === 0 && store.lastPath) {
      store.lastPath = '';
    } else if (location.pathname !== store.lastPath) {
      store.lastPath = location.pathname;
    }
  }, [location, store.push.length, store.routes.length]);

  return store.routes.map(({ path, component, props }, i) => (
    <Route
      key={`${i}:${path}`}
      path={path}
      children={routerProps => <Children {...props} {...routerProps} component={component} />}
    />
  ));
});

ModalRoute.displayName = 'ModalRoute';

const StaticSwitch = shouldUpdate(({ location }, p2) => !deepEqual(location, p2.location))(p => <Switch {...p} />);

export const NormalSwitch = observer(props => {
  const ctx = React.useContext(AppModalCtx);
  return (
    <StaticSwitch location={ctx.isModal ? null : AppModal.normalLocation} {...props}>
      {React.Children.map(props.children, El =>
        React.isValidElement(El) && El.type === Route ? (
          <Route
            {...El.props}
            component={null}
            children={
              El.props.children ||
              (El.props.component && (props => (props.match ? <El.props.component {...props} /> : null)))
            }
          />
        ) : (
            El
          ),
      )}
    </StaticSwitch>
  );
});

NormalSwitch.displayName = 'NormalSwitch';

export default AppModal;
