import pandas as pd


#Lectura del archivo excel
def importar(archivo,carreras,materias):
    archivo = pd.ExcelFile(f'{archivo}')
    hojas = archivo.sheet_names
    contenido = {}
    columnas_numerica = ["Semestre","Unidad", "No_Faltas","Calificacion"]
    columnas_existentes = ["Carreras","Materia"]
    lista_informacion = {"Carreras":carreras, "Materia": materias}

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
    
    return contenido