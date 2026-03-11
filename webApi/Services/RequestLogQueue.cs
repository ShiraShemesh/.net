using System.Collections.Concurrent;

namespace webApi.Services
{
    public class RequestLogQueue
    {
        private readonly ConcurrentQueue<LogMessage> _queue = new();
        private readonly SemaphoreSlim _semaphore = new(0);

        public void EnqueueLog(LogMessage logMessage)
        {
            _queue.Enqueue(logMessage);
            _semaphore.Release();
        }

        public async Task<LogMessage> DequeueLogAsync(CancellationToken cancellationToken = default)
        {
            await _semaphore.WaitAsync(cancellationToken);
            _queue.TryDequeue(out var logMessage);
            return logMessage;
        }

        public int Count => _queue.Count;
    }
}
