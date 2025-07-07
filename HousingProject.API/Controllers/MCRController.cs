using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HousingProject.API.Data;
using HousingProject.API.Models;
using HousingProject.API.Services;

namespace HousingProject.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MCRController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<MCRController> _logger;

    public MCRController(ApplicationDbContext context, IEmailService emailService, ILogger<MCRController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<MCRForm>> SubmitMCRForm(MCRForm mcrForm)
    {
        _logger.LogInformation("MCR form submission received");
        
        try
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Model state is invalid: {Errors}", string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            _logger.LogInformation("Creating parent Form record");
            // Create the parent Form record
            var form = new Form
            {
                FormType = "MCR",
                CreatedAt = DateTime.UtcNow,
                Status = "Pending"
            };

            _context.Forms.Add(form);
            await _context.SaveChangesAsync(); // This will generate the Form.Id
            _logger.LogInformation("Parent Form created with ID: {FormId}", form.Id);

            // Set the FormId and creation timestamp for MCR form
            mcrForm.FormId = form.Id;
            mcrForm.CreatedAt = DateTime.UtcNow;
            mcrForm.Status = MCRFormStatus.Pending; // Explicitly set to ensure it's not null

            _logger.LogInformation("MCR Form Status set to: {Status}", mcrForm.Status);

            _context.MCRForms.Add(mcrForm);
            await _context.SaveChangesAsync();
            _logger.LogInformation("MCR Form created with ID: {MCRFormId}", mcrForm.Id);

            // Send email notification
            try
            {
                await _emailService.SendMCRNotificationAsync(
                    mcrForm.TenantName,
                    mcrForm.MCRType,
                    mcrForm.Id,
                    mcrForm.HousingSpecialistName
                );
                _logger.LogInformation("Email notification sent successfully for MCR form {Id}", mcrForm.Id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send email notification for MCR form {Id}", mcrForm.Id);
                // Don't fail the submission if email fails
            }

            _logger.LogInformation("MCR form submission completed successfully");
            return CreatedAtAction(nameof(GetMCRForm), new { id = mcrForm.Id }, mcrForm);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting MCR form");
            return StatusCode(500, "An error occurred while submitting the form");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MCRForm>> GetMCRForm(int id)
    {
        var mcrForm = await _context.MCRForms
            .Include(m => m.Form)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (mcrForm == null)
        {
            return NotFound();
        }

        return mcrForm;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MCRForm>>> GetMCRForms()
    {
        try
        {
            _logger.LogInformation("Fetching all MCR forms");
            
            var forms = await _context.MCRForms
                .Include(m => m.Form)
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();
                
            _logger.LogInformation("Successfully fetched {Count} MCR forms", forms.Count);
            return forms;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching MCR forms");
            return StatusCode(500, $"An error occurred while fetching forms: {ex.Message}");
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateMCRFormStatus(int id, [FromBody] StatusUpdateRequest request)
    {
        var existingForm = await _context.MCRForms
            .Include(m => m.Form)
            .FirstOrDefaultAsync(m => m.Id == id);
            
        if (existingForm == null)
        {
            return NotFound();
        }

        // Validate the status
        if (!Enum.IsDefined(typeof(MCRFormStatus), request.Status))
        {
            return BadRequest("Invalid status value");
        }

        existingForm.Status = request.Status;
        existingForm.UpdatedAt = DateTime.UtcNow;
        if (existingForm.Form != null)
        {
            existingForm.Form.Status = request.Status.ToString();
            existingForm.Form.UpdatedAt = DateTime.UtcNow;
        }

        try
        {
            await _context.SaveChangesAsync();
            _logger.LogInformation("MCR Form {Id} status updated to {Status}", id, request.Status);
            
            // Send status update notification
            try
            {
                var subject = $"MCR Form Status Updated - {existingForm.TenantName} (ID: {id})";
                var statusText = request.Status.ToString();
                var body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .header {{ background-color: #667eea; color: white; padding: 20px; text-align: center; }}
                            .content {{ padding: 20px; }}
                            .status {{ padding: 10px; border-radius: 5px; margin: 15px 0; font-weight: bold; }}
                            .approved {{ background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }}
                            .rejected {{ background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }}
                            .pending {{ background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }}
                            .footer {{ background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                        </style>
                    </head>
                    <body>
                        <div class='header'>
                            <h1>MCR Form Status Update</h1>
                        </div>
                        <div class='content'>
                            <p>The status of an MCR form has been updated.</p>
                            
                            <div class='status {statusText.ToLower()}'>
                                <h3>New Status: {statusText.ToUpper()}</h3>
                            </div>
                            
                            <h3>Form Details:</h3>
                            <p><strong>Form ID:</strong> {id}</p>
                            <p><strong>Tenant Name:</strong> {existingForm.TenantName}</p>
                            <p><strong>MCR Type:</strong> {existingForm.MCRType}</p>
                            <p><strong>Housing Specialist:</strong> {existingForm.HousingSpecialistName}</p>
                            <p><strong>Updated Date:</strong> {DateTime.Now:MM/dd/yyyy HH:mm}</p>
                            
                            <p>Please log into the Housing Management System for more details.</p>
                        </div>
                        <div class='footer'>
                            <p>This is an automated notification from the Vallejo Housing Management System.</p>
                            <p>Please do not reply to this email.</p>
                        </div>
                    </body>
                    </html>";

                // Send status update notification to the housing specialist who submitted the form
                await _emailService.SendEmailAsync(existingForm.HousingSpecialistEmail, subject, body);
                _logger.LogInformation("Status update notification sent to housing specialist for MCR form {Id}", id);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send status update notification for MCR form {Id}", id);
                // Don't fail the status update if email fails
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating MCR Form {Id} status", id);
            return StatusCode(500, "An error occurred while updating the form status");
        }

        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMCRForm(int id, MCRForm mcrForm)
    {
        if (id != mcrForm.Id)
        {
            return BadRequest();
        }

        var existingForm = await _context.MCRForms
            .Include(m => m.Form)
            .FirstOrDefaultAsync(m => m.Id == id);
            
        if (existingForm == null)
        {
            return NotFound();
        }

        existingForm.UpdatedAt = DateTime.UtcNow;
        existingForm.Form!.UpdatedAt = DateTime.UtcNow;
        _context.Entry(existingForm).CurrentValues.SetValues(mcrForm);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!MCRFormExists(id))
            {
                return NotFound();
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMCRForm(int id)
    {
        var mcrForm = await _context.MCRForms
            .Include(m => m.Form)
            .FirstOrDefaultAsync(m => m.Id == id);
            
        if (mcrForm == null)
        {
            return NotFound();
        }

        // Delete both the MCR form and the parent form (cascade delete)
        _context.MCRForms.Remove(mcrForm);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool MCRFormExists(int id)
    {
        return _context.MCRForms.Any(e => e.Id == id);
    }
} 