// CSV dosyasından veri okuma ve işleme
async function loadCarData() {
    const response = await fetch('sonhali.csv');
    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => row.split(','));
    const headers = rows[0];
    
    const carData = rows.slice(1).reduce((acc, row) => {
        const brand = row[headers.indexOf('brand')].toLowerCase();
        const model = row[headers.indexOf('model')];
        const year = row[headers.indexOf('year')];
        const price = row[headers.indexOf('price')];
        const fuelType = row[headers.indexOf('fuel_type')];
        
        if (!acc[brand]) {
            acc[brand] = {
                models: [],
                years: [],
                prices: {},
                fuelTypes: {}
            };
        }
        
        if (!acc[brand].models.includes(model)) {
            acc[brand].models.push(model);
        }
        if (!acc[brand].years.includes(year)) {
            acc[brand].years.push(year);
        }
        
        acc[brand].prices[model] = price;
        acc[brand].fuelTypes[model] = fuelType;
        
        return acc;
    }, {});
    
    return carData;
}

// Filtreleme fonksiyonlarını güncelleyelim
async function initializeFilters() {
    const carData = await loadCarData();
    
    // Marka filtresi için seçenekleri doldur
    const brandFilter = document.getElementById('brandFilter');
    Object.keys(carData).forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand.charAt(0).toUpperCase() + brand.slice(1);
        brandFilter.appendChild(option);
    });
    
    return carData;
}
