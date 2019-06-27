using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NextCity.Services;
using NextCity.ViewModels;

namespace NextCity.Controllers
{
    [Route("api/[controller]")]
    public class UserRequestController : Controller
    {
        private readonly IUserRequestService _userRequestService;

        public UserRequestController(IUserRequestService userRequestService)
        {
            _userRequestService = userRequestService;
        }

        [HttpGet("[action]")]
        public async Task<List<UserRequestViewModel>> GetUserRequests()
        {
            return await _userRequestService.GetUserRequests();
        }

        [HttpPost("[action]")]
        public async Task AddUserRequest([FromBody] UserRequestViewModel userRequestVm)
        {
            await _userRequestService.AddUserRequest(userRequestVm);
        }

        [HttpGet("[action]/{id}")]
        public async Task<UserRequestViewModel> GetUserRequest(int id)
        {
            return await _userRequestService.GetUserRequest(id);
        }
    }
}