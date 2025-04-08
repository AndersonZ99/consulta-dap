
from flask import Flask, render_template, request, jsonify
import gspread
from google.oauth2.service_account import Credentials
import math

app = Flask(__name__)

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
SERVICE_ACCOUNT_FILE = 'client_secret.json'
SPREADSHEET_ID = '11jCOLowBqzWlgK_f34eCHbQO8_rzVnkaGJIqeDTBat8'

creds = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)
client = gspread.authorize(creds)
sheet = client.open_by_key(SPREADSHEET_ID).sheet1

dados_sheet = sheet.get_all_records()

DADOS = [
    {
        "Nome Agricultor": d["Nome Agricultor"],
        "CPF Agricultor": d["CPF Agricultor"],
        "Município": d["Município"]
    }
    for d in dados_sheet
]

MUNICIPIOS = sorted(list(set(d["Município"] for d in DADOS)))

@app.route("/")
def index():
    return render_template("index.html", municipios=MUNICIPIOS)

@app.route("/buscar")
def buscar():
    nome = request.args.get("nome", "").lower()
    cpf = request.args.get("cpf", "").lower()
    cidade = request.args.get("cidade", "").lower()
    pagina = int(request.args.get("pagina", 1))

    dados_filtrados = [
        d for d in DADOS
        if (not nome or nome in d["Nome Agricultor"].lower())
        and (not cpf or cpf in d["CPF Agricultor"])
        and (not cidade or cidade in d["Município"].lower())
    ]

    total = len(dados_filtrados)

    distribuicao = {}
    for d in dados_filtrados:
        m = d["Município"]
        distribuicao[m] = distribuicao.get(m, 0) + 1

    dados_paginados = dados_filtrados[(pagina - 1)*20 : pagina*20]

    return jsonify({
        "dados": dados_paginados,
        "paginas": math.ceil(total / 20),
        "total": total,
        "distribuicao": distribuicao
    })

if __name__ == "__main__":
    app.run(debug=True)
