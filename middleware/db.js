import { createTransport } from "nodemailer";

const sendmail = async (email, subject, otp) => {
    // Create the transporter object using Gmail's SMTP settings
    const transport = createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // Ensures the connection uses SSL/TLS
        auth: {
            user: process.env.GMAIL_USER, // Ensure correct environment variable is used
            pass: process.env.GMAIL_PASSWORD, // Ensure correct environment variable is used
        },
    });

    // Email HTML content
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            h1 {
                color: red;
            }
            p {
                margin-bottom: 20px;
                color: #666;
            }
            .otp {
                font-size: 36px;
                color: #7b68ee; /* Purple text */
                margin-bottom: 30px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>OTP Verification</h1>
            <p>Hello ${email}, your (One-Time Password) for your account verification is:</p>
            <p class="otp">${otp}</p>
        </div>
    </body>
    </html>
    `;

    try {
        // Send email
        await transport.sendMail({
            from: process.env.GMAIL_USER, // Ensure correct environment variable is used
            to: email,
            subject,
            html,
        });
        console.log("OTP email sent successfully to", email);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send OTP email.");
    }
};

export default sendmail;