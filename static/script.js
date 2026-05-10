const formulario = document.getElementById('formulario');
const resultado = document.getElementById('resultado');
const fueGym = document.getElementById('fue_gym');
const gymOptions = document.getElementById('gym_options');
const hizoCardio = document.getElementById('hizo_cardio');
const cardioInput = document.getElementById('cardio_input');
const hizoExtra = document.getElementById('hizo_extra');
const extraInput = document.getElementById('extra_input');

// Mostrar/ocultar opciones de gym
fueGym.addEventListener('change', function() {
    gymOptions.classList.toggle('hidden');
    if (!this.checked) {
        cardioInput.classList.add('hidden');
        hizoCardio.checked = false;
    }
});

// Mostrar/ocultar input de cardio
hizoCardio.addEventListener('change', function() {
    cardioInput.classList.toggle('hidden');
});

// Mostrar/ocultar input de actividad extra
hizoExtra.addEventListener('change', function() {
    extraInput.classList.toggle('hidden');
});

// Enviar formulario
formulario.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const data = {
        cal_ingeridas: parseInt(document.getElementById('cal_ingeridas').value),
        cal_caminata: parseInt(document.getElementById('cal_caminata').value) || 0,
        fue_gym: document.getElementById('fue_gym').checked,
        hizo_cardio: document.getElementById('hizo_cardio').checked,
        cal_cardio: parseInt(document.getElementById('cal_cardio').value) || 0,
        hizo_extra: document.getElementById('hizo_extra').checked,
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
        
        // Mostrar resultados
        document.getElementById('cal_quemadas_resultado').textContent = result.cal_quemadas + ' kcal';
        document.getElementById('estado_resultado').textContent = result.estado;
        document.getElementById('balance_resultado').textContent = result.balance + ' kcal';
        
        // Cambiar color según el tipo de estado
        const statBalance = document.querySelector('.stat.balance');
        statBalance.classList.remove('deficit', 'superavit', 'mantenimiento');
        statBalance.classList.add(result.tipo_estado);
        
        resultado.classList.remove('hidden');
        resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        alert('Error al calcular: ' + error.message);
    }
});