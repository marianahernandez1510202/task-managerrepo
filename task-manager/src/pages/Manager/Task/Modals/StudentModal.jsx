// StudentModal.jsx - Modal para agregar estudiantes a un grupo
import React from 'react';
import { Modal, Form, Button, Select } from 'antd';

const { Option } = Select;

const StudentModal = ({ 
  visible, 
  onCancel, 
  onFinish, 
  form, 
  students,
  selectedGroup,
  loading = false
}) => {
  return (
    <Modal
      title={`Agregar Estudiantes a ${selectedGroup?.name || 'grupo'}`}
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
          name="students"
          label="Seleccionar Estudiantes"
          rules={[{ required: true, message: 'Por favor selecciona al menos un estudiante' }]}
        >
          <Select 
            mode="multiple" 
            placeholder="Selecciona estudiantes"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {students.map(student => (
              <Option key={student._id} value={student._id}>
                {student.full_name} ({student.email})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Agregar Estudiantes
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

export default StudentModal;