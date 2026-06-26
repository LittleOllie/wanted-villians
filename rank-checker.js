document.getElementById('check-rank').addEventListener('click', function () {
    const nftId = document.getElementById('nft-id-input').value;
    
    if (!nftId) {
        alert('Please enter a valid NFT number');
        return;
    }
    
    const apiUrl = `https://api.opensea.io/api/v2/chain/base/contract/0xA91B95a1DBA98E3537eAd7aA4A488A8886316be2/nfts/${nftId}`;
    
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-api-key': '3a0bb7983c7841e6a0770e39305fa084'
        }
    })
    .then(response => response.json())
    .then(data => {
        const nft = data.nft;
        if (nft) {
            // Affiche l'image du NFT
            document.getElementById('nft-image').src = nft.image_url;
            
            // Affiche le rang du NFT
            document.getElementById('nft-rank').textContent = `Rank: ${nft.rarity.rank}`;
            
            // Remplit le tableau des traits
            const traitsTableBody = document.getElementById('nft-traits-table').querySelector('tbody');
            traitsTableBody.innerHTML = ''; // Efface les lignes précédentes
            
            nft.traits.forEach(trait => {
                const row = document.createElement('tr');
                const traitTypeCell = document.createElement('td');
                const traitValueCell = document.createElement('td');
                
                traitTypeCell.textContent = trait.trait_type;
                traitValueCell.textContent = trait.value;
                
                row.appendChild(traitTypeCell);
                row.appendChild(traitValueCell);
                
                traitsTableBody.appendChild(row);
            });
            
            // Affiche la section des détails du NFT
            document.getElementById('nft-display').classList.remove('hidden');
        }
    })
    .catch(err => console.error('Error fetching NFT data:', err));
});
