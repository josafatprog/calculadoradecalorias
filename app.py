from flask import Flask, render_template, request, jsonify

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/calcular", methods=["POST"])
def calcular():
    try:
        data = request.get_json() or {}

        cal_ingeridas = int(data.get("cal_ingeridas", 0))
        cal_caminata = int(data.get("cal_caminata", 0))
        fue_gym = data.get("fue_gym", False)
        hizo_cardio = data.get("hizo_cardio", False)
        cal_cardio = int(data.get("cal_cardio", 0))
        hizo_extra = data.get("hizo_extra", False)
        cal_extra = int(data.get("cal_extra", 0))

        cal_quemadas = 1850 + cal_caminata

        if fue_gym:
            cal_quemadas += 300
            if hizo_cardio:
                cal_quemadas += cal_cardio

        if hizo_extra:
            cal_quemadas += cal_extra

        balance = cal_ingeridas - cal_quemadas

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
            "cal_quemadas": cal_quemadas,
            "balance": abs(balance),
            "estado": estado,
            "tipo_estado": tipo_estado
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 400


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
