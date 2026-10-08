self.addEventListener("push", (event) => {
    let data = {
        title: "Urban Detail",
        body: "You have a new booking.",
        url: "/"
    };

    try {
        if (event.data) {
            data = {
                ...data,
                ...event.data.json()
            };
        }
    } catch {
        // Ignore malformed notification payloads.
    }

    const title = data.title || "Urban Detail";

    const options = {
        body: data.body || "You have a new booking.",
        icon: data.icon || "/icon-192.png",
        badge: data.badge || "/icon-192.png",
        data: {
            url: data.url || "/"
        },
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const url = event.notification?.data?.url || "/";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) {
                    client.focus();
                    if ("navigate" in client) {
                        client.navigate(url);
                    }
                    return;
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});