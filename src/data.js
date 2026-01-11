export const featuredPlaces = [
    {
        id: 'karanji-lake',
        title: "Karanji Lake",
        category: "Nature",
        categoryColor: "bg-green-500",
        description: "Serene nature trail with butterfly park and panoramic palace views",
        location: "Siddhartha Layout",
        rating: 4.3,
        coords: [12.3021, 76.6715],
        image: "/karanji.jpg"
    }
];

export const popularPlaces = [
    {
        id: 'karanji-lake',
        title: "Karanji Lake",
        category: "Nature",
        categoryColor: "bg-green-500",
        description: "Serene nature trail with butterfly park and panoramic palace views",
        location: "Siddhartha Layout",
        rating: 4.3,
        coords: [12.3021, 76.6715],
        image: "/karanji.jpg"
    }
];

// Combine unique places for easier searching
const allPlacesMap = new Map();
[...featuredPlaces, ...popularPlaces].forEach(place => {
    allPlacesMap.set(place.id, place);
});

export const allPlaces = Array.from(allPlacesMap.values());
