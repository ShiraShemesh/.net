using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using webApi.Models;
using webApi.Interfaces;
using System.Linq;

namespace webApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class JewelryController : ControllerBase
    {
        Iinterface<Jewelry> service;
        private readonly IActiveUserService _activeUserService;

        public JewelryController(Iinterface<Jewelry> service, IActiveUserService activeUserService)
        {
            this.service = service;
            _activeUserService = activeUserService;
        }

        private string GetUserEmail()
        {
            return _activeUserService.Email;
        }
        private bool IsAdmin()
        {
            return _activeUserService.IsAdmin;
        }

        [HttpGet]
        public IEnumerable<Jewelry> Get()
        {
            if (IsAdmin())
            {
                return service.Get();
            }
            string myEmail = GetUserEmail();
            return service.Get().Where(j => j.Email != null && j.Email.Equals(myEmail, StringComparison.OrdinalIgnoreCase));
        }

        [HttpGet("{id}")]
        public ActionResult<Jewelry> Get(int id)
        {
            var j = service.Get(id);
            if (j == null) return NotFound();
            if (!IsAdmin() && !j.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            return j;
        }

        public void Create(Jewelry j)
        {
            if (IsAdmin() && !string.IsNullOrEmpty(j.Email))
            {
                service.Create(j);
            }
            else
            {
                j.Email = GetUserEmail();
                service.Create(j);
            }
        }

        [HttpPut("{id}")]
        public ActionResult Update(int id, [FromBody] Jewelry j)
        {
            var existingItem = service.Get(id);
            if (existingItem == null) return NotFound();
            if (!IsAdmin() && !existingItem.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            if (!(IsAdmin() && !string.IsNullOrEmpty(j.Email))){
                j.Email = existingItem.Email;
            }
            service.Update(id, j);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public ActionResult Delete(int id)
        {
            var existingItem = service.Get(id);
            if (existingItem == null) return NotFound();
            if (!IsAdmin() && !existingItem.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            bool flag = service.Delete(id);
            if (!flag) return NotFound();
            return NoContent();
        }
    }
}