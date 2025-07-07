using Microsoft.EntityFrameworkCore;
using HousingProject.API.Data;
using HousingProject.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// Add Windows Authentication
builder.Services.AddAuthentication("Windows");
builder.Services.AddAuthorization();

// Add Entity Framework and SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Add CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "https://localhost:3000", 
                "http://localhost:3001", 
                "https://localhost:3001",
                "http://localhost:5042",
                "https://localhost:7001"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // This is important for Windows Auth
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.UseAuthentication(); // Add authentication middleware
app.UseAuthorization();
app.MapControllers();

app.Run();
