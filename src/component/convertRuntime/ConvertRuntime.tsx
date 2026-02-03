export const convertRuntime = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h${mins}min`;
};

// Example
// const runtime = 141;
 
