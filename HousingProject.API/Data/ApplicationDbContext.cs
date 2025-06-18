using Microsoft.EntityFrameworkCore;
using HousingProject.API.Models;

namespace HousingProject.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<MCRForm> MCRForms { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure MCRForm entity
        modelBuilder.Entity<MCRForm>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.HAPAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.ProratedAmount).HasColumnType("decimal(18,2)");
            entity.Property(e => e.SignatureData).HasColumnType("nvarchar(max)");
        });
    }
} 