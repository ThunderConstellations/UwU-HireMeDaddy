import { scheduleApply } from "../scheduler.js";
import { applyIndeed } from "./site_indeed.js";
import { applyLinkedIn } from "./site_linkedin.js";
import { applyGlassdoor } from "./site_glassdoor.js";
import { applyMonster } from "./site_monster.js";

const host = window.location.hostname;
let handler = null;
if (host.includes("indeed.com")) handler = applyIndeed;
else if (host.includes("linkedin.com")) handler = applyLinkedIn;
else if (host.includes("glassdoor.com")) handler = applyGlassdoor;
else if (host.includes("monster.com")) handler = applyMonster;

if (handler) scheduleApply(handler);