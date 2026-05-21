from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calcular', methods=['POST'])
def calcular():
    try:
        data = request.json
        
        cal_ingeridas = int(data.get('cal_ingeridas', 0))
        cal_caminata = int(data.get('cal_caminata', 0))
        cal_gym = int(data.get('cal_gym', 0))
        cal_extra = int(data.get('cal_extra', 0))
        
        # Cálculo de calorías quemadas
        cal_quemadas = 1850 + cal_caminata + cal_gym + cal_extra  # 1850 = BMR baseline
        
        # Balance
        balance = cal_ingeridas - cal_quemadas
        
        # Determinar estado
        if balance < 0:
            estado = f"Déficit de {abs(balance)} kcal"
            tipo_estado = "deficit"
        elif balance > 0:
            estado = f"Superávit de {balance} kcal"
            tipo_estado = "superavit"
        else:
            estado = "Mantenimiento (0 kcal)"
            tipo_estado = "mantenimiento"
        
        return jsonify({
            'cal_quemadas': cal_quemadas,
            'balance': abs(balance),
            'estado': estado,
            'tipo_estado': tipo_estado
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)