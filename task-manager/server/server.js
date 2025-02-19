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

  // Definir esquema y modelo para Tareas
  const taskSchema = new mongoose.Schema({
    name_task: String,
    description: String,
    dead_line: Date,
    status: String,
    category: String,
  });

  const Task = mongoose.model("Task", taskSchema);

  // Definir esquema y modelo para Usuario (user_records)
  const userSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    date_of_birth: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date, default: Date.now },
  });

  const User = mongoose.model("UserRecord", userSchema);

  // Ruta de registro de usuario
  app.post("/api/register", async (req, res) => {
    const { full_name, date_of_birth, email, password } = req.body;

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
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser });
  });

  // Ruta de inicio de sesión
// Ruta de inicio de sesión
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario existe
  const user = await User.findOne({ email });
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
    { userId: user._id, email: user.email },
    "your_jwt_secret", // Aquí debes usar un secreto más seguro
    { expiresIn: "1h" }
  );

  // Actualizar el último inicio de sesión
  user.last_login = Date.now();
  await user.save();

  res.status(200).json({ success: true, message: "Inicio de sesión exitoso", token });
});

  // Ruta para agregar tareas
  app.post("/api/tasks", async (req, res) => {
    const { name_task, description, dead_line, status, category } = req.body;
    const newTask = new Task({
      name_task,
      description,
      dead_line,
      status,
      category,
    });
    await newTask.save();
    res.status(201).json(newTask);
  });

  // Ruta para obtener tareas
  app.get("/api/tasks", async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
  });

  // Iniciar servidor
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
