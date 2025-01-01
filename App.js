import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import './App.css';

function App() {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandData, setBrandData] = useState([]);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // Markaları getir
    fetch('http://localhost:5000/api/brands')
      .then(response => response.json())
      .then(data => setBrands(data));

    // Grafik verilerini getir
    fetch('http://localhost:5000/api/graphs')
      .then(response => response.json())
      .then(data => setGraphData(data));
  }, []);

  const fetchBrandData = (brand) => {
    setSelectedBrand(brand);
    fetch(`http://localhost:5000/api/cars/${brand}`)
      .then(response => response.json())
      .then(data => setBrandData(data));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Car Analysis</h1>
        <div className="brand-logos">
          {brands.map((brand) => (
            <button key={brand} onClick={() => fetchBrandData(brand)}>
              <img 
                src={`/images/${brand.toLowerCase()}.png`}
                alt={brand} 
                className="brand-logo" 
              />
            </button>
          ))}
        </div>
      </header>
      <main>
        {selectedBrand && (
          <div>
            <h2>{selectedBrand} Data</h2>
            <table>
              <thead>
                <tr>
                  {brandData.length > 0 && Object.keys(brandData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, idx) => (
                      <td key={idx}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <section className="charts">
          <h2>Graphs</h2>
          {graphData && (
            <div className="graph-container">
              <Plot
                data={[{
                  x: Object.keys(graphData.model_count),
                  y: Object.values(graphData.model_count),
                  type: 'bar',
                  marker: { color: 'blue' },
                }]}
                layout={{ title: 'Marka Başına Model Sayısı' }}
              />
              <Plot
                data={[{
                  x: Object.keys(graphData.average_prices),
                  y: Object.values(graphData.average_prices),
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: { color: 'green' },
                }]}
                layout={{ title: 'Yıllara Göre Ortalama Araç Fiyatları' }}
              />
              <Plot
                data={[{
                  x: Object.keys(graphData.brand_avg_prices),
                  y: Object.values(graphData.brand_avg_prices),
                  type: 'bar',
                  marker: { color: 'orange' },
                }]}
                layout={{ title: 'Marka Bazında Araçların Ortalama Fiyatları' }}
              />
              <Plot
                data={[{
                  labels: Object.keys(graphData.petrol_distribution),
                  values: Object.values(graphData.petrol_distribution),
                  type: 'pie',
                }]}
                layout={{ title: 'Yıllara Göre Petrol Tüketiminin Dağılımı' }}
              />
              <Plot
                data={[{
                  x: Object.values(graphData.fuel_consumption),
                  y: Object.keys(graphData.fuel_consumption),
                  type: 'bar',
                  orientation: 'h',
                  marker: { color: 'purple' },
                }]}
                layout={{ title: 'Araç Sınıfına Göre Ortalama Yakıt Tüketimi' }}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
