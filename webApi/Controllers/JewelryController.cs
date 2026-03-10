using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using webApi.Models;
using webApi.Interfaces;
using webApi.Hubs;
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
        private readonly IHubContext<JewelryHub> _hubContext;

        public JewelryController(Iinterface<Jewelry> service, IActiveUserService activeUserService, IHubContext<JewelryHub> hubContext)
        {
            this.service = service;
            _activeUserService = activeUserService;
            _hubContext = hubContext;
        }

        private string GetUserEmail()
        {
            return _activeUserService.Email;
        }

        private string GetUserId()
        {
            return _activeUserService.UserId?.ToString() ?? "";
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

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Jewelry j)
        {
            var userId = GetUserId();
            if (IsAdmin() && !string.IsNullOrEmpty(j.Email))
            {
                service.Create(j);
                await JewelryHub.NotifyUserAsync(_hubContext, userId, "ItemAdded", j);
            }
            else
            {
                j.Email = GetUserEmail();
                service.Create(j);
                await JewelryHub.NotifyUserAsync(_hubContext, userId, "ItemAdded", j);
            }
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Jewelry j)
        {
            var userId = GetUserId();
            var existingItem = service.Get(id);
            if (existingItem == null) return NotFound();
            if (!IsAdmin() && !existingItem.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            if (!(IsAdmin() && !string.IsNullOrEmpty(j.Email)))
            {
                j.Email = existingItem.Email;
            }
            service.Update(id, j);
            await JewelryHub.NotifyUserAsync(_hubContext, userId, "ItemUpdated", new { id, item = j });
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var userId = GetUserId();
            var existingItem = service.Get(id);
            if (existingItem == null) return NotFound();
            if (!IsAdmin() && !existingItem.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            bool flag = service.Delete(id);
            if (!flag) return NotFound();
            await JewelryHub.NotifyUserAsync(_hubContext, userId, "ItemDeleted", id);
            return NoContent();
        }
    }
}
