// pages/user/settings.jsx

import React, { useState, useContext, useEffect } from 'react';
import { 
  Card, Typography, List, Switch, Divider, Row, Col, Tabs, 
  Button, message, Form, Radio, Select, TimePicker, Modal, Empty
} from 'antd';
import { 
  BellOutlined, 
  MailOutlined, 
  EyeOutlined, 
  LockOutlined, 
  GlobalOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { ThemeContext } from '../../context/ThemeContext';

const { Title, Text, Paragraph } = Typography;  
const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [formNotifications] = Form.useForm();
  const [formAppearance] = Form.useForm();
  
  // Estados para los diferentes ajustes
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    darkMode: theme === 'dark',
    language: 'es',
    timezone: 'America/Mexico_City',
    reminderTime: null,
  });
  
  // Cargar configuraciones del usuario
  useEffect(() => {
    // Aquí podrías hacer una petición al backend para obtener las configuraciones del usuario
    // Por ahora usamos valores predeterminados
    formNotifications.setFieldsValue({
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      taskReminders: settings.taskReminders,
      reminderTime: settings.reminderTime ? moment(settings.reminderTime) : null
    });
    
    formAppearance.setFieldsValue({
      darkMode: settings.darkMode,
      language: settings.language,
      timezone: settings.timezone
    });
  }, [settings, formNotifications, formAppearance]);
  
  // Guardar configuraciones de notificaciones
  const saveNotificationSettings = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Aquí harías la petición al backend para guardar las configuraciones
      // await axios.post('http://localhost:5000/api/settings/notifications', values, { headers });
      
      // Por ahora solo actualizamos el estado local
      setSettings(prev => ({
        ...prev,
        emailNotifications: values.emailNotifications,
        pushNotifications: values.pushNotifications,
        taskReminders: values.taskReminders,
        reminderTime: values.reminderTime ? values.reminderTime.format('HH:mm') : null
      }));
      
      message.success('Configuraciones de notificaciones guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      message.error('Error al guardar las configuraciones');
    } finally {
      setLoading(false);
    }
  };
  
  // Guardar configuraciones de apariencia
  const saveAppearanceSettings = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { "Authorization": `Bearer ${token}` };
      
      // Aquí harías la petición al backend para guardar las configuraciones
      // await axios.post('http://localhost:5000/api/settings/appearance', values, { headers });
      
      // Actualizar el tema usando ThemeContext
      toggleTheme(values.darkMode);
      
      // Por ahora solo actualizamos el estado local
      setSettings(prev => ({
        ...prev,
        darkMode: values.darkMode,
        language: values.language,
        timezone: values.timezone
      }));
      
      message.success('Configuraciones de apariencia guardadas correctamente');
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      message.error('Error al guardar las configuraciones');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <Title level={2} style={{ color: '#6a11cb', marginBottom: 24 }}>Configuraciones</Title>
      
      <Tabs defaultActiveKey="notifications">
        <TabPane 
          tab={
            <span>
              <BellOutlined />
              Notificaciones
            </span>
          } 
          key="notifications"
        >
          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
            <Form
              form={formNotifications}
              layout="vertical"
              onFinish={saveNotificationSettings}
              initialValues={{
                emailNotifications: true,
                pushNotifications: true,
                taskReminders: true
              }}
            >
              <Form.Item name="emailNotifications" valuePropName="checked">
                <List.Item
                  actions={[
                    <Switch 
                      checked={settings.emailNotifications} 
                      onChange={(checked) => {
                        formNotifications.setFieldsValue({ emailNotifications: checked });
                        setSettings(prev => ({ ...prev, emailNotifications: checked }));
                      }}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<MailOutlined style={{ fontSize: 24, color: '#6a11cb' }} />}
                    title="Notificaciones por Correo"
                    description="Recibe notificaciones por correo electrónico cuando se te asigne una nueva tarea"
                  />
                </List.Item>
              </Form.Item>
              
              <Divider />
              
              <Form.Item name="pushNotifications" valuePropName="checked">
                <List.Item
                  actions={[
                    <Switch 
                      checked={settings.pushNotifications} 
                      onChange={(checked) => {
                        formNotifications.setFieldsValue({ pushNotifications: checked });
                        setSettings(prev => ({ ...prev, pushNotifications: checked }));
                      }}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<BellOutlined style={{ fontSize: 24, color: '#6a11cb' }} />}
                    title="Notificaciones Push"
                    description="Recibe notificaciones push en el navegador cuando haya actualizaciones"
                  />
                </List.Item>
              </Form.Item>
              
              <Divider />
              
              <Form.Item name="taskReminders" valuePropName="checked">
                <List.Item
                  actions={[
                    <Switch 
                      checked={settings.taskReminders} 
                      onChange={(checked) => {
                        formNotifications.setFieldsValue({ taskReminders: checked });
                        setSettings(prev => ({ ...prev, taskReminders: checked }));
                      }}
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={<ClockCircleOutlined style={{ fontSize: 24, color: '#6a11cb' }} />}
                    title="Recordatorios de Tareas"
                    description="Recibe recordatorios de tareas próximas a vencer"
                  />
                </List.Item>
              </Form.Item>
              
              {settings.taskReminders && (
                <Form.Item
                  name="reminderTime"
                  label="Hora de recordatorio"
                  style={{ marginLeft: 48 }}
                >
                  <TimePicker 
                    format="HH:mm" 
                    placeholder="Selecciona la hora" 
                    style={{ width: 200 }}
                  />
                </Form.Item>
              )}
              
              <Form.Item style={{ marginTop: 24 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  style={{ backgroundColor: '#6a11cb', borderColor: '#6a11cb' }}
                >
                  Guardar Configuraciones
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <EyeOutlined />
              Apariencia
            </span>
          } 
          key="appearance"
        >
          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
            <Form
              form={formAppearance}
              layout="vertical"
              onFinish={saveAppearanceSettings}
              initialValues={{
                darkMode: theme === 'dark',
                language: 'es',
                timezone: 'America/Mexico_City'
              }}
            >
              <Form.Item name="darkMode" label="Tema">
                <Radio.Group 
                  onChange={(e) => {
                    setSettings(prev => ({ ...prev, darkMode: e.target.value }));
                  }}
                >
                  <Radio.Button value={false}>Claro</Radio.Button>
                  <Radio.Button value={true}>Oscuro</Radio.Button>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item name="language" label="Idioma">
                <Select
                  style={{ width: 200 }}
                  onChange={(value) => {
                    setSettings(prev => ({ ...prev, language: value }));
                  }}
                >
                  <Option value="es">Español</Option>
                  <Option value="en">English</Option>
                  <Option value="fr">Français</Option>
                  <Option value="pt">Português</Option>
                </Select>
              </Form.Item>
              
              <Form.Item name="timezone" label="Zona Horaria">
                <Select
                  style={{ width: 300 }}
                  showSearch
                  optionFilterProp="children"
                  onChange={(value) => {
                    setSettings(prev => ({ ...prev, timezone: value }));
                  }}
                >
                  <Option value="America/Mexico_City">Ciudad de México (GMT-6)</Option>
                  <Option value="America/New_York">Nueva York (GMT-5)</Option>
                  <Option value="America/Los_Angeles">Los Ángeles (GMT-8)</Option>
                  <Option value="Europe/Madrid">Madrid (GMT+1)</Option>
                  <Option value="Europe/London">Londres (GMT+0)</Option>
                  <Option value="Asia/Tokyo">Tokio (GMT+9)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item style={{ marginTop: 24 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  style={{ backgroundColor: '#6a11cb', borderColor: '#6a11cb' }}
                >
                  Guardar Configuraciones
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <LockOutlined />
              Privacidad y Seguridad
            </span>
          } 
          key="privacy"
        >
          <Card style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}>
            <Title level={4}>Privacidad y Seguridad</Title>
            <Paragraph>Aquí podrás configurar las opciones de privacidad y seguridad de tu cuenta.</Paragraph>
            
            <Empty 
              description="Función no disponible actualmente" 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;