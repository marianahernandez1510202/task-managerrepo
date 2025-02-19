  import React, { useState, useEffect } from "react";
  import { Button, Modal, Form, Input, Select, DatePicker, TimePicker, Card, Tag, Row, Col } from "antd";
  import { PlusOutlined } from "@ant-design/icons";
  import axios from "axios";
  import moment from "moment";

  const { Option } = Select;

  const DashboardPage = () => {
    const [tasks, setTasks] = useState([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();

    // Obtener tareas desde el servidor
    useEffect(() => {
      const fetchTasks = async () => {
        const response = await axios.get("http://localhost:5000/api/tasks");
        setTasks(response.data);
      };
      fetchTasks();
    }, []);

    // Mostrar el modal
    const showModal = () => {
      setVisible(true);
    };

    // Cerrar el modal
    const handleCancel = () => {
      setVisible(false);
      form.resetFields();
    };

    // Manejar el envío del formulario
    const handleOk = async () => {
      const values = await form.validateFields();
      const deadlineDate = values.dead_line.format("YYYY-MM-DD");
      const deadlineTime = values.time ? values.time.format("HH:mm:ss") : "00:00:00"; // Si no se selecciona hora, poner 00:00:00
      values.dead_line = `${deadlineDate} ${deadlineTime}`;

      await axios.post("http://localhost:5000/api/tasks", values);

      // Actualizar la lista de tareas
      const response = await axios.get("http://localhost:5000/api/tasks");
      setTasks(response.data);

      // Cerrar el modal y resetear el formulario
      setVisible(false);
      form.resetFields();
    };

    // Colores para el estado de la tarea
    const getStatusColor = (status) => {
      switch (status) {
        case "In Progress":
          return "#1890FF"; // Azul
        case "Done":
          return "#52C41A"; // Verde
        case "Paused":
          return "#FA8C16"; // Naranja
        case "Revision":
          return "#FF4D4F"; // Rojo
        default:
          return "#B0B0B0"; // Gris
      }
    };

    return (
      <div style={{ padding: "30px", backgroundColor: "#F0F2F5" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>Panel de Tareas</h1>

        <Row gutter={[16, 16]}>
          {tasks.map((task) => (
            <Col xs={24} sm={12} md={8} lg={6} key={task._id}>
              <Card
                title={task.name_task}
                bordered={false}
                style={{
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <p>{task.description}</p>
                <Tag color={getStatusColor(task.status)}>{task.status}</Tag>
                <p style={{ fontSize: "14px", color: "#8C8C8C", marginTop: "10px" }}>
                  Fecha límite: {moment(task.dead_line).format("DD/MM/YYYY HH:mm")}
                </p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Botón flotante */}
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#1890FF",
            color: "#fff",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
          }}
          onClick={showModal}
        />

        {/* Modal para agregar tarea */}
        <Modal
          title="Agregar Tarea"
          open={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Guardar"
          cancelText="Cancelar"
          style={{
            top: "50px",
          }}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Nombre de la tarea"
              name="name_task"
              rules={[{ required: true, message: "Por favor ingrese el nombre de la tarea" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Descripción"
              name="description"
              rules={[{ required: true, message: "Por favor ingrese una descripción" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="Fecha límite"
              name="dead_line"
              rules={[{ required: true, message: "Por favor seleccione la fecha límite" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Hora límite"
              name="time"
              rules={[{ required: true, message: "Por favor seleccione la hora límite" }]}
            >
              <TimePicker style={{ width: "100%" }} format="HH:mm" />
            </Form.Item>
            <Form.Item
              label="Estado"
              name="status"
              rules={[{ required: true, message: "Por favor seleccione el estado" }]}
            >
              <Select placeholder="Seleccione un estado">
                <Option value="In Progress">En progreso</Option>
                <Option value="Done">Hecho</Option>
                <Option value="Paused">Pausado</Option>
                <Option value="Revision">Revisión</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Categoría"
              name="category"
              rules={[{ required: true, message: "Por favor seleccione la categoría" }]}
            >
              <Select placeholder="Seleccione una categoría">
                <Option value="Work">Trabajo</Option>
                <Option value="Personal">Personal</Option>
                <Option value="Other">Otro</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  };

  export default DashboardPage;
