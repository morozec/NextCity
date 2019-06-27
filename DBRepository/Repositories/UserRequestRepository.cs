using System.Collections.Generic;
using System.Threading.Tasks;
using DBRepository.Factories;
using Microsoft.EntityFrameworkCore;
using Model;

namespace DBRepository.Repositories
{
    public class UserRequestRepository : BaseRepository, IUserRequestRepository
    {
        public UserRequestRepository(string connectionString, IRepositoryContextFactory repositoryContextFactory) : base(connectionString, repositoryContextFactory)
        {
        }

        public async Task<List<UserRequest>> GetUserRequests()
        {
            using (var context = RepositoryContextFactory.CreateDbContext(ConnectionString))
            {
                return await context.UserRequests.ToListAsync();
            }
        }

        public async Task AddUserRequest(UserRequest userRequest)
        {
            using (var context = RepositoryContextFactory.CreateDbContext(ConnectionString))
            {
                context.UserRequests.Add(userRequest);
                await context.SaveChangesAsync();
            }
        }

        public async Task<UserRequest> GetUserRequest(int id)
        {
            using (var context = RepositoryContextFactory.CreateDbContext(ConnectionString))
            {
                return await context.UserRequests.FirstOrDefaultAsync(ur => ur.Id == id);
            }
        }
    }
}