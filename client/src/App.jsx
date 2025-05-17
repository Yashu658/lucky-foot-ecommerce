import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Men from "./pages/Men";
import Women from "./pages/Women";
import Kids from "./pages/Kids";
import Sale from "./pages/Sale";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Register from "./pages/register";
import Login from './pages/Login';
import Update from "./pages/update";
import AdminDashboard from "./pages/AdminDashboard";

const App = () => {
  return (
    <Router>
      <Navbar />
      <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/men" element={<Men />} />
            <Route path="/women" element={<Women />} />
            <Route path="/kids" element={<Kids />} />
            <Route path="/sale" element={<Sale />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/update" element={<Update />} />
            <Route path="/adminDashboard" element={<AdminDashboard />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;