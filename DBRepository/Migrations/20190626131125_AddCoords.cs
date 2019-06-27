using Microsoft.EntityFrameworkCore.Migrations;

namespace DBRepository.Migrations
{
    public partial class AddCoords : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "X",
                table: "UserRequests",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Y",
                table: "UserRequests",
                nullable: false,
                defaultValue: 0.0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "X",
                table: "UserRequests");

            migrationBuilder.DropColumn(
                name: "Y",
                table: "UserRequests");
        }
    }
}
