from decimal import Decimal
from django.db import transaction
from apps.nomina.models import BoletaPago, DetalleBoletaPago, ReglaSalarial, EstructuraSalarial
from apps.asistencia.models import Asistencia
from apps.horas_extras.models import HorasExtras
from apps.empleado.models import Empleado
from apps.contrato.models import Contrato
from datetime import date, timedelta

def calcular_nomina(empleado, contrato, estructura, fecha_inicio, fecha_fin, empresa):
    """
    Calcula la nómina de un empleado para un periodo y crea BoletaPago y DetalleBoletaPago.
    """
    salario_base = contrato.salario_personalizado or contrato.cargo_departamento.id_cargo.salario
    asistencias = Asistencia.objects.filter(
        empleado=empleado, empresa=empresa, fecha__range=(fecha_inicio, fecha_fin)
    )
    horas_trabajadas = sum([(a.horas_trabajadas or 0) for a in asistencias])
    dias_trabajados = asistencias.count()
    dias_periodo = (fecha_fin - fecha_inicio).days + 1
    dias_faltados = dias_periodo - dias_trabajados
    horas_extras = HorasExtras.objects.filter(
        empleado_solicitador=empleado, empresa=empresa,
        fecha_solicitud__range=(fecha_inicio, fecha_fin), aprobado=True
    )
    total_horas_extra = sum([he.cantidad_horas_extra_trabajadas.total_seconds() / 3600 for he in horas_extras])

    contexto = {
        'empleado': empleado,
        'contrato': contrato,
        'empresa': empresa,
        'salario_base': salario_base,
        'fecha_inicio': fecha_inicio,
        'fecha_fin': fecha_fin,
        'asistencias': asistencias,
        'dias_trabajados': dias_trabajados,
        'dias_periodo': dias_periodo,
        'dias_faltados': dias_faltados,
        'horas_trabajadas': horas_trabajadas,
        'horas_extras': horas_extras,
        'total_horas_extra': total_horas_extra,
        'horas_extra_totales': Decimal(str(total_horas_extra)),
        'hoy': date.today(),
        'Decimal': Decimal,
    }

    reglas = estructura.reglas.order_by('secuencia')
    total_ingresos = Decimal(0)
    total_deducciones = Decimal(0)
    detalles = []

    for regla in reglas:
        try:
            if not regla.condicion or eval(regla.condicion, {}, contexto):
                monto = eval(regla.formula, {}, contexto)
                monto = Decimal(monto)
                detalles.append({
                    'regla': regla,
                    'nombre': regla.nombre,
                    'codigo': regla.codigo,
                    'tipo': regla.tipo,
                    'monto': monto,
                    'secuencia': regla.secuencia,
                })
                if regla.tipo in ['ingreso', 'bono', 'hora_extra']:
                    total_ingresos += monto
                elif regla.tipo == 'deduccion':
                    total_deducciones += monto
        except Exception as e:
            continue

    total_neto = total_ingresos - total_deducciones

    with transaction.atomic():
        boleta = BoletaPago.objects.create(
            empleado=empleado,
            contrato=contrato,
            empresa=empresa,
            estructura=estructura,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            total_ingresos=total_ingresos,
            total_deducciones=total_deducciones,
            total_neto=total_neto,
            estado='validada'
        )
        for d in detalles:
            DetalleBoletaPago.objects.create(
                boleta=boleta,
                regla=d['regla'],
                nombre=d['nombre'],
                codigo=d['codigo'],
                tipo=d['tipo'],
                monto=d['monto'],
                secuencia=d['secuencia']
            )
    return boleta

def ultimo_dia_mes(fecha):
    """Devuelve el último día del mes de la fecha dada."""
    if fecha.month == 12:
        return fecha.replace(day=31)
    return (fecha.replace(month=fecha.month+1, day=1) - timedelta(days=1))

def generar_nomina_masiva(empresa, fecha_inicio, fecha_fin=None, cierre_fin_de_mes=False):
    """
    Genera la nómina de todos los empleados activos con contrato vigente en la empresa para el periodo dado.
    Si cierre_fin_de_mes=True, calcula hasta el último día del mes de fecha_inicio.
    """
    if cierre_fin_de_mes:
        fecha_fin = ultimo_dia_mes(fecha_inicio)
    elif not fecha_fin:
        fecha_fin = fecha_inicio
    empleados = Empleado.objects.filter(empresa=empresa)
    boletas = []
    for empleado in empleados:
        # Validar si ya existe boleta para este empleado, empresa y periodo
        if BoletaPago.objects.filter(
            empleado=empleado,
            empresa=empresa,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin
        ).exists():
            continue  # Ignora y sigue con el siguiente empleado
        contrato = Contrato.objects.filter(
            empleado=empleado,
            empresa=empresa,
            estado='ACTIVO',
            fecha_inicio__lte=fecha_fin
        ).order_by('-fecha_inicio').first()
        if not contrato:
            continue
        estructura = EstructuraSalarial.objects.filter(
            empresa=empresa,
            tipo_contrato=contrato.tipo_contrato,
            activa=True
        ).first()
        if not estructura:
            continue
        boleta = calcular_nomina(
            empleado=empleado,
            contrato=contrato,
            estructura=estructura,
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            empresa=empresa
        )
        boleta.modo_generacion = 'automatico'
        boleta.save()
        boletas.append(boleta)
    return boletas

def generar_nomina_manual(empleado, empresa, fecha_inicio, fecha_fin=None, cierre_fin_de_mes=False):
    """
    Genera la nómina de un solo empleado bajo demanda.
    Si cierre_fin_de_mes=True, calcula hasta el último día del mes de fecha_inicio.
    """
    if cierre_fin_de_mes:
        fecha_fin = ultimo_dia_mes(fecha_inicio)
    elif not fecha_fin:
        fecha_fin = fecha_inicio
    # Validar si ya existe boleta para este empleado, empresa y periodo
    if BoletaPago.objects.filter(
        empleado=empleado,
        empresa=empresa,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin
    ).exists():
        return 'EXISTE'
    contrato = Contrato.objects.filter(
        empleado=empleado,
        empresa=empresa,
        estado='ACTIVO',
        fecha_inicio__lte=fecha_fin
    ).order_by('-fecha_inicio').first()
    if not contrato:
        return None
    estructura = EstructuraSalarial.objects.filter(
        empresa=empresa,
        tipo_contrato=contrato.tipo_contrato,
        activa=True
    ).first()
    if not estructura:
        return None
    boleta = calcular_nomina(
        empleado=empleado,
        contrato=contrato,
        estructura=estructura,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        empresa=empresa
    )
    if not boleta:
        return None
    boleta.modo_generacion = 'manual'
    boleta.save()

    # Obtener detalles simplificados
    detalles = DetalleBoletaPago.objects.filter(boleta=boleta).order_by('secuencia')
    detalles_simplificados = [
        {
            'nombre': d.nombre,
            'codigo': d.codigo,
            'tipo': d.tipo,
            'monto': str(d.monto),
            'secuencia': d.secuencia
        }
        for d in detalles
    ]

    return {
        'id': boleta.id,
        'empleado': boleta.empleado.id if hasattr(boleta.empleado, 'id') else boleta.empleado,
        'contrato': boleta.contrato.id if hasattr(boleta.contrato, 'id') else boleta.contrato,
        'empresa': boleta.empresa.id if hasattr(boleta.empresa, 'id') else boleta.empresa,
        'fecha_inicio': boleta.fecha_inicio,
        'fecha_fin': boleta.fecha_fin,
        'total_ingresos': str(boleta.total_ingresos),
        'total_deducciones': str(boleta.total_deducciones),
        'total_neto': str(boleta.total_neto),
        'estado': boleta.estado,
        'modo_generacion': boleta.modo_generacion,
        'detalles': detalles_simplificados
    }
