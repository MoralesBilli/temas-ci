from Extensiones import db
from Modelos.Modelos import Alumnos,FactoresDeRiesgo,FactoresPorAlumno
from flask import jsonify, Blueprint
from sqlalchemy.orm import joinedload
Alumnos_bp = Blueprint('alumnos',__name__)

@Alumnos_bp.route('/api/alumnos',methods=['GET'])
def obtener_alumnos_factores():
    try:
        # Traer todos los alumnos
        alumnos = Alumnos.query.all()

        resultado = []
        for a in alumnos:
            resultado.append({
                "numeroDeControl": a.no_control,
                "nombre": a.nombre,
                "apellidoPaterno": a.apellido_paterno,
                "apellidoMaterno": a.apellido_materno,  # si es None, JSON lo mantiene
                "factoresDeRiesgo": [f.factor.nombre for f in a.factores_de_riesgo]
            })
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'ERROR': f'Error al cargar los alumnos: {str(e)}'}), 500



@Alumnos_bp.route('/api/alumno_detalle/<no_control>', methods=['GET'])
def obtener_alumno_detalle(no_control):
    try:
        alumno = Alumnos.query.filter_by(no_control=no_control).first()
        if not alumno:
            return jsonify({'ERROR': 'Alumno no encontrado'}), 404

        resultado = {
            "numeroDeControl": alumno.no_control,
            "nombre": alumno.nombre,
            "apellidoPaterno": alumno.apellido_paterno,
            "apellidoMaterno": alumno.apellido_materno,
            "genero": alumno.genero,
            "estado": alumno.estado,
            "semestre": alumno.semestre,
            "nombreCarrera": alumno.carrera.nombre if alumno.carrera else None,
            "modalidadCarrera": alumno.carrera.modalidad if alumno.carrera else None,
            "factoresDeRiesgo": [f.factor.nombre for f in alumno.factores_de_riesgo],
            "inscripciones": []
        }

        # Recorrer inscripciones
        for inscripcion in alumno.inscripciones:
            grupo = inscripcion.grupo
            materias = []
            if grupo:
                for relacion in grupo.grupos_materias:
                    materia = relacion.materia
                    materias.append({
                        "nombreMateria": materia.nombre,
                        "serieMateria": materia.serie
                    })
                ins = {
                    "grupo": grupo.grupo if grupo else None,
                    "materias": materias,
                    "calificaciones": []
                }
            # Calificaciones de esa inscripción
            for cal in inscripcion.calificaciones:
                ins['calificaciones'].append({
                    "unidad": cal.unidad,
                    "calificacion": cal.calificacion,
                    "faltas": cal.faltas
                })

            resultado['inscripciones'].append(ins)

        return jsonify(resultado)

    except Exception as e:
        return jsonify({'ERROR': f'Error al cargar el alumno: {str(e)}'}), 500
