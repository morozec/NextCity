using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using DBRepository.Repositories;
using Model;
using NextCity.ViewModels;


namespace NextCity.Services
{
    public class UserRequestService : IUserRequestService
    {
        private readonly IUserRequestRepository _userRequestRepository;
        private readonly IMapper _mapper;

        public UserRequestService(IUserRequestRepository userRequestRepository, IMapper mapper)
        {
            _userRequestRepository = userRequestRepository;
            _mapper = mapper;
        }

        public async Task<List<UserRequestViewModel>> GetUserRequests()
        {
            var userRequests = await _userRequestRepository.GetUserRequests();
            return userRequests.Select(ur => _mapper.Map<UserRequest, UserRequestViewModel>(ur)).ToList();
        }

        public async Task AddUserRequest(UserRequestViewModel userRequestVm)
        {
            var userRequest = _mapper.Map<UserRequestViewModel, UserRequest>(userRequestVm);
            await _userRequestRepository.AddUserRequest(userRequest);
        }
    }
}