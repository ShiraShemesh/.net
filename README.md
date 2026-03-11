🚀 Item Management System (ASP.NET MVC Web API & SignalR)
A robust, real-time item management system featuring secure user authentication, role-based access control (RBAC), and advanced asynchronous logging.

⚠️ Important Note: Google Authentication
To access the application via Google, a pre-defined password is required. Access will be denied without this specific credential. Alternatively, please use the standard login method provided on the login page.

🛠 Core Technologies
Backend: ASP.NET Core Web API

Real-Time Communication: SignalR (for automatic Grid synchronization)

Data Persistence: JSON-based storage (with Interface/Service abstraction for easy DB migration)

Security: JWT Authentication & Role-based Authorization

Logging: Asynchronous Background Worker with Message Queue

📋 System Features
Server-Side
Role-Based Access: * Administrators: Full control over all users and items.

Regular Users: Can only manage and view their own data.

Clean Architecture: * Services are injected via Interfaces to ensure the app is decoupled from the storage logic (JSON/DB).

Scoped User Service: Injected globally to provide easy access to the current User ID and Role.

Service Registration: Custom IServiceCollection extension method for clean dependency injection.

Real-Time Synchronization: SignalR tracks active user connections (OnConnectedAsync/OnDisconnectedAsync) and broadcasts updates only to the specific user's active tabs/devices.

Advanced Logging: Every request is logged asynchronously (Start time, Controller/Action, Username, and Duration) using a background worker to ensure zero performance impact on the main request threads.

Client-Side
State Management: The app checks for a valid JWT in local storage. If missing or expired, the user is automatically redirected to the Login page.

Optimistic UX: Upon Add/Update/Delete, the user receives a Toast notification confirming the success. The data grid updates automatically only when the SignalR notification is received.

Dynamic Navigation: Administrative links are conditionally rendered based on user privileges.
