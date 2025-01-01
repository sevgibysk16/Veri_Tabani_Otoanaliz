import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Plot from 'react-plotly.js';
import './HomePage.css';

function HomePage() {
  const [graphData, setGraphData] = useState([]);
  const history = useHistory();

  useEffect(() => {
    fetch('http://localhost:5000/api/graphs')
      .then(res => res.json())
      .then(data => setGraphData(data));
  }, []);

  const handleBrandClick = (brand) => {
    history.push(`/brand/${brand}`);
  };

  return (
    <div className="home-page">
      <div className="brand-strip">
        {/* Add car brand images/buttons here */}
      </div>
      <div className="graphs-container">
        {graphData.map((graph, index) => (
          <Plot
            key={index}
            data={graph.data}
            layout={graph.layout}
            className="graph"
          />
        ))}
      </div>
    </div>
  );
}

export default HomePage;
