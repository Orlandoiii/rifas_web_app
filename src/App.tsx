import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MyPurchases from './pages/MyPurchases';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mis-compras" element={<MyPurchases />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
