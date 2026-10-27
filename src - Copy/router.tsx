import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import SchemeDetail from './pages/SchemeDetail';
import ChatBot from './pages/ChatBot';
import Auth from './pages/Auth';
import About from './pages/About';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}> {/* layout wrapper */}
          <Route path="/" element={<Home />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/schemes/:id" element={<SchemeDetail />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
