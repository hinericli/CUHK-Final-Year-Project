import dayjs from 'dayjs';

// add 0 to the single digit (for hours and minutes)
export const singleDigitTransformer = (value) => {
    if (String(value).length === 1) {
        value = "0" + value;
    }
    return value;
}

export const stringToDateObj = (str) => {
    try {
        const date = new Date(str);
        
        const dateObject = {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1, // month: zero-indexed
            day: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes()
        };
        return dateObject;
    } catch (e) {
        console.error("Unable to convert string to Date, " + e);
    }
}

export const dayJSObjtoString = (obj) => {
    return ''+obj.years+'-'+singleDigitTransformer(obj.months+1)+'-'+singleDigitTransformer(obj.date)+'T'+singleDigitTransformer(obj.hours)+':'+singleDigitTransformer(obj.minutes)+':00Z';
} 

export const isoStringToDayJS = (str) => {
    return dayjs(str)
}