import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EmailService {
  static async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
    try {
      await resend.emails.send({
        from: 'DSATutor <noreply@dsatutor.com>',
        to: email,
        subject: 'Welcome to DSATutor!',
        html: `
          <h1>Welcome to DSATutor, ${fullName}!</h1>
          <p>Thank you for joining our AI-powered DSA learning platform.</p>
          <p>Start your journey to mastering Data Structures and Algorithms today!</p>
          <p>Best regards,<br>The DSATutor Team</p>
        `
      })
      console.log('Welcome email sent to:', email)
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      throw error
    }
  }

  static async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      await resend.emails.send({
        from: 'DSATutor <noreply@dsatutor.com>',
        to: email,
        subject: 'Reset Your DSATutor Password',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested a password reset for your DSATutor account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The DSATutor Team</p>
        `
      })
      console.log('Password reset email sent to:', email)
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw error
    }
  }
} 