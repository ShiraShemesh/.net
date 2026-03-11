namespace webApi.Services
{
    public class RequestLogWorker : BackgroundService
    {
        private readonly RequestLogQueue _logQueue;
        private readonly string _logDirectory;
        private readonly ILogger<RequestLogWorker> _logger;

        public RequestLogWorker(RequestLogQueue logQueue, ILogger<RequestLogWorker> logger)
        {
            _logQueue = logQueue;
            _logger = logger;
            _logDirectory = Path.Combine(AppContext.BaseDirectory, "Logs");

            if (!Directory.Exists(_logDirectory))
            {
                Directory.CreateDirectory(_logDirectory);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    var logMessage = await _logQueue.DequeueLogAsync(stoppingToken);

                    if (logMessage != null)
                    {
                        await WriteLogAsync(logMessage);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Request log worker stopped.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in request log worker");
            }
        }

        private async Task WriteLogAsync(LogMessage logMessage)
        {
            try
            {
                string logFileName = Path.Combine(
                    _logDirectory,
                    $"requests_{DateTime.Now:yyyy-MM-dd}.log"
                );

                string logEntry = $"[{logMessage.StartTime:yyyy-MM-dd HH:mm:ss.fff}] " +
                    $"Controller: {logMessage.ControllerName} | " +
                    $"Action: {logMessage.ActionName} | " +
                    $"User: {logMessage.UserName ?? "Anonymous"} | " +
                    $"Duration: {logMessage.DurationMs}ms";

                await File.AppendAllTextAsync(logFileName, logEntry + Environment.NewLine);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error writing log to file");
            }
        }
    }
}
