import Container from '../components/Container';

const Sale = () => {
  return (
    <Container className="space-y-6 py-8">
      <h1 className="text-3xl font-bold text-surface-900">Sale Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-primary-content rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-surface-200"></div>
            <div className="p-4 bg-secondary-content">
              <h3 className="text-lg font-semibold text-primary">Sale Item {item}</h3>
              <p className="text-surface-500 line-through">$99.99</p>
              <p className="text-error font-bold">$69.99</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default Sale;