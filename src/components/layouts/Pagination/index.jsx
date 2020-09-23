import { ActivityIndicator, Flex } from 'antd-mobile';
import { action, computed, observable } from 'mobx';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './index.less';

export const ListLoading = ({ value }) => (value ? <Flex justify='center' children={<ActivityIndicator />} /> : null);
ListLoading.propTypes = { name: PropTypes.string.isRequired };

export const ListFinished = ({ value }) =>
  value ? <Flex justify='center' className={styles.text} children='没有更多了' /> : null;
ListFinished.propTypes = { name: PropTypes.string.isRequired };

export class PaginationStore {
  @observable list = [];

  @observable pageSize = 10;

  @observable page = 0;

  @observable loading = false;

  @computed get loadingMore() {
    return this.list.length > 0 && this.loading;
  }

  @observable finished = false;

  @computed get refreshing() {
    return this.list.length === 0 && this.loading;
  }

  @action loadList = async (reload = false) => {
    if (this.loading) return;
    if (reload === true) {
      this.list = [];
      this.finished = false;
      this.page = 0;
    }
    if (this.finished) return;
    this.page += 1;

    if (typeof this.listRequest === 'function') {
      this.loading = true;
      const list = await this.listRequest(reload);
      this.loading = false;
      if (!Array.isArray(list)) return;
      this.list = this.list.concat(list);
      this.finished = this.pageSize > list.length;
    }
  };

  @action reset = () => {
    this.loadList(true);
  };
}
