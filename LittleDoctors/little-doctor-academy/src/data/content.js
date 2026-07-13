export const doctors = [
  { id: "mia", name: "Dr. Mia", role: "Pediatrician", emoji: "👩🏽‍⚕️", color: "lavender", message: "I help children feel healthy and strong." },
  { id: "alex", name: "Dr. Alex", role: "Surgeon", emoji: "👨🏿‍⚕️", color: "mint", message: "I carefully fix problems inside the body." },
  { id: "bella", name: "Nurse Bella", role: "Nurse", emoji: "👩🏼‍⚕️", color: "peach", message: "I check vital signs and help patients feel safe." },
  { id: "sam", name: "Dr. Sam", role: "Dentist", emoji: "🧑🏻‍⚕️", color: "sky", message: "I help keep teeth clean and healthy." },
  { id: "zoe", name: "Dr. Zoe", role: "Veterinarian", emoji: "👩🏾‍⚕️", color: "rose", message: "I care for animals when they are sick." }
];

export const patients = [
  { id: "lily", name: "Lily", age: 6, emoji: "👧🏻", symptom: "Cough and sore throat", level: "Beginner" },
  { id: "ethan", name: "Ethan", age: 8, emoji: "👦🏿", symptom: "Scraped knee", level: "Beginner" },
  { id: "noah", name: "Noah", age: 5, emoji: "👦🏻", symptom: "Tummy ache", level: "Intermediate" },
  { id: "emma", name: "Emma", age: 7, emoji: "👧🏼", symptom: "Twisted ankle", level: "Intermediate" }
];

export const lessons = [
  {
    id: "heartbeat",
    title: "Listen to the Heart",
    icon: "🩺",
    minutes: 4,
    description: "Learn where the heart is and listen to a friendly heartbeat.",
    steps: [
      "Welcome the patient and ask how they feel.",
      "Place the stethoscope over the heart.",
      "Listen carefully to the heartbeat.",
      "Tell the patient the heart sounds strong."
    ],
    quiz: { question: "What tool helps a doctor listen to the heart?", options: ["Thermometer", "Stethoscope", "Bandage"], answer: "Stethoscope" }
  },
  {
    id: "temperature",
    title: "Check a Temperature",
    icon: "🌡️",
    minutes: 3,
    description: "Use a thermometer and learn what a fever means.",
    steps: [
      "Explain that the thermometer will not hurt.",
      "Place the thermometer correctly.",
      "Wait for the reading.",
      "Decide whether the temperature is normal."
    ],
    quiz: { question: "Which tool measures body temperature?", options: ["Thermometer", "X-ray", "Stethoscope"], answer: "Thermometer" }
  },
  {
    id: "bandage",
    title: "Treat a Scraped Knee",
    icon: "🩹",
    minutes: 5,
    description: "Clean a small scrape and apply a bandage.",
    steps: [
      "Wash your hands.",
      "Gently clean the scrape.",
      "Dry the area.",
      "Choose and apply the correct bandage."
    ],
    quiz: { question: "What should you do before treating a scrape?", options: ["Wash your hands", "Run outside", "Eat a snack"], answer: "Wash your hands" }
  },
  {
    id: "xray",
    title: "Explore an X-ray",
    icon: "🩻",
    minutes: 6,
    description: "Discover what bones look like in an X-ray image.",
    steps: [
      "Ask where the patient feels pain.",
      "Explain what an X-ray does.",
      "Look carefully at the bones.",
      "Choose whether the bone looks healthy."
    ],
    quiz: { question: "An X-ray helps doctors see what?", options: ["Bones", "Thoughts", "Dreams"], answer: "Bones" }
  }
];

export const badges = [
  { id: "kind", label: "Kind Doctor", icon: "💗" },
  { id: "listener", label: "Great Listener", icon: "👂" },
  { id: "heart", label: "Heart Helper", icon: "❤️" },
  { id: "bandage", label: "Bandage Pro", icon: "🩹" }
];
