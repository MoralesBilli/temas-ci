import pandas as pd


#Lectura del archivo excel
def importar(archivo,carreras):
    archivo = pd.ExcelFile(f'{archivo}')
    hojas = archivo.sheet_names
    contenido = {}
    columnas_numerica = ["Semestre","Unidad", "No_Faltas","Calificacion"]

    for hoja in hojas:
        df =archivo.parse(hoja)

        df.columns = df.columns.str.strip() 
            
        if "Carrera" in df.columns:
            #Identifica filas donde la carrera no existe en la bd
            invalidas = ~df['Carreras'].isin(carreras)
            if invalidas:
                return "No se pudo importar, carrera no encontrada"
            
        else:
            return "Campo no encontrado"
        #Detecta valores nulos
        if df.isnull.values.any():
            return "No se pudo importar, datos nulos"
        
        #Detecta valores vacios
        if (df.astype(str).apply(lambda x: x.str.strip() == "")).values.any():
            return "No se pudo importar, datos vacíos "

        #Validar que el campo unidad, semestre, calificacion y No.Faltas sea solamente numeros
        for columna in columnas_numerica:
            if columna in df.columns:
                no_numericos = df[~df[columna].astype(str).str.isnumeric()]
                if not no_numericos.empty:
                    return f"No se pudo importar, datos no numéricos en {columna}"
            else:
                return "No existe la columna Unidad"
        
        contenido[hoja] = df
        print(df)
    
    return contenido