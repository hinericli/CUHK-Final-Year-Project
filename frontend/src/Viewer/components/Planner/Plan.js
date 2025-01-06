import Day from './Day'; // Make sure to import the Day class
import dayjs from 'dayjs';

class Plan {
    constructor(name, startingDate, endingDate, dayCount, cost) {
        this.name = name;
        this.startingDate = startingDate;
        this.endingDate = endingDate;
        this.dayList = this.initializeDayList(dayCount);
        this.dayCount = dayCount;
        this.cost = cost;
    }

    initializeDayList(dayCount) {
        let dayList = [];
        for (let i = 0; i < dayCount; i++) {
            const newDay = new Day(this.startingDate.add(i, 'day').day(), this.startingDate.add(i, 'day'), [], null, null, 0); // Create a new Day object
            dayList.push(newDay);
        }
        console.log(dayList)
        return dayList;
    }
}

export default Plan;