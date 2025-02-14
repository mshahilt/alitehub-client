import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {store} from './app/redux/store';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <Provider store={store}>
      <App />
  </Provider>
  </GoogleOAuthProvider>
)
