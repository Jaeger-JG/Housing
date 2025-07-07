using Microsoft.EntityFrameworkCore;
using HousingProject.API.Models;

namespace HousingProject.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Form> Forms { get; set; }
    public DbSet<MCRForm> MCRForms { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Form entity
        modelBuilder.Entity<Form>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FormType).IsRequired();
            entity.Property(e => e.Status).HasDefaultValue("Pending");
        });

        // Configure MCRForm entity
        modelBuilder.Entity<MCRForm>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.HAPAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ProratedAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SignatureData).HasColumnType("nvarchar(max)");
            
            // Configure Status enum conversion with proper default
            entity.Property(e => e.Status)
                  .HasConversion(
                      v => v.ToString(),
                      v => MCRForm.ParseStatus(v))
                  .HasDefaultValue(MCRFormStatus.Pending)
                  .IsRequired();
            
            // Configure the relationship with Form
            entity.HasOne(e => e.Form)
                  .WithOne(f => f.MCRForm)
                  .HasForeignKey<MCRForm>(e => e.FormId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
} 