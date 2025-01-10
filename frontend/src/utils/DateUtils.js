
// add 0 to the single digit (for hours and minutes)
export const singleDigitTransformer = (value) => {
    if (String(value).length === 1) {
        value = "0" + value;
    }
    return value;
}

export const stringToDate = (str) => {
    try {
        const date = new Date(str);
        
        // Create an object with the desired attributes
        const dateObject = {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1, // Months are zero-indexed
            day: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes()
        };
        
        console.log(dateObject);
        return dateObject;
        // Output: { year: 2021, month: 7, day: 14, hours: 0, minutes: 0 }
    } catch (e) {
        console.error("Unable to convert string to Date, " + e);
    }
    
}