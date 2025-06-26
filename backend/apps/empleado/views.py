from datetime import datetime

import xlsxwriter
from django.db import models
from django.http import HttpResponse
from reportlab.lib.pagesizes import letter, landscape, legal
from reportlab.pdfgen import canvas
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from .models import Empleado, genero_Choices, estado_Civil_Choise
from .serializer import CambiarPasswordConValidacionSerializer, EmpleadoSerializers
from rest_framework.permissions import IsAuthenticated
from .service import cambiar_password_con_validacion, crear_empleado_con_usuario
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter

from ..contrato.models import TIPOS_CONTRATO
from apps.bitacora.utils import registrar_bitacora

# Create your views here.

class EmpleadoViewSets(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = EmpleadoSerializers
    
    def get_queryset(self):
        return Empleado.objects.filter(empresa=self.request.user.empresa)

    def perform_create(self, serializer):
        instance = serializer.save(empresa=self.request.user.empresa)
        registrar_bitacora(
            empresa=self.request.user.empresa,
            usuario=self.request.user,
            accion=f"Creó empleado {instance.id} ({instance.nombre} {instance.apellidos})",
            ip=self.request.META.get('REMOTE_ADDR'),
            detalles={"empleado_id": instance.id, "nombre": instance.nombre, "apellidos": instance.apellidos}
        )

    
    @action(detail=False, methods=['get'], url_path='actual')
    def actual(self, request):
        empleado = Empleado.objects.filter(user_id=request.user).first()
        if not empleado:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        registrar_bitacora(
            empresa=request.user.empresa,
            usuario=request.user,
            accion=f"Consultó sus datos de empleado ({empleado.id})",
            ip=request.META.get('REMOTE_ADDR'),
            detalles={"empleado_id": empleado.id}
        )
        serializer = self.get_serializer(empleado)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='mi-departamento/empleados')
    def empleados_de_mi_departamento(self, request):
        empleado = Empleado.objects.filter(user_id=request.user).first()
        if not empleado:
            return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        contrato = empleado.contratos.filter(estado='ACTIVO').first()
        if not contrato or not contrato.cargo_departamento:
            return Response({'error': 'No tiene departamento asignado'}, status=status.HTTP_404_NOT_FOUND)
        departamento = contrato.cargo_departamento.id_departamento
        empleados = Empleado.objects.filter(
            contratos__cargo_departamento__id_departamento=departamento,
            contratos__estado='ACTIVO'
        ).distinct()
        serializer = self.get_serializer(empleados, many=True)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Forzar empresa del usuario autenticado
        empresa = request.user.empresa
        empleado, username, password = crear_empleado_con_usuario(serializer.validated_data, empresa=empresa)
        registrar_bitacora(
            empresa=empresa,
            usuario=request.user,
            accion=f"Creó empleado {empleado.id} ({empleado.nombre} {empleado.apellidos})",
            ip=request.META.get('REMOTE_ADDR'),
            detalles={"username": username, "empleado_id": empleado.id}
        )
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


PARAMETROS = [
    ('genero', str, 'Género del empleado (por ejemplo: M o F)'),
    ('estado_civil', str, 'Estado civil del empleado'),
    ('fecha_ingreso_inicio', str, 'Fecha de ingreso inicial (YYYY-MM-DD)'),
    ('fecha_ingreso_fin', str, 'Fecha de ingreso final (YYYY-MM-DD)'),
    ('departamento', int, 'ID del departamento'),
    ('cargo', int, 'ID del cargo'),
    ('tipo_contrato', str, 'Tipo de contrato (INDEFINIDO, PLAZO FIJO, MEDIO TIEMPO, PASANTIA)')
]

class ReporteEmpleadosExcelView(APIView):

    @extend_schema(
        parameters=[
            OpenApiParameter(name=nombre, type=tipo, location=OpenApiParameter.QUERY, description=desc)
            for nombre, tipo, desc in PARAMETROS
        ],
        responses={200: {'description': 'PDF con el reporte de empleados'}}
    )
    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa

        empleados = self._get_empleados_filtrados(request, empresa)

        # Crear archivo Excel
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="reporte_empleados.xlsx"'

        wb = xlsxwriter.Workbook(response)

        self._crear_hoja_reporte_empleados(wb, empresa, empleados)
        self._crear_hoja_estadisticas(wb, empleados)

        wb.close()
        return response

    def _get_empleados_filtrados(self, request, empresa):
        empleados = Empleado.objects.filter(empresa=empresa)

        genero = request.GET.get('genero')
        estado_civil = request.GET.get('estado_civil')
        fecha_ingreso_inicio = request.GET.get('fecha_ingreso_inicio')
        fecha_ingreso_fin = request.GET.get('fecha_ingreso_fin')
        departamento_id = request.GET.get('departamento')
        cargo_id = request.GET.get('cargo')
        tipo_contrato = request.GET.get('tipo_contrato')

        if genero:
            empleados = empleados.filter(genero=genero)
        if estado_civil:
            empleados = empleados.filter(estado_civil=estado_civil)
        if fecha_ingreso_inicio and fecha_ingreso_fin:
            empleados = empleados.filter(fecha_ingreso__range=[fecha_ingreso_inicio, fecha_ingreso_fin])
        if departamento_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_departamento=departamento_id)
        if cargo_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_cargo=cargo_id)
        if tipo_contrato:
            empleados = empleados.filter(contratos__tipo_contrato=tipo_contrato)

        if tipo_contrato and tipo_contrato not in dict(TIPOS_CONTRATO):
            return Response({'error': 'Tipo de contrato no válido'}, status=400)

        return empleados

    def _crear_hoja_reporte_empleados(self, wb, empresa, empleados):
        ws = wb.add_worksheet("Reporte de Empleados")

        # Formatos
        empresa_format = wb.add_format({
            'bold': True, 'align': 'center', 'valign': 'vcenter', 'font_size': 16
        })
        titulo_format = wb.add_format({
            'bold': True, 'align': 'center', 'valign': 'vcenter', 'font_size': 14
        })
        header_format = wb.add_format({
            'bold': True, 'align': 'center', 'valign': 'vcenter'
        })

        # Fila 1: Empresa
        ws.merge_range('A1:J1', f"Empresa: {empresa.nombre}", empresa_format)

        # Fila 2: Vacía

        # Fila 3: Título del reporte
        ws.merge_range('A3:J3', "Reporte de Empleados", titulo_format)

        # Fila 4: Vacía

        # Fila 5: Encabezados
        headers = ['ID', 'Nombre', 'Apellidos', 'C.I.', 'Género', 'Estado Civil', 'Fecha de Ingreso', 'Departamento', 'Cargo', 'Contrato']
        for col, header in enumerate(headers):
            ws.write(4, col, header, header_format)

        # Fila 6+: Datos
        column_widths = [len(header) for header in headers]
        row = 5  # fila 6 en hoja (indexada desde 0)

        for empleado in empleados:
            data = [
                str(empleado.id),
                empleado.nombre,
                empleado.apellidos,
                str(empleado.ci),
                dict(genero_Choices).get(empleado.genero, ""),
                dict(estado_Civil_Choise).get(empleado.estado_civil, ""),
                str(empleado.fecha_ingreso),
                "",
                "",
                ""
            ]

            contrato = empleado.contratos.first()
            if contrato and contrato.cargo_departamento:
                data[7] = contrato.cargo_departamento.id_departamento.nombre
                data[8] = contrato.cargo_departamento.id_cargo.nombre
                data[9] = contrato.get_tipo_contrato_display()

            for col, value in enumerate(data):
                ws.write(row, col, value)
                column_widths[col] = max(column_widths[col], len(str(value)))

            row += 1

        # Ajustar ancho de columnas automáticamente
        for i, width in enumerate(column_widths):
            ws.set_column(i, i, width + 2)

    def _crear_hoja_estadisticas(self, wb, empleados):
        ws = wb.add_worksheet("Estadísticas")

        # Formatos
        titulo_format = wb.add_format({
            'bold': True, 'align': 'center', 'valign': 'vcenter', 'font_size': 14
        })
        seccion_format = wb.add_format({'bold': True})

        ws.merge_range('A1:J1', "Reporte Estadístico", titulo_format)

        max_len_col_a = len("Total de empleados")

        # Total empleados
        ws.write(2, 0, "Total de empleados", seccion_format)
        ws.write(2, 1, empleados.count())

        row = 4

        # Tipo de contrato
        ws.write(row, 0, "Tipo de contrato", seccion_format)
        ws.write(row, 1, "Cantidad", seccion_format)
        max_len_col_a = max(max_len_col_a, len("Tipo de contrato"))
        row += 1

        contratos = empleados.values('contratos__tipo_contrato').annotate(cantidad=models.Count('id'))
        for item in contratos:
            tipo = dict(TIPOS_CONTRATO).get(item['contratos__tipo_contrato'], 'Desconocido')
            ws.write(row, 0, tipo)
            ws.write(row, 1, item['cantidad'])
            max_len_col_a = max(max_len_col_a, len(tipo))
            row += 1

        # Género
        ws.write(row, 0, "Género", seccion_format)
        ws.write(row, 1, "Cantidad", seccion_format)
        max_len_col_a = max(max_len_col_a, len("Género"))
        row += 1

        generos = empleados.values('genero').annotate(cantidad=models.Count('id'))
        for item in generos:
            genero_txt = dict(genero_Choices).get(item['genero'], 'Desconocido')
            ws.write(row, 0, genero_txt)
            ws.write(row, 1, item['cantidad'])
            max_len_col_a = max(max_len_col_a, len(genero_txt))
            row += 1

        # Estado civil
        ws.write(row, 0, "Estado civil", seccion_format)
        ws.write(row, 1, "Cantidad", seccion_format)
        max_len_col_a = max(max_len_col_a, len("Estado civil"))
        row += 1

        estados = empleados.values('estado_civil').annotate(cantidad=models.Count('id'))
        for item in estados:
            estado_txt = dict(estado_Civil_Choise).get(item['estado_civil'], 'Desconocido')
            ws.write(row, 0, estado_txt)
            ws.write(row, 1, item['cantidad'])
            max_len_col_a = max(max_len_col_a, len(estado_txt))
            row += 1

        # Cargo
        ws.write(row, 0, "Cargo", seccion_format)
        ws.write(row, 1, "Cantidad", seccion_format)
        max_len_col_a = max(max_len_col_a, len("Cargo"))
        row += 1

        cargos = empleados.values('contratos__cargo_departamento__id_cargo__nombre').annotate(cantidad=models.Count('id'))
        for item in cargos:
            cargo_txt = item['contratos__cargo_departamento__id_cargo__nombre'] or 'Desconocido'
            ws.write(row, 0, cargo_txt)
            ws.write(row, 1, item['cantidad'])
            max_len_col_a = max(max_len_col_a, len(cargo_txt))
            row += 1

        # Departamento
        ws.write(row, 0, "Departamento", seccion_format)
        ws.write(row, 1, "Cantidad", seccion_format)
        max_len_col_a = max(max_len_col_a, len("Departamento"))
        row += 1

        departamentos = empleados.values('contratos__cargo_departamento__id_departamento__nombre').annotate(
            cantidad=models.Count('id'))
        for item in departamentos:
            depto_txt = item['contratos__cargo_departamento__id_departamento__nombre'] or 'Desconocido'
            ws.write(row, 0, depto_txt)
            ws.write(row, 1, item['cantidad'])
            max_len_col_a = max(max_len_col_a, len(depto_txt))
            row += 1

        # Ajusta columna A
        ws.set_column(0, 0, max_len_col_a + 2)

class ReporteEmpleadosPdfView(APIView):

    @extend_schema(
        parameters=[
            OpenApiParameter(name=nombre, type=tipo, location=OpenApiParameter.QUERY, description=desc)
            for nombre, tipo, desc in PARAMETROS
        ],
        responses={200: {'description': 'PDF con el reporte de empleados'}}
    )
    def get(self, request, *args, **kwargs):
        empresa = request.user.empresa
        empleados = Empleado.objects.filter(empresa=empresa)

        print("Usuario autenticado:", request.user)
        print("Tiene empresa:", hasattr(request.user, 'empresa'))
        print("Empresa:", getattr(request.user, 'empresa', None))

        # Filtros
        genero = request.GET.get('genero', None)
        estado_civil = request.GET.get('estado_civil', None)
        fecha_ingreso_inicio = request.GET.get('fecha_ingreso_inicio', None)
        fecha_ingreso_fin = request.GET.get('fecha_ingreso_fin', None)
        departamento_id = request.GET.get('departamento', None)
        cargo_id = request.GET.get('cargo', None)

        if genero:
            empleados = empleados.filter(genero=genero)
        if estado_civil:
            empleados = empleados.filter(estado_civil=estado_civil)
        if fecha_ingreso_inicio and fecha_ingreso_fin:
            empleados = empleados.filter(fecha_ingreso__range=[fecha_ingreso_inicio, fecha_ingreso_fin])
        if departamento_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_departamento=departamento_id)
        if cargo_id:
            empleados = empleados.filter(contratos__cargo_departamento__id_cargo=cargo_id)

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="reporte_empleados.pdf"'

        p = canvas.Canvas(response, pagesize=landscape(legal))
        width, height = landscape(legal)

        # Título con empresa
        empresa_nombre = empresa.nombre if empresa and hasattr(empresa, 'nombre') else "Empresa Desconocida"
        p.setFont("Helvetica-Bold", 16)
        p.drawString(30, height - 20, f"Empresa: {empresa_nombre}")
        print("Empresa usada en reporte:", empresa_nombre)

        p.setFont("Helvetica-Bold", 20)
        p.drawString(30, height - 60, "Reporte de Empleados")

        # Filtros aplicados
        p.setFont("Helvetica", 12)
        filtro_y = height - 80
        if genero or estado_civil or fecha_ingreso_inicio or fecha_ingreso_fin or departamento_id or cargo_id:
            p.drawString(30, filtro_y, "Filtros aplicados:")
            filtros = []
            if genero:
                filtros.append(f"Género: {genero}")
            if estado_civil:
                filtros.append(f"Estado Civil: {estado_civil}")
            if fecha_ingreso_inicio and fecha_ingreso_fin:
                filtros.append(f"Fecha Ingreso: {fecha_ingreso_inicio} a {fecha_ingreso_fin}")
            if departamento_id:
                filtros.append(f"Departamento: {departamento_id}")
            if cargo_id:
                filtros.append(f"Cargo: {cargo_id}")
            filtro_text = ', '.join(filtros)
            p.drawString(30, filtro_y - 20, filtro_text)
        else:
            p.drawString(30, filtro_y, "No se aplicaron filtros")

        # Encabezados de columnas
        p.setFont("Helvetica-Bold", 12)
        p.drawString(30, height - 120, "ID")
        p.drawString(100, height - 120, "Nombre")
        p.drawString(220, height - 120, "Apellidos")
        p.drawString(340, height - 120, "C.I.")
        p.drawString(420, height - 120, "Género")
        p.drawString(500, height - 120, "Estado Civil")
        p.drawString(610, height - 120, "Fecha Ingreso")
        p.drawString(740, height - 120, "Departamento")
        p.drawString(880, height - 120, "Cargo")

        y_position = height - 140
        p.setFont("Helvetica", 12)

        for empleado in empleados:
            if y_position < 40:
                p.showPage()
                y_position = height - 40

            p.drawString(30, y_position, str(empleado.id))
            p.drawString(100, y_position, empleado.nombre)
            p.drawString(220, y_position, empleado.apellidos)
            p.drawString(340, y_position, str(empleado.ci))
            p.drawString(420, y_position, dict(genero_Choices).get(empleado.genero, ""))
            p.drawString(500, y_position, dict(estado_Civil_Choise).get(empleado.estado_civil, ""))
            p.drawString(610, y_position, str(empleado.fecha_ingreso))

            contrato = empleado.contratos.first()
            if contrato:
                cargo_departamento = contrato.cargo_departamento
                if cargo_departamento:
                    p.drawString(740, y_position, cargo_departamento.id_departamento.nombre)
                    p.drawString(880, y_position, cargo_departamento.id_cargo.nombre)

            y_position -= 20

        # Pie de página
        p.setFont("Helvetica", 10)
        fecha_generacion = datetime.now().strftime("%d-%m-%Y %H:%M:%S")
        p.drawString(30, 30, f"Fecha de generación del reporte: {fecha_generacion}")

        p.showPage()
        p.save()
        return response