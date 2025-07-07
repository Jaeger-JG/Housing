using System.ComponentModel.DataAnnotations;

namespace HousingProject.API.Models;

public class Form
{
    public int Id { get; set; }

    [Required]
    public string FormType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; } = "Pending";

    public MCRForm? MCRForm { get; set; }
}