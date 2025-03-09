const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conectar a MongoDB
mongoose.connect("mongodb://localhost:27017/web", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Definir esquema y modelo para Usuarios con roles
const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'student'], default: 'student' },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now },
});

const User = mongoose.model("UserRecord", userSchema);

// Definir esquema y modelo para Grupos
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "UserRecord", required: true },
  created_at: { type: Date, default: Date.now },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRecord" }]
});

const Group = mongoose.model("Group", groupSchema);

// Definir esquema y modelo para Tareas (asociadas a un grupo)
const taskSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  name_task: { type: String, required: true },
  description: { type: String },
  dead_line: { type: Date, required: true },
  status: { type: String, enum: ['In Progress', 'Done', 'Paused', 'Revision'], default: 'In Progress' },
  category: { type: String },
  assigned_to: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserRecord" }],
  completed_by: [{ 
    student: { type: mongoose.Schema.Types.ObjectId, ref: "UserRecord" },
    completed_at: { type: Date, default: Date.now }
  }]
});

const Task = mongoose.model("Task", taskSchema);

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Acceso denegado, token no proporcionado" });

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), "your_jwt_secret");
    req.user = verified; // Guarda toda la información del usuario (id y rol)
    next();
  } catch (error) {
    res.status(400).json({ message: "Token inválido" });
  }
};

// Middleware para verificar si es superadmin
const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ message: "Acceso denegado, se requiere rol de Super Administrador" });
  }
  next();
};

// Ruta de registro de usuario
app.post("/api/register", async (req, res) => {
  const { full_name, date_of_birth, email, password, role } = req.body;

  // Verificar si el correo ya está registrado
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "El correo ya está registrado" });
  }

  // Cifrar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  // Crear un nuevo usuario
  const newUser = new User({
    full_name,
    date_of_birth,
    email,
    password: hashedPassword,
    role: role || 'student', // Si no se especifica, será estudiante por defecto
  });

  await newUser.save();
  res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser });
});

// Ruta de inicio de sesión
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar que tengamos valores para email y password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Por favor proporciona un email y contraseña" 
      });
    }

    // Verificar si el usuario existe
    // IMPORTANTE: Asegúrate de pasar el email como string, no como objeto
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Comparar la contraseña cifrada con la proporcionada
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
    }

    // Generar un token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );

    // Actualizar el último inicio de sesión
    user.last_login = Date.now();
    await user.save();

    res.status(200).json({ 
      success: true, 
      message: "Inicio de sesión exitoso", 
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ======= RUTAS PARA EL SUPERADMIN =======
// Añade estas rutas a tu servidor Express (server.js)

// Obtener todos los usuarios (solo superadmin)
app.get("/api/users/all", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error("Error al obtener todos los usuarios:", error);
    res.status(500).json({ message: "Error al obtener la lista de usuarios" });
  }
});

// Crear un nuevo usuario (solo superadmin)
app.post("/api/users", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { full_name, email, password, role, date_of_birth } = req.body;
    
    // Verificar si el correo ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }
    
    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      full_name,
      email,
      password: hashedPassword,
      role: role || 'student',
      date_of_birth
    });
    
    await newUser.save();
    
    // No enviar la contraseña en la respuesta
    const userResponse = { ...newUser.toObject() };
    delete userResponse.password;
    
    res.status(201).json({ 
      message: "Usuario creado exitosamente", 
      user: userResponse 
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al crear el usuario" });
  }
});

// Actualizar un usuario (solo superadmin)
app.put("/api/users/:userId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, email, role, date_of_birth } = req.body;
    
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Si se está cambiando el email, verificar que no esté en uso
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }
    }
    
    // Actualizar campos
    user.full_name = full_name || user.full_name;
    user.email = email || user.email;
    user.role = role || user.role;
    if (date_of_birth) {
      user.date_of_birth = date_of_birth;
    }
    
    await user.save();
    
    // No enviar la contraseña en la respuesta
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ 
      message: "Usuario actualizado exitosamente", 
      user: userResponse 
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar el usuario" });
  }
});

// Eliminar un usuario (solo superadmin)
app.delete("/api/users/:userId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Evitar que se elimine a sí mismo
    if (userId === req.user.userId) {
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Eliminar el usuario
    await User.findByIdAndDelete(userId);
    
    // También eliminar al usuario de todos los grupos
    await Group.updateMany(
      { students: userId },
      { $pull: { students: userId } }
    );
    
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
});

// Cambiar contraseña de un usuario (solo superadmin)
app.post("/api/users/:userId/change-password", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: "La contraseña es requerida" });
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Cifrar la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    
    await user.save();
    
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
});

// Obtener perfil del usuario actual
app.get("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener el perfil del usuario" });
  }
});

// Actualizar perfil del usuario actual
app.put("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const { full_name, email, date_of_birth } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Si se está cambiando el email, verificar que no esté en uso
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El correo ya está registrado" });
      }
      user.email = email;
    }
    
    // Actualizar los demás campos
    if (full_name) user.full_name = full_name;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    
    await user.save();
    
    // No enviar la contraseña en la respuesta
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    res.json({ 
      message: "Perfil actualizado exitosamente", 
      user: userResponse 
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
});

// Cambiar la contraseña propia
app.post("/api/users/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Verificar que ambas contraseñas están presentes
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Las contraseñas actual y nueva son requeridas" });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Verificar que la contraseña actual es correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }
    
    // Cifrar y guardar la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    
    await user.save();
    
    res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(500).json({ message: "Error al cambiar la contraseña" });
  }
});
// Crear un nuevo grupo (solo superadmin)
app.post("/api/groups", verifyToken, async (req, res) => {
  try {
    // Verifica que req.body.name exista
    if (!req.body.name) {
      return res.status(400).json({ message: "El nombre del grupo es obligatorio" });
    }
    
    const newGroup = new Group({
      name: req.body.name,
      description: req.body.description,
      created_by: req.user.userId,
      students: req.body.students || []
    });
    
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error("Error al crear grupo:", error);
    res.status(500).json({ message: "Error al crear el grupo" });
  }
});

// Obtener todos los grupos creados por el superadmin
app.get("/api/groups", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const groups = await Group.find({ created_by: req.user.userId })
      .populate('students', 'full_name email');
    res.json(groups);
  } catch (error) {
    console.error("Error al obtener grupos:", error);
    res.status(500).json({ message: "Error al obtener los grupos" });
  }
});

// Eliminar un grupo
app.delete("/api/groups/:groupId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Verificar que el grupo existe y fue creado por este superadmin
    const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    
    // Eliminar todas las tareas asociadas al grupo
    await Task.deleteMany({ group_id: groupId });
    
    // Eliminar el grupo
    await Group.findByIdAndDelete(groupId);
    
    res.json({ message: "Grupo y todas sus tareas eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar grupo:", error);
    res.status(500).json({ message: "Error al eliminar el grupo" });
  }
});

app.post("/api/groups/:groupId/students", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { studentIds } = req.body; // Array de IDs de estudiantes
    
    console.log(`Intentando agregar estudiantes al grupo ${groupId}:`, studentIds);
    
    // Verificar que el grupo existe y fue creado por este superadmin
    const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
    if (!group) {
      console.log(`Grupo ${groupId} no encontrado o no pertenece al usuario ${req.user.userId}`);
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    
    // Verificar que todos los IDs corresponden a estudiantes
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    console.log(`Encontrados ${students.length} estudiantes válidos de ${studentIds.length} IDs proporcionados`);
    
    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: "Algunos IDs no corresponden a estudiantes válidos" });
    }
    
    // Agregar estudiantes al grupo (evitar duplicados)
    const currentStudentIds = group.students.map(id => id.toString());
    console.log("IDs de estudiantes actuales:", currentStudentIds);
    
    const newStudentIds = studentIds.filter(id => !currentStudentIds.includes(id));
    console.log("Nuevos IDs de estudiantes a agregar:", newStudentIds);
    
    if (newStudentIds.length > 0) {
      group.students = [...group.students, ...newStudentIds];
      await group.save();
      console.log("Grupo actualizado con nuevos estudiantes");
    } else {
      console.log("No hay nuevos estudiantes para agregar");
    }
    
    // Obtener el grupo actualizado con los estudiantes populados para la respuesta
    const updatedGroup = await Group.findById(groupId).populate('students', 'full_name email');
    
    res.json({ 
      message: "Estudiantes agregados al grupo correctamente", 
      group: updatedGroup 
    });
  } catch (error) {
    console.error("Error al agregar estudiantes:", error);
    res.status(500).json({ message: "Error al agregar estudiantes al grupo" });
  }
});


// Agregar estudiantes a un grupo
app.post("/api/groups/:groupId/students", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { studentIds } = req.body; // Array de IDs de estudiantes
    
    // Verificar que el grupo existe y fue creado por este superadmin
    const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    
    // Verificar que todos los IDs corresponden a estudiantes
    const students = await User.find({ _id: { $in: studentIds }, role: 'student' });
    if (students.length !== studentIds.length) {
      return res.status(400).json({ message: "Algunos IDs no corresponden a estudiantes válidos" });
    }
    
    // Agregar estudiantes al grupo (evitar duplicados)
    const uniqueStudentIds = [...new Set([...group.students.map(id => id.toString()), ...studentIds])];
    group.students = uniqueStudentIds;
    
    await group.save();
    res.json({ message: "Estudiantes agregados al grupo correctamente", group });
  } catch (error) {
    console.error("Error al agregar estudiantes:", error);
    res.status(500).json({ message: "Error al agregar estudiantes al grupo" });
  }
});


//atraer estudiante
app.get("/api/users", verifyToken, async (req, res) => {
  try {
    const { role = 'student' } = req.query; // Por defecto 'student'
    
    // Construir las condiciones de búsqueda
    let query = { role };
    
    // Obtener los usuarios que coincidan con la consulta
    const users = await User.find(query).select('_id full_name email role');
    
    console.log(`Se encontraron ${users.length} usuarios con rol ${role}`);
    
    // Devolver los usuarios
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener la lista de usuarios" });
  }
});

// Eliminar un estudiante de un grupo
app.delete("/api/groups/:groupId/students/:studentId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { groupId, studentId } = req.params;
    
    // Verificar que el grupo existe y fue creado por este superadmin
    const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    
    // Remover el estudiante del grupo
    group.students = group.students.filter(id => id.toString() !== studentId);
    
    await group.save();
    res.json({ message: "Estudiante eliminado del grupo correctamente", group });
  } catch (error) {
    console.error("Error al eliminar estudiante:", error);
    res.status(500).json({ message: "Error al eliminar estudiante del grupo" });
  }
});

// Crear tarea en un grupo
app.post("/api/groups/:groupId/tasks", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name_task, description, dead_line, status, category, assigned_to } = req.body;
    
    // Verificar que el grupo existe y fue creado por este superadmin
    const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    
    // Verificar que todos los estudiantes asignados pertenecen al grupo
    if (assigned_to && assigned_to.length > 0) {
      const validStudents = assigned_to.every(id => 
        group.students.some(studentId => studentId.toString() === id)
      );
      
      if (!validStudents) {
        return res.status(400).json({ message: "Algunos estudiantes asignados no pertenecen a este grupo" });
      }
    }
    
    const newTask = new Task({
      group_id: groupId,
      name_task,
      description,
      dead_line,
      status,
      category,
      assigned_to: assigned_to || group.students // Si no se especifica, asignar a todos los estudiantes del grupo
    });
    
    await newTask.save();
    res.status(201).json({ message: "Tarea creada exitosamente", task: newTask });
  } catch (error) {
    console.error("Error al crear tarea:", error);
    res.status(500).json({ message: "Error al crear la tarea" });
  }
});

// Obtener tareas de un grupo
app.get("/api/groups/:groupId/tasks", verifyToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    if (req.user.role === 'superadmin') {
      // Si es superadmin, verificar que el grupo le pertenece
      const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
      if (!group) {
        return res.status(404).json({ message: "Grupo no encontrado" });
      }
      
      const tasks = await Task.find({ group_id: groupId })
        .populate('assigned_to', 'full_name email')
        .populate('completed_by.student', 'full_name email');
      
      return res.json(tasks);
    } else {
      // Si es estudiante, verificar que pertenece al grupo
      const group = await Group.findOne({ 
        _id: groupId, 
        students: req.user.userId 
      });
      
      if (!group) {
        return res.status(404).json({ message: "No tienes acceso a este grupo" });
      }
      
      // Obtener solo las tareas asignadas a este estudiante
      const tasks = await Task.find({ 
        group_id: groupId,
        assigned_to: req.user.userId
      }).populate('completed_by.student', 'full_name email');
      
      return res.json(tasks);
    }
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    res.status(500).json({ message: "Error al obtener las tareas" });
  }
});

// Actualizar una tarea (solo superadmin)
app.put("/api/tasks/:taskId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    
    // Obtener la tarea y verificar que pertenece a un grupo creado por este superadmin
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    const group = await Group.findOne({ 
      _id: task.group_id, 
      created_by: req.user.userId 
    });
    
    if (!group) {
      return res.status(403).json({ message: "No tienes permiso para modificar esta tarea" });
    }
    
    // Si hay estudiantes asignados, verificar que pertenecen al grupo
    if (updates.assigned_to) {
      const validStudents = updates.assigned_to.every(id => 
        group.students.some(studentId => studentId.toString() === id)
      );
      
      if (!validStudents) {
        return res.status(400).json({ message: "Algunos estudiantes asignados no pertenecen a este grupo" });
      }
    }
    
    // Actualizar la tarea
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updates,
      { new: true }
    );
    
    res.json({ message: "Tarea actualizada correctamente", task: updatedTask });
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
});
// Agregar esta ruta a tu archivo de servidor Express

// Actualizar un grupo
app.put("/api/groups/:groupId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    
    // Verificar que el grupo existe y fue creado por este superadmin
    const group = await Group.findOne({ _id: groupId, created_by: req.user.userId });
    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }
    
    // Actualizar solo los campos proporcionados
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    await group.save();
    
    // Obtener el grupo actualizado con los estudiantes populados
    const updatedGroup = await Group.findById(groupId).populate('students', 'full_name email');
    
    res.json({ 
      message: "Grupo actualizado correctamente", 
      group: updatedGroup 
    });
  } catch (error) {
    console.error("Error al actualizar grupo:", error);
    res.status(500).json({ message: "Error al actualizar el grupo" });
  }
});

// Eliminar una tarea (solo superadmin)
app.delete("/api/tasks/:taskId", verifyToken, isSuperAdmin, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Obtener la tarea y verificar que pertenece a un grupo creado por este superadmin
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    const group = await Group.findOne({ 
      _id: task.group_id, 
      created_by: req.user.userId 
    });
    
    if (!group) {
      return res.status(403).json({ message: "No tienes permiso para eliminar esta tarea" });
    }
    
    await Task.findByIdAndDelete(taskId);
    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    res.status(500).json({ message: "Error al eliminar la tarea" });
  }
});

// ======= RUTAS PARA ESTUDIANTES =======
// Rutas para manejo de tareas personales de estudiantes
// Añadir a tu archivo server.js

// Definir esquema y modelo para tareas personales de estudiantes
const personalTaskSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserRecord", required: true },
  name_task: { type: String, required: true },
  description: { type: String },
  dead_line: { type: Date, required: true },
  status: { type: String, enum: ['In Progress', 'Done', 'Paused', 'Revision'], default: 'In Progress' },
  category: { type: String },
  completed: { type: Boolean, default: false },
  completed_at: { type: Date }
});

const PersonalTask = mongoose.model("PersonalTask", personalTaskSchema);

// Crear una tarea personal (estudiante)
app.post("/api/personal-tasks", verifyToken, async (req, res) => {
  try {
    const { name_task, description, dead_line, status, category } = req.body;
    
    const newTask = new PersonalTask({
      user_id: req.user.userId,
      name_task,
      description,
      dead_line,
      status: status || 'In Progress',
      category,
      completed: false
    });
    
    await newTask.save();
    res.status(201).json({ 
      message: "Tarea personal creada exitosamente", 
      task: newTask 
    });
  } catch (error) {
    console.error("Error al crear tarea personal:", error);
    res.status(500).json({ message: "Error al crear la tarea personal" });
  }
});

// Obtener todas las tareas personales del estudiante
app.get("/api/personal-tasks", verifyToken, async (req, res) => {
  try {
    const tasks = await PersonalTask.find({ user_id: req.user.userId });
    res.json(tasks);
  } catch (error) {
    console.error("Error al obtener tareas personales:", error);
    res.status(500).json({ message: "Error al obtener las tareas personales" });
  }
});

// Actualizar una tarea personal
app.put("/api/personal-tasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { name_task, description, dead_line, status, category } = req.body;
    
    // Verificar que la tarea existe y pertenece al usuario
    const task = await PersonalTask.findOne({ 
      _id: taskId, 
      user_id: req.user.userId 
    });
    
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    // Actualizar los campos
    if (name_task) task.name_task = name_task;
    if (description !== undefined) task.description = description;
    if (dead_line) task.dead_line = dead_line;
    if (status) task.status = status;
    if (category !== undefined) task.category = category;
    
    await task.save();
    res.json({ message: "Tarea actualizada exitosamente", task });
  } catch (error) {
    console.error("Error al actualizar tarea personal:", error);
    res.status(500).json({ message: "Error al actualizar la tarea personal" });
  }
});

// Eliminar una tarea personal
app.delete("/api/personal-tasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verificar que la tarea existe y pertenece al usuario
    const task = await PersonalTask.findOne({ 
      _id: taskId, 
      user_id: req.user.userId 
    });
    
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    await PersonalTask.findByIdAndDelete(taskId);
    res.json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar tarea personal:", error);
    res.status(500).json({ message: "Error al eliminar la tarea personal" });
  }
});

// Marcar tarea personal como completada/pendiente
app.post("/api/personal-tasks/:taskId/toggle-complete", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verificar que la tarea existe y pertenece al usuario
    const task = await PersonalTask.findOne({ 
      _id: taskId, 
      user_id: req.user.userId 
    });
    
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }
    
    // Cambiar el estado de completado
    task.completed = !task.completed;
    
    // Si se marca como completada, guardar la fecha
    if (task.completed) {
      task.completed_at = new Date();
    } else {
      task.completed_at = null;
    }
    
    await task.save();
    res.json({ 
      message: task.completed ? "Tarea marcada como completada" : "Tarea marcada como pendiente", 
      task 
    });
  } catch (error) {
    console.error("Error al cambiar estado de tarea:", error);
    res.status(500).json({ message: "Error al cambiar el estado de la tarea" });
  }
});

// Modificación a la ruta existente para completar tareas asignadas
// (Reemplaza o modifica la ruta existente)
app.post("/api/tasks/:taskId/complete", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verificar que la tarea existe y está asignada al estudiante
    const task = await Task.findOne({ 
      _id: taskId,
      assigned_to: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada o no asignada a ti" });
    }
    
    // Verificar si ya la completó
    const alreadyCompleted = task.completed_by.some(
      entry => entry.student.toString() === req.user.userId
    );
    
    if (alreadyCompleted) {
      // Si ya estaba completada, la marcamos como pendiente (toggle)
      task.completed_by = task.completed_by.filter(
        entry => entry.student.toString() !== req.user.userId
      );
      await task.save();
      return res.json({ message: "Tarea marcada como pendiente", task });
    } else {
      // Agregar al estudiante a la lista de quienes completaron la tarea
      task.completed_by.push({
        student: req.user.userId,
        completed_at: new Date()
      });
      
      await task.save();
      return res.json({ message: "Tarea marcada como completada", task });
    }
  } catch (error) {
    console.error("Error al cambiar estado de tarea:", error);
    res.status(500).json({ message: "Error al cambiar el estado de la tarea" });
  }
});
// Obtener grupos a los que pertenece un estudiante
app.get("/api/student/groups", verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ students: req.user.userId })
      .populate('created_by', 'full_name');
    
    res.json(groups);
  } catch (error) {
    console.error("Error al obtener grupos del estudiante:", error);
    res.status(500).json({ message: "Error al obtener los grupos" });
  }
});

// Marcar tarea como completada (solo estudiantes)
app.post("/api/tasks/:taskId/complete", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    // Verificar que la tarea existe y está asignada al estudiante
    const task = await Task.findOne({ 
      _id: taskId,
      assigned_to: req.user.userId
    });
    
    if (!task) {
      return res.status(404).json({ message: "Tarea no encontrada o no asignada a ti" });
    }
    
    // Verificar si ya la completó
    const alreadyCompleted = task.completed_by.some(
      entry => entry.student.toString() === req.user.userId
    );
    
    if (alreadyCompleted) {
      return res.status(400).json({ message: "Ya has marcado esta tarea como completada" });
    }
    
    // Agregar al estudiante a la lista de quienes completaron la tarea
    task.completed_by.push({
      student: req.user.userId,
      completed_at: new Date()
    });
    
    await task.save();
    res.json({ message: "Tarea marcada como completada exitosamente", task });
  } catch (error) {
    console.error("Error al completar tarea:", error);
    res.status(500).json({ message: "Error al marcar la tarea como completada" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});