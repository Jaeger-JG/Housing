using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HousingProject.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityNameToMCRFormV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EntityName",
                table: "MCRForms",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EntityName",
                table: "MCRForms");
        }
    }
}
