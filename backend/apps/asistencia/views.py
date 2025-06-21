from decimal import Decimal

from django.http import HttpResponse
from reportlab.lib.pagesizes import landscape, legal
from reportlab.lib.units import cm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.contrato.models import Contrato
from .models import Asistencia
from .serializer import AsistenciaSerializer
from apps.empleado.models import Empleado
from datetime import datetime, timedelta
from apps.horas_extras.models import HorasExtras

class RegistroAsistenciaViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def create(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
            
            contrato = Contrato.objects.select_related(
                'cargo_departamento', 'cargo_departamento__id_cargo'
            ).filter(empleado=empleado, estado='ACTIVO').first()

            if not contrato:
                return Response({'error': 'Empleado no tiene contrato activo'}, status=status.HTTP_404_NOT_FOUND)

            cargo = contrato.cargo_departamento.id_cargo
            hoy = datetime.today().date()
            ahora = datetime.now().time()

            asistencia, creada = Asistencia.objects.get_or_create(
                empleado=empleado,
                fecha=hoy,
                defaults={
                    'hora_entrada': ahora,
                    'empresa': empleado.empresa    #Auemnte
                }
            )

            if not creada:
                if asistencia.hora_salida is not None:
                    return Response({'mensaje': 'Ya se registró entrada y salida para hoy'}, status=status.HTTP_400_BAD_REQUEST)

                asistencia.hora_salida = ahora

                # Calcular horas trabajadas
                entrada_dt = datetime.combine(hoy, asistencia.hora_entrada)
                salida_dt = datetime.combine(hoy, ahora)
                total_horas = (salida_dt - entrada_dt).total_seconds() / 3600
                receso = float(cargo.receso_diario or 0)
                asistencia.horas_trabajadas = Decimal(total_horas - receso)

                # Observaciones
                obs = []
                tolerancia_retraso = timedelta(minutes=15)
                if asistencia.hora_entrada > (datetime.combine(hoy, cargo.horario_inicio) + tolerancia_retraso).time():
                    obs.append("Retraso")
                if asistencia.hora_salida > cargo.horario_fin:
                    obs.append("Salida después del horario")
                if not obs:
                    obs.append("Puntual")

                asistencia.observaciones = " / ".join(obs)
                asistencia.save()

                # Horas Extra
                horasExtras = asistencia.horas_trabajadas - cargo.horas_de_trabajo
                if horasExtras > 0.25: # tolerancia 15 minutos    
                    HorasExtras.create(empleado, horasExtras)
                    
                return Response({'mensaje': 'Salida registrada correctamente'}, status=status.HTTP_200_OK)

            return Response({'mensaje': 'Entrada registrada correctamente'}, status=status.HTTP_201_CREATED)

        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class AsistenciaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Asistencia.objects.all().order_by('-fecha')
    serializer_class = AsistenciaSerializer
    permission_classes = [IsAuthenticated]


    ##!! FIJARSE EN ENTE SI FUCIONA LE HICE MODIFICACIONES
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Asistencia.objects.filter(empresa=user.empresa)
        return Asistencia.objects.filter(empleado__user=user, empresa=user.empresa)

class MisAsistenciasAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user)
            asistencias = Asistencia.objects.filter(empleado=empleado).order_by('-fecha')
            serializer = AsistenciaSerializer(asistencias, many=True)
            return Response(serializer.data)
        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class EstadoAsistenciaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            empleado = Empleado.objects.get(user_id=request.user.id)
            hoy = datetime.today().date()

            asistencia = Asistencia.objects.filter(empleado=empleado, fecha=hoy).first()

            if asistencia:
                ya_marco_salida = asistencia.hora_salida is not None
                return Response({
                    'yaMarcoSalida': ya_marco_salida,
                    'mensaje': 'Ya finalizó su jornada hoy' if ya_marco_salida else 'Puede registrar su salida'
                })

            return Response({
                'yaMarcoSalida': False,
                'mensaje': 'Puede registrar su entrada'
            })

        except Empleado.DoesNotExist:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

class ReporteAsistenciasPdfView(APIView):
    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa
        fecha = request.GET.get('fecha', None)
        departamento_id = request.GET.get('departamento', None)
        cargo_id = request.GET.get('cargo', None)

        if not fecha:
            return Response({'detail': 'El parámetro "fecha" es obligatorio.'}, status=400)

        empleados = Empleado.objects.filter(empresa=empresa)
        if departamento_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_departamento_id=departamento_id)
        if cargo_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_cargo_id=cargo_id)

        empleados = empleados.distinct()
        asistencias_dict = {
            a.empleado_id: a for a in Asistencia.objects.filter(fecha=fecha, empresa=empresa)
        }

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="reporte_asistencias_{fecha}.pdf"'

        p = canvas.Canvas(response, pagesize=landscape(legal))
        width, height = landscape(legal)

        # Encabezado
        p.setFont("Helvetica-Bold", 16)
        p.drawString(30, height - 30, f"Empresa: {empresa.nombre}")
        p.setFont("Helvetica-Bold", 20)
        p.drawString(30, height - 55, "Reporte de Asistencias")
        p.setFont("Helvetica", 12)
        p.drawString(30, height - 80, f"Fecha: {fecha}")

        # Columnas
        columnas = ["C.I.", "Nombre", "Apellidos", "Departamento", "Cargo", "Hora Entrada", "Hora Salida", "Observaciones"]
        col_widths = [60, 100, 100, 100, 100, 80, 80, 240]
        col_positions = [sum(col_widths[:i]) + 30 for i in range(len(col_widths))]
        font_size = 12
        line_height = 30
        margen_observacion = 1.5 * cm

        def get_wrapped_lines(text, width, font="Helvetica", size=12, margin=42):
            words = text.split()
            lines = []
            current_line = ""
            for word in words:
                test_line = f"{current_line} {word}".strip()
                if stringWidth(test_line, font, size) < (width - margin):
                    current_line = test_line
                else:
                    lines.append(current_line)
                    current_line = word
            lines.append(current_line)
            return lines

        def dibujar_encabezado(y):
            p.setFont("Helvetica-Bold", font_size)
            for i, titulo in enumerate(columnas):
                x = col_positions[i]
                p.rect(x, y, col_widths[i], line_height)
                p.drawString(x + 5, y + 8, titulo)

        y = height - 130
        dibujar_encabezado(y)
        # y -= line_height

        p.setFont("Helvetica", font_size)

        for emp in empleados:
            asistencia = asistencias_dict.get(emp.id)
            contrato = emp.contratos.first()
            depto = contrato.cargo_departamento.id_departamento.nombre if contrato else ""
            cargo = contrato.cargo_departamento.id_cargo.nombre if contrato else ""

            observacion = asistencia.observaciones if asistencia and asistencia.observaciones else ""
            observacion_lines = get_wrapped_lines(observacion, col_widths[7], size=font_size, margin=margen_observacion)
            filas_observacion = len(observacion_lines)
            row_height = max(30, (len(observacion_lines) * font_size) + 12)

            if y - row_height < 50:
                p.showPage()
                y = height - 50
                dibujar_encabezado(y)
                y -= line_height
                p.setFont("Helvetica", font_size)

            fila = [
                str(emp.ci),
                emp.nombre,
                emp.apellidos,
                depto,
                cargo,
                asistencia.hora_entrada.strftime('%H:%M') if asistencia and asistencia.hora_entrada else "",
                asistencia.hora_salida.strftime('%H:%M') if asistencia and asistencia.hora_salida else "",
            ]

            for i, dato in enumerate(fila):
                x = col_positions[i]
                p.rect(x, y - row_height, col_widths[i], row_height)
                text_y = y - (row_height / 2) + (font_size / 2) - 2
                p.drawString(x + 5, text_y, str(dato))

            # Observaciones multi-línea
            obs_x = col_positions[7]
            p.rect(obs_x, y - row_height, col_widths[7], row_height)
            text_y = y - 10
            for line in observacion_lines:
                p.drawString(obs_x + 5, text_y, line)
                text_y -= font_size

            y -= row_height

        p.setFont("Helvetica", 10)
        p.drawString(30, 30, f"Generado el {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        p.showPage()
        p.save()

        return response