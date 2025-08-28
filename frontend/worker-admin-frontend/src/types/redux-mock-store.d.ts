declare module 'redux-mock-store' {
  import { Store, Dispatch, AnyAction } from 'redux';

  interface MockStore<S = any, A extends AnyAction = AnyAction> {
    getState(): S;
    dispatch: Dispatch<A>;
    clearActions(): void;
    getActions(): A[];
    subscribe(listener: () => void): () => void;
  }

  function configureStore<S = any, A extends AnyAction = AnyAction>(middlewares?: any[]): (initialState?: S) => MockStore<S, A>;

  export default configureStore;
}
