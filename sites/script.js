document.getElementById('fetchServerButton').addEventListener('click', () => {
    const serverId = document.getElementById('serverIdInput').value;

    fetch(`/server/${serverId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('server-info').innerHTML = `<p>${data.error}</p>`;
            } else {
                document.getElementById('server-info').innerHTML = `
                    <div class="server-details">
                        <h2>${data.serverName}</h2>
                        <p><strong>Server ID:</strong> ${data.serverID}</p>
                        <p><strong>Member Count:</strong> ${data.memberCount}</p>
                        <p><strong>Region:</strong> ${data.region}</p>
                        <p><strong>Boost Level:</strong> ${data.boostLevel}</p>
                        <p><strong>Server Owner:</strong> ${data.ownerName}</p>
                        <p><strong>Created On:</strong> ${new Date(data.creationDate).toLocaleDateString()}</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching server data:', error);
            document.getElementById('server-info').innerHTML = '<p>Error fetching server data.</p>';
        });
});
