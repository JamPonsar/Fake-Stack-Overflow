export default function findTime (date) {
    date = new Date(date);
    const currentTime = new Date();
    let timeDiffSeconds = (currentTime.getTime() - date.getTime()) / 1000; //time difference in seconds

    //everytime we pass data into the findTime function, we want to compare for minute, hour, day, month, and year
    if (date.getFullYear() === currentTime.getFullYear() && date.getMonth() === currentTime.getMonth() && date.getDate() === currentTime.getDate()) //year,month, and day
    {
        
		if (timeDiffSeconds < 60) { // posted less than a minute ago
			return Math.floor(timeDiffSeconds) + " seconds ago";
		}
		if (timeDiffSeconds < 3600) { // posted less than an hour ago
			let minDiff = Math.floor(timeDiffSeconds / 60);
			return minDiff + " minutes ago";
		}
		// Calculate the time difference in hours
		let timeDiffHours = Math.floor(timeDiffSeconds / 3600);
		return timeDiffHours + " hours ago";
    }
    else if (date.getFullYear() === currentTime.getFullYear()) //same year 
    {
        let currentHours = date.getHours(), currentMinutes = date.getMinutes();
        currentHours = (currentHours < 10) ? "0" + currentHours : currentHours; //add leading zeroes 
        currentMinutes = (currentMinutes < 10) ? "0" + currentMinutes : currentMinutes;
        return months(date.getMonth()) + " " + date.getDate() + " at " + currentHours + ":" + currentMinutes;
    }
    else //different years so have to include in print 
    {
        let currentHours = date.getHours(), currentMinutes = date.getMinutes();
        currentHours = (currentHours < 10) ? "0" + currentHours : currentHours; //add leading zeroes 
        currentMinutes = (currentMinutes < 10) ? "0" + currentMinutes : currentMinutes;
        return months(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear() + " at " + currentHours + ":" + currentMinutes;
    }
}

//passing num and getting corresponding month string
const months = num => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][num];