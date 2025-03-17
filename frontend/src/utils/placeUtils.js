export const handlePlaceName = (place) => {
    if (!place) return "/";

    if (place.name === place.formatted_address) {
        return place.name
    } else {
        return (place.name)
    }
}