// Variables del DOM
const formulario = document.getElementById('formulario');
const mainPage = document.getElementById('mainPage');
const historialPage = document.getElementById('historialPage');
const btnHistorial = document.getElementById('btnHistorial');
const btnVolver = document.getElementById('btnVolver');
const fechaHoy = document.getElementById('fechaHoy');
const resultado = document.getElementById('resultado');

// Mostrar fecha actual
function mostrarFecha() {
    const hoy = new Date();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
    const fecha = hoy.toLocaleDateString('es-ES', opciones);
    fechaHoy.textContent = fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

// Obtener clave de fecha para localStorage
function getDateKey() {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Obtener historial del localStorage
function getHistorial() {
    const data = localStorage.getItem('historialCalorias');
    return data ? JSON.parse(data) : {};
}

// Guardar historial en localStorage
function saveHistorial(historial) {
    localStorage.setItem('historialCalorias', JSON.stringify(historial));
}

// Cargar registro de hoy
function cargarRegistroHoy() {
    const historial = getHistorial();
    const hoy = getDateKey();
    
    if (historial[hoy]) {
        const registro = historial[hoy];
        document.getElementById('cal_ingeridas').value = registro.cal_ingeridas;
        document.getElementById('cal_caminata').value = registro.cal_caminata || 0;
        document.getElementById('cal_gym').value = registro.cal_gym || 0;
        document.getElementById('cal_extra').value = registro.cal_extra || 0;
        
        // Mostrar resultado
        mostrarResultado(registro);
    }
}

// Mostrar resultado
function mostrarResultado(registro) {
    resultado.classList.remove('hidden');
    
    const balance = registro.balance;
    const tipo = registro.tipo_estado;
    const cal_quemadas = registro.cal_quemadas;
    const cal_ingeridas = registro.cal_ingeridas;
    
    // Balance box
    const balanceValue = document.getElementById('balanceValue');
    const balanceLabel = document.getElementById('balanceLabel');
    const balanceBox = document.getElementById('balanceBox');
    
    balanceValue.textContent = `${Math.abs(balance)} kcal`;
    balanceValue.className = 'balance-value ' + tipo;
    balanceLabel.textContent = registro.estado;
    
    // Badge
    const badge = document.getElementById('resultadoBadge');
    badge.textContent = registro.estado;
    badge.className = 'resultado-badge ' + tipo;
    
    // Stats
    document.getElementById('cal_consumido').textContent = cal_ingeridas + ' kcal';
    document.getElementById('cal_quemado').textContent = cal_quemadas + ' kcal';
    
    // Desglose de actividades
    const actividadesDetalle = document.getElementById('actividadesDetalle');
    actividadesDetalle.innerHTML = '';
    
    const actividades = [
        { nombre: 'Base metabolismo', valor: 1850, siempre: true },
        { nombre: 'Caminata', valor: registro.cal_caminata, mostrar: registro.cal_caminata > 0 },
        { nombre: 'Entrenamiento (Gym)', valor: registro.cal_gym, mostrar: registro.cal_gym > 0 },
        { nombre: 'Otra actividad', valor: registro.cal_extra, mostrar: registro.cal_extra > 0 }
    ];
    
    actividades.forEach(act => {
        if (act.siempre || act.mostrar) {
            const div = document.createElement('div');
            div.className = 'actividad-item';
            div.innerHTML = `
                <span class="actividad-name">${act.nombre}</span>
                <span class="actividad-value">+${act.valor} kcal</span>
            `;
            actividadesDetalle.appendChild(div);
        }
    });
}

// Enviar formulario
formulario.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = {
        cal_ingeridas: parseInt(document.getElementById('cal_ingeridas').value),
        cal_caminata: parseInt(document.getElementById('cal_caminata').value) || 0,
        cal_gym: parseInt(document.getElementById('cal_gym').value) || 0,
        cal_extra: parseInt(document.getElementById('cal_extra').value) || 0
    };
    
    try {
        const response = await fetch('/calcular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Error en el servidor');
        }
        
        const result = await response.json();
        
        // Guardar en localStorage
        const historial = getHistorial();
        const hoy = getDateKey();
        historial[hoy] = {
            ...data,
            ...result,
            fecha: hoy
        };
        saveHistorial(historial);
        
        // Mostrar resultado
        mostrarResultado(historial[hoy]);
        resultado.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Error al calcular: ' + error.message);
    }
});

// Eliminar registro de hoy
document.getElementById('btnEliminarHoy').addEventListener('click', function() {
    if (confirm('¿Eliminar el registro de hoy?')) {
        const historial = getHistorial();
        const hoy = getDateKey();
        delete historial[hoy];
        saveHistorial(historial);
        
        // Limpiar formulario
        formulario.reset();
        resultado.classList.add('hidden');
        cargarRegistroHoy();
    }
});

// Navegación
btnHistorial.addEventListener('click', function() {
    mainPage.classList.add('hidden');
    historialPage.classList.remove('hidden');
    mostrarHistorial();
});

btnVolver.addEventListener('click', function() {
    historialPage.classList.add('hidden');
    mainPage.classList.remove('hidden');
});

// Mostrar historial
function mostrarHistorial() {
    const historial = getHistorial();
    const registrosList = document.getElementById('registrosList');
    registrosList.innerHTML = '';
    
    // Obtener últimos 7 días
    const ultimos7 = obtenerUltimos7Dias(historial);
    
    if (Object.keys(ultimos7).length === 0) {
        registrosList.innerHTML = '<p style="text-align: center; color: #636e72; padding: 20px;">Sin registros aún</p>';
        return;
    }
    
    // Mostrar registros de más reciente a más antiguo
    Object.keys(ultimos7).reverse().forEach(fecha => {
        const registro = ultimos7[fecha];
        const div = document.createElement('div');
        div.className = 'registro-card';
        
        const fechaObj = new Date(fecha + 'T00:00:00');
        const fechaFormato = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        
        div.innerHTML = `
            <div class="registro-header">
                <span class="registro-fecha">${fechaFormato.charAt(0).toUpperCase() + fechaFormato.slice(1)}</span>
                <span class="registro-badge ${registro.tipo_estado}">${registro.estado}</span>
            </div>
            <div class="registro-contenido">
                <div class="registro-stat">
                    <div class="registro-stat-label">Consumido</div>
                    <div class="registro-stat-value">${registro.cal_ingeridas}</div>
                </div>
                <div class="registro-stat">
                    <div class="registro-stat-label">Quemado</div>
                    <div class="registro-stat-value">${registro.cal_quemadas}</div>
                </div>
            </div>
        `;
        registrosList.appendChild(div);
    });
    
    // Actualizar estadísticas
    actualizarEstadisticas(ultimos7);
}

// Obtener últimos 7 días con registros
function obtenerUltimos7Dias(historial) {
    const ultimos7 = {};
    const hoy = new Date();
    
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() - i);
        const fechaKey = fecha.toISOString().split('T')[0];
        
        if (historial[fechaKey]) {
            ultimos7[fechaKey] = historial[fechaKey];
        }
    }
    
    return ultimos7;
}

// Actualizar estadísticas
function actualizarEstadisticas(ultimos7) {
    let diasDeficit = 0;
    let diasSuperavit = 0;
    let totalBalance = 0;
    const balances = [];
    const fechas = [];
    
    // Recolectar datos
    Object.keys(ultimos7).forEach(fecha => {
        const registro = ultimos7[fecha];
        
        if (registro.tipo_estado === 'deficit') diasDeficit++;
        if (registro.tipo_estado === 'superavit') diasSuperavit++;
        
        totalBalance += registro.balance;
        balances.push({
            fecha: new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
            deficit: registro.tipo_estado === 'deficit' ? Math.abs(registro.balance) : 0,
            superavit: registro.tipo_estado === 'superavit' ? registro.balance : 0
        });
        fechas.push(new Date(fecha));
    });
    
    // Ordenar por fecha
    balances.sort((a, b) => fechas[balances.indexOf(a)] - fechas[balances.indexOf(b)]);
    
    const promedioCalorico = Math.round(totalBalance / (Object.keys(ultimos7).length || 1));
    
    // Actualizar números
    document.getElementById('diasDeficit').textContent = diasDeficit;
    document.getElementById('diasSuperavit').textContent = diasSuperavit;
    document.getElementById('promedioCalorico').textContent = Math.abs(promedioCalorico);
    
    // Crear gráfico
    crearGrafico(balances);
}

// Crear gráfico con Chart.js
function crearGrafico(datos) {
    const ctx = document.getElementById('chart');
    
    // Destruir gráfico anterior si existe
    if (window.chart) {
        window.chart.destroy();
    }
    
    window.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.map(d => d.fecha),
            datasets: [
                {
                    label: 'Déficit',
                    data: datos.map(d => d.deficit),
                    backgroundColor: '#d63031',
                    borderRadius: 6
                },
                {
                    label: 'Superávit',
                    data: datos.map(d => d.superavit),
                    backgroundColor: '#00b894',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 12,
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                x: {
                    stacked: false,
                    grid: { display: false }
                },
                y: {
                    stacked: false,
                    beginAtZero: true,
                    grid: { color: '#e0e0e0' }
                }
            }
        }
    });
}

// Inicializar
mostrarFecha();
cargarRegistroHoy();