using webApi.Models;

namespace webApi.Interfaces
{
    public interface IJewelryService : Iinterface<Jewelry>
    {
        bool DeleteByEmail(string email);
    }
}
