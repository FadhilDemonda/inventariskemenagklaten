import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/DataBarang";
import InputBarangPage from "./components/InputBarangPage";
import Login from "./loginapp";
import DataKendaraan from "./components/DataKendaraan";

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* hanya bisa diakses kalau sudah login */}
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/inputbarang" element={<PrivateRoute><InputBarangPage /></PrivateRoute>} />
        <Route path="/kendaraan" element={<PrivateRoute><DataKendaraan /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
