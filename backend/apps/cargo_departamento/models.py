from django.db import models

from apps.cargo.models import Cargo
from apps.departamento.models import Departamento


# Create your models here.

class CargoDepartamento(models.Model):
    id_cargo = models.ForeignKey(
        Cargo,
        on_delete=models.PROTECT,
        related_name='cargo_departamentos'
    )

    id_departamento = models.ForeignKey(
        Departamento,
        on_delete=models.PROTECT,
        related_name='departamento_cargos'
    )