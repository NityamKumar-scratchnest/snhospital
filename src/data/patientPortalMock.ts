/** Rich demo records when API is unavailable — swap for live fetches later. */

export type MockBill = {
  id: string
  date: string
  description: string
  amount: string
  status: "Paid" | "Due"
}

export type MockReport = {
  id: string
  title: string
  provider: string
  date: string
  summary: string
  visitId: string
}

export type MockRx = {
  id: string
  name: string
  sig: string
  refills: string
  startedOn: string
  visitId: string
}

export type MockAppointment = {
  id: string
  when: string
  reason: string
  with: string
}

export type MockVisit = {
  id: string
  date: string
  type: "OPD" | "Follow-up" | "Acute"
  doctor: string
  doctorQuals: string
  chiefComplaint: string
  history: string
  vitals: string
  examination: string
  assessment: string
  plan: string
  revisitBy: string | null
  reportIds: string[]
  rxIds: string[]
}

export const mockVisits: MockVisit[] = [
  {
    id: "v3",
    date: "28 Mar 2026",
    type: "Follow-up",
    doctor: "Dr. Ananya Krishnan",
    doctorQuals: "MBBS, MD (General Medicine)",
    chiefComplaint: "Blood pressure review — home readings borderline high.",
    history:
      "Known hypertension, on Telmisartan. Home log shows 130–88 mmHg average last 2 weeks. No chest pain, no headache.",
    vitals: "BP 128/82 mmHg · Pulse 72 · SpO₂ 98% · Wt 72 kg",
    examination: "CVS S1S2 normal. No pedal oedema. Fundoscopy not repeated today.",
    assessment: "Essential hypertension — adequately controlled on current dose.",
    plan:
      "Continue same antihypertensive. Repeat metabolic panel in 6 weeks. Lifestyle: salt under 5 g/day, walk 30 min × 5 days/week.",
    revisitBy: "15 May 2026 (or earlier if symptoms)",
    reportIds: ["r2"],
    rxIds: ["rx1"],
  },
  {
    id: "v2",
    date: "12 Mar 2026",
    type: "Acute",
    doctor: "Dr. Ananya Krishnan",
    doctorQuals: "MBBS, MD (General Medicine)",
    chiefComplaint: "Fever and sore throat × 2 days.",
    history:
      "No travel. No rash. Mild cough. No breathlessness. Appetite reduced. Takes paracetamol SOS.",
    vitals: "Temp 38.1 °C · BP 118/76 · Pulse 88 · Throat erythematous, no exudate",
    examination: "ENT: mild pharyngitis. Lungs clear. No lymphadenopathy.",
    assessment: "Acute viral upper respiratory infection — likely.",
    plan:
      "Symptomatic care, hydration, paracetamol dosing chart. Return if breathing difficulty, fever over 3 days, or reduced oral intake.",
    revisitBy: "If not better in 48–72 hours",
    reportIds: [],
    rxIds: [],
  },
  {
    id: "v1",
    date: "02 Feb 2026",
    type: "OPD",
    doctor: "Dr. Ananya Krishnan",
    doctorQuals: "MBBS, MD (General Medicine)",
    chiefComplaint: "Annual health check — diabetes and lipid screening.",
    history:
      "Type 2 DM on metformin. No hypoglycaemia episodes. Diet partially compliant.",
    vitals: "BP 122/80 · BMI 24.1 · RBS 142 mg/dL (non-fasting)",
    examination: "General examination unremarkable. Feet sensation intact monofilament.",
    assessment: "T2DM — fair control. Dyslipidaemia to confirm with labs.",
    plan:
      "Ordered CBC, HbA1c, lipid profile, renal panel. Continue metformin. Dietician handout given.",
    revisitBy: "With reports in 2–3 weeks",
    reportIds: ["r1"],
    rxIds: ["rx2"],
  },
]

export const mockReports: MockReport[] = [
  {
    id: "r1",
    title: "Complete blood count & HbA1c",
    provider: "Dr. Ananya Krishnan",
    date: "03 Feb 2026",
    summary: "HbA1c 6.8%. Haemoglobin 13.2 g/dL. WBC differential normal.",
    visitId: "v1",
  },
  {
    id: "r2",
    title: "Lipid panel & renal profile",
    provider: "Dr. Ananya Krishnan",
    date: "20 Mar 2026",
    summary: "LDL 112 mg/dL · HDL 48 · TG 150 · Creatinine 0.9 mg/dL.",
    visitId: "v3",
  },
]

export const mockPrescriptions: MockRx[] = [
  {
    id: "rx1",
    name: "Telmisartan 40 mg",
    sig: "1 tablet every morning after food",
    refills: "2 repeats until Aug 2026",
    startedOn: "28 Mar 2026",
    visitId: "v3",
  },
  {
    id: "rx2",
    name: "Metformin 500 mg SR",
    sig: "1 tablet twice daily with meals",
    refills: "3 repeats until Dec 2026",
    startedOn: "02 Feb 2026",
    visitId: "v1",
  },
  {
    id: "rx3",
    name: "Cholecalciferol 60k IU",
    sig: "1 capsule weekly × 8 weeks",
    refills: "As labelled",
    startedOn: "02 Feb 2026",
    visitId: "v1",
  },
]

export const mockBills: MockBill[] = [
  {
    id: "b1",
    date: "12 Mar 2026",
    description: "GP consult — acute visit",
    amount: "₹ 800",
    status: "Paid",
  },
  {
    id: "b2",
    date: "28 Mar 2026",
    description: "GP consult — follow-up",
    amount: "₹ 800",
    status: "Paid",
  },
  {
    id: "b3",
    date: "29 Mar 2026",
    description: "Lab panel — lipids & renal",
    amount: "₹ 1,450",
    status: "Due",
  },
]

export const mockAppointments: MockAppointment[] = [
  {
    id: "a1",
    when: "Thu, 10 Apr 2026 · 9:30 AM",
    reason: "Scheduled BP & lab review",
    with: "Dr. Ananya Krishnan",
  },
  {
    id: "a2",
    when: "Mon, 28 Apr 2026 · 2:00 PM",
    reason: "Diabetes follow-up (if labs pending)",
    with: "Dr. Ananya Krishnan",
  },
]

export function getVisitById(id: string) {
  return mockVisits.find((v) => v.id === id)
}

export function getReportsForVisit(visitId: string) {
  return mockReports.filter((r) => r.visitId === visitId)
}

export function getRxForVisit(visitId: string) {
  return mockPrescriptions.filter((r) => r.visitId === visitId)
}
