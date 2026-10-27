import AppRouter from './router';
import { AuthProvider } from './firebase/authContext';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
