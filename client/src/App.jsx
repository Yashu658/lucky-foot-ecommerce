
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop"; // Adjust path if needed
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
import Login from "./pages/Login";
import Resetpassword from "./pages/Resetpassword";
import Update from "./pages/update";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import ThankYou from "./pages/ThankYou";
import Search from "./pages/Search";
import PlaceOrder from "./pages/PlaceOrder";
import AddressPage from "./pages/AddressPage";
import OrderDetails from "./pages/OrderDetails";
import TrackOrder from "./pages/TrackOrder";
import PaymentPage from "./pages/PaymentPage";
import Wishlist from "./pages/Wishlist";
import CustomerDetail from "../src/components/admin/CustomerDetail";
import { CartProvider } from "./context/CartContext";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import Order from "./pages/Order";
import SearchBox from "./pages/SerchBox";
import "react-toastify/dist/ReactToastify.css";
import ReviewPage from "./pages/ReviewPage";
import FAQPage from "./pages/FAQPage ";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ShippingPolicy from "./pages/ShippingPolicy";
import ReturnsAndExchanges from "./pages/ReturnsAndExchanges";
import Accessibility from "./pages/Accessibility";
import PopupOfferModal from "./pages/PopupOfferModal";
import ShopPage from "./pages/ShopPage";
const App = () => {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />
        {/*Always scroll to top on route change  */}
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
            <Route path="/Resetpassword" element={<Resetpassword />} />
            <Route path="/update" element={<Update />} />
            <Route path="/adminDashboard" element={<AdminDashboard />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/search" element={<Search />} />
            <Route path="/searchbox" element={<SearchBox />} />
            <Route path="/PlaceOrder" element={<PlaceOrder />} />
            <Route path="/edit-address" element={<AddressPage />} />
            <Route path="/paymentPage" element={<PaymentPage />} />
            <Route path="/order" element={<Order />} />
            <Route path="/orderdetails/:orderId" element={<OrderDetails />} />
            <Route
              path="/admin/orderdetails/:orderId"
              element={<OrderDetails />}
            />
            <Route path="/track-order/:orderId" element={<TrackOrder />} />
            <Route path="/review/:productId" element={<ReviewPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
           <Route path="/customers/:id" element={<CustomerDetail />} />
               <Route path="/faq" element={<FAQPage />} />
                   <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                     <Route path="/shipping-policy" element={<ShippingPolicy />} />
                     <Route path="/returns-exchanges" element={<ReturnsAndExchanges />} />
                     <Route path="/accessibility" element={<Accessibility />} />
                     <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/shop" element={<ShopPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-center" autoClose={800} />
      </CartProvider>
      <Toaster />
      <PopupOfferModal />
    </Router>
  );
};

export default App;
