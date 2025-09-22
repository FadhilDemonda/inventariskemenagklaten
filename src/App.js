import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./DataBarang";
import InputBarangPage from "./InputBarangPage"; // Import yang baru
import Login from "./loginapp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/inputbarang" element={<InputBarangPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;