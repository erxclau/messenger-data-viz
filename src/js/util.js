import { format } from "https://cdn.skypack.dev/d3-format@3";
import { timeFormat, timeParse } from "https://cdn.skypack.dev/d3-time-format@4";

const comma = format(",");
const formatTime = timeFormat("%B %d, %Y");
const parseTime = timeParse("%Y-%m-%d");

export { comma, formatTime, parseTime };