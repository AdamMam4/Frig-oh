import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.app_name = "Frig'Oh"
    
    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        return bool(self.smtp_username and self.smtp_password)
    
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email using SMTP."""
        if not self.is_configured():
            print("⚠️ Email service not configured. Set SMTP_USERNAME and SMTP_PASSWORD in .env")
            return False
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.app_name} <{self.from_email}>"
            msg["To"] = to_email
            
            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.sendmail(self.from_email, to_email, msg.as_string())
            
            print(f"✅ Email envoyé à {to_email}")
            return True
        except Exception as e:
            print(f"❌ Erreur envoi email: {type(e).__name__}: {str(e)}")
            return False
    
    def send_password_reset_email(self, to_email: str, reset_code: str) -> bool:
        """Send a password reset email with a 6-digit code."""
        subject = f"🔐 {self.app_name} - Code de réinitialisation de mot de passe"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    background-color: #1a1a1a;
                    color: #ffffff;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #2a2a2a;
                    border-radius: 12px;
                    padding: 40px;
                }}
                .logo {{
                    text-align: center;
                    font-size: 28px;
                    color: #FFD700;
                    margin-bottom: 30px;
                }}
                h1 {{
                    color: #FFD700;
                    font-size: 24px;
                    margin-bottom: 20px;
                }}
                .code-box {{
                    background-color: #1a1a1a;
                    border: 2px solid #FFD700;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                    margin: 30px 0;
                }}
                .code {{
                    font-size: 32px;
                    font-weight: bold;
                    color: #FFD700;
                    letter-spacing: 8px;
                }}
                .warning {{
                    color: #ff6b6b;
                    font-size: 14px;
                    margin-top: 20px;
                }}
                .footer {{
                    text-align: center;
                    color: #888;
                    font-size: 12px;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #444;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">🍳 {self.app_name}</div>
                <h1>Réinitialisation de votre mot de passe</h1>
                <p>Bonjour,</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de vérification :</p>
                
                <div class="code-box">
                    <div class="code">{reset_code}</div>
                </div>
                
                <p>Entrez ce code dans l'application pour définir votre nouveau mot de passe.</p>
                
                <p class="warning">⚠️ Ce code expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                
                <div class="footer">
                    <p>Cet email a été envoyé automatiquement par {self.app_name}.</p>
                    <p>Ne partagez jamais ce code avec personne.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return self.send_email(to_email, subject, html_content)


email_service = EmailService()
