import Container from '../components/Container';

const Cart = () => {
  return (
    <Container className="space-y-6 py-8">
      <h1 className="text-3xl font-bold text-surface-900">Shopping Cart</h1>
      <div className="bg-primary-content rounded-lg shadow-md p-6">
        <div className="text-center text-surface-600">
          Your cart is empty
        </div>
      </div>
    </Container>
  );
};

export default Cart;