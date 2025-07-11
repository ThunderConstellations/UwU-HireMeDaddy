import { CONFIG } from "./config.js";

// Keywords that appear in dropdowns, radio buttons, etc.
const yesKeywords = ["authorized", "us citizen", "legally work", "over 18", "age", "permission to work", "authorized to work"];
const noKeywords = ["sponsorship", "require sponsorship", "visa", "felony", "crime", "convicted", "conviction", "disabled veteran", "disability", "handicap"];
const optionalQuestions = ["ethnicity", "gender", "race", "sexual orientation", "religion"];

function matchQuestion(text, keywords) {
  return keywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Fill textareas & inputs
export function fillTextInputs() {
  const inputs = document.querySelectorAll("input[type='text'], textarea");

  inputs.forEach(input => {
    const name = input.name || input.placeholder || "";
    const lowerName = name.toLowerCase();

    if (lowerName.includes("first")) input.value = CONFIG.name.split(" ")[0];
    else if (lowerName.includes("last")) input.value = CONFIG.name.split(" ").slice(-1)[0];
    else if (lowerName.includes("full") || lowerName.includes("name")) input.value = CONFIG.name;
    else if (lowerName.includes("email")) input.value = CONFIG.email;
    else if (lowerName.includes("phone")) input.value = CONFIG.phone;
    else if (lowerName.includes("address") || lowerName.includes("location")) input.value = CONFIG.address;
    else if (lowerName.includes("portfolio") || lowerName.includes("website")) input.value = CONFIG.portfolio;
  });
}

// Auto-fill yes/no, dropdowns, checkboxes
export function fillBinaryQuestions() {
  const labels = document.querySelectorAll("label");

  labels.forEach(label => {
    const labelText = label.innerText || "";
    if (!labelText) return;

    const input = label.querySelector("input[type='radio'], input[type='checkbox']");
    if (!input) return;

    if (matchQuestion(labelText, yesKeywords)) input.checked = true;
    if (matchQuestion(labelText, noKeywords)) input.checked = false;
  });

  const selects = document.querySelectorAll("select");

  selects.forEach(select => {
    const label = select.closest("label")?.innerText || select.name || "";

    if (matchQuestion(label, yesKeywords)) select.value = "Yes";
    if (matchQuestion(label, noKeywords)) select.value = "No";

    if (optionalQuestions.some(q => label.toLowerCase().includes(q))) {
      select.value = CONFIG[label.toLowerCase()] || "Prefer not to say";
    }
  });
}

// Advanced fallback for unmatched questions
export function fillUnmatched() {
  const textInputs = [...document.querySelectorAll("input[type='text'], textarea")];

  textInputs.forEach(input => {
    const name = input.name?.toLowerCase() || "";

    if (name.includes("authorization")) input.value = CONFIG.legallyAuthorized;
    else if (name.includes("sponsorship")) input.value = CONFIG.requireSponsorship;
    else if (name.includes("veteran")) input.value = CONFIG.disabledVeteran;
    else if (name.includes("ethnic")) input.value = CONFIG.ethnicity;
    else if (name.includes("gender")) input.value = CONFIG.gender;
    else if (name.includes("disability")) input.value = CONFIG.disabilityStatus;
  });
}

// Execute all
export function autofillForm() {
  fillTextInputs();
  fillBinaryQuestions();
  fillUnmatched();
}
