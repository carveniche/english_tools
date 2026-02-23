import { useState } from "react";
import "./ForestDropdown.css";

export default function ForestDropdown({ selectedOption, onChange }) {
  const [open, setOpen] = useState(false);
  const options = ["Easy", "Medium", "Hard"];

  return (
    <div className="forest-dropdown">
      <div
        className="forest-dropdown-btn"
        // onClick={() => setOpen(!open)}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
      >
        <span>{selectedOption.toUpperCase()}</span>
        <span className={`arrow ${open ? "open" : ""}`}>&#9660;</span>
      </div>

      {open && (
        <div className="forest-dropdown-menu">
          {options.map((option) => (
            <div
              key={option}
              className="forest-dropdown-item"
              //   onClick={() => {
              //     setOpen(false);
              //     onChange(option);
              //   }}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onChange(option);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setOpen(false);
                onChange(option);
              }}
            >
              {option.toUpperCase()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
