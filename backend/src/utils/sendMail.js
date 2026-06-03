import nodemailer from 'nodemailer';
import envs from '../config/envs.js';
import ApiError from './ApiError.js';


/**
 * Sends an email using nodemailer.
 * @param {string} to - Recipient email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Email text content.
 * @param {string} html - Email HTML content.
 */
export default async function ({ to, subject, text, html }) {
    if (!to || !subject) throw new ApiError(400, 'Missing required email fields: to and subject are required.');

    const { host, port, user, pass } = envs.mail;
    if (!user || !pass) throw new ApiError(500, 'SMTP credentials are not configured.');

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: false,
            auth: { user, pass }
        });

        const getContent = () => (html ? { html } : { text });

        const mailOptions = {
            from: user,
            to,
            subject,
            ...getContent()
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new ApiError(500, 'Failed to send email: ' + error.message);
    }
}