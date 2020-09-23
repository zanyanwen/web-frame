import { useEffect, useState, useCallback } from 'react';
import { findDOMNode } from 'react-dom';

/**
 * 绑定滚动到底部回调函数
 * @param fn {Function} 滚动到底部时的回调函数
 * @param distance = 50 {Number} 与底部的触发距离
 * @param scrollElement {HTMLElement|Window} 监听对象(可滚动的dom节点)
 * @param ref = false {Boolean} 是否返回 [HTMLElement, React.Ref]
 * @returns {void | [HTMLElement, React.Ref]}
 * @example {
 *   const [node, ref] = useReachBottom(store.loadList, { ref: true });
 *   <ScrollContainer ref={ref}>
 *     <PullToRefresh getScrollContainer={() => node}>
 *       {renderList()}
 *     </PullToRefresh>
 *   </ScrollContainer>
 * }
 * @example {
 *   useReachBottom(store.loadList);
 *   <PullToRefresh >
 *     {renderList()}
 *   </PullToRefresh>
 * }
 */
const useReachBottom = (fn, { distance = 50, scrollElement = window, ref: useRef = false } = {}) => {
  const [node, setNode] = useState(useRef ? null : scrollElement);

  useEffect(() => {
    if (!node) return;

    const onScroll = e => {
      const {
        scrollHeight = window.document.body.offsetHeight,
        scrollY,
        scrollTop = scrollY,
        innerHeight,
        offsetHeight = innerHeight,
      } = e.currentTarget;

      if (scrollHeight - offsetHeight - scrollTop - distance <= 0) {
        if (typeof fn === 'function') fn();
      }
    };
    onScroll({ currentTarget: node });
    node.addEventListener('scroll', onScroll);
    return () => node.removeEventListener('scroll', onScroll);
  }, [node]);

  if (useRef) return [node, useCallback(ref => setNode(ref && findDOMNode(ref)), [])];
};

export default useReachBottom;
