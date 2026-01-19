// Dynamically load community partners
document.addEventListener('DOMContentLoaded', function() {
    const partnersContainer = document.getElementById('partners-container');
    if (!partnersContainer) return;

    // Define partners with placeholder links
    // TODO: Replace placeholder URLs with actual partner websites
    const partners = [
        {
            name: 'Hubs Network',
            logo: 'hubs-network.jpg',
            url: 'https://placeholder-url-hubs-network.com' // TODO: Replace with actual URL
        },
        {
            name: 'Invisible Garden',
            logo: 'invisible-garden.svg',
            url: 'https://placeholder-url-invisible-garden.com' // TODO: Replace with actual URL
        },
        {
            name: 'Understories',
            logo: 'understories.png',
            url: 'https://placeholder-url-understories.com' // TODO: Replace with actual URL
        }
    ];

    // Load each partner
    partners.forEach(partner => {
        loadPartner(partner);
    });

    function loadPartner(partner) {
        try {
            // Create partner link
            const partnerLink = document.createElement('a');
            partnerLink.href = partner.url;
            partnerLink.target = '_blank';
            partnerLink.rel = 'noopener noreferrer';
            partnerLink.className = 'partner-link';

            // Create logo image
            const img = document.createElement('img');
            img.src = `community-partners/${partner.logo}`;
            img.alt = partner.name;
            img.className = 'partner-logo';
            img.loading = 'lazy';

            // Assemble link
            partnerLink.appendChild(img);
            partnersContainer.appendChild(partnerLink);
        } catch (error) {
            console.error(`Error loading partner ${partner.name}:`, error);
        }
    }
});
