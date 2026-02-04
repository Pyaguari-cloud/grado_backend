import axios from 'axios';

const sendEmail = async ({ to, subject, html }) => {
  // URL oficial de la API v3 de Brevo
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  // Datos del correo
  const emailData = {
    sender: { 
        // IMPORTANTE: Este correo debe estar validado en "Senders" en Brevo
        name: "UEPMRMP", 
        email: process.env.EMAIL_USER 
    },
    to: [{ email: to }], 
    subject: subject,
    htmlContent: html,
  };

  try {
    const response = await axios.post(url, emailData, {
      headers: {
        'api-key': process.env.BREVO_API_KEY, // Usaremos esta nueva variable
        'Content-Type': 'application/json',
        'accept': 'application/json'
      },
    });

    console.log('✅ Correo enviado vía API. ID:', response.data.messageId);
    return true; // Retornamos true para confirmar éxito
    
  } catch (error) {
    // Si falla, mostramos el error detallado que devuelve Brevo
    console.error('❌ Error enviando correo:', error.response?.data || error.message);
    throw new Error('No se pudo enviar el correo');
  }
};

export default sendEmail;