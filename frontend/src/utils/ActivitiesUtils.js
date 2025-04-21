export const sortActivities = (activityList) => {
  if (activityList.length === 0) {
    return [];
  }

  activityList.sort((a, b) => {
    return (a.startDateTime < b.startDateTime) ? -1 : ((a.startDateTime > b.startDateTime) ? 1 : 0);
  });
  
  return activityList;
}