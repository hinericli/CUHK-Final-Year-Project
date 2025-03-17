export const sortActivities = (activityList) => {
  activityList.sort((a, b) => {
    return (a.startDateTime < b.startDateTime) ? -1 : ((a.startDateTime > b.startDateTime) ? 1 : 0);
  });
  
  return activityList;
}