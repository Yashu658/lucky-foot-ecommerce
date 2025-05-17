import React from "react";
import { Link } from "react-router-dom";
import Container from "../components/Container";
import back from "../assets/back.jpeg";
import mens from "../assets/mens.jpg";
import womens from "../assets/womens.webp";
import kids from "../assets/kids.jpg";


const Home = () => {
  return (
    <div className="min-h-screen">
  {/* Hero Section */}
  <section className="relative py-16">
    <img
      src={back}
      alt="Hero Background"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-black/60"></div>
    <Container>
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-[60vh]">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Lucky Footwear
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8">Wear your Luck</p>
        <Link
          to="/sale"
          className="bg-primary text-primary-content px-8 py-3 rounded-md hover:bg-primary-focus transition"
        >
          Shop Now
        </Link>
      </div>
    </Container>
  </section>

  {/* Categories Section */}
  <section className="py-16">
    <Container>
      <h2 className="text-3xl font-bold text-surface-900 text-center mb-12">
        Shop by Category
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { to: "/men", label: "Men", image: mens },
          { to: "/women", label: "Women", image: womens },
          { to: "/kids", label: "Kids", image: kids },
        ].map(({ to, label, image }) => (
          <Link to={to} key={label} className="group">
            <div className="relative h-96 bg-surface-200 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`${label} Collection`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-2xl font-bold text-transparent group-hover:text-primary-content transition-colors">
                  {label}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  </section>

  {/* Featured Section */}
  <section className="bg-surface-100 py-16">
    <Container>
      <h2 className="text-3xl font-bold text-surface-900 text-center mb-12">
        Featured Collection
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-primary-content rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-square bg-surface-200" />
            <div className="p-4 bg-secondary-content">
              <h3 className="text-lg font-semibold text-primary">
                Product Name
              </h3>
              <p className="text-primary font-medium">$99.99</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  </section>
</div>

  );
};

export default Home;