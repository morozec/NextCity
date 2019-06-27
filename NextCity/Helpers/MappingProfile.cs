using AutoMapper;
using Model;
using NextCity.ViewModels;

namespace NextCity.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<UserRequest, UserRequestViewModel>();
            CreateMap<UserRequestViewModel, UserRequest>();
        }
    }
}