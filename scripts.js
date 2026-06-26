document.addEventListener("DOMContentLoaded", () => {
    // Fetch OpenSea stats using API
    fetchOpenSeaStats();

    async function fetchOpenSeaStats() {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-api-key': '3a0bb7983c7841e6a0770e39305fa084'
            }
        };

        try {
            const response = await fetch('https://api.opensea.io/api/v2/collections/villains-by-nev/stats', options);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Log les données pour débogage
            console.log(data);

            // Update global stats
            document.getElementById("total-volume").textContent = data.total.volume.toFixed(2);
            document.getElementById("floor-price").textContent = data.total.floor_price.toFixed(4);
            document.getElementById("num-owners").textContent = data.total.num_owners;
            document.getElementById("total-sales").textContent = data.total.sales;
            document.getElementById("average-price").textContent = data.total.average_price.toFixed(4);

            // Update 1-day stats
            const oneDayStats = data.intervals.find(interval => interval.interval === "one_day");
            document.getElementById("one-day-volume").textContent = oneDayStats.volume.toFixed(4);
            document.getElementById("one-day-sales").textContent = oneDayStats.sales;
            document.getElementById("one-day-average-price").textContent = oneDayStats.average_price.toFixed(4);

            // Update 7-day stats
            const sevenDayStats = data.intervals.find(interval => interval.interval === "seven_day");
            document.getElementById("seven-day-volume").textContent = sevenDayStats.volume.toFixed(4);
            document.getElementById("seven-day-sales").textContent = sevenDayStats.sales;
            document.getElementById("seven-day-average-price").textContent = sevenDayStats.average_price.toFixed(4);

            // Update 30-day stats
            const thirtyDayStats = data.intervals.find(interval => interval.interval === "thirty_day");
            document.getElementById("thirty-day-volume").textContent = thirtyDayStats.volume.toFixed(4);
            document.getElementById("thirty-day-sales").textContent = thirtyDayStats.sales;
            document.getElementById("thirty-day-average-price").textContent = thirtyDayStats.average_price.toFixed(4);

        } catch (error) {
            console.error('Error fetching OpenSea stats:', error);
        }
    }
});


// Function to animate counters
function animateCounter(id, start, end, duration) {
    let obj = document.getElementById(id);
    let current = start;
    let range = end - start;

    // Si l'intervalle est zéro ou négatif, ne pas animer
    if (range === 0) {
        obj.textContent = (end).toFixed(4); // Mettre directement la valeur finale
        return;
    }

    let increment = (range > 0) ? Math.ceil(range / duration * 100) : Math.floor(range / duration * 100);
    let stepTime = Math.abs(Math.floor(duration / (range / increment)));

    let timer = setInterval(function() {
        current += increment;

        // Assurez-vous de ne pas dépasser la valeur de fin
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }

        // Mettez à jour le contenu du texte en fonction de l'ID
        if (id === "total-volume" || id === "average-price" || id === "floor-price") {
            obj.textContent = current.toFixed(4); // Affiche jusqu'à 4 décimales pour volume total, floor price et average price
        } else {
            obj.textContent = current; // Pas de formatage pour les autres valeurs
        }
    }, stepTime);
}







// Function to detect when an element is visible in the viewport
function isElementInView(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add 'in-view' class to elements when they come into the viewport
function handleScrollAnimation() {
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(element => {
        if (isElementInView(element)) {
            element.classList.add('in-view');
        }
    });
}

// Attach scroll event listener
window.addEventListener('scroll', handleScrollAnimation);

// Trigger the function on page load
document.addEventListener('DOMContentLoaded', handleScrollAnimation);