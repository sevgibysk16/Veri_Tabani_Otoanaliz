import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './BrandPage.css';

function BrandPage() {
  const { brandName } = useParams();
  const [carData, setCarData] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/cars/${brandName}`)
      .then(res => res.json())
      .then(data => setCarData(data));
  }, [brandName]);

  return (
    <div className="brand-page">
      <img 
        src={`/images/${brandName}.jpg`} 
        alt={brandName} 
        className="brand-image"
      />
      <table className="car-data-table">
        <thead>
          <tr>
            <th>Model</th>
            <th>Year</th>
            <th>Price</th>
            <th>Specifications</th>
          </tr>
        </thead>
        <tbody>
          {carData.map((car, index) => (
            <tr key={index}>
              <td>{car.model}</td>
              <td>{car.year}</td>
              <td>{car.price}</td>
              <td>{car.specs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BrandPage;
