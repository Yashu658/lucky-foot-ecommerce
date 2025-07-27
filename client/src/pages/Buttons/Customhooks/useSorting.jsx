import { useState, useEffect } from 'react';

const useSorting = (initialValue = 'updated') => {
  const [sortOption, setSortOption] = useState(initialValue);

  const getSortParam = () => {
    switch (sortOption) {
      case 'updated': return '&sortBy=updated';
      case 'newest': return '&sortBy=latest';
      case 'price-high': return '&sortBy=mrp_desc';
      case 'price-low': return '&sortBy=mrp_asc';
      case 'rating': return '&sortBy=rating_desc';
      case 'discount': return '&sortBy=discount_desc';
      default: return '&sortBy=updated';
    }
  };

  const sortOptions = [
    { value: 'updated', label: 'Recently Updated' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'discount', label: 'Biggest Discount' }
  ];

  return {
    sortOption,
    setSortOption,
    getSortParam,
    sortOptions
  };
};

export default useSorting;