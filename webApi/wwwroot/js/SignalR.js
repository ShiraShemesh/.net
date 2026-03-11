const connection = new signalR.HubConnectionBuilder()
    .withUrl("/jewelryHub", {
        accessTokenFactory: () => sessionStorage.getItem('token'),
        transport: signalR.HttpTransportType.WebSocket | signalR.HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 0, 1000, 3000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

connection.on("ItemAdded", (item) => {
    getItems();
    console.log("Item added:", item);
});

connection.on("ItemUpdated", (data) => {
    getItems();
    console.log("Item updated:", data);
});

connection.on("ItemDeleted", (itemId) => {
    getItems();
    console.log("Item deleted:", itemId);
});

async function connectToHub() {
    try {
        console.log(" Attempting to connect to JewelryHub...");
        await connection.start();
        console.log(" Connected to JewelryHub successfully!");
    } catch (err) {
        console.error(" Connection failed:", err);
        setTimeout(connectToHub, 5000);
    }
}

connection.onreconnecting((error) => {
    console.log("Reconnecting:", error);
});

connection.onreconnected((connectionId) => {
    console.log("Reconnected with connectionId:", connectionId);
});
