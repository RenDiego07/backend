from django.shortcuts import render

# Create your views here.

from django.http import HttpResponse
import requests 
import json 
from collections import Counter
from datetime import datetime
import re
# Importe el decorador login_required
from django.contrib.auth.decorators import login_required, permission_required


@login_required
@permission_required('main.index_viewer', raise_exception=True)
def index(request):
    #return HttpResponse("Hello, World!")
    #return render(request, 'main/base.html')

    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url + '/api/v1/landing'

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    print("Endpoint ", url)
    print("Response ", response_dict)

     # Respuestas totales
    total_responses = len(response_dict.keys())
    responses = []
    high_rate_responses = ""
    first_response = None
    last_response = None
    
    if total_responses > 0:
        responses = list(response_dict.values())

        # Extraer y convertir fechas
        dates = []
        for record in responses:
            saved_time = record.get("saved")
            if saved_time:
                # Limpiar caracteres extraños y espacios ocultos
                cleaned_time = re.sub(r'[^\x00-\x7F]+', '', saved_time).strip()
                cleaned_time = cleaned_time.replace('a. m.', 'AM').replace('p. m.', 'PM')
                try:
                    dt = datetime.strptime(cleaned_time, "%d/%m/%Y, %I:%M:%S %p")
                    dates.append(dt)
                except ValueError as e:
                    print(f"Error procesando la fecha: {cleaned_time} - {e}")

        # Ordenar fechas
        if dates:
            dates.sort()
            # Obtener primera y última respuesta
            first_response = dates[0].strftime("%d/%m/%Y, %I:%M:%S %p")
            last_response = dates[-1].strftime("%d/%m/%Y, %I:%M:%S %p")

            # Contar respuestas por mes
            month_counts = Counter(date.strftime("%B") for date in dates)
            high_rate_responses = month_counts.most_common(1)[0][0] if month_counts else None
    
    print(responses)
    data = {
        'title' : 'Landing - Dashboard',
        'total_responses': total_responses,
        'responses': responses,
        'first_response': first_response,
        'last_response': last_response,
        'high_rate_responses': high_rate_responses,
    }

    return render(request, 'main/index.html', data)
