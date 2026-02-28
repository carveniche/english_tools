// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { getLetterPath } from "./getLetterPath";
// import Lottie from "lottie-react";
// import BalloonCelebration from "./BalloonCelebration.json";

// type PathTracerProps = {
//   letter: string;
//   isUpper: boolean;
//   onProgress?: (progress: number) => void;
// };

// type Point = { x: number; y: number };

// export default function PathTracerWeb({ letter, isUpper, onProgress }: PathTracerProps) {
//   const strokesRaw = useMemo(() => getLetterPath(letter, isUpper), [letter, isUpper]);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [containerWidth, setContainerWidth] = useState(320);
//   const [dotAngle, setDotAngle] = useState(0);
//   const [showStartDot, setShowStartDot] = useState(true);
//   const strokesMeta = useRef<any[]>([]);
//   const finishedRef = useRef<boolean[]>([]);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const activeIdxRef = useRef(0);
//   const [drawIndex, setDrawIndex] = useState(0);
//   const [dot, setDot] = useState<Point>({ x: 0, y: 0 });
//   const draggingRef = useRef(false);
//   const lastIndexRef = useRef(0);
//   const lottieRef = useRef<any>(null);

//   const WIDTH_FRACTION = 0.9;
//   const DENSIFY_MAX_LEN = 6;
//   const BASE_GUIDE_STROKE = 16;
//   const BASE_FILL_STROKE = 16;
//   const BASE_DOT_RADIUS = 14;
//   const FINISH_THRESHOLD = 0.98;
//   const DIST_THRESHOLD = 40;

//   // Densify stroke points
//   const densify = (pts: Point[], maxLen = DENSIFY_MAX_LEN) => {
//     if (!pts || pts.length < 2) return pts ? [...pts] : [];
//     const out: Point[] = [];
//     for (let i = 0; i < pts.length - 1; i++) {
//       const a = pts[i], b = pts[i + 1];
//       const dx = b.x - a.x, dy = b.y - a.y;
//       const segLen = Math.hypot(dx, dy);
//       const n = Math.max(1, Math.ceil(segLen / maxLen));
//       for (let k = 0; k < n; k++) out.push({ x: a.x + dx * (k / n), y: a.y + dy * (k / n) });
//     }
//     out.push({ ...pts[pts.length - 1] });
//     return out;
//   };

//   // Set container width
//   useEffect(() => {
//     if (!containerRef.current) return;
//     setContainerWidth(containerRef.current.offsetWidth);
//   }, [containerRef.current]);

//   // Blinking start dot (only if showStartDot = true)
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (showStartDot) setShowStartDot(prev => !prev);
//     }, 500);
//     return () => clearInterval(interval);
//   }, [showStartDot]);

//   // Prepare strokes
//   useEffect(() => {
//     if (!containerWidth) return;
//     const svgW = Math.round(containerWidth * WIDTH_FRACTION);

//     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
//     strokesRaw.forEach((stroke:any) =>
//       stroke.forEach((p: Point) => {
//         if (p.x < minX) minX = p.x;
//         if (p.y < minY) minY = p.y;
//         if (p.x > maxX) maxX = p.x;
//         if (p.y > maxY) maxY = p.y;
//       })
//     );
//     if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 220; maxY = 230; }

//     const bboxW = Math.max(1, maxX - minX);
//     const bboxH = Math.max(1, maxY - minY);
//     const scale = Math.min(svgW / bboxW, 245 / bboxH);
//     const offsetY = 25;
//     const tx = (svgW - bboxW * scale) / 2 - minX * scale;
//     const tyBase = offsetY - minY * scale;

//     const meta = strokesRaw.map((rawPts: Point[]) => {
//       const dense = densify(rawPts, DENSIFY_MAX_LEN);
//       const LOWERCASE_SCALE = 0.75;
//       const pts = dense.map(p => ({
//         x: p.x * scale * (isUpper ? 1 : LOWERCASE_SCALE) + tx,
//         y: p.y * scale * (isUpper ? 1 : LOWERCASE_SCALE) + tyBase,
//       }));
//       return { pts };
//     });

//     strokesMeta.current = meta;
//     finishedRef.current = new Array(meta.length).fill(false);
//     setActiveIdx(0);
//     activeIdxRef.current = 0;
//     setDrawIndex(0);
//     lastIndexRef.current = 0;
//     setDot(meta[0].pts[0]);
//     setShowStartDot(true); // show arrow at first stroke start
//   }, [containerWidth, strokesRaw, isUpper]);

//   const handlePointerDown = (e: React.PointerEvent) => {
//     e.preventDefault();
//     draggingRef.current = true;
//     lastIndexRef.current = drawIndex;
//     setDot(strokesMeta.current[activeIdx].pts[drawIndex]);
//     setShowStartDot(false); // hide start arrow immediately when dragging
//     window.addEventListener("pointermove", handlePointerMove);
//     window.addEventListener("pointerup", handlePointerUp);
//   };

//   const handlePointerMove = (e: PointerEvent) => {
//     if (!draggingRef.current) return;

//     const rect = containerRef.current!.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || finishedRef.current[activeIdx]) return;

//     let closestDist = Infinity;
//     let closestIndex = lastIndexRef.current;
//     let closestPoint = meta.pts[lastIndexRef.current];

//     for (let i = lastIndexRef.current; i < meta.pts.length; i++) {
//       const p = meta.pts[i];
//       const d = Math.hypot(p.x - x, p.y - y);
//       if (d < closestDist) {
//         closestDist = d;
//         closestPoint = p;
//         closestIndex = i;
//       }
//     }

//     if (closestDist > DIST_THRESHOLD) return;

//     lastIndexRef.current = closestIndex;
//     setDot(closestPoint);
//     setDrawIndex(closestIndex);

//     const progress = Math.min(1, closestIndex / (meta.pts.length - 1));
//     onProgress?.(progress);

//     // Drag arrow angle
//     const prevPoint = meta.pts[Math.max(0, closestIndex - 1)];
//     const dx = closestPoint.x - prevPoint.x;
//     const dy = closestPoint.y - prevPoint.y;
//     setDotAngle(Math.atan2(dy, dx));

//     // Move to next stroke
//     if (progress >= FINISH_THRESHOLD) {
//       finishedRef.current[activeIdx] = true;
//       const next = activeIdx + 1;
//       if (strokesMeta.current[next]) {
//         setActiveIdx(next);
//         activeIdxRef.current = next;
//         lastIndexRef.current = 0;
//         setDrawIndex(0);
//         setDot(strokesMeta.current[next].pts[0]);
//         setShowStartDot(true); // show arrow at next stroke start
//       }
//     }
//   };

//   const handlePointerUp = () => {
//     draggingRef.current = false;
//     window.removeEventListener("pointermove", handlePointerMove);
//     window.removeEventListener("pointerup", handlePointerUp);
//   };

//   return (
//     <div
//       ref={containerRef}
//       style={{ width: "100%", height: 300, position: "relative", touchAction: "none" }}
//       onPointerDown={handlePointerDown}
//     >
//       <svg width={containerWidth} height={245} overflow="visible">
//         {/* Guide strokes */}
//         {strokesMeta.current.map((m, i) => (
//           <polyline
//             key={`guide-${i}`}
//             points={m.pts.map((p:any) => `${p.x},${p.y}`).join(" ")}
//             stroke="#eee"
//             strokeWidth={BASE_GUIDE_STROKE}
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         ))}

//         {/* Blinking start arrow */}
//         {strokesMeta.current[activeIdx]?.pts?.[0] && showStartDot && (
//           <g
//             transform={`translate(${strokesMeta.current[activeIdx].pts[0].x}, ${strokesMeta.current[activeIdx].pts[0].y})`}
//           >
//             <polygon
//               points="0,-4 8,0 0,4"
//               fill="orange"
//               opacity={0.8}
//               transform={`rotate(${
//                 strokesMeta.current[activeIdx].pts[1]
//                   ? (Math.atan2(
//                       strokesMeta.current[activeIdx].pts[1].y - strokesMeta.current[activeIdx].pts[0].y,
//                       strokesMeta.current[activeIdx].pts[1].x - strokesMeta.current[activeIdx].pts[0].x
//                     ) *
//                       180) /
//                     Math.PI
//                   : 0
//               })`}
//             />
//           </g>
//         )}

//         {/* Filled strokes */}
//         {strokesMeta.current.map((m, i) => {
//           let idx = 0;
//           if (i < activeIdx) idx = m.pts.length - 1;
//           else if (i === activeIdx) idx = drawIndex;
//           const drawPts = m.pts.slice(0, idx + 1);
//           return (
//             <polyline
//               key={`fill-${i}`}
//               points={drawPts.map((p:any) => `${p.x},${p.y}`).join(" ")}
//               stroke="#2563eb"
//               strokeWidth={BASE_FILL_STROKE}
//               strokeLinecap="round"
//               fill="none"
//             />
//           );
//         })}

//         {/* Drag dot with arrow */}
//         <g transform={`translate(${dot.x}, ${dot.y})`}>
//           <circle r={BASE_DOT_RADIUS} fill="#09bc48" />
//           <polygon
//             points="0,-6 12,0 0,6"
//             fill="#fff"
//             transform={`rotate(${(dotAngle * 180) / Math.PI}) translate(-6,0)`}
//           />
//         </g>
//       </svg>

//       {/* Celebration */}
//       {finishedRef.current.every(f => f) && (
//         <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
//           <Lottie lottieRef={lottieRef} animationData={BalloonCelebration} loop={false} />
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { getLetterPath } from "./getLetterPath";
// import Lottie from "lottie-react";
// import BalloonCelebration from "./BalloonCelebration.json";

// type PathTracerProps = {
//   letter: string;
//   isUpper: boolean;
//   onProgress?: (progress: number) => void;
//   onComplete?: () => void;
// };

// type Point = { x: number; y: number };

// export default function PathTracerWeb({ letter, isUpper, onProgress,onComplete }: PathTracerProps) {
//   const strokesRaw = useMemo(() => getLetterPath(letter, isUpper), [letter, isUpper]);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [containerWidth, setContainerWidth] = useState(220);
//   const [dotAngle, setDotAngle] = useState(0);
//   const strokesMeta = useRef<any[]>([]);
//   const finishedRef = useRef<boolean[]>([]);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const [drawIndex, setDrawIndex] = useState(0);
//   const [userDot, setUserDot] = useState<Point>({ x: 0, y: 0 });
//   const draggingRef = useRef(false);
//   const lastIndexRef = useRef(0);
//   const lottieRef = useRef<any>(null);

//   // Blinking guide dots
//   const [blinkVisible, setBlinkVisible] = useState(true);

//   const WIDTH_FRACTION = 0.9;
//   const DENSIFY_MAX_LEN = 6;
//   const BASE_GUIDE_STROKE = 16;
//   const BASE_FILL_STROKE = 16;
//   const USER_DOT_RADIUS = 14;
//   const BLINK_DOT_RADIUS = 4;           // ← smaller
//   const FINISH_THRESHOLD = 0.98;
//   const DIST_THRESHOLD = 40;
//   const [isFullyDone, setIsFullyDone] = useState(false);

// // When finished
// if (finishedRef.current.every(f => f) && !isFullyDone) {
//   setIsFullyDone(true);
//   onComplete?.();
// }

//   // Blink animation – a bit faster
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setBlinkVisible((prev) => !prev);
//     }, 500); // ← 500ms instead of 600ms
//     return () => clearInterval(interval);
//   }, []);

//   // Densify points
//   const densify = (pts: Point[], maxLen = DENSIFY_MAX_LEN) => {
//     if (!pts || pts.length < 2) return pts ? [...pts] : [];
//     const out: Point[] = [];
//     for (let i = 0; i < pts.length - 1; i++) {
//       const a = pts[i], b = pts[i + 1];
//       const dx = b.x - a.x, dy = b.y - a.y;
//       const segLen = Math.hypot(dx, dy);
//       const n = Math.max(1, Math.ceil(segLen / maxLen));
//       for (let k = 0; k < n; k++) out.push({ x: a.x + dx * (k / n), y: a.y + dy * (k / n) });
//     }
//     out.push({ ...pts[pts.length - 1] });
//     return out;
//   };

//   // Container width
//   useEffect(() => {
//     if (!containerRef.current) return;
//     setContainerWidth(containerRef.current.offsetWidth);
//   }, [containerRef.current]);

//   // Prepare strokes
//   useEffect(() => {
//     if (!containerWidth) return;
//     const svgW = Math.round(containerWidth * WIDTH_FRACTION);

//     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
//     strokesRaw.forEach((stroke: any) =>
//       stroke.forEach((p: Point) => {
//         if (p.x < minX) minX = p.x;
//         if (p.y < minY) minY = p.y;
//         if (p.x > maxX) maxX = p.x;
//         if (p.y > maxY) maxY = p.y;
//       })
//     );
//     if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 220; maxY = 230; }

//     const bboxW = Math.max(1, maxX - minX);
//     const bboxH = Math.max(1, maxY - minY);
//     const scale = Math.min(svgW / bboxW, 245 / bboxH);
//     const offsetY = 25;
//     const tx = (svgW - bboxW * scale) / 2 - minX * scale;
//     const tyBase = offsetY - minY * scale;

//     const meta = strokesRaw.map((rawPts: Point[]) => {
//       const dense = densify(rawPts, DENSIFY_MAX_LEN);
//       const LOWERCASE_SCALE = 0.75;
//       const pts = dense.map((p) => ({
//         x: p.x * scale * (isUpper ? 1 : LOWERCASE_SCALE) + tx,
//         y: p.y * scale * (isUpper ? 1 : LOWERCASE_SCALE) + tyBase,
//       }));
//       return { pts };
//     });

//     strokesMeta.current = meta;
//     finishedRef.current = new Array(meta.length).fill(false);
//     setActiveIdx(0);
//     setDrawIndex(0);
//     lastIndexRef.current = 0;
//     const startPt = meta[0]?.pts[0] || { x: 0, y: 0 };
//     setUserDot(startPt);
//   }, [containerWidth, strokesRaw, isUpper]);

//   const handlePointerDown = (e: React.PointerEvent) => {
//     e.preventDefault();
//     draggingRef.current = true;
//     lastIndexRef.current = drawIndex;
//     const pt = strokesMeta.current[activeIdx].pts[drawIndex];
//     setUserDot(pt);
//     window.addEventListener("pointermove", handlePointerMove);
//     window.addEventListener("pointerup", handlePointerUp);
//   };

//   const handlePointerMove = (e: PointerEvent) => {
//     if (!draggingRef.current) return;

//     const rect = containerRef.current!.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || finishedRef.current[activeIdx]) return;

//     let closestDist = Infinity;
//     let closestIndex = lastIndexRef.current;
//     let closestPoint = meta.pts[lastIndexRef.current];

//     for (let i = lastIndexRef.current; i < meta.pts.length; i++) {
//       const p = meta.pts[i];
//       const d = Math.hypot(p.x - x, p.y - y);
//       if (d < closestDist) {
//         closestDist = d;
//         closestPoint = p;
//         closestIndex = i;
//       }
//     }

//     if (closestDist > DIST_THRESHOLD) return;

//     lastIndexRef.current = closestIndex;
//     setUserDot(closestPoint);
//     setDrawIndex(closestIndex);

//     const progress = Math.min(1, closestIndex / (meta.pts.length - 1));
//     onProgress?.(progress);

//     const prevPoint = meta.pts[Math.max(0, closestIndex - 1)];
//     setDotAngle(Math.atan2(closestPoint.y - prevPoint.y, closestPoint.x - prevPoint.x));

//     if (progress >= FINISH_THRESHOLD) {
//       finishedRef.current[activeIdx] = true;
//       const next = activeIdx + 1;
//       if (strokesMeta.current[next]) {
//         setActiveIdx(next);
//         setDrawIndex(0);
//         lastIndexRef.current = 0;
//         setUserDot(strokesMeta.current[next].pts[0]);
//       }
//     }
//   };

//   const handlePointerUp = () => {
//     draggingRef.current = false;
//     window.removeEventListener("pointermove", handlePointerMove);
//     window.removeEventListener("pointerup", handlePointerUp);
//   };

//   // Get points from current drawIndex to end for blinking
//   const getRemainingPoints = () => {
//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || meta.pts.length <= drawIndex) return [];
//     return meta.pts.slice(drawIndex);
//   };

//   return (
//     <div
//       ref={containerRef}
//       style={{ width: "100%", height: 300, position: "relative", touchAction: "none" }}
//       className="flex justify-center items-center"
//       onPointerDown={handlePointerDown}
//     >
//       <svg width={containerWidth} height={245} overflow="visible"
//      className={`relative flex items-center justify-center ${
//   !isUpper ? "" : "top-[-1rem]"
// }`}
// >
//         {/* Gray guide lines */}
//         {strokesMeta.current.map((m, i) => (
//           <polyline
//             key={`guide-${i}`}
//             points={m.pts.map((p: any) => `${p.x},${p.y}`).join(" ")}
//             stroke="#eee"
//             strokeWidth={BASE_GUIDE_STROKE}
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         ))}

//         {/* Blue filled progress */}
//         {strokesMeta.current.map((m, i) => {
//           let idx = 0;
//           if (i < activeIdx) idx = m.pts.length - 1;
//           else if (i === activeIdx) idx = drawIndex;
//           const drawPts = m.pts.slice(0, idx + 1);
//           return (
//             <polyline
//               key={`fill-${i}`}
//               points={drawPts.map((p: any) => `${p.x},${p.y}`).join(" ")}
//               stroke="#2563eb"
//               strokeWidth={BASE_FILL_STROKE}
//               strokeLinecap="round"
//               fill="none"
//             />
//           );
//         })}

//         {/* Main user node – always visible */}
//        <g transform={`translate(${userDot.x}, ${userDot.y})`}>
//   {/* Main dot – always visible */}
//   <circle 
//     r={USER_DOT_RADIUS} 
//     fill="#09bc48"           // green
//     stroke="#15803d"         // darker green outline
//     strokeWidth={2}
//   />

//   {/* Arrow – pointing in the direction of movement */}
//   <g transform={`rotate(${(dotAngle * 180) / Math.PI})`}>
//     <polygon
//       points="-4,-10  12,0  -4,10"          // wider & longer arrow shape
//       fill="#ffffff"                        // white fill
//       stroke="#1e293b"                      // dark outline (stone gray)
//       strokeWidth={1.5}
//     />
//   </g>
// </g>

//         {/* Blinking hint dots – more of them, smaller */}
//         {blinkVisible &&
//           getRemainingPoints().map((pt: Point, idx: number) => {
//             // Skip the very first point (covered by main dot)
//             if (idx === 0) return null;
//             // Show more frequently → every 5th point instead of 10th
//             if (idx % 5 !== 0) return null;

//             return (
//               <circle
//                 key={`blink-${activeIdx}-${drawIndex}-${idx}`}
//                 cx={pt.x}
//                 cy={pt.y}
//                 r={BLINK_DOT_RADIUS}
//                 fill="#f97316"
//                 opacity={0.65}           // ← slightly softer
//               />
//             );
//           })}
//       </svg>

//       {/* Celebration */}
//       {finishedRef.current.every((f) => f) && (
//         <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}>
//           <Lottie lottieRef={lottieRef} animationData={BalloonCelebration} loop={false}
//           onComplete={() => {
//         onComplete?.();               // ← Call when animation starts / ends
//       }} />
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { getLetterPath } from "./getLetterPath";
// import Lottie from "lottie-react";
// import BalloonCelebration from "./BalloonCelebration.json";

// type PathTracerProps = {
//   letter: string;
//   isUpper: boolean;
//   onProgress?: (progress: number) => void;
//   onComplete?: () => void;
// };

// type Point = { x: number; y: number };

// export default function PathTracerWeb({ letter, isUpper, onProgress, onComplete }: PathTracerProps) {
//   const strokesRaw = useMemo(() => getLetterPath(letter, isUpper), [letter, isUpper]);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [containerWidth, setContainerWidth] = useState(0);
//   const [dotAngle, setDotAngle] = useState(0);
//   const strokesMeta = useRef<any[]>([]);
//   const finishedRef = useRef<boolean[]>([]);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const [drawIndex, setDrawIndex] = useState(0);
//   const [userDot, setUserDot] = useState<Point>({ x: 0, y: 0 });
//   const draggingRef = useRef(false);
//   const lastIndexRef = useRef(0);
//   const lottieRef = useRef<any>(null);
//   const [blinkVisible, setBlinkVisible] = useState(true);
//   const [isFullyDone, setIsFullyDone] = useState(false);

//   const WIDTH_FRACTION = 0.92;
//   const DENSIFY_MAX_LEN = 6;
//   const BASE_GUIDE_STROKE = 14;
//   const BASE_FILL_STROKE = 14;
//   const USER_DOT_RADIUS = 13;
//   const BLINK_DOT_RADIUS = 4;
//   const FINISH_THRESHOLD = 0.98;
//   const DIST_THRESHOLD = 35;

//   // Blink animation
//   useEffect(() => {
//     const id = setInterval(() => setBlinkVisible(v => !v), 600);
//     return () => clearInterval(id);
//   }, []);

//   // Complete callback
//   useEffect(() => {
//     if (finishedRef.current.every(f => f) && !isFullyDone) {
//       setIsFullyDone(true);
//       onComplete?.();
//     }
//   }, [finishedRef.current, isFullyDone]);

//   // Resize observer for accurate width
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const updateWidth = () => {
//       setContainerWidth(containerRef.current?.offsetWidth || 320);
//     };

//     updateWidth();
//     const ro = new ResizeObserver(updateWidth);
//     ro.observe(containerRef.current);

//     return () => ro.disconnect();
//   }, []);

//     const densify = (pts: Point[], maxLen = DENSIFY_MAX_LEN) => {
//     if (!pts || pts.length < 2) return pts ? [...pts] : [];
//     const out: Point[] = [];
//     for (let i = 0; i < pts.length - 1; i++) {
//       const a = pts[i], b = pts[i + 1];
//       const dx = b.x - a.x, dy = b.y - a.y;
//       const segLen = Math.hypot(dx, dy);
//       const n = Math.max(1, Math.ceil(segLen / maxLen));
//       for (let k = 0; k < n; k++) out.push({ x: a.x + dx * (k / n), y: a.y + dy * (k / n) });
//     }
//     out.push({ ...pts[pts.length - 1] });
//     return out;
//   };

//   // Prepare paths
//   useEffect(() => {
//     if (!containerWidth) return;

//     const svgW = containerWidth * WIDTH_FRACTION;

//     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
//     strokesRaw.forEach((stroke:any) =>
//       stroke.forEach((p: Point) => {
//         minX = Math.min(minX, p.x);
//         minY = Math.min(minY, p.y);
//         maxX = Math.max(maxX, p.x);
//         maxY = Math.max(maxY, p.y);
//       })
//     );

//     if (!isFinite(minX)) {
//       minX = minY = 0;
//       maxX = 220; maxY = 230;
//     }

//     const bboxW = maxX - minX || 1;
//     const bboxH = maxY - minY || 1;

//     // Base scale
//     let scale = Math.min(svgW / bboxW, 240 / bboxH);

//     // Lowercase smaller & better positioned
//     const LOWERCASE_SCALE = 0.72;
//     if (!isUpper) {
//       scale *= LOWERCASE_SCALE;
//     }

//     const tx = (svgW - bboxW * scale) / 2 - minX * scale;

//     // Vertical centering — lowercase needs more top margin
//     const offsetY = isUpper ? 30 : 80;
//     const tyBase = offsetY - minY * scale;

//     const meta = strokesRaw.map((rawPts:any) => {
//       const dense = densify(rawPts);
//       const pts = dense.map(p => ({
//         x: p.x * scale + tx,
//         y: p.y * scale + tyBase,
//       }));
//       return { pts };
//     });

//     strokesMeta.current = meta;
//     finishedRef.current = new Array(meta.length).fill(false);
//     setActiveIdx(0);
//     setDrawIndex(0);
//     lastIndexRef.current = 0;
//     setUserDot(meta[0]?.pts[0] || { x: 0, y: 0 });
//     setIsFullyDone(false);
//   }, [containerWidth, strokesRaw, isUpper]);
//   const handlePointerDown = (e: React.PointerEvent) => {
//     e.preventDefault();
//     draggingRef.current = true;
//     lastIndexRef.current = drawIndex;
//     const pt = strokesMeta.current[activeIdx].pts[drawIndex];
//     setUserDot(pt);
//     window.addEventListener("pointermove", handlePointerMove);
//     window.addEventListener("pointerup", handlePointerUp);
//   };

//   const handlePointerMove = (e: PointerEvent) => {
//     if (!draggingRef.current) return;

//     const rect = containerRef.current!.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || finishedRef.current[activeIdx]) return;

//     let closestDist = Infinity;
//     let closestIndex = lastIndexRef.current;
//     let closestPoint = meta.pts[lastIndexRef.current];

//     for (let i = lastIndexRef.current; i < meta.pts.length; i++) {
//       const p = meta.pts[i];
//       const d = Math.hypot(p.x - x, p.y - y);
//       if (d < closestDist) {
//         closestDist = d;
//         closestPoint = p;
//         closestIndex = i;
//       }
//     }

//     if (closestDist > DIST_THRESHOLD) return;

//     lastIndexRef.current = closestIndex;
//     setUserDot(closestPoint);
//     setDrawIndex(closestIndex);

//     const progress = Math.min(1, closestIndex / (meta.pts.length - 1));
//     onProgress?.(progress);

//     const prevPoint = meta.pts[Math.max(0, closestIndex - 1)];
//     setDotAngle(Math.atan2(closestPoint.y - prevPoint.y, closestPoint.x - prevPoint.x));

//     if (progress >= FINISH_THRESHOLD) {
//       finishedRef.current[activeIdx] = true;
//       const next = activeIdx + 1;
//       if (strokesMeta.current[next]) {
//         setActiveIdx(next);
//         setDrawIndex(0);
//         lastIndexRef.current = 0;
//         setUserDot(strokesMeta.current[next].pts[0]);
//       }
//     }
//   };

//   const handlePointerUp = () => {
//     draggingRef.current = false;
//     window.removeEventListener("pointermove", handlePointerMove);
//     window.removeEventListener("pointerup", handlePointerUp);
//   };

//   // Get points from current drawIndex to end for blinking
//   const getRemainingPoints = () => {
//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || meta.pts.length <= drawIndex) return [];
//     return meta.pts.slice(drawIndex);
//   };

//   // ... rest of your event handlers remain the same ...

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         width: "100%",
//         height: "100%",
//         position: "relative",
//         touchAction: "none",
//       }}
//       onPointerDown={handlePointerDown}
//     >
//       <svg
//         width="100%"
//         height="100%"
//         viewBox={`0 0 ${containerWidth} 300`}
//         preserveAspectRatio="xMidYMid meet"
//         style={{ overflow: "visible" }}
//       >
//         <g stroke="#9ca3af" strokeWidth="1.8" strokeDasharray="5 3">
//     {/* Top line (headline / sky line) */}
//     <line x1="0" y1="70" x2={containerWidth} y2="70" />

//     {/* Middle line (main writing line) */}
//     <line x1="0" y1="150" x2={containerWidth} y2="150" />

//     {/* Bottom line (baseline / foot line) */}
//     <line x1="0" y1="230" x2={containerWidth} y2="230" />
//   </g>
//         {/* Guide */}
//         {strokesMeta.current.map((m, i) => (
//           <polyline
//             key={`guide-${i}`}
//             points={m.pts.map((p:any) => `${p.x},${p.y}`).join(" ")}
//             stroke="#e5e7eb"
//             strokeWidth={BASE_GUIDE_STROKE}
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         ))}

//         {/* Progress */}
//         {strokesMeta.current.map((m, i) => {
//           let idx = i < activeIdx ? m.pts.length - 1 : (i === activeIdx ? drawIndex : 0);
//           const pts = m.pts.slice(0, idx + 1);
//           return (
//             <polyline
//               key={`fill-${i}`}
//               points={pts.map((p:any) => `${p.x},${p.y}`).join(" ")}
//               stroke="#3b82f6"
//               strokeWidth={BASE_FILL_STROKE}
//               strokeLinecap="round"
//               fill="none"
//             />
//           );
//         })}

//         {/* Dot + Arrow */}
//         <g transform={`translate(${userDot.x}, ${userDot.y})`}>
//           <circle r={USER_DOT_RADIUS} fill="#10b981" stroke="#047857" strokeWidth={2.5} />
//           <g transform={`rotate(${(dotAngle * 180) / Math.PI}) translate(10, 0)`}>
//             <polygon
//               points="0,-10 16,0 0,10"
//               fill="white"
//               stroke="#1e293b"
//               strokeWidth={1.8}
//               strokeLinejoin="round"
//             />
//           </g>
//         </g>

//         {/* Blinking hints */}
//         {blinkVisible &&
//           getRemainingPoints().map((pt:any, idx:any) => {
//             if (idx === 0 || idx % 6 !== 0) return null;
//             return (
//               <circle
//                 key={idx}
//                 cx={pt.x}
//                 cy={pt.y}
//                 r={BLINK_DOT_RADIUS}
//                 fill="#f59e0b"
//                 opacity={0.7}
//               />
//             );
//           })}
//       </svg>

//       {/* Celebration */}
//       {finishedRef.current.every(f => f) && (
//         <div style={{
//           position: "absolute",
//           inset: 0,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           pointerEvents: "none",
//         }}>
//           <Lottie
//             lottieRef={lottieRef}
//             animationData={BalloonCelebration}
//             loop={false}
//             style={{ width: "100%", height: "100%" }}
//             onComplete={() => onComplete?.()}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useEffect, useRef, useState, useMemo } from "react";
// import { getLetterPath } from "./getLetterPath";
// import Lottie from "lottie-react";
// import BalloonCelebration from "./BalloonCelebration.json";

// type PathTracerProps = {
//   letter: string;
//   isUpper: boolean;
//   onProgress?: (progress: number) => void;
//   onComplete?: () => void;
// };

// type Point = { x: number; y: number };

// export default function PathTracerWeb({ letter, isUpper, onProgress, onComplete }: PathTracerProps) {
//   const strokesRaw = useMemo(() => getLetterPath(letter, isUpper), [letter, isUpper]);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [containerWidth, setContainerWidth] = useState(0);
//   const [dotAngle, setDotAngle] = useState(0);
//   const strokesMeta = useRef<any[]>([]);
//   const finishedRef = useRef<boolean[]>([]);
//   const [activeIdx, setActiveIdx] = useState(0);
//   const [drawIndex, setDrawIndex] = useState(0);
//   const [userDot, setUserDot] = useState<Point>({ x: 0, y: 0 });
//   const draggingRef = useRef(false);
//   const lastIndexRef = useRef(0);
//   const lottieRef = useRef<any>(null);
//   const [blinkVisible, setBlinkVisible] = useState(true);
//   const [isFullyDone, setIsFullyDone] = useState(false);

//   const WIDTH_FRACTION = 0.92;
//   const DENSIFY_MAX_LEN = 6;
//   const BASE_GUIDE_STROKE = 14;
//   const BASE_FILL_STROKE = 14;
//   const USER_DOT_RADIUS = 13;
//   const BLINK_DOT_RADIUS = 4;
//   const FINISH_THRESHOLD = 0.98;
//   const DIST_THRESHOLD = 35;

//   // Blink animation
//   useEffect(() => {
//     const id = setInterval(() => setBlinkVisible(v => !v), 600);
//     return () => clearInterval(id);
//   }, []);

//   // Complete callback
//   useEffect(() => {
//     if (finishedRef.current.every(f => f) && !isFullyDone) {
//       setIsFullyDone(true);
//       onComplete?.();
//     }
//   }, [finishedRef.current, isFullyDone]);

//   // Resize observer
//   useEffect(() => {
//     if (!containerRef.current) return;

//     const updateWidth = () => {
//       setContainerWidth(containerRef.current?.offsetWidth || 320);
//     };

//     updateWidth();
//     const ro = new ResizeObserver(updateWidth);
//     ro.observe(containerRef.current);

//     return () => ro.disconnect();
//   }, []);

//   const densify = (pts: Point[], maxLen = DENSIFY_MAX_LEN) => {
//     if (!pts || pts.length < 2) return pts ? [...pts] : [];
//     const out: Point[] = [];
//     for (let i = 0; i < pts.length - 1; i++) {
//       const a = pts[i], b = pts[i + 1];
//       const dx = b.x - a.x, dy = b.y - a.y;
//       const segLen = Math.hypot(dx, dy);
//       const n = Math.max(1, Math.ceil(segLen / maxLen));
//       for (let k = 0; k < n; k++) out.push({ x: a.x + dx * (k / n), y: a.y + dy * (k / n) });
//     }
//     out.push({ ...pts[pts.length - 1] });
//     return out;
//   };

//   // Prepare paths – fit letter between 3 guideline lines
//   useEffect(() => {
//     if (!containerWidth) return;

//     const svgW = containerWidth * WIDTH_FRACTION;

//     // Fixed 3-line positions (in 0–300 viewBox height)
//     const TOP_LINE_Y    = 70;   // sky / headline
//     const MIDDLE_LINE_Y = 150;  // plane / midline
//     const BOTTOM_LINE_Y = 230;  // baseline / worm line

//     // Target height for capitals (almost full span between top & bottom line)
//     const TARGET_CAPITAL_HEIGHT = BOTTOM_LINE_Y - TOP_LINE_Y; // 160 units

//     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
//     strokesRaw.forEach((stroke: any) =>
//       stroke.forEach((p: Point) => {
//         minX = Math.min(minX, p.x);
//         minY = Math.min(minY, p.y);
//         maxX = Math.max(maxX, p.x);
//         maxY = Math.max(maxY, p.y);
//       })
//     );

//     if (!isFinite(minX)) {
//       minX = minY = 0;
//       maxX = 220;
//       maxY = 230;
//     }

//     const bboxW = maxX - minX || 1;
//     const bboxH = maxY - minY || 1;

//     // Base scale
//     let scale = Math.min(svgW / bboxW, 240 / bboxH);

//     // Capitals: scale to fit between top & bottom line
//     if (isUpper) {
//       scale = Math.min(scale, TARGET_CAPITAL_HEIGHT / bboxH * 0.95);
//     } else {
//       // Lowercase: smaller, baseline on bottom line
//       scale *= 0.68;
//     }

//     const tx = (svgW - bboxW * scale) / 2 - minX * scale;

//     // Vertical alignment to 3-line system
//     let tyBase: number;
//     if (isUpper) {
//       // Capitals span from near top line to bottom line
//       tyBase = TOP_LINE_Y - minY * scale + 5; // small padding
//     } else {
//       // Lowercase: baseline on bottom line
//       tyBase = BOTTOM_LINE_Y - maxY * scale;
//     }

//     const meta = strokesRaw.map((rawPts: Point[]) => {
//       const dense = densify(rawPts);
//       const pts = dense.map(p => ({
//         x: p.x * scale + tx,
//         y: p.y * scale + tyBase,
//       }));
//       return { pts };
//     });

//     strokesMeta.current = meta;
//     finishedRef.current = new Array(meta.length).fill(false);
//     setActiveIdx(0);
//     setDrawIndex(0);
//     lastIndexRef.current = 0;
//     setUserDot(meta[0]?.pts[0] || { x: 0, y: 0 });
//     setIsFullyDone(false);
//   }, [containerWidth, strokesRaw, isUpper]);

//   const handlePointerDown = (e: React.PointerEvent) => {
//     e.preventDefault();
//     draggingRef.current = true;
//     lastIndexRef.current = drawIndex;
//     const pt = strokesMeta.current[activeIdx].pts[drawIndex];
//     setUserDot(pt);
//     window.addEventListener("pointermove", handlePointerMove);
//     window.addEventListener("pointerup", handlePointerUp);
//   };

//   const handlePointerMove = (e: PointerEvent) => {
//     if (!draggingRef.current) return;

//     const rect = containerRef.current!.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || finishedRef.current[activeIdx]) return;

//     let closestDist = Infinity;
//     let closestIndex = lastIndexRef.current;
//     let closestPoint = meta.pts[lastIndexRef.current];

//     for (let i = lastIndexRef.current; i < meta.pts.length; i++) {
//       const p = meta.pts[i];
//       const d = Math.hypot(p.x - x, p.y - y);
//       if (d < closestDist) {
//         closestDist = d;
//         closestPoint = p;
//         closestIndex = i;
//       }
//     }

//     if (closestDist > DIST_THRESHOLD) return;

//     lastIndexRef.current = closestIndex;
//     setUserDot(closestPoint);
//     setDrawIndex(closestIndex);

//     const progress = Math.min(1, closestIndex / (meta.pts.length - 1));
//     onProgress?.(progress);

//     const prevPoint = meta.pts[Math.max(0, closestIndex - 1)];
//     setDotAngle(Math.atan2(closestPoint.y - prevPoint.y, closestPoint.x - prevPoint.x));

//     if (progress >= FINISH_THRESHOLD) {
//       finishedRef.current[activeIdx] = true;
//       const next = activeIdx + 1;
//       if (strokesMeta.current[next]) {
//         setActiveIdx(next);
//         setDrawIndex(0);
//         lastIndexRef.current = 0;
//         setUserDot(strokesMeta.current[next].pts[0]);
//       }
//     }
//   };

//   const handlePointerUp = () => {
//     draggingRef.current = false;
//     window.removeEventListener("pointermove", handlePointerMove);
//     window.removeEventListener("pointerup", handlePointerUp);
//   };

//   const getRemainingPoints = () => {
//     const meta = strokesMeta.current[activeIdx];
//     if (!meta || meta.pts.length <= drawIndex) return [];
//     return meta.pts.slice(drawIndex);
//   };

//   return (
//     <div
//       ref={containerRef}
//       style={{
//         width: "100%",
//         height: "100%",
//         position: "relative",
//         touchAction: "none",
//       }}
//       onPointerDown={handlePointerDown}
//     >
//       <svg
//         width="100%"
//         height="100%"
//         viewBox={`0 0 ${containerWidth} 300`}
//         preserveAspectRatio="xMidYMid meet"
//         style={{ overflow: "visible" }}
//       >
//         {/* === 3-line handwriting guidelines === */}
//         <g stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="6 4" opacity={0.7}>
//           <line x1="0" y1="70"  x2={containerWidth} y2="70"  /> {/* Top / sky line */}
//           <line x1="0" y1="150" x2={containerWidth} y2="150" /> {/* Middle / plane line */}
//           <line x1="0" y1="230" x2={containerWidth} y2="230" /> {/* Bottom / baseline */}
//         </g>

//         {/* Guide strokes */}
//         {strokesMeta.current.map((m, i) => (
//           <polyline
//             key={`guide-${i}`}
//             points={m.pts.map((p: any) => `${p.x},${p.y}`).join(" ")}
//             stroke="#e5e7eb"
//             strokeWidth={BASE_GUIDE_STROKE}
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           />
//         ))}

//         {/* Filled progress */}
//         {strokesMeta.current.map((m, i) => {
//           let idx = i < activeIdx ? m.pts.length - 1 : (i === activeIdx ? drawIndex : 0);
//           const pts = m.pts.slice(0, idx + 1);
//           return (
//             <polyline
//               key={`fill-${i}`}
//               points={pts.map((p: any) => `${p.x},${p.y}`).join(" ")}
//               stroke="#3b82f6"
//               strokeWidth={BASE_FILL_STROKE}
//               strokeLinecap="round"
//               fill="none"
//             />
//           );
//         })}

//         {/* User dot + arrow */}
//         <g transform={`translate(${userDot.x}, ${userDot.y})`}>
//           <circle r={USER_DOT_RADIUS} fill="#10b981" stroke="#047857" strokeWidth={2.5} />
//           <g transform={`rotate(${(dotAngle * 180) / Math.PI}) translate(10, 0)`}>
//             <polygon
//               points="0,-10 16,0 0,10"
//               fill="white"
//               stroke="#1e293b"
//               strokeWidth={1.8}
//               strokeLinejoin="round"
//             />
//           </g>
//         </g>

//         {/* Blinking direction arrows */}
//      {/* Blinking direction arrows – always point forward along the path */}
// {blinkVisible &&
//   getRemainingPoints()
//     .filter((_:any, idx:any) => idx > 0 && idx % 10 === 0) // adjust %10 for more/less density
//     .map((pt: Point, i: number) => {
//       const pts = strokesMeta.current[activeIdx].pts;
//       const currentGlobalIdx = drawIndex + i * 10;

//       let angleDeg = 0;

//       // Prefer forward direction (look 1–4 points ahead for smooth angle)
//       if (currentGlobalIdx < pts.length - 1) {
//         // Find the next valid point with reasonable distance
//         let nextIdx = currentGlobalIdx + 1;
//         let attempts = 0;
//         while (nextIdx < pts.length && attempts < 4) {
//           const next = pts[nextIdx];
//           const dx = next.x - pt.x;
//           const dy = next.y - pt.y;
//           const dist = Math.hypot(dx, dy);
//           if (dist > 3) { // only use if segment is long enough
//             angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
//             break;
//           }
//           nextIdx++;
//           attempts++;
//         }
//       }

//       // If no good forward point (very end), gently fallback to previous (but keep forward intent)
//       if (angleDeg === 0 && currentGlobalIdx > 0) {
//         const prev = pts[currentGlobalIdx - 1];
//         const dx = pt.x - prev.x;
//         const dy = pt.y - prev.y;
//         if (Math.hypot(dx, dy) > 1) {
//           angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
//         }
//       }

//       return (
//         <g
//           key={`dir-arrow-${activeIdx}-${drawIndex}-${i}`}
//           transform={`translate(${pt.x}, ${pt.y})`}
//         >
//           <polygon
//             points="-1,-9 14,0 -1,9"     // sharper, longer arrow
//             fill="#f59e0b"
//             opacity={0.88}
//             stroke="#b45309"
//             strokeWidth={1.5}
//             strokeLinejoin="round"
//             transform={`rotate(${angleDeg}) translate(6, 0)`} // offset so arrow starts at point
//           />
//         </g>
//       );
//     })}
//       </svg>

//       {/* Celebration */}
//       {finishedRef.current.every(f => f) && (
//         <div style={{
//           position: "absolute",
//           inset: 0,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           pointerEvents: "none",
//         }}>
//           <Lottie
//             lottieRef={lottieRef}
//             animationData={BalloonCelebration}
//             loop={false}
//             style={{ width: "100%", height: "100%" }}
//             onComplete={() => onComplete?.()}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useRef, useState, useMemo } from "react";
import { getLetterPath } from "./getLetterPath";
import Lottie from "lottie-react";
import BalloonCelebration from "./BalloonCelebration.json";

type PathTracerProps = {
  letter: string;
  isUpper: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
};

type Point = { x: number; y: number };

export default function PathTracerWeb({ letter, isUpper, onProgress, onComplete }: PathTracerProps) {
  const strokesRaw = useMemo(() => getLetterPath(letter, isUpper), [letter, isUpper]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [dotAngle, setDotAngle] = useState(0);
  const strokesMeta = useRef<any[]>([]);
  const finishedRef = useRef<boolean[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [drawIndex, setDrawIndex] = useState(0);
  const [userDot, setUserDot] = useState<Point>({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const lastIndexRef = useRef(0);
  const lottieRef = useRef<any>(null);
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [isFullyDone, setIsFullyDone] = useState(false);

  const WIDTH_FRACTION = 0.92;
  const DENSIFY_MAX_LEN = 6;
  const BASE_GUIDE_STROKE = 14;
  const BASE_FILL_STROKE = 14;
  const USER_DOT_RADIUS = 12;
  const BLINK_DOT_RADIUS = 4;
  const FINISH_THRESHOLD = 0.98;
  const DIST_THRESHOLD = 35;

//   const MIDDLE_TO_BOTTOM_LETTERS = new Set([
//   "a","c","e","g","i","j","m","n","o","p","q","r",
//   "s","t","u","v","w","x","y","z"
// ]);

const MIDDLE_ONLY_LETTERS = new Set([
  "a","c","e","i","m","n","o","r","s","t","u","v","w","x","z"
]);

const DESCENDER_LETTERS = new Set([
  "g","j","p","q","y"
]);
  // Blink animation
  useEffect(() => {
    const id = setInterval(() => setBlinkVisible(v => !v), 600);
    return () => clearInterval(id);
  }, []);

  // Complete callback
  useEffect(() => {
    if (finishedRef.current.every(f => f) && !isFullyDone) {
      setIsFullyDone(true);
      onComplete?.();
    }
  }, [finishedRef.current, isFullyDone]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      setContainerWidth(containerRef.current?.offsetWidth || 320);
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);

    return () => ro.disconnect();
  }, []);

  const densify = (pts: Point[], maxLen = DENSIFY_MAX_LEN) => {
    if (!pts || pts.length < 2) return pts ? [...pts] : [];
    const out: Point[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y;
      const segLen = Math.hypot(dx, dy);
      const n = Math.max(1, Math.ceil(segLen / maxLen));
      for (let k = 0; k < n; k++) out.push({ x: a.x + dx * (k / n), y: a.y + dy * (k / n) });
    }
    out.push({ ...pts[pts.length - 1] });
    return out;
  };

  // Prepare paths – fit letter between 3 guideline lines
     const computeAngleAtIndex = (pts: Point[], idx: number) => {
  if (!pts || pts.length < 2) return 0;

  const curr = pts[idx];
  const next = pts[Math.min(idx + 1, pts.length - 1)];

  const dx = next.x - curr.x;
  const dy = next.y - curr.y;

  if (Math.hypot(dx, dy) < 0.5) return 0;

  return Math.atan2(dy, dx);
};
  useEffect(() => {
    if (!containerWidth) return;
 


    const svgW = containerWidth * WIDTH_FRACTION;

    // Fixed 3-line positions (in 0–300 viewBox height)
    const TOP_LINE_Y    = 70;   // sky / headline
    const MIDDLE_LINE_Y = 150;  // plane / midline
    const BOTTOM_LINE_Y = 230;  // baseline / worm line

    // Target height for capitals (almost full span between top & bottom line)
    const TARGET_CAPITAL_HEIGHT = BOTTOM_LINE_Y - TOP_LINE_Y; // 160 units

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokesRaw.forEach((stroke: any) =>
      stroke.forEach((p: Point) => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      })
    );

    if (!isFinite(minX)) {
      minX = minY = 0;
      maxX = 220;
      maxY = 230;
    }

    const bboxW = maxX - minX || 1;
    const bboxH = maxY - minY || 1;

    // Base scale
    // let scale = Math.min(svgW / bboxW, 240 / bboxH);

    // Capitals: scale to fit between top & bottom line
    // if (isUpper) {
    //   scale = Math.min(scale, TARGET_CAPITAL_HEIGHT / bboxH * 0.95);
    // } else {
    //   // Lowercase: smaller, baseline on bottom line
    //   scale *= 0.68;
    // }

  //   const tx = (svgW - bboxW * scale) / 2 - minX * scale;

  //   // Vertical alignment to 3-line system
  //   let tyBase: number;
  //   if (isUpper) {
  //     // Capitals span from near top line to bottom line
  //     tyBase = TOP_LINE_Y - minY * scale + 5; // small padding
  //   } else {
  //     // Lowercase: baseline on bottom line
  //     // tyBase = BOTTOM_LINE_Y - maxY * scale;
  //       const TARGET_LOWER_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;

  // scale = Math.min(scale, TARGET_LOWER_HEIGHT / bboxH * 0.95);
  // tyBase = MIDDLE_LINE_Y - minY * scale;
  //   }

  // Base scale
// let scale = Math.min(svgW / bboxW, 240 / bboxH);

// const tx = (svgW - bboxW * scale) / 2 - minX * scale;

// let tyBase: number;

// if (isUpper) {
//   // ✅ CAPITAL LETTERS → top to bottom
//   scale = Math.min(scale, TARGET_CAPITAL_HEIGHT / bboxH * 0.95);
//   tyBase = TOP_LINE_Y - minY * scale + 5;

// } else if (MIDDLE_TO_BOTTOM_LETTERS.has(letter.toLowerCase())) {
//   // ✅ a c e g i j m n o p q r s t u v w x y z
//   const TARGET_LOWER_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;
//   scale = Math.min(scale, TARGET_LOWER_HEIGHT / bboxH * 0.95);
//   tyBase = MIDDLE_LINE_Y - minY * scale;

// } else {
//   // ✅ b d h k l f (ascenders)
//   scale *= 0.85;
//   tyBase = BOTTOM_LINE_Y - maxY * scale;
// }

// ---------------- ALIGNMENT FIX ----------------
// let scale = Math.min(svgW / bboxW, 240 / bboxH);
// let tyBase: number;

// // Capital letters: top → bottom
// if (isUpper) {
//   scale = Math.min(scale, TARGET_CAPITAL_HEIGHT / bboxH * 0.95);
//   tyBase = TOP_LINE_Y - minY * scale + 5;

// // Middle → bottom lowercase letters
// } else if (MIDDLE_TO_BOTTOM_LETTERS.has(letter.toLowerCase())) {
//   const TARGET_LOWER_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;
//   scale = Math.min(scale, TARGET_LOWER_HEIGHT / bboxH * 0.95);
//   tyBase = MIDDLE_LINE_Y - minY * scale;

// // Ascenders (b d h k l f)
// } else {
//   scale = Math.min(scale, (BOTTOM_LINE_Y - TOP_LINE_Y) / bboxH * 0.9);
//   tyBase = BOTTOM_LINE_Y - maxY * scale;
// }

// // ✅ CENTER HORIZONTALLY — AFTER scale finalized
// const tx = (svgW - bboxW * scale) / 2 - minX * scale;

// let scale = Math.min(svgW / bboxW, 240 / bboxH);
// let tyBase: number;

// // CAPITAL LETTERS
// if (isUpper) {
//   scale = Math.min(scale, TARGET_CAPITAL_HEIGHT / bboxH * 0.95);
//   tyBase = TOP_LINE_Y - minY * scale + 5;

// // DESCENDERS → body middle→bottom, tail below bottom
// } else if (DESCENDER_LETTERS.has(letter.toLowerCase())) {
//   const BODY_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;
//   const TOTAL_HEIGHT = BODY_HEIGHT * 1.45; // extra space for tail

//   scale = Math.min(scale, TOTAL_HEIGHT / bboxH);

//   // 👇 body starts at middle line
//   tyBase = MIDDLE_LINE_Y - minY * scale;

// // MIDDLE-ONLY lowercase letters
// } else if (MIDDLE_ONLY_LETTERS.has(letter.toLowerCase())) {
//   const TARGET_LOWER_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;
//   scale = Math.min(scale, TARGET_LOWER_HEIGHT / bboxH * 0.95);
//   tyBase = MIDDLE_LINE_Y - minY * scale;

// // ASCENDERS (b d h k l f)
// } else {
//   scale = Math.min(scale, (BOTTOM_LINE_Y - TOP_LINE_Y) / bboxH * 0.9);
//   tyBase = BOTTOM_LINE_Y - maxY * scale;
// }

// // ✅ horizontal centering (after scale!)
// const tx = (svgW - bboxW * scale) / 2 - minX * scale;

let scale = Math.min(svgW / bboxW, 240 / bboxH);
let tyBase: number;

// CAPITAL LETTERS
if (isUpper) {
  scale = Math.min(scale, TARGET_CAPITAL_HEIGHT / bboxH * 0.95);
  tyBase = TOP_LINE_Y - minY * scale + 5;

// DESCENDERS (g j p q y)
} else if (DESCENDER_LETTERS.has(letter.toLowerCase())) {
  const BODY_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;
  const TOTAL_HEIGHT = BODY_HEIGHT * 1.45;

  scale = Math.min(scale, TOTAL_HEIGHT / bboxH);
  tyBase = MIDDLE_LINE_Y - minY * scale;

// MIDDLE-ONLY lowercase
} else if (MIDDLE_ONLY_LETTERS.has(letter.toLowerCase())) {
  const TARGET_LOWER_HEIGHT = BOTTOM_LINE_Y - MIDDLE_LINE_Y;
  scale = Math.min(scale, TARGET_LOWER_HEIGHT / bboxH * 0.95);
  tyBase = MIDDLE_LINE_Y - minY * scale;

// ✅ ASCENDERS (b d f h k l) — FIXED
} else {
  const ASCENDER_HEIGHT = BOTTOM_LINE_Y - TOP_LINE_Y;
  scale = Math.min(scale, ASCENDER_HEIGHT / bboxH * 0.95);

  // 🔥 anchor to TOP line, not bottom
  tyBase = TOP_LINE_Y - minY * scale;
}

// horizontal centering
const tx = (svgW - bboxW * scale) / 2 - minX * scale;


    const meta = strokesRaw.map((rawPts: Point[]) => {
      const dense = densify(rawPts);
      const pts = dense.map(p => ({
        x: p.x * scale + tx,
        y: p.y * scale + tyBase,
      }));
      return { pts };
    });

    strokesMeta.current = meta;
    finishedRef.current = new Array(meta.length).fill(false);
    setActiveIdx(0);
    setDrawIndex(0);
    lastIndexRef.current = 0;
    // setUserDot(meta[0]?.pts[0] || { x: 0, y: 0 });
    const firstPts = meta[0]?.pts;
if (firstPts && firstPts.length > 1) {
  setUserDot(firstPts[0]);
  setDotAngle(computeAngleAtIndex(firstPts, 0)); // ⭐ INITIAL AUTO DIRECTION
}

    setIsFullyDone(false);
  }, [containerWidth, strokesRaw, isUpper]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    lastIndexRef.current = drawIndex;
    const pt = strokesMeta.current[activeIdx].pts[drawIndex];
    setUserDot(pt);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!draggingRef.current) return;

    const rect = containerRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const meta = strokesMeta.current[activeIdx];
    if (!meta || finishedRef.current[activeIdx]) return;

    let closestDist = Infinity;
    let closestIndex = lastIndexRef.current;
    let closestPoint = meta.pts[lastIndexRef.current];

    for (let i = lastIndexRef.current; i < meta.pts.length; i++) {
      const p = meta.pts[i];
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < closestDist) {
        closestDist = d;
        closestPoint = p;
        closestIndex = i;
      }
    }

    if (closestDist > DIST_THRESHOLD) return;

    lastIndexRef.current = closestIndex;
    setUserDot(closestPoint);
    setDrawIndex(closestIndex);

    const progress = Math.min(1, closestIndex / (meta.pts.length - 1));
    onProgress?.(progress);

    const prevPoint = meta.pts[Math.max(0, closestIndex - 1)];
    setDotAngle(Math.atan2(closestPoint.y - prevPoint.y, closestPoint.x - prevPoint.x));

    if (progress >= FINISH_THRESHOLD) {
      finishedRef.current[activeIdx] = true;
      const next = activeIdx + 1;
      // if (strokesMeta.current[next]) {
      //   setActiveIdx(next);
      //   setDrawIndex(0);
      //   lastIndexRef.current = 0;
      //   setUserDot(strokesMeta.current[next].pts[0]);
      // }
        if (strokesMeta.current[next]) {
    const nextPts = strokesMeta.current[next].pts;

    setActiveIdx(next);
    setDrawIndex(0);
    lastIndexRef.current = 0;
    setUserDot(nextPts[0]);

    // ✅ Arrow auto-points for next stroke
    setDotAngle(computeAngleAtIndex(nextPts, 0));
  }
    }
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  const getRemainingPoints = () => {
    const meta = strokesMeta.current[activeIdx];
    if (!meta || meta.pts.length <= drawIndex) return [];
    return meta.pts.slice(drawIndex);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${containerWidth} 300`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: "visible" }}
      >
        {/* === 3-line handwriting guidelines === */}
        <g stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="6 4" opacity={0.7}>
          <line x1="0" y1="70"  x2={containerWidth} y2="70"  /> {/* Top / sky line */}
          <line x1="0" y1="150" x2={containerWidth} y2="150" /> {/* Middle / plane line */}
          <line x1="0" y1="230" x2={containerWidth} y2="230" /> {/* Bottom / baseline */}
        </g>

        {/* Guide strokes */}
        {strokesMeta.current.map((m, i) => (
          <polyline
            key={`guide-${i}`}
            points={m.pts.map((p: any) => `${p.x},${p.y}`).join(" ")}
            stroke="#e5e7eb"
            strokeWidth={BASE_GUIDE_STROKE}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Filled progress */}
        {strokesMeta.current.map((m, i) => {
          let idx = i < activeIdx ? m.pts.length - 1 : (i === activeIdx ? drawIndex : 0);
          const pts = m.pts.slice(0, idx + 1);
          return (
            <polyline
              key={`fill-${i}`}
              points={pts.map((p: any) => `${p.x},${p.y}`).join(" ")}
              stroke="#3b82f6"
              strokeWidth={BASE_FILL_STROKE}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}

        {/* Main user dot + forward-pointing arrow (fixed) */}
        {/* <g transform={`translate(${userDot.x}, ${userDot.y})`}>
          <circle r={USER_DOT_RADIUS} fill="#10b981" stroke="#047857" strokeWidth={2.5} />

      
          <g transform={`rotate(${dotAngle * (180 / Math.PI)})`}>
            <polygon
              points="0,-10 14,0 0,10"  // points RIGHT by default (correct for rotation)
              fill="white"
              stroke="#1e293b"
              strokeWidth={1.8}
              strokeLinejoin="round"
              transform="translate(12, 0)" // shift forward along arrow's direction
            />
          </g>
        </g> */}
    <g transform={`translate(${userDot.x}, ${userDot.y})`}>
  {/* Main user dot */}
  <circle
    r={USER_DOT_RADIUS}
    fill="#12e549"
    stroke="#FFFFFF"
    strokeWidth={2}
  />

  {/* Arrow inside the dot */}
  <g
    transform={`
      rotate(${dotAngle * (180 / Math.PI)})
      translate(2, 0)
    `}
  >
    {/* Arrow shaft (centered) */}
    <line
      x1={-10}
      y1={0}
      x2={2}
      y2={0}
      stroke="#FFFFFF"
      strokeWidth={3}
      strokeLinecap="round"
    />

    {/* Arrow head (big + centered) */}
    <polygon
      points="2,-6 8,0 2,6"
      fill="#FFFFFF"
    />
  </g>
</g>



        {/* Blinking direction arrows */}
    {blinkVisible &&
  getRemainingPoints()
    .filter((_: any, idx: number) => idx > 0 && idx % 6 === 0)
    .map((pt: Point, i: number, arr: any[]) => {
      const pts = strokesMeta.current[activeIdx].pts;

      const globalIdx = drawIndex + i * 6;
      const isLastHint = i === arr.length - 1;

      let angleDeg = 0;
      if (globalIdx < pts.length - 1) {
        const curr = pts[globalIdx];
        const next = pts[globalIdx + 1];

        const dx = next.x - curr.x;
        const dy = next.y - curr.y;

        if (Math.hypot(dx, dy) > 0.5) {
          angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
        }
      }

      return (
        <g
          key={`hint-${activeIdx}-${i}`}
          transform={`translate(${pt.x}, ${pt.y})`}
          opacity={0.6}
        >
          {isLastHint ? (
            // ✅ FINAL ARROW
            // <g transform={`rotate(${angleDeg})`}>
            //   <polygon
            //     points="0,-4 8,0 0,4"
            //     // fill="#fbbf24"
            //     fill="red"

            //     // stroke="#92400e"
            //     stroke="red"

            //     strokeWidth={1.5}
            //     strokeLinejoin="round"
            //     transform="translate(4, 0)"
            //   />
            // </g>
              <g transform={`rotate(${angleDeg})`}>
    {/* Arrow shaft */}
    <line
      // x1={-4}
      // y1={0}
      // x2={6}
      // y2={0}
       x1={-10}
      y1={0}
      x2={2}
      y2={0}
      // stroke="#064e3b"
       stroke="red"
      strokeWidth={3}
      strokeLinecap="round"
    />

    {/* Arrow head */}
    <polygon
      // points="6,-3 10,0 6,3"
      points="2,-6 8,0 2,6"
      // fill="#064e3b"
      fill="red"

    />
  </g>
          ) : (
            // ✅ SMALL DOTS
            <circle
              r={2.6}
              // fill="#fbbf24"
              fill="blue"

              // stroke="#92400e"
              stroke="blue"

              strokeWidth={2}
            />
          )}
        </g>
      );
    })}



      </svg>

      {/* Celebration */}
      {finishedRef.current.every(f => f) && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}>
          <Lottie
            lottieRef={lottieRef}
            animationData={BalloonCelebration}
            loop={false}
            style={{ width: "100%", height: "100%" }}
            onComplete={() => onComplete?.()}
          />
        </div>
      )}
    </div>
  );
}