from Extensiones import db
from flask import Blueprint, jsonify,request
from Funciones.ImportarExcel import importar, Guardar_Datos

import os

Import_export_bp = Blueprint('Import_export',__name__)

#folder para guardar el archivo de manera temporal


@Import_export_bp.route('/api/importar',methods=['POST'])
def importar_Excel():
    try:
        UPLOAD_FOLDER = 'uploads'
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        #validaciones 
        if 'archivo' not in request.files:
            return jsonify({'error': 'No fue enviaddo un archivo'}),400
        
        archivo = request.files['archivo']

        if archivo.filename == '':
            return jsonify({'error': 'El nombre del archivo está vacío'}),400
        
        if not archivo.filename.endswith(('.xls','.xlsx')):
            return jsonify({'error':'Formato de archivo no válido'}),400
        

        ruta = os.path.join(UPLOAD_FOLDER, archivo.filename)
        archivo.save(ruta)

        procesamiento = importar(ruta)
       

        os.remove(ruta)

        return jsonify({'mensaje':'Archivo subido', 'resultado' : procesamiento})
    except Exception  as e:
        return jsonify({'error': f'Error al importar el archivo {str(e)}'}),400

