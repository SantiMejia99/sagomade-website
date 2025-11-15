// 'YYYY-MM-DD': hours
import DESIGN_ACTIVITIES from '../data/DesignActivities.json';

const activities = DESIGN_ACTIVITIES as { [key: string]: number };

const DesignCounter = () => {
  const getWeeksData = () => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // 52 weeks

    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday

    for (let week = 0; week < 53; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const hours = activities[dateStr] || 0;
        days.push({
          date: dateStr,
          hours: hours,
          displayDate: new Date(currentDate),
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(days);
    }
    return weeks;
  };

  const getColorIntensity = (hours: number): string => {
    if (hours === 0) return 'bg-gray-100/20';
    if (hours < 2) return 'bg-green-200/80';
    if (hours < 4) return 'bg-green-400/80';
    if (hours < 6) return 'bg-green-600/80';
    return 'bg-green-800';
  };

  //   const getTotalHours = (): number => {
  //     return Object.values(DESIGN_ACTIVITIES).reduce((sum: number, hours: number) => sum + hours, 0);
  //   };

  //   const getActiveDays = (): number => {
  //     return Object.values(DESIGN_ACTIVITIES).filter((hours: number) => hours > 0).length;
  //   };

  //   const getCurrentStreak = (): number => {
  //     const sortedDates = Object.keys(DESIGN_ACTIVITIES).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  //     if (sortedDates.length === 0) return 0;

  //     const today = new Date();
  //     today.setHours(0, 0, 0, 0);

  //     let streak = 0;
  //     let checkDate = new Date(today);

  //     while (true) {
  //       const dateStr = checkDate.toISOString().split('T')[0];
  //       if (DESIGN_ACTIVITIES[dateStr] && DESIGN_ACTIVITIES[dateStr] > 0) {
  //         streak++;
  //         checkDate.setDate(checkDate.getDate() - 1);
  //       } else if (streak === 0 && dateStr === today.toISOString().split('T')[0]) {
  //         // If today has no activity, check yesterday
  //         checkDate.setDate(checkDate.getDate() - 1);
  //       } else {
  //         break;
  //       }
  //     }

  //     return streak;
  //   };

  const weeks = getWeeksData();
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className='space-y-2'>
      <div className='w-full mx-auto'>
        <div className='rounded-xl shadow-xl'>
          <div className='flex items-center gap-3 mb-2'>
            <h1 className='text-4xl font-bold'>Design Tracker</h1>
          </div>
          <p className='text-start mb-8'>Tracking my design journey over the past year</p>

          <div className='mb-6'>
            <div className='w-full pb-4 pr-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
              <div className='min-w-max md:min-w-0 md:w-full'>
                <div className='flex gap-0.5 md:gap-1 mb-2'>
                  <div className='w-8 md:w-12'></div>
                  {weeks.map((week, i) => {
                    const firstDay = week[0].displayDate;
                    const isFirstWeekOfMonth = firstDay.getDate() <= 7;
                    return (
                      <div key={i} className='w-2.5 md:flex-1 text-[10px] md:text-xs text-gray-500 font-medium'>
                        {isFirstWeekOfMonth && monthLabels[firstDay.getMonth()]}
                      </div>
                    );
                  })}
                </div>
                <div className='flex gap-0.5 md:gap-1'>
                  <div className='flex flex-col gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500 pr-1 md:pr-2 font-medium w-8 md:w-12'>
                    <div className='flex-1 flex items-center'>Sun</div>
                    <div className='flex-1 flex items-center'>Mon</div>
                    <div className='flex-1 flex items-center'>Tue</div>
                    <div className='flex-1 flex items-center'>Wed</div>
                    <div className='flex-1 flex items-center'>Thu</div>
                    <div className='flex-1 flex items-center'>Fri</div>
                    <div className='flex-1 flex items-center'>Sat</div>
                  </div>
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className='w-2.5 md:flex-1 flex flex-col gap-0.5 md:gap-1'>
                      {week.map((day, dayIdx) => (
                        <div
                          key={dayIdx}
                          className={`w-full aspect-square rounded-[2px] md:rounded-sm border border-gray-200/40 transition-all hover:scale-110 md:hover:scale-125 hover:border-gray-400/40  ${getColorIntensity(day.hours)}`}
                          title={`${day.date}: ${day.hours}h`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2 mt-4 text-xs md:text-sm text-gray-600'>
              <span>Less</span>
              <div className='w-2.5 h-2.5 md:w-3 md:h-3 bg-gray-100 rounded-sm border border-gray-200'></div>
              <div className='w-2.5 h-2.5 md:w-3 md:h-3 bg-green-200 rounded-sm border border-gray-200'></div>
              <div className='w-2.5 h-2.5 md:w-3 md:h-3 bg-green-400 rounded-sm border border-gray-200'></div>
              <div className='w-2.5 h-2.5 md:w-3 md:h-3 bg-green-600 rounded-sm border border-gray-200'></div>
              <div className='w-2.5 h-2.5 md:w-3 md:h-3 bg-green-800 rounded-sm border border-gray-200'></div>
              <span>More</span>
            </div>
          </div>

          {/* <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
            <div className='bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200'>
              <div className='text-sm text-gray-600 mb-1'>Total Hours</div>
              <div className='text-3xl font-bold text-green-700'>
                {getTotalHours()}
                <span className='text-lg'>h</span>
              </div>
            </div>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200'>
              <div className='text-sm text-gray-600 mb-1'>Active Days</div>
              <div className='text-3xl font-bold text-blue-700'>{getActiveDays()}</div>
            </div>
            <div className='bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200'>
              <div className='text-sm text-gray-600 mb-1'>Current Streak</div>
              <div className='text-3xl font-bold text-purple-700'>
                {getCurrentStreak()}
                <span className='text-lg'>d</span>
              </div>
            </div>
            <div className='bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200'>
              <div className='text-sm text-gray-600 mb-1'>Avg per Day</div>
              <div className='text-3xl font-bold text-orange-700'>
                {getActiveDays() > 0 ? (getTotalHours() / getActiveDays()).toFixed(1) : 0}
                <span className='text-lg'>h</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DesignCounter;
