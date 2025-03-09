// EditTaskModal.jsx - Modal para editar tareas
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Select } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const EditTaskModal = ({ 
  visible, 
  onCancel, 
  onFinish, 
  form,
  loading = false
}) => {
  return (
    <Modal
      title="Editar Tarea"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="name_task"
          label="Nombre de la Tarea"
          rules={[{ required: true, message: 'Por favor ingresa el nombre de la tarea' }]}
        >
          <Input placeholder="Nombre de la tarea" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Descripción"
          rules={[{ required: true, message: 'Por favor ingresa una descripción' }]}
        >
          <TextArea rows={4} placeholder="Descripción de la tarea" />
        </Form.Item>
        <Form.Item
          name="dead_line"
          label="Fecha de Vencimiento"
          rules={[{ required: true, message: 'Por favor selecciona una fecha de vencimiento' }]}
        >
          <Input type="datetime-local" />
        </Form.Item>
        <Form.Item
          name="status"
          label="Estado"
          rules={[{ required: true, message: 'Por favor selecciona un estado' }]}
        >
          <Select>
            <Option value="In Progress">En Progreso</Option>
            <Option value="Done">Completada</Option>
            <Option value="Paused">Pausada</Option>
            <Option value="Revision">En Revisión</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="category"
          label="Categoría"
        >
          <Input placeholder="Categoría de la tarea" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Actualizar Tarea
          </Button>
          <Button 
            onClick={onCancel} 
            style={{ marginLeft: 8 }}
          >
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTaskModal;