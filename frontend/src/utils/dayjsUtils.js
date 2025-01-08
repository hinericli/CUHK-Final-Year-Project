// add 0 to the single digit (for hours and minutes)
export const singleDigitTransformer = (value) => {
    if (value.toString().length === 1) {
        value = "0" + value;
    }
    return value;
}
