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
        private readonly IUserService _userService;

        public JewelryController(Iinterface<Jewelry> service, IActiveUserService activeUserService, IHubContext<JewelryHub> hubContext, IUserService userService)
        {
            this.service = service;
            _activeUserService = activeUserService;
            _hubContext = hubContext;
            _userService = userService;
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
            var currentUserEmail = GetUserEmail();

            if (IsAdmin() && !string.IsNullOrEmpty(j.Email) && !j.Email.Equals(currentUserEmail, StringComparison.OrdinalIgnoreCase))
            {
                // Admin is adding item for another user - validate that user exists
                var targetUser = _userService.Get().FirstOrDefault(u => u.Email.Equals(j.Email, StringComparison.OrdinalIgnoreCase));
                if (targetUser == null)
                    return BadRequest("שגיאה: המשתמש עם כתובת המייל הזו לא קיים במערכת.");
                
                service.Create(j);
                await JewelryHub.NotifyUserByEmailAsync(_hubContext, j.Email, "ItemAdded", j);
                await JewelryHub.NotifyAdminsAsync(_hubContext, "ItemAdded", j);
            }
            else
            {
                j.Email = currentUserEmail;
                service.Create(j);
                await JewelryHub.NotifyUserByEmailAsync(_hubContext, currentUserEmail, "ItemAdded", j);
                await JewelryHub.NotifyAdminsAsync(_hubContext, "ItemAdded", j);
            }
            return Ok();
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] Jewelry j)
        {
            var existingItem = service.Get(id);
            if (existingItem == null) return NotFound();
            if (!IsAdmin() && !existingItem.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            if (!(IsAdmin() && !string.IsNullOrEmpty(j.Email)))
            {
                j.Email = existingItem.Email;
            }
            else
            {
                // Admin is trying to update the email - validate that the new user exists
                if (!j.Email.Equals(existingItem.Email, StringComparison.OrdinalIgnoreCase))
                {
                    var targetUser = _userService.Get().FirstOrDefault(u => u.Email.Equals(j.Email, StringComparison.OrdinalIgnoreCase));
                    if (targetUser == null)
                        return BadRequest("שגיאה: המשתמש עם כתובת המייל הזו לא קיים במערכת.");
                }
            }
            
            service.Update(id, j);
            await JewelryHub.NotifyUserByEmailAsync(_hubContext, existingItem.Email, "ItemUpdated", new { id, item = j });
            await JewelryHub.NotifyAdminsAsync(_hubContext, "ItemUpdated", new { id, item = j });

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existingItem = service.Get(id);
            if (existingItem == null) return NotFound();
            if (!IsAdmin() && !existingItem.Email.Equals(GetUserEmail(), StringComparison.OrdinalIgnoreCase))
                return Forbid();

            bool flag = service.Delete(id);
            if (!flag) return NotFound();

            await JewelryHub.NotifyUserByEmailAsync(_hubContext, existingItem.Email, "ItemDeleted", id);
            await JewelryHub.NotifyAdminsAsync(_hubContext, "ItemDeleted", id);

            return NoContent();
        }
    }
}
