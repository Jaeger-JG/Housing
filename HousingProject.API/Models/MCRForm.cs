using System.ComponentModel.DataAnnotations;

namespace HousingProject.API.Models;

public class MCRForm
{
    public int Id { get; set; }
    
    [Required]
    public string HousingSpecialistName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string HousingSpecialistEmail { get; set; } = string.Empty;
    
    [Required]
    public DateTime Date { get; set; }
    
    [Required]
    public string ProgramType { get; set; } = string.Empty;
    
    [Required]
    [StringLength(4, MinimumLength = 4)]
    public string LastFourSSN { get; set; } = string.Empty;
    
    [Required]
    public string TenantName { get; set; } = string.Empty;
    
    [Required]
    public string OwnerAccountNumber { get; set; } = string.Empty;
    
    // Unit Address
    [Required]
    public string AddressLine1 { get; set; } = string.Empty;
    
    public string? AddressLine2 { get; set; }
    
    [Required]
    public string City { get; set; } = string.Empty;
    
    [Required]
    public string State { get; set; } = string.Empty;
    
    [Required]
    public string ZipCode { get; set; } = string.Empty;
    
    // Landlord Information
    [Required]
    public string LandlordFirstName { get; set; } = string.Empty;
    
    [Required]
    public string LandlordLastName { get; set; } = string.Empty;
    
    [Required]
    public DateTime EffectiveDate { get; set; }
    
    // Payment Date Range
    [Required]
    public DateTime StartDate { get; set; }
    
    [Required]
    public DateTime EndDate { get; set; }
    
    public string? ReasonComments { get; set; }
    
    [Required]
    public string MCRType { get; set; } = string.Empty;
    
    // Verification Checkboxes
    public bool ThirdPartyPaymentsVerified { get; set; }
    public bool TransactionScreenVerified { get; set; }
    public bool OverlappingHAP { get; set; }
    
    // Radio Button Selection
    public string SelectedType { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // HAP Calculation
    [Required]
    public decimal HAPAmount { get; set; }
    
    public DateTime? DateIntendedToVacate { get; set; }
    
    public decimal? ProratedAmount { get; set; }
    
    // Signature (stored as base64 string)
    public string? SignatureData { get; set; }
    
    // Metadata
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string Status { get; set; } = "Pending";
} 