import React from "react";
import { Clock, Calendar, User } from "lucide-react";

const ClassRoutine = ({ rooms, userType = "student", userId = null }) => {
  // Time slots based on the enum from Room model
  const timeSlots = [
    { start: "8:00 AM", end: "9:20 AM", display: "08:00 AM-09:20 AM" },
    { start: "9:30 AM", end: "10:50 AM", display: "09:30 AM-10:50 AM" },
    { start: "11:00 AM", end: "12:20 PM", display: "11:00 AM-12:20 PM" },
    { start: "12:30 PM", end: "1:50 PM", display: "12:30 PM-01:50 PM" },
    { start: "2:00 PM", end: "3:20 PM", display: "02:00 PM-03:20 PM" },
    { start: "3:30 PM", end: "4:50 PM", display: "03:30 PM-04:50 PM" },
  ];

  const days = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Create a schedule grid
  const schedule = {};

  // Initialize empty schedule
  timeSlots.forEach((slot, timeIndex) => {
    schedule[timeIndex] = {};
    days.forEach((day) => {
      schedule[timeIndex][day] = null;
    });
  });

  // Count total scheduled classes for user feedback
  let totalClasses = 0;

  // Populate schedule with classes (now only showing user's assigned sections)
  rooms.forEach((room) => {
    if (room.sections && room.sections.length > 0) {
      room.sections.forEach((section) => {
        if (section.classTimings && section.classTimings.length > 0) {
          section.classTimings.forEach((timing) => {
            const timeIndex = timeSlots.findIndex(
              (slot) =>
                slot.start === timing.startTime && slot.end === timing.endTime
            );

            if (timeIndex !== -1 && days.includes(timing.day)) {
              // Generate course code from room name (similar to image format)
              const courseCode = room.room_name
                .replace(/\s+/g, "")
                .substring(0, 6)
                .toUpperCase();
              const sectionCode = `${String(section.sectionNumber).padStart(
                2,
                "0"
              )}`;

              schedule[timeIndex][timing.day] = {
                room: room.room_name,
                courseCode: `${courseCode}-${sectionCode}`,
                section: section.sectionNumber,
                roomId: room._id,
                timing: timing,
                fullCode: `${courseCode}-${sectionCode}-${timing.day.substring(
                  0,
                  3
                )}-${timeIndex + 1}`,
              };

              totalClasses++;
            }
          });
        }
      });
    }
  });

  if (!rooms || rooms.length === 0) {
    return (
      <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-base-content">
            Class Routine
          </h2>
        </div>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-base-content/40 mx-auto mb-3" />
          <p className="text-base-content/60">No classes scheduled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow-sm border border-base-300 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-base-content">
            My Class Routine
          </h2>
        </div>
        {totalClasses > 0 && (
          <div className="flex items-center gap-1 text-xs text-base-content/60">
            <User className="h-3 w-3" />
            <span>{totalClasses} classes/week</span>
          </div>
        )}
      </div>

      {totalClasses === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-base-content/40 mx-auto mb-3" />
          <p className="text-base-content/60">
            {userType === "student"
              ? "You're not assigned to any sections yet"
              : "You're not teaching any sections yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-700 text-white">
                  <th className="border border-gray-600 p-2 sm:p-3 text-left font-medium min-w-[100px] sm:min-w-[120px]">
                    <div className="text-xs sm:text-sm">Time/Day</div>
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-600 p-2 sm:p-3 text-center font-medium min-w-[90px] sm:min-w-[110px]"
                    >
                      <div className="text-xs sm:text-sm">{day.substring(0, 3)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, timeIndex) => (
                  <tr key={timeIndex} className="hover:bg-base-50">
                    <td className="border border-gray-300 p-2 sm:p-3 bg-gray-100 font-medium text-center">
                      <div className="text-xs sm:text-sm leading-tight whitespace-nowrap">
                        {slot.start}<br className="sm:hidden" />-<br className="sm:hidden" />{slot.end}
                      </div>
                    </td>
                    {days.map((day) => {
                      const classInfo = schedule[timeIndex][day];
                      return (
                        <td
                          key={day}
                          className="border border-gray-300 p-1 sm:p-2 text-center"
                        >
                          {classInfo ? (
                            <div className="bg-gray-700 text-white rounded px-2 py-2 sm:px-3 sm:py-2 min-h-[45px] sm:min-h-[50px] flex flex-col justify-center">
                              <div className="font-medium leading-tight text-xs sm:text-sm">
                                {classInfo.courseCode}
                              </div>
                            </div>
                          ) : (
                            <div className="min-h-[45px] sm:min-h-[50px] flex items-center justify-center">
                              <span className="text-gray-400 text-xs sm:text-sm">—</span>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile scroll hint */}
          <div className="mt-2 text-xs text-base-content/50 text-center sm:hidden">
            ← Swipe to see full schedule →
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-base-content/60">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-700 rounded"></div>
              <span>My Classes</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Personal Schedule</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ClassRoutine;
