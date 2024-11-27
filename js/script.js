document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.querySelector('#number-input');
    const dropdownContainer = document.querySelector('#dropdown-container');
    const tableBody = document.querySelector('#data-table tbody');
    const resultsTableBody = document.querySelector('#results-table tbody');
    const calculateBtn = document.querySelector('#calculate-btn');

    function loadTableData() {
    fetch('../json/data.json')
        .then(response => response.json())
        .then(data => {
            const relicLevels = data.RelicLevels;

            function populateTable(data) {
                tableBody.innerHTML = '';
                data.forEach(row => {
                    const tr = document.createElement('tr');
                    
                    Object.keys(row).forEach(key => {
                        const td = document.createElement('td');
                        
                        // Asignar clases para diferenciar Scrap, Signal Data, y Credits
                        if (['Carbonite Circuit Board', 'Bronzium Wiring', 'Chromium Transistor', 'Aurodium Heatsink', 
                             'Electrium Conductor', 'Zinbiddle Card', 'Aeromagnificator', 'Impulse Detector', 'DB and GK']
                            .includes(key)) {
                            td.className = 'scrap-material'; // Clase para Scrap
                        } else if (['Fragmented', 'Incomplete', 'Flawed'].includes(key)) {
                            td.className = 'signal-data'; // Clase para Signal Data
                        } else if (['Credits'].includes(key)) {
                            td.className = 'credits'; // Clase para Credits
                        }
        
                        // Aplicar formato solo a Credits usando la función formatNumber
                        const value = row[key] !== null ? formatNumber(row[key], td) : '-';
                        td.textContent = value;
        
                        // Añadir clase para valores cero si es necesario
                        if (value === '0') {
                            td.classList.add('zero-value');
                        }
        
                        tr.appendChild(td);
                    });
                    
                    tableBody.appendChild(tr);
                });
            }

            populateTable(relicLevels);
        })
        .catch(error => console.error('Error al cargar el JSON:', error));
    }

    function formatNumber(value, element) {
        if (element && element.classList.contains('credits')) {
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1).replace('.0', '') + 'M';
            } else if (value >= 1000) {
                return (value / 1000).toFixed(1).replace('.0', '') + 'k';
            }
        } 
            return value;
    }
    

    // Función para generar listas desplegables
    function generateDropdowns(num) {
        dropdownContainer.innerHTML = '';

        if (isNaN(num) || num <= 0) {
            return;
        }

        for (let i = 0; i < num; i++) {
            // Crea un contenedor para cada conjunto de listas desplegables
            const wrapper = document.createElement('div');
            wrapper.className = 'dropdown-wrapper';

            // Crear lista desplegable con opciones 0 a 8 (primer nivel)
            const select1 = document.createElement('select');
            for (let j = 0; j <= 8; j++) {
                const option = document.createElement('option');
                option.value = j;
                option.textContent = j;
                select1.appendChild(option);
            }

            // Crear lista desplegable con opciones 1 a 9 (segundo nivel)
            const select2 = document.createElement('select');
            for (let j = 1; j <= 9; j++) {
                const option = document.createElement('option');
                option.value = j;
                option.textContent = j;
                select2.appendChild(option);
            }

            // Crear texto "Relic level to"
            const span = document.createElement('span');
            span.textContent = 'Relic level to';

            // Añadir elementos al contenedor
            wrapper.appendChild(select1);
            wrapper.appendChild(span);
            wrapper.appendChild(select2);

            // Añadir contenedor al contenedor principal
            dropdownContainer.appendChild(wrapper);

            // Event listener para el primer desplegable
            select1.addEventListener('change', function() {
                const selectedValue = parseInt(select1.value, 10);

                // Limpiar las opciones del segundo desplegable
                select2.innerHTML = '';

                // Agregar opciones válidas al segundo desplegable
                for (let j = selectedValue + 1; j <= 9; j++) {
                    const option = document.createElement('option');
                    option.value = j;
                    option.textContent = j;
                    select2.appendChild(option);
                }
            });

            // Inicializar el segundo desplegable para la selección predeterminada del primer desplegable
            select1.dispatchEvent(new Event('change'));
        }
    }

    // Función para manejar el cambio en el primer desplegable
    function handleFirstDropdownChange(event) {
        const firstSelect = event.target;
        const secondSelect = firstSelect.nextElementSibling;

        const selectedValue = parseInt(firstSelect.value, 10);
        const maxValue = 9; // El nivel máximo de reliquia

        // Limpiar las opciones del segundo desplegable
        secondSelect.innerHTML = '';

        // Agregar opciones válidas al segundo desplegable
        for (let i = selectedValue + 1; i <= maxValue; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            secondSelect.appendChild(option);
        }
    }

    // Asignar la función de manejo a todos los primeros desplegables
    document.querySelectorAll('.relic-dropdown').forEach(select => {
        select.addEventListener('change', handleFirstDropdownChange);
    });

    // Función para calcular y mostrar resultados
    function calculateResults() {
        // Primero, limpiar la tabla de resultados
        resultsTableBody.innerHTML = '';

        // Cargar los datos de la tabla desde el JSON
        fetch('../json/data.json')
            .then(response => response.json())
            .then(data => {
                const relicLevels = data.RelicLevels;

                // Crear un objeto para acumular los resultados
                const resultTotals = {
                    'Carbonite Circuit Board': 0,
                    'Bronzium Wiring': 0,
                    'Chromium Transistor': 0,
                    'Aurodium Heatsink': 0,
                    'Electrium Conductor': 0,
                    'Zinbiddle Card': 0,
                    'Aeromagnificator': 0,
                    'Impulse Detector': 0,
                    'DB and GK': 0,
                    'Fragmented': 0,
                    'Incomplete': 0,
                    'Flawed': 0,
                    'Credits': 0,
                };

                // Convertir el array de niveles a un objeto para acceso rápido
                const relicData = relicLevels.reduce((acc, row) => {
                    acc[row['Relic Level']] = row;
                    return acc;
                }, {});

                const selects = dropdownContainer.querySelectorAll('select');
                const numLists = selects.length / 2;

                for (let i = 0; i < numLists; i++) {
                    const currentLevel = parseInt(selects[i * 2].value, 10);
                    const targetLevel = parseInt(selects[i * 2 + 1].value, 10);

                    if (currentLevel >= targetLevel) continue;

                    // Calcular la suma total de materiales necesarios
                    for (let level = currentLevel + 1; level <= targetLevel; level++) {
                        const row = relicData[level];
                        if (row) {
                            Object.keys(resultTotals).forEach(material => {
                                resultTotals[material] += row[material] || 0;
                            });
                        }
                    }
                }

                // Crear la fila de encabezado
                const headerRow = document.createElement('tr');
                const headerCell = document.createElement('th');
                headerCell.textContent = 'Material';
                headerRow.appendChild(headerCell);

                Object.keys(resultTotals).forEach(material => {
                    const th = document.createElement('th');
                    th.textContent = material;
                    headerRow.appendChild(th);
                });
                resultsTableBody.appendChild(headerRow);

                // Crear la fila de resultados
                const resultsRow = document.createElement('tr');
                const resultsHeaderCell = document.createElement('td');
                resultsHeaderCell.textContent = 'Total';
                resultsRow.appendChild(resultsHeaderCell);

                Object.keys(resultTotals).forEach(material => {
                    const td = document.createElement('td');
                    const total = resultTotals[material];

                    // Asignar clase antes de formatear el valor
                    if (['Carbonite Circuit Board', 'Bronzium Wiring', 'Chromium Transistor', 'Aurodium Heatsink', 
                        'Electrium Conductor', 'Zinbiddle Card', 'Aeromagnificator', 'Impulse Detector', 'DB and GK']
                        .includes(material)) {
                        td.classList.add('scrap-material');
                    } else if (['Fragmented', 'Incomplete', 'Flawed'].includes(material)) {
                        td.classList.add('signal-data');
                    } else if (['Credits'].includes(material)) {
                        td.classList.add('credits');
                    }

                    // Formatear usando formatNumber y pasar el elemento
                    td.textContent = total > 0 ? formatNumber(total, td) : '';
                    td.className = total === 0 ? 'zero-value' : td.className;

                    resultsRow.appendChild(td);
                });
                resultsTableBody.appendChild(resultsRow);
            })
            .catch(error => console.error('Error al cargar el JSON:', error));
    }


    // Cargar los datos de la tabla al cargar la página
    loadTableData();

    // Manejar cambios en el campo de texto
    numberInput.addEventListener('input', () => {
        const num = parseInt(numberInput.value, 10);
        generateDropdowns(num);
    });

    // Manejar clic en el botón de calcular
    calculateBtn.addEventListener('click', calculateResults);
});
