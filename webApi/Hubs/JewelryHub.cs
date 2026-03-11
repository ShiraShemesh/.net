using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace webApi.Hubs;

public class JewelryHub : Hub
{
    private static ConcurrentDictionary<string, HashSet<string>> UserConnections = 
        new ConcurrentDictionary<string, HashSet<string>>();
    private static ConcurrentDictionary<string, HashSet<string>> EmailToUserConnections = 
        new ConcurrentDictionary<string, HashSet<string>>();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("userid")?.Value;
        var userEmail = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
        var userType = Context.User?.FindFirst("type")?.Value;
        
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.AddOrUpdate(userId,
                new HashSet<string> { Context.ConnectionId },
                (key, existingSet) =>
                {
                    existingSet.Add(Context.ConnectionId);
                    return existingSet;
                });
            
            if (!string.IsNullOrEmpty(userEmail))
            {
                EmailToUserConnections.AddOrUpdate(userEmail,
                    new HashSet<string> { Context.ConnectionId },
                    (key, existingSet) =>
                    {
                        existingSet.Add(Context.ConnectionId);
                        return existingSet;
                    });
            }
            
            if (userType == "Admin")
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
            }
        }
        else
        {
            Console.WriteLine("NO USERID! No authentication claim found.");
        }
        
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("userid")?.Value;
        var userEmail = Context.User?.FindFirst(ClaimTypes.Email)?.Value;
        
        if (!string.IsNullOrEmpty(userId) && UserConnections.TryGetValue(userId, out var connectionIds))
        {
            connectionIds.Remove(Context.ConnectionId);
            if (connectionIds.Count == 0)
            {
                UserConnections.TryRemove(userId, out _);
            }
        }
        
        if (!string.IsNullOrEmpty(userEmail) && EmailToUserConnections.TryGetValue(userEmail, out var emailConnections))
        {
            emailConnections.Remove(Context.ConnectionId);
            if (emailConnections.Count == 0)
            {
                EmailToUserConnections.TryRemove(userEmail, out _);
            }
        }
        
        await base.OnDisconnectedAsync(exception);
    }

    public static async Task NotifyUserAsync(IHubContext<JewelryHub> hubContext, string userId, string method, object data)
    {
        if (UserConnections.TryGetValue(userId, out var connectionIds))
        {
            await hubContext.Clients.Clients(connectionIds.ToList()).SendAsync(method, data);
        }
        else
        {
            Console.WriteLine($"NO CONNECTIONS for user ID {userId}");
        }
    }

    public static async Task NotifyUserByEmailAsync(IHubContext<JewelryHub> hubContext, string userEmail, string method, object data)
    {
        if (!string.IsNullOrEmpty(userEmail) && EmailToUserConnections.TryGetValue(userEmail, out var connectionIds))
        {
            await hubContext.Clients.Clients(connectionIds.ToList()).SendAsync(method, data);
        }
        else
        {
            Console.WriteLine($"NO CONNECTIONS for email {userEmail}");
        }
    }

    public static async Task NotifyAdminsAsync(IHubContext<JewelryHub> hubContext, string method, object data)
    {
        await hubContext.Clients.Group("admins").SendAsync(method, data);
    }
}
