    function renderServerDetail(server) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${server.serverName}</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>${server.serverName}</h1>
                    <p><strong>Server ID:</strong> ${server.serverID}</p>
                    <p><strong>Member Count:</strong> ${server.memberCount}</p>
                    <a href="/servers" class="back-button">Back to Servers List</a>
                </div>
            </body>
            </html>
        `;
    }

    function renderServerList(servers) {
        const serverCards = servers.map(server => `
            <div class="server-card">
                <a href="/server/${server.serverID}" class="server-link">
                    <h2>${server.serverName}</h2>
                    <p>Server ID: ${server.serverID}</p>
                    <a href="/server/${server.serverID}" class="view-button">View Details</a>
                </a>
            </div>
        `).join('');
    
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Servers List</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header class="header">
                    <div class="logo-container">
                        <img src="sites/deceit.png" alt="Logo" class="logo">
                        <h1 class="header-title">Server List</h1>
                    </div>
                </header>
                <div class="search-container">
                    <input type="text" placeholder="Search servers..." class="search-bar">
                </div>
                <div class="container">
                    <h2>Discord Server List</h2>
                    <div class="server-list">
                        ${serverCards}
                    </div>
                    <a href="/" class="back-button">Back to Home</a>
                </div>
            </body>
            </html>
        `;
    }

    function renderServerDetail(server) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${server.serverName}</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <div class="container">
                    <h1>${server.serverName}</h1>
                    <p><strong>Server ID:</strong> ${server.serverID}</p>
                    <p><strong>Member Count:</strong> ${server.memberCount}</p>
                    <p><strong>Creation Date:</strong> ${new Date(server.creationDate).toLocaleDateString()}</p>
                    <p><strong>Region:</strong> ${server.region}</p>
                    <p><strong>Description:</strong> ${server.description}</p>
                    <a href="/servers" class="back-button">Back to Servers List</a>
                </div>
            </body>
            </html>
        `;
    }

    
module.exports = { renderServerDetail, renderServerList };
