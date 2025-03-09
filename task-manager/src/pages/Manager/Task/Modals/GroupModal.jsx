// GroupModal.jsx - Modal para crear o editar grupos
import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';

const { TextArea } = Input;

const GroupModal = ({ 
  visible, 
  onCancel, 
  onFinish, 
  form, 
  selectedGroup,
  loading = false
}) => {
  // Cuando cambia selectedGroup, actualizar los campos del formulario
  useEffect(() => {
    if (selectedGroup) {
      form.setFieldsValue({
        name: selectedGroup.name,
        description: selectedGroup.description || ''
      });
    } else {
      form.resetFields();
    }
  }, [selectedGroup, form, visible]);

  const handleSubmit = async (values) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error en el envío del formulario:", error);
      message.error("Ocurrió un error al procesar el formulario");
    }
  };

  return (
    <Modal
      title={selectedGroup ? "Editar Grupo" : "Crear Grupo"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ name: '', description: '' }}
      >
        <Form.Item
          name="name"
          label="Nombre del Grupo"
          rules={[{ required: true, message: 'Por favor ingresa el nombre del grupo' }]}
        >
          <Input placeholder="Nombre del grupo" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="Descripción"
        >
          <TextArea rows={4} placeholder="Descripción del grupo" />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {selectedGroup ? "Actualizar Grupo" : "Crear Grupo"}
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

export default GroupModal;