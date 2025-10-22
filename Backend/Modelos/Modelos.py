from Exteniones import db



class Carreras(db.Model):
    __tablename__='carreras'
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    nombre=db.Column(db.String(64),nullable=False)
    modalidad=db.Column(db.Enum('PRESENCIAL','SEMIPRESENCIAL', name='modalidad'),nullable=False)


class Alumnos(db.Model):
    __tablename__='alumnos'
    no_control = db.Column(db.String(16), primary_key=True, nullable=False)
    nombre = db.Column(db.String(64), nullable=False)
    apellido_paterno = db.Column(db.String(64), nullable=False)
    apellido_materno = db.Column(db.String(64),nullable=False)
    genero = db.Column(db.Enum('Hombre','Mujer', name='genero'),nullable=False)
    estaddo = db.Column (db.Enum('VIGENTE','EGRESADO','BAJA_TEMPORAL','BAJA_DEFINITIVA', name='estado_aluno'), nullable=False)
    semestre = db.Column(db.Integer, nullable=False)
    id_carrera =db.Column(db.Integer, db.ForeignKey('carreras.id'),nullable=False)

    #Relación con tabla carreras
    carreras = db.relationship('Carreras', backref='carreras')
    def to_dict(self):
        return{
            'no_control': self.no_control,
            'nombre':self.nombre,
            'apellido_paterno': self.apellido_paterno,
            'apellido_materno': self.apellido_materno,
            'genero':self.genero,
            'estado':self.estaddo,
            'semestre':self.semestre,
            'id_carrera':self.id_carrera
        }