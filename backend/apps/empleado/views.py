import xlsxwriter
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from rest_framework.decorators import action
from rest_framework import viewsets, status
from .models import Empleado, genero_Choices, estado_Civil_Choise
from .serializer import CambiarPasswordConValidacionSerializer, EmpleadoSerializers
from rest_framework.permissions import IsAuthenticated
from .service import cambiar_password_con_validacion, crear_empleado_con_usuario
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

# Create your views here.

class EmpleadoViewSets(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EmpleadoSerializers
    
    def get_queryset(self):
        return Empleado.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user.empresa)

    
    @action(detail=False, methods=['get'], url_path='actual')
    def actual(self, request):
        empleado = Empleado.objects.filter(user_id=request.user).first()
        if not empleado:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    
        serializer = self.get_serializer(empleado)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Forzar empresa del usuario autenticado
        empresa = request.user.empresa
        empleado, username, password = crear_empleado_con_usuario(serializer.validated_data, empresa=empresa)

        response_data = self.get_serializer(empleado).data
        return Response(response_data, status=status.HTTP_201_CREATED)
    
class CambiarPasswordEmpleadoView(APIView):

    @extend_schema(
        request=CambiarPasswordConValidacionSerializer,
        responses={
            200: None,
            400: {"error": "Contraseña actual incorrecta"},
            404: {"error": "Empleado no encontrado"}
        },
        description="Permite al empleado cambiar su contraseña validando la actual"
    )
    def put(self, request, empleado_id):
        serializer = CambiarPasswordConValidacionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            actual = serializer.validated_data.get('actual_password')
            nueva = serializer.validated_data['nueva_password']

            exito, mensaje = cambiar_password_con_validacion(empleado_id, actual, nueva)

            if exito:
                return Response({'mensaje': mensaje}, status=status.HTTP_200_OK)
            return Response({'error': mensaje}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReporteEmpleadosExcelView(APIView):
    def get(self, request, *args, **kwargs):
        empleados = Empleado.objects.filter(empresa=request.empresa)

        # Filtros de género, estado civil, fecha de ingreso, departamento y cargo
        genero = request.GET.get('genero', None)
        if genero:
            empleados = empleados.filter(genero=genero)

        estado_civil = request.GET.get('estado_civil', None)
        if estado_civil:
            empleados = empleados.filter(estado_civil=estado_civil)

        fecha_ingreso_inicio = request.GET.get('fecha_ingreso_inicio', None)
        fecha_ingreso_fin = request.GET.get('fecha_ingreso_fin', None)
        if fecha_ingreso_inicio and fecha_ingreso_fin:
            empleados = empleados.filter(fecha_ingreso__range=[fecha_ingreso_inicio, fecha_ingreso_fin])

        departamento_id = request.GET.get('departamento', None)
        if departamento_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_departamento=departamento_id)

        cargo_id = request.GET.get('cargo', None)
        if cargo_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_cargo=cargo_id)

        # Crear archivo Excel
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="reporte_empleados.xlsx"'

        wb = xlsxwriter.Workbook(response)
        ws = wb.add_worksheet("Reporte de Empleados")

        # Títulos de las columnas
        ws.write('A1', 'ID')
        ws.write('B1', 'Nombre')
        ws.write('C1', 'Apellidos')
        ws.write('D1', 'C.I.')
        ws.write('E1', 'Género')
        ws.write('F1', 'Estado Civil')
        ws.write('G1', 'Fecha de Ingreso')
        ws.write('H1', 'Departamento')
        ws.write('I1', 'Cargo')

        # Rellenar filas con los datos de los empleados
        row = 1  # Comienza desde la fila 2 (fila 1 tiene los encabezados)
        for empleado in empleados:
            ws.write(row, 0, empleado.id)
            ws.write(row, 1, empleado.nombre)
            ws.write(row, 2, empleado.apellidos)
            ws.write(row, 3, empleado.ci)
            ws.write(row, 4, dict(genero_Choices).get(empleado.genero, ""))
            ws.write(row, 5, dict(estado_Civil_Choise).get(empleado.estado_civil, ""))
            ws.write(row, 6, str(empleado.fecha_ingreso))

            # Información de departamento y cargo usando las relaciones en Contrato
            contrato = empleado.contratos.first()
            if contrato:
                cargo_departamento = contrato.cargo_departamento
                if cargo_departamento:
                    ws.write(row, 7, cargo_departamento.id_departamento.nombre)
                    ws.write(row, 8, cargo_departamento.id_cargo.nombre)

            row += 1

        wb.close()
        return response


class ReporteEmpleadosPdfView(APIView):
    def get(self, request, *args, **kwargs):
        empleados = Empleado.objects.filter(empresa=request.empresa)

        # Filtros de género, estado civil, fecha de ingreso, departamento y cargo
        genero = request.GET.get('genero', None)
        if genero:
            empleados = empleados.filter(genero=genero)

        estado_civil = request.GET.get('estado_civil', None)
        if estado_civil:
            empleados = empleados.filter(estado_civil=estado_civil)

        fecha_ingreso_inicio = request.GET.get('fecha_ingreso_inicio', None)
        fecha_ingreso_fin = request.GET.get('fecha_ingreso_fin', None)
        if fecha_ingreso_inicio and fecha_ingreso_fin:
            empleados = empleados.filter(fecha_ingreso__range=[fecha_ingreso_inicio, fecha_ingreso_fin])

        departamento_id = request.GET.get('departamento', None)
        if departamento_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_departamento=departamento_id)

        cargo_id = request.GET.get('cargo', None)
        if cargo_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_cargo=cargo_id)

        # Crear respuesta HTTP para el PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="reporte_empleados.pdf"'

        # Crear el PDF con ReportLab
        p = canvas.Canvas(response, pagesize=letter)
        width, height = letter  # Tamaño de la página

        # Títulos de las columnas
        p.setFont("Helvetica", 10)
        p.drawString(30, height - 40, "ID")
        p.drawString(60, height - 40, "Nombre")
        p.drawString(160, height - 40, "Apellidos")
        p.drawString(260, height - 40, "C.I.")
        p.drawString(310, height - 40, "Género")
        p.drawString(360, height - 40, "Estado Civil")
        p.drawString(430, height - 40, "Fecha Ingreso")
        p.drawString(500, height - 40, "Departamento")
        p.drawString(600, height - 40, "Cargo")

        y_position = height - 60  # Ajustamos la posición vertical para las filas

        # Dibujar datos de empleados en el PDF
        for empleado in empleados:
            if y_position < 40:  # Si se llega al final de la página, generamos una nueva
                p.showPage()
                y_position = height - 40

            p.drawString(30, y_position, str(empleado.id))
            p.drawString(60, y_position, empleado.nombre)
            p.drawString(160, y_position, empleado.apellidos)
            p.drawString(260, y_position, str(empleado.ci))
            p.drawString(310, y_position, dict(genero_Choices).get(empleado.genero, ""))
            p.drawString(360, y_position, dict(estado_Civil_Choise).get(empleado.estado_civil, ""))
            p.drawString(430, y_position, str(empleado.fecha_ingreso))

            # Información de departamento y cargo usando las relaciones en Contrato
            contrato = empleado.contratos.first()
            if contrato:
                cargo_departamento = contrato.cargo_departamento
                if cargo_departamento:
                    p.drawString(500, y_position, cargo_departamento.id_departamento.nombre)
                    p.drawString(600, y_position, cargo_departamento.id_cargo.nombre)

            y_position -= 15  # Espaciado entre las filas

        p.showPage()
        p.save()
        return response