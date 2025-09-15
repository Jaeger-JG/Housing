using System.Net.Mail;
using System.Net;
using Microsoft.Extensions.Logging;

namespace HousingProject.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendEmailAsync(string[] to, string subject, string body);
    Task SendMCRNotificationAsync(string tenantName, string mcrType, int formId, string housingSpecialistName);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        await SendEmailAsync(new[] { to }, subject, body);
    }

    public async Task SendEmailAsync(string[] to, string subject, string body)
    {
        try
        {
            var smtpServer = _configuration["SMTP:Server"];
            var smtpPort = int.Parse(_configuration["SMTP:Port"] ?? "587");
            var smtpUsername = _configuration["SMTP:Username"];
            var smtpPassword = _configuration["SMTP:Password"];
            var fromEmail = _configuration["SMTP:FromEmail"];

            if (string.IsNullOrEmpty(smtpServer) || string.IsNullOrEmpty(smtpUsername) || 
                string.IsNullOrEmpty(smtpPassword) || string.IsNullOrEmpty(fromEmail))
            {
                throw new InvalidOperationException("SMTP configuration is incomplete");
            }

            // Set SSL certificate validation callback to bypass validation for internal SMTP servers
            if (smtpPort == 587 || smtpPort == 465)
            {
                ServicePointManager.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) => true;
            }

            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = smtpPort == 587 || smtpPort == 465, // Only enable SSL for standard secure ports
                Credentials = new NetworkCredential(smtpUsername, smtpPassword)
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            
            foreach (var email in to)
            {
                message.To.Add(email);
            }

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {Recipients}", string.Join(", ", to));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipients}", string.Join(", ", to));
            throw;
        }
    }

    public async Task SendMCRNotificationAsync(string tenantName, string mcrType, int formId, string housingSpecialistName)
    {
        var subject = $"New MCR Form Submission - {tenantName} (ID: {formId})";
        
        var body = $@"
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .header {{ background-color: #667eea; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .details {{ background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                    .footer {{ background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                    .highlight {{ color: #667eea; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class='header'>
                    <h1>New Manual Check Request (MCR) Form Submission</h1>
                </div>
                <div class='content'>
                    <p>A new MCR form has been submitted and requires your approval or rejection.</p>
                    
                    <div class='details'>
                        <h3>Form Details:</h3>
                        <p><span class='highlight'>Form ID:</span> {formId}</p>
                        <p><span class='highlight'>Tenant Name:</span> {tenantName}</p>
                        <p><span class='highlight'>MCR Type:</span> {mcrType}</p>
                        <p><span class='highlight'>Submitted By:</span> {housingSpecialistName}</p>
                        <p><span class='highlight'>Submission Date:</span> {DateTime.Now:MM/dd/yyyy HH:mm}</p>
                    </div>
                    
                    <p><strong>Action Required:</strong> Please log into the Housing Management System to review and approve or reject this MCR form.</p>
                    
                    <p><strong>Next Steps:</strong></p>
                    <ol>
                        <li>Log into the Housing Management System</li>
                        <li>Navigate to the Forms List</li>
                        <li>Find Form ID: {formId}</li>
                        <li>Click &quot;View Details&quot; to review the complete form</li>
                        <li>Click &quot;Approve&quot; or &quot;Reject&quot; as appropriate</li>
                    </ol>
                    
                    <p>If you have any questions, please contact the housing specialist who submitted this form.</p>
                </div>
                <div class='footer'>
                    <p>This is an automated notification from the Vallejo Housing Management System.</p>
                    <p>Please do not reply to this email.</p>
                </div>
            </body>
            </html>";

        // Send notification to the approver (justin.grier@cityofvallejo.net)
        var approverEmail = _configuration["SMTP:NotificationRecipients"];
        if (!string.IsNullOrEmpty(approverEmail))
        {
            await SendEmailAsync(approverEmail, subject, body);
            _logger.LogInformation("MCR form notification sent to approver: {ApproverEmail}", approverEmail);
        }
        else
        {
            _logger.LogWarning("No approver email configured for MCR notifications");
        }
    }
} 