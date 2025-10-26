import pandas as pd
from Backend.Extensiones import db
from Modelos.Modelos import Alumnos, Carreras, Calificaciones, Inscripciones

#Lectura del archivo excel
def importar(archivo,carreras,materias):
    archivo = pd.ExcelFile(f'{archivo}')
    hojas = archivo.sheet_names
    contenido = {}
    columnas_numerica = ["Semestre","Unidad", "No_Faltas","Calificacion"]
    columnas_existentes = ["Carreras","Materia"]
    lista_informacion = {"Carreras":carreras, "Materia": materias}

    try:
     for hoja in hojas:
        df =archivo.parse(hoja)
        df.columns = df.columns.str.strip() #quita los espacios de las celdas
        

        #Detecta valores nulos
        if df.isnull().values.any():
            return "No se pudo importar, datos nulos"
        
        #Detecta valores vacios
        if (df.astype(str).apply(lambda x: x.str.strip() == "")).values.any():
            return "No se pudo importar, datos vacíos "
        
       #Revisa que existan columnas 
        faltantes = [c for c in columnas_existentes + columnas_numerica if c not in df.columns]
        if faltantes:
            return f"No se pudo importar, columnas faltantes, o error de escritura: {', '.join(faltantes)}"
        
        #Revisa la existencia de carreras y materias validas
        for coex in columnas_existentes:
            if coex in df.columns:
                #Identifica filas donde la carrera no existe en la bd
                invalidas = ~df[coex].isin(lista_informacion[coex])
                if invalidas.any():
                    return "No se pudo importar, carrera no encontrada"
            
            
        #Validar que el campo unidad, semestre, calificacion y No.Faltas sea solamente numeros
        for columna in columnas_numerica:
            if columna in df.columns:
                no_numericos = df[~df[columna].astype(str).str.isnumeric()]
                if not no_numericos.empty:
                    return f"No se pudo importar, datos no numéricos en {columna}"
       
        if 'Semestre' in df.columns:
            invalidos_semestre = df['Semestre'] > 9
            if invalidos_semestre.any():
                return "No se pudo importar: hay semestres invaldios"


        contenido[hoja] = df
        print(df)
    except Exception as e:
        return f'Error al importar el archivo: {str(e)}'
    resultado = Guardar_Datos_grupos(contenido)
    return resultado


def imprtar_grupos(arcvhivo,carreras):
    archivo = pd.ExcelFile(f'{archivo}')
    hojas = archivo.sheet_names
    contenido = {}

    try:
     for hoja in hojas:
        df =archivo.parse(hoja)
        df.columns = df.columns.str.strip() #quita los espacios de las celdas
        

        #Detecta valores nulos
        if df.isnull().values.any():
            return "No se pudo importar, datos nulos"
        
        #Detecta valores vacios
        if (df.astype(str).apply(lambda x: x.str.strip() == "")).values.any():
            return "No se pudo importar, datos vacíos "
        
        
    except Exception as e:
        return f'Error al importar el archivo: {str(e)}'
    resultado = Guardar_Datos_grupos(contenido)
    return resultado
    

def Guardar_Datos_grupos(datos):
    try:
        if isinstance(datos,dict):
            carreras = {carrera.nombre: carrera.id_carrera for carrera in Carreras.query.all()}

            for hoja, df in  datos.items():
                for _,fila in df.iterrows():
                    nombre_carrera = fila["Carreras"]
                    id_carrera = carreras.get(nombre_carrera)
                    #guardado enla base de datos faltan los modelos
                    
                    nuevo_alumno = Alumnos(
                        no_control=fila["No_Control"],
                        nombre=fila["Nombre"],
                        apellido_paterno=fila["Apellido_Paterno"],
                        apellido_materno=fila["Apellido_Materno"],
                        estado="Activo",
                        semestre =fila["Semestre"],
                        id_carrera=id_carrera
                    )
                    db.session.add(nuevo_alumno)

            db.session.commit()
            return "Guardado correctamente"
        else:
            return datos
    except Exception as e:
        return f'No se guardaron los datos {str(e)}'