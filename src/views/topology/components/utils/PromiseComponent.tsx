import { Component } from 'react';
import i18next from 'i18next';

type PromiseComponentState = {
  inProgress: boolean;
  errorMessage: string;
};

class PromiseComponent<P, S extends PromiseComponentState> extends Component<P, S> {
  constructor(props) {
    super(props);
    this.state = {
      inProgress: false,
      errorMessage: '',
    } as S;
  }

  handlePromise<T>(promise: Promise<T>): Promise<T> {
    this.setState({
      inProgress: true,
    });
    return promise.then(
      (res) => this.then(res),
      (error) => this.catch(error),
    );
  }

  private then(res) {
    this.setState({
      inProgress: false,
      errorMessage: '',
    });
    return res;
  }

  private catch(error) {
    const errorMessage =
      error.message || i18next.t('kubevirt-plugin~An error occurred. Please try again.');
    this.setState({
      inProgress: false,
      errorMessage,
    });
    return Promise.reject(errorMessage);
  }
}

export default PromiseComponent;
