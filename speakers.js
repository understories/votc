// Dynamically load featured speakers
document.addEventListener('DOMContentLoaded', function() {
    const speakersContainer = document.getElementById('speakers-container');
    if (!speakersContainer) return;

    // Define speakers based on folder structure
    const speakers = [
        {
            name: 'Michel Bauwens',
            folder: 'Michel Bauwens',
            image: 'bauwens.jpeg'
        },
        {
            name: 'Adam Arvidsson',
            folder: 'Adam Arvidsson',
            image: 'Arvidsson.png'
        },
        {
            name: 'Felix Fritsch',
            folder: 'Felix Fritsch',
            image: 'Fritsch.png'
        },
        {
            name: 'Rashmi Abbigeri',
            folder: 'Rashmi Abbigeri',
            image: 'Abbigeri.png'
        }
    ];

    // Load each speaker
    speakers.forEach(speaker => {
        loadSpeaker(speaker);
    });

    async function loadSpeaker(speaker) {
        try {
            // Fetch bio
            const bioResponse = await fetch(`speakers/${speaker.folder}/bio.md`);
            if (!bioResponse.ok) {
                console.error(`Failed to load bio for ${speaker.name}`);
                return;
            }
            const bioText = await bioResponse.text();

            // Create speaker card
            const speakerCard = document.createElement('div');
            speakerCard.className = 'speaker-card';

            // Create image
            const img = document.createElement('img');
            img.src = `speakers/${speaker.folder}/${speaker.image}`;
            img.alt = speaker.name;
            img.className = 'speaker-image';
            img.loading = 'lazy';

            // Create name
            const name = document.createElement('h3');
            name.className = 'speaker-name';
            name.textContent = speaker.name;

            // Create bio
            const bio = document.createElement('p');
            bio.className = 'speaker-bio';
            bio.textContent = bioText.trim();

            // Assemble card
            speakerCard.appendChild(img);
            speakerCard.appendChild(name);
            speakerCard.appendChild(bio);

            // Add click handler for mobile
            speakerCard.addEventListener('click', function(e) {
                if (window.innerWidth < 769) {
                    e.preventDefault();
                    speakerCard.classList.toggle('expanded');
                }
            });

            speakersContainer.appendChild(speakerCard);
        } catch (error) {
            console.error(`Error loading speaker ${speaker.name}:`, error);
        }
    }
});
