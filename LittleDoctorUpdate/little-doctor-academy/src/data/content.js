export const doctors = [
  { id: "mia", name: "Dr. Mia", role: "Pediatrician", image: "/assets/characters-hd/dr-mia.webp", color: "lavender", message: "I help children feel healthy and strong." },
  { id: "alex", name: "Dr. Alex", role: "Surgeon", image: "/assets/characters-hd/dr-alex.webp", color: "mint", message: "I carefully fix problems inside the body." },
  { id: "bella", name: "Nurse Bella", role: "Nurse", image: "/assets/characters-hd/nurse-bella.webp", color: "peach", message: "I check vital signs and help patients feel safe." },
  { id: "sam", name: "Dr. Sam", role: "Dentist", image: "/assets/characters-hd/dr-sam.webp", color: "sky", message: "I help keep teeth clean and healthy." },
  { id: "zoe", name: "Dr. Zoe", role: "Veterinarian", image: "/assets/characters-hd/dr-zoe.webp", color: "rose", message: "I care for animals when they are sick." }
];

export const patients = [
  { id: "lily", name: "Lily", age: 6, image: "/assets/characters-hd/lily.webp", symptom: "Cough and sore throat", level: "Beginner" },
  { id: "ethan", name: "Ethan", age: 8, image: "/assets/characters-hd/ethan.webp", symptom: "Scraped knee", level: "Beginner" },
  { id: "noah", name: "Noah", age: 5, image: "/assets/characters-hd/noah.webp", symptom: "Tummy ache", level: "Intermediate" },
  { id: "emma", name: "Emma", age: 7, image: "/assets/characters-hd/emma.webp", symptom: "Twisted ankle", level: "Intermediate" }
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

export const scenarios = [
  {
    id: "sore-throat-visit",
    title: "Lily's Sore Throat Visit",
    icon: "🏥",
    minutes: 9,
    description: "Follow Lily from nurse check-in to the doctor and then the pharmacy while learning how a simple diagnosis is made.",
    patient: { name: "Lily", image: "/assets/characters-hd/lily.webp", symptom: "Cough and sore throat" },
    scenes: [
      {
        role: "nurse", location: "Nurse station", characterName: "Nurse Bella", characterImage: "/assets/characters-hd/nurse-bella.webp",
        title: "Welcome Lily and check her symptoms",
        prompt: "Lily says her throat hurts and she has been coughing. What should Nurse Bella do first?",
        options: [
          { label: "Ask when the symptoms started", feedback: "Great choice. A nurse first listens carefully and gathers important information." },
          { label: "Give medicine immediately", feedback: "Medicine should only be given after the care team understands the problem." },
          { label: "Send her home without checking", feedback: "Patients should be assessed so the team can decide what care is appropriate." }
        ]
      },
      {
        role: "nurse", location: "Vitals area", characterName: "Nurse Bella", characterImage: "/assets/characters-hd/nurse-bella.webp",
        title: "Check Lily's vital signs",
        prompt: "Which check helps the team learn whether Lily may have a fever?",
        options: [
          { label: "Use a thermometer", feedback: "Correct. A thermometer measures body temperature." },
          { label: "Use a bandage", feedback: "A bandage protects cuts, but it cannot measure a fever." },
          { label: "Use an X-ray", feedback: "An X-ray can show bones and some internal structures, but it is not used to check temperature." }
        ]
      },
      {
        role: "doctor", location: "Exam room", characterName: "Dr. Mia", characterImage: "/assets/characters-hd/dr-mia.webp",
        title: "Help Dr. Mia examine Lily",
        prompt: "Dr. Mia listens to Lily's lungs and looks at her throat. Which finding best supports a common viral cold?",
        options: [
          { label: "Cough, runny nose, and mild sore throat", feedback: "That pattern often fits a common viral cold. The doctor uses the whole story and exam before deciding." },
          { label: "A scraped knee", feedback: "A scraped knee is unrelated to Lily's throat and cough." },
          { label: "A twisted ankle", feedback: "An ankle injury would need a different examination." }
        ]
      },
      {
        role: "doctor", location: "Diagnosis discussion", characterName: "Dr. Mia", characterImage: "/assets/characters-hd/dr-mia.webp",
        title: "Explain the diagnosis kindly",
        prompt: "Dr. Mia believes Lily has a viral cold. What is the most helpful explanation?",
        options: [
          { label: "Rest, drink fluids, and follow the care instructions", feedback: "Exactly. Clear, calm instructions help patients and families know what to do next." },
          { label: "Every cold needs antibiotics", feedback: "Antibiotics treat certain bacterial infections, not ordinary viral colds." },
          { label: "Ignore worsening symptoms", feedback: "Families should know when to seek more help if symptoms get worse or do not improve." }
        ]
      },
      {
        role: "pharmacist", location: "Hospital pharmacy", characterName: "Pharmacist Maya", characterImage: "/assets/characters-hd/dr-alex.webp",
        title: "Learn how the pharmacist helps",
        prompt: "The pharmacist reviews Lily's care instructions. What should the pharmacist explain?",
        options: [
          { label: "How and when a medicine should be used", feedback: "Correct. Pharmacists help families understand safe use, timing, and important warnings." },
          { label: "Take any amount that tastes good", feedback: "Medicine should only be taken in the exact amount directed by a responsible adult and healthcare professional." },
          { label: "Share medicine with friends", feedback: "Medicine should never be shared. It is chosen for a specific patient and situation." }
        ]
      }
    ]
  },
  {
    id: "tummy-ache-visit",
    title: "Noah's Tummy Ache Visit",
    icon: "🩺",
    minutes: 8,
    description: "Ask questions, check symptoms, choose a gentle diagnosis path, and learn what the pharmacist reviews with a family.",
    patient: { name: "Noah", image: "/assets/characters-hd/noah.webp", symptom: "Tummy ache" },
    scenes: [
      {
        role: "nurse", location: "Nurse station", characterName: "Nurse Bella", characterImage: "/assets/characters-hd/nurse-bella.webp",
        title: "Ask Noah about his pain",
        prompt: "Which question gives the nurse useful information?",
        options: [
          { label: "Where does it hurt and when did it start?", feedback: "Good assessment. Location and timing help the medical team understand the problem." },
          { label: "What is your favorite cartoon?", feedback: "That may help Noah relax, but the nurse also needs symptom details." },
          { label: "Can you run very fast?", feedback: "That does not directly explain Noah's tummy ache." }
        ]
      },
      {
        role: "doctor", location: "Exam room", characterName: "Dr. Mia", characterImage: "/assets/characters-hd/dr-mia.webp",
        title: "Choose a careful exam",
        prompt: "What should Dr. Mia do during a gentle tummy examination?",
        options: [
          { label: "Ask permission and gently examine the abdomen", feedback: "Correct. Doctors explain what they are doing and check gently." },
          { label: "Press very hard without warning", feedback: "Exams should be explained and performed gently." },
          { label: "Skip the examination", feedback: "The doctor needs enough information to make a safe decision." }
        ]
      },
      {
        role: "doctor", location: "Care plan", characterName: "Dr. Mia", characterImage: "/assets/characters-hd/dr-mia.webp",
        title: "Create the care plan",
        prompt: "Noah's exam is reassuring and he may be mildly constipated. Which plan is most helpful?",
        options: [
          { label: "Fluids, healthy fiber, movement, and family follow-up", feedback: "That is a sensible supportive plan when the doctor has ruled out urgent warning signs." },
          { label: "Never drink water", feedback: "Fluids are often an important part of healthy digestion." },
          { label: "Hide worsening pain", feedback: "Worsening or severe symptoms should be shared with a responsible adult and healthcare professional." }
        ]
      },
      {
        role: "pharmacist", location: "Hospital pharmacy", characterName: "Pharmacist Maya", characterImage: "/assets/characters-hd/dr-alex.webp",
        title: "Review safe medicine use",
        prompt: "If the doctor recommends a medicine, what should the pharmacist confirm?",
        options: [
          { label: "The correct child, amount, timing, and instructions", feedback: "Exactly. Pharmacists double-check details and answer questions about safe use." },
          { label: "That everyone in the family takes it", feedback: "Medicine is not automatically appropriate for other family members." },
          { label: "That the label can be ignored", feedback: "The label and professional instructions are essential for safe use." }
        ]
      }
    ]
  }
];
