import { Link } from "react-router";
import { formatDate } from "../lib/utils";

const RoomCard = ({ room }) => {
  return (
    <Link
      to={`/teacher/room/${room._id}/forum`}
      className="card bg-base-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-2 border-[#00A2E8]/40 hover:border-[#00A2E8] group"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-base-content mb-2">
          {room.room_name}
        </h3>
        <p className="text-base-content/70 line-clamp-3 mb-4">
          {room.description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-base-content/60">
            {formatDate(new Date(room.createdAt))}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RoomCard;
