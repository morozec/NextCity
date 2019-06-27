using System.Collections.Generic;
using System.Threading.Tasks;
using NextCity.ViewModels;

namespace NextCity.Services
{
    public interface IUserRequestService
    {
        Task<List<UserRequestViewModel>> GetUserRequests();
        Task AddUserRequest(UserRequestViewModel userRequest);
    }
}
