import { PullToRefresh } from 'antd-mobile';

PullToRefresh.defaultProps = {
  ...(PullToRefresh.defaultProps || {}),
  getScrollContainer: () => document.getElementById('app-root'),
};

const fixAndroidSafeArea = async () => {
  if (navigator.userAgent.toLowerCase().indexOf('android') === -1) return;
  if (!StatusBar) return console.log('No StatusBar Support');
  const style = document.documentElement.style;

  StatusBar.hide();
  StatusBar.overlaysWebView(false);

  const pms = [];
  pms.push(
    new Promise(res => {
      AndroidNotch.getInsetTop(res, () => res());
    }).then(px => (px && style.setProperty('--safe-area-inset-top', px + 'px'), px)),
  );
  pms.push(
    new Promise(res => {
      AndroidNotch.getInsetRight(res, () => res());
    }).then(px => px && style.setProperty('--safe-area-inset-right', px + 'px')),
  );
  pms.push(
    new Promise(res => {
      AndroidNotch.getInsetBottom(res, () => res());
    }).then(px => px && style.setProperty('--safe-area-inset-bottom', px + 'px')),
  );
  pms.push(
    new Promise(res => {
      AndroidNotch.getInsetLeft(res, () => res());
    }).then(px => px && style.setProperty('--safe-area-inset-left', px + 'px')),
  );
  pms.push(new Promise(res => setTimeout(res, 200)));

  const [top] = await Promise.all(pms);

  StatusBar.show();
  StatusBar.styleDefault();
  StatusBar.overlaysWebView(Number(top) > 0);
};

// if (window.cordovoa) fixAndroidSafeArea();
// else document.addEventListener('deviceready', fixAndroidSafeArea, false);
