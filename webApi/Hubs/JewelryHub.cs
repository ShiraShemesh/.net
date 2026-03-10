using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace webApi.Hubs;

public class JewelryHub : Hub
{
    private static ConcurrentDictionary<string, HashSet<string>> UserConnections = 
        new ConcurrentDictionary<string, HashSet<string>>();

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst("userid")?.Value;
       
        if (Context.User?.Claims != null)
        {
            foreach (var claim in Context.User.Claims)
            {
                Console.WriteLine($"  Claim: {claim.Type} = {claim.Value}");
            }
        }
        
        if (!string.IsNullOrEmpty(userId))
        {
            UserConnections.AddOrUpdate(userId,
                new HashSet<string> { Context.ConnectionId },
                (key, existingSet) =>
                {
                    existingSet.Add(Context.ConnectionId);
                    return existingSet;
                });
            
        }
        else
        {
            Console.WriteLine($"NO USERID! No authentication claim found.");
        }
        
        
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst("userid")?.Value;
        
        if (!string.IsNullOrEmpty(userId) && UserConnections.TryGetValue(userId, out var connectionIds))
        {
            connectionIds.Remove(Context.ConnectionId);
            if (connectionIds.Count == 0)
            {
                UserConnections.TryRemove(userId, out _);
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
            Console.WriteLine($"❌ NO CONNECTIONS for {userId}");
        }
    }
}
