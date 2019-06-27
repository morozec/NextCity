using DBRepository.Factories;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace NextCity.Helpers
{
    public static class DataSeeder
    {
        public static void SeedData(this IApplicationBuilder app, IConfiguration configuration)
        {
            using (var scope = app.ApplicationServices.GetRequiredService<IServiceScopeFactory>().CreateScope())
            {
                var factory = scope.ServiceProvider.GetRequiredService<IRepositoryContextFactory>();
                var connectionString = configuration.GetConnectionString("DefaultConnection");

                var context = factory.CreateDbContext(connectionString);
                context.Database.EnsureCreated();
                context.Database.Migrate();


            }
        }
    }
}