using System.Net.Mail;
using System.Net;

namespace HousingProject.API.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body);
    Task SendMCRNotificationAsync(string to, string tenantName, string mcrType);
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

            using var client = new SmtpClient(smtpServer, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUsername, smtpPassword)
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            message.To.Add(to);

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            throw;
        }
    }

    public async Task SendMCRNotificationAsync(string to, string tenantName, string mcrType)
    {
        var subject = "New MCR Form Submission";
        var body = $@"
            <h2>New Manual Check Request (MCR) Form Submitted</h2>
            <p><strong>Tenant Name:</strong> {tenantName}</p>
            <p><strong>MCR Type:</strong> {mcrType}</p>
            <p>Please review the submission in the system.</p>
            <p>Thank you,<br>Housing Project System</p>";

        await SendEmailAsync(to, subject, body);
    }
} 