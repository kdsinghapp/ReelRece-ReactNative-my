export const formatSecondsToHMS = (secs:number): string => {
    const hours= Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
   return [hours, minutes, seconds]
    .map((unit)=> String(unit).padStart(2, '0') )
    .join(':');
  };

