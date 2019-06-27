using Microsoft.EntityFrameworkCore;
using Model;

namespace DBRepository
{
    public class RepositoryContext : DbContext
    {
        public RepositoryContext(DbContextOptions<RepositoryContext> options) : base(options)
        {

        }

        public DbSet<UserRequest> UserRequests { get; set; }
    }
}