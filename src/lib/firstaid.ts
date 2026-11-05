export type FirstAidTopic = {
  id: string;
  title: string;
  severity: "critical" | "urgent" | "minor";
  summary: string;
  steps: string[];
};

export const firstAidTopics: FirstAidTopic[] = [
  {
    id: "cpr",
    title: "CPR (Adult)",
    severity: "critical",
    summary: "Unresponsive, not breathing normally.",
    steps: [
      "Call emergency services (112/911) or tell someone to call now.",
      "Place the heel of one hand on the center of the chest, other hand on top.",
      "Push hard and fast: 100–120 compressions per minute, at least 5 cm deep.",
      "Allow full chest recoil between compressions.",
      "If trained, give 2 rescue breaths after every 30 compressions.",
      "Continue until help arrives or the person starts breathing normally.",
    ],
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    severity: "critical",
    summary: "Wound with heavy or spurting blood loss.",
    steps: [
      "Call emergency services immediately.",
      "Apply firm, direct pressure with a clean cloth or gauze.",
      "Do NOT remove soaked dressings — add more on top.",
      "If the limb is bleeding severely and won't stop, apply a tourniquet 5–7 cm above the wound (note the time).",
      "Keep the person warm and lying down.",
      "Do not give food or drink.",
    ],
  },
  {
    id: "choking",
    title: "Choking",
    severity: "urgent",
    summary: "Airway blocked — cannot speak, cough, or breathe.",
    steps: [
      "Encourage the person to cough if they can breathe.",
      "If they cannot cough or breathe, call emergency services.",
      "Give up to 5 back blows between the shoulder blades with the heel of your hand.",
      "If that fails, give up to 5 abdominal thrusts (Heimlich maneuver).",
      "Alternate 5 back blows and 5 abdominal thrusts.",
      "If the person becomes unresponsive, begin CPR and call for help.",
    ],
  },
  {
    id: "burns",
    title: "Burns",
    severity: "urgent",
    summary: "Thermal, chemical, or electrical burns.",
    steps: [
      "Remove the source of the burn if safe. For chemicals, brush off dry powder and rinse with water for 20 minutes.",
      "Cool the burn under cool running water for at least 20 minutes.",
      "Do NOT apply ice, butter, or creams.",
      "Cover loosely with cling film or a sterile non-fluffy dressing.",
      "Remove jewelry/tight items before swelling.",
      "Seek emergency care for large, deep, facial, airway, or electrical burns.",
    ],
  },
  {
    id: "anaphylaxis",
    title: "Anaphylaxis",
    severity: "critical",
    summary: "Severe allergic reaction — difficulty breathing, swelling, collapse.",
    steps: [
      "Call emergency services immediately.",
      "Use the person's epinephrine auto-injector if available (outer mid-thigh).",
      "Lay the person flat; elevate legs unless breathing is difficult.",
      "Give a second dose of epinephrine after 5 minutes if no improvement.",
      "If unresponsive and not breathing, start CPR.",
      "Stay with the person until help arrives.",
    ],
  },
  {
    id: "seizure",
    title: "Seizures",
    severity: "urgent",
    summary: "Convulsions or loss of awareness.",
    steps: [
      "Protect from injury — move hazards away, cushion the head.",
      "Do NOT hold the person down or put anything in their mouth.",
      "Time the seizure.",
      "Turn the person on their side (recovery position) once the convulsions stop.",
      "Call emergency services if it lasts more than 5 minutes, repeats, or the person is injured or not breathing.",
      "Stay until fully recovered.",
    ],
  },
];
