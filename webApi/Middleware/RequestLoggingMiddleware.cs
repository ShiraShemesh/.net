using webApi.Services;
using System.Diagnostics;

namespace webApi.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly RequestLogQueue _logQueue;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(RequestDelegate next, RequestLogQueue logQueue, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logQueue = logQueue;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var startTime = DateTime.Now;
            var stopwatch = Stopwatch.StartNew();

            try
            {
                await _next(context);
            }
            finally
            {
                stopwatch.Stop();

                // Extract controller and action from route
                var routeData = context.GetRouteData();
                var controllerName = routeData?.Values?["controller"]?.ToString() ?? "Unknown";
                var actionName = routeData?.Values?["action"]?.ToString() ?? "Unknown";

                // Get logged-in user
                var userName = context.User?.Identity?.Name ?? null;

                // Create log message
                var logMessage = new LogMessage
                {
                    StartTime = startTime,
                    ControllerName = controllerName,
                    ActionName = actionName,
                    UserName = userName,
                    DurationMs = stopwatch.ElapsedMilliseconds
                };

                // Enqueue for async processing
                _logQueue.EnqueueLog(logMessage);
            }
        }
    }
}
