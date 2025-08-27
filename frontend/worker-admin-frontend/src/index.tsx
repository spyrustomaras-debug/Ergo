import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import { store, persistor } from '../src/features/auth/index';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from "redux-persist/integration/react";


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
         <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

reportWebVitals();
