import React from 'react'
const GRAD = [
  "from-pink-500 to-rose-400",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-500 to-purple-500",
  "from-lime-400 to-green-500",
  "from-cyan-400 to-sky-500",
  "from-indigo-500 to-blue-500",
];
const Tile = ({
  children,
  gradIdx = 0,
  onClick,
  selected = false,
  ring = null,
  big = false,
  draggable = false,
  onDragStart,
}) => (
  <div
    role={onClick ? "button" : "img"}
    onClick={onClick}
    className={`relative ${
      big ? "aspect-[4/3]" : "aspect-square"
    } select-none rounded-2xl shadow grid place-items-center bg-gradient-to-br ${
      GRAD[gradIdx % GRAD.length]
    } ${onClick ? "cursor-pointer active:scale-[0.98]" : ""} ${
      selected ? "ring-4 ring-sky-400" : ""
    }`}
    draggable={draggable}
    onDragStart={onDragStart}
  >
    <div
      className={`${
        big ? "text-8xl md:text-9xl" : "text-4xl"
      } font-black text-white drop-shadow`}
    >
      {children}
    </div>
    {ring && <div className={`absolute inset-0 rounded-2xl ring-4 ${ring}`} />}
  </div>
);

export default Tile