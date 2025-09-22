import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./DataBarang";
import InputBarang from "./InputBarang";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/" element={<InputBarang />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
