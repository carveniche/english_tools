export default function DailyLimitCard({
  isCompleted,
  isWordCompleted,
}) 
{
  console.log(isCompleted,isWordCompleted)
  return (
    <div className="bg-white text-center p-[1rem]
      flex justify-center  items-center w-full h-full left-0 top-0 flex-col gap-[1rem]">

      {!isCompleted ? (
        <div className="flex justify-center">
          <div className="rounded-full bg-orange-50 flex items-center justify-center shadow-inner">
            {/* cloud svg */}
            <svg xmlns="http://www.w3.org/2000/svg" width="109" height="56" viewBox="0 0 109 56" fill="none">
              <path d="M107.105 55.0655C107.808 53.0441 108.21 50.8796 108.21 48.6147C108.21 37.75 99.4016 28.9416 88.5369 28.9416C88.1929 28.9416 87.8605 28.9763 87.5204 28.9918C85.5183 12.6542 71.6041 0 54.7254 0C40.0382 0 27.6004 9.58148 23.2908 22.827C22.3516 22.6956 21.4047 22.6029 20.4307 22.6029C9.14473 22.6029 0 31.7515 0 43.0336C0 47.5364 1.47259 51.6836 3.94236 55.0616H107.109L107.105 55.0655Z" fill="#D2DDFC"/>
            </svg>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="rounded-full bg-orange-50 flex items-center justify-center shadow-inner">
            {/* clock svg */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
        </div>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
        {isCompleted ? "Daily limit is over" : "No data available"}
      </h1>

      <p className="text-sm md:text-base text-gray-500">
        {isCompleted && "You’ve reached today’s limit. Come back tomorrow to continue."}
      </p>
    </div>
  );
}
