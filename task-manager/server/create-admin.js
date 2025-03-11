// save as create-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Conectar a MongoDB
mongoose.connect('mongodb+srv://2022371082:marianahernandezdimas15102004@cluster0.k11jy.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).catch(err => console.error('Error al conectar a MongoDB:', err));

// Definir esquema de usuario
const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'student'], default: 'student' },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now },
});

// Crear modelo
const User = mongoose.model('UserRecord', userSchema);

// Función para crear usuario administrador
async function createAdmin() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('¡Ya existe un administrador con este email!');
    } else {
      // Cifrar la contraseña correctamente
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Crear el usuario
      const newAdmin = new User({
        full_name: 'Administrador Principal',
        date_of_birth: new Date('1990-01-01'),
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'superadmin'
      });
      
      await newAdmin.save();
      console.log('¡Usuario administrador creado exitosamente!');
      console.log('Email: admin@example.com');
      console.log('Contraseña: admin123');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();