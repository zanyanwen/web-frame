import clsx from 'clsx';
import React from 'react';
import styles from './index.less';
import PropTypes from 'prop-types';

/**
 * 视图安全区域的padding，比如iPhone X的刘海和手势区域
 */
const SafeArea = React.forwardRef(({ top, bottom, left, right, component: Comp = 'div', className, ...props }, ref) => (
  <Comp
    ref={ref}
    {...props}
    className={clsx(
      {
        [styles.top]: top,
        [styles.bottom]: bottom,
        [styles.left]: left,
        [styles.right]: right,
      },
      className,
    )}
  />
));

SafeArea.propTypes = {
  /**
   * 顶部视图安全区域的padding
   */
  top: PropTypes.bool,

  /**
   * 底部视图安全区域的padding
   */
  bottom: PropTypes.bool,

  /**
   * 左边视图安全区域的padding
   */
  left: PropTypes.bool,

  /**
   * 右边视图安全区域的padding
   */
  right: PropTypes.bool,

  /**
   * 组件，默认为`div`
   */
  component: PropTypes.elementType,
};

SafeArea.displayName = 'SafeArea';

export default SafeArea;
