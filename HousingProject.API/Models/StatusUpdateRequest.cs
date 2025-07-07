using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HousingProject.API.Models;

public class StatusUpdateRequest
{
    [Required]
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MCRFormStatus Status { get; set; }
    
    public string? Comments { get; set; }
} 