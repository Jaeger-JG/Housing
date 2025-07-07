using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HousingProject.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Forms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Forms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MCRForms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FormId = table.Column<int>(type: "int", nullable: false),
                    HousingSpecialistName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HousingSpecialistEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProgramType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastFourSSN = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    TenantName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OwnerAccountNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressLine1 = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AddressLine2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    State = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ZipCode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LandlordFirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LandlordLastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EffectiveDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReasonComments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MCRType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThirdPartyPaymentsVerified = table.Column<bool>(type: "bit", nullable: false),
                    TransactionScreenVerified = table.Column<bool>(type: "bit", nullable: false),
                    OverlappingHAP = table.Column<bool>(type: "bit", nullable: false),
                    SelectedType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HAPAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DateIntendedToVacate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ProratedAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    SignatureData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MCRForms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MCRForms_Forms_FormId",
                        column: x => x.FormId,
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MCRForms_FormId",
                table: "MCRForms",
                column: "FormId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MCRForms");

            migrationBuilder.DropTable(
                name: "Forms");
        }
    }
}
