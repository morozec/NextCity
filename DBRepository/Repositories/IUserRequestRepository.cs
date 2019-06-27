using System.Collections.Generic;
using System.Threading.Tasks;
using Model;

namespace DBRepository.Repositories
{
    public interface IUserRequestRepository
    {
        Task<List<UserRequest>> GetUserRequests();
        Task AddUserRequest(UserRequest userRequest);
    }
}