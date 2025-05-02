import ReactDOM from 'react-dom/client';
import { Suspense } from 'react';
import App from './App';
import './index.css';
import { store } from './app/redux/store';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoadingScreen from './components/Loading/Loading';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </Provider>
  </GoogleOAuthProvider>
);
