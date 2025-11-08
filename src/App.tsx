import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import MyPurchases from './pages/MyPurchases';
import VerifyRaffle from './pages/VerifyRaffle';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mis-compras" element={<MyPurchases />} />
        <Route path="/verificar/:raffleId" element={<VerifyRaffle />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
