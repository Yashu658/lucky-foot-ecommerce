import Container from '../components/Container';

const NotFound = () => {
  return (
    <Container className="space-y-6 py-16 text-center">
      <h1 className="text-4xl font-bold text-surface-900">404 - Page Not Found</h1>
      <p className="text-surface-600">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-primary hover:text-primary-focus">
        Return to Home
      </a>
    </Container>
  );
};

export default NotFound;