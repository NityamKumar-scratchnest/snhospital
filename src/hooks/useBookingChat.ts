import { useCallback, useRef, useState } from "react"
import { CLINIC_PHONE_DISPLAY } from "../lib/clinic"
import {
  bookingBannerFromApi,
  INTENT_FOLLOW,
  INTENT_NEW,
  formatSlotDisplay,
  intentLooksLikeFollowUp,
  intentLooksLikeNew,
  intentLooksLikeStatus,
  normalizePatientBookingCards,
  normalizePhone,
  parseDoctorPick,
  parseUserDate,
  QUICK_START,
  QUICK_STATUS,
  suggestDoctor,
  todayISODate,
  type PatientBookingCard,
  type WebhookDoctor,
} from "../lib/bookingFlowUtils"
import { webhookClient } from "../services/webhookClient"

export type ChatQuickReply = { label: string; value: string }

export type ChatMessage = {
  id: string
  from: "user" | "ai"
  text: string
  quickReplies?: ChatQuickReply[]
  appointmentCards?: PatientBookingCard[]
  bookingBanner?: string
}

type Step =
  | "greeting"
  | "need_phone"
  | "identify_loading"
  | "new_name"
  | "new_address"
  | "create_patient_loading"
  | "choose_intent"
  | "collect_symptoms"
  | "load_doctors"
  | "choose_doctor"
  | "collect_date"
  | "collect_date_follow"
  | "book_loading"
  | "status_need_phone"

type Ctx = {
  phone: string
  name: string
  address: string
  primaryDoctor: WebhookDoctor | null
  doctors: WebhookDoctor[]
  selectedDoctorId: string
  symptoms: string
  pendingDate: string
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const seedIntro = `Namaste — I’m Scratchnest’s care assistant. Book a GP visit in chat, check recent appointments, or ask about timings and what to carry. Medical decisions stay with your doctor. You can always call **${CLINIC_PHONE_DISPLAY}**.`

export function useBookingChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: "i1", from: "ai", text: seedIntro },
    {
      id: "i2",
      from: "ai",
      text: "What would you like to do?",
      quickReplies: [
        { label: "Book a visit", value: QUICK_START },
        { label: "My appointments", value: QUICK_STATUS },
      ],
    },
  ])
  const [busy, setBusy] = useState(false)
  const stepRef = useRef<Step>("greeting")
  const ctxRef = useRef<Ctx>({
    phone: "",
    name: "",
    address: "",
    primaryDoctor: null,
    doctors: [],
    selectedDoctorId: "",
    symptoms: "",
    pendingDate: "",
  })

  const stripOldReplies = useCallback((list: ChatMessage[]) => {
    return list.map((m) =>
      m.from === "ai" ? { ...m, quickReplies: undefined } : m
    )
  }, [])

  const pushAi = useCallback(
    (
      text: string,
      quickReplies?: ChatQuickReply[],
      cards?: {
        appointmentCards: PatientBookingCard[]
        bookingBanner?: string
      }
    ) => {
      setMessages((prev) => [
        ...stripOldReplies(prev),
        {
          id: uid(),
          from: "ai",
          text,
          quickReplies,
          appointmentCards: cards?.appointmentCards,
          bookingBanner: cards?.bookingBanner,
        },
      ])
    },
    [stripOldReplies]
  )

  const pushUser = useCallback((text: string) => {
    setMessages((prev) => [...prev, { id: uid(), from: "user", text }])
  }, [])

  const runStatus = useCallback(async () => {
    const ctx = ctxRef.current
    setBusy(true)
    try {
      const { data } = await webhookClient.post("/webhook/patient-appointments", {
        phone: ctx.phone,
      })
      const cards = normalizePatientBookingCards(data?.appointments)
      const banner = bookingBannerFromApi(data)
      const replies = [
        { label: "Book a visit", value: QUICK_START },
        { label: "My appointments", value: QUICK_STATUS },
      ]
      if (!cards.length) {
        const msg =
          typeof data?.message === "string"
            ? data.message
            : "No appointments found for this number."
        pushAi(msg, replies)
      } else {
        pushAi(
          "Here are **your visits** (newest first). Scroll if the list is long.",
          replies,
          { appointmentCards: cards, bookingBanner: banner }
        )
      }
    } catch {
      pushAi("Couldn’t load appointments. Try again or call the clinic.", [
        { label: "Book a visit", value: QUICK_START },
      ])
    } finally {
      setBusy(false)
      stepRef.current = "greeting"
    }
  }, [pushAi])

  const runIdentify = useCallback(async () => {
    const ctx = ctxRef.current
    stepRef.current = "identify_loading"
    setBusy(true)
    try {
      const { data } = await webhookClient.post("/webhook/identify-patient", {
        phone: ctx.phone,
      })

      if (data?.action === "ask_phone" || !data) {
        pushAi("I couldn’t read that number. Please send a **10-digit Indian mobile**.")
        stepRef.current = "need_phone"
        return
      }

      if (data.type === "NEW_PATIENT") {
        stepRef.current = "new_name"
        pushAi(
          data.message ??
            "Let’s register you. **What’s your full name?** (as you’d like on your file)"
        )
        return
      }

      if (data.type === "EXISTING_PATIENT" && data.patient) {
        ctx.name = String(data.patient.name ?? "")
        ctx.address = String(data.patient.address ?? "")
        ctx.primaryDoctor = data.primaryDoctor
          ? {
              id: String(data.primaryDoctor.id ?? data.primaryDoctor._id ?? ""),
              name: String(data.primaryDoctor.name ?? ""),
              specialization: String(data.primaryDoctor.specialization ?? ""),
            }
          : null

        stepRef.current = "choose_intent"
        const cards = normalizePatientBookingCards(data?.appointments)
        const banner = bookingBannerFromApi({
          patient: {
            name: String(data.patient.name ?? ctx.name),
            phone: String(data.patient.phone ?? ctx.phone),
          },
          total: typeof data.total === "number" ? data.total : cards.length,
          appointments: cards,
        })
        const intro =
          data.message ??
          `Welcome back, **${ctx.name}**. Choose follow-up, a new consultation, or view appointments.`
        pushAi(
          cards.length
            ? `${intro}\n\nYour **recent bookings** are below.`
            : intro,
          [
            { label: "Follow-up visit", value: INTENT_FOLLOW },
            { label: "New consultation", value: INTENT_NEW },
            { label: "My appointments", value: QUICK_STATUS },
          ],
          cards.length
            ? { appointmentCards: cards, bookingBanner: banner }
            : undefined
        )
        return
      }

      pushAi("Something unexpected happened. Try again or call the clinic.")
      stepRef.current = "greeting"
    } catch {
      pushAi(
        "We couldn’t reach the server. Check your connection or try again — or call the clinic."
      )
      stepRef.current = "need_phone"
    } finally {
      setBusy(false)
    }
  }, [pushAi])

  const runCreatePatient = useCallback(async () => {
    const ctx = ctxRef.current
    stepRef.current = "create_patient_loading"
    setBusy(true)
    try {
      const { data } = await webhookClient.post("/webhook/create-patient", {
        phone: ctx.phone,
        name: ctx.name,
        address: ctx.address,
      })
      if (data?.error) {
        pushAi(`Couldn’t save profile: ${data.error}. Please check and try again.`)
        stepRef.current = "new_name"
        return
      }
      pushAi(
        "You’re registered. **What symptoms or reason** should we note? (e.g. fever, cough, check-up)"
      )
      stepRef.current = "collect_symptoms"
    } catch {
      pushAi("Registration didn’t go through. Please try again.")
      stepRef.current = "new_address"
    } finally {
      setBusy(false)
    }
  }, [pushAi])

  const runLoadDoctors = useCallback(async () => {
    const ctx = ctxRef.current
    stepRef.current = "load_doctors"
    setBusy(true)
    try {
      const { data } = await webhookClient.post("/webhook/get-doctors", {})
      const doctors: WebhookDoctor[] = Array.isArray(data?.doctors)
        ? data.doctors.map(
            (d: {
              id?: string
              _id?: string
              name?: string
              specialization?: string
            }) => ({
              id: String(d.id ?? d._id ?? ""),
              name: String(d.name ?? "Doctor"),
              specialization: String(d.specialization ?? "General"),
            })
          )
        : []
      ctx.doctors = doctors.filter((d) => d.id)
      if (!ctx.doctors.length) {
        pushAi("No doctors are listed right now. Please call the clinic.")
        stepRef.current = "greeting"
        return
      }

      const pick = suggestDoctor(ctx.symptoms, ctx.doctors)
      ctx.selectedDoctorId = pick?.id ?? ctx.doctors[0].id

      const lines = ctx.doctors
        .map(
          (d) =>
            `• **${d.name}** — ${d.specialization}${d.id === ctx.selectedDoctorId ? " _(suggested)_" : ""}`
        )
        .join("\n")

      pushAi(
        `Here are our doctors:\n\n${lines}\n\n**Tap a doctor** to continue.`,
        ctx.doctors.map((d) => ({
          label: d.name,
          value: `__doc__${d.id}`,
        }))
      )
      stepRef.current = "choose_doctor"
    } catch {
      pushAi("Couldn’t load doctors. Try again or call the clinic.")
      stepRef.current = "collect_symptoms"
    } finally {
      setBusy(false)
    }
  }, [pushAi])

  const runCreateAppointment = useCallback(async () => {
    const ctx = ctxRef.current
    stepRef.current = "book_loading"
    setBusy(true)
    try {
      const { data } = await webhookClient.post("/webhook/create-appointment", {
        phone: ctx.phone,
        name: ctx.name,
        address: ctx.address,
        doctorId: ctx.selectedDoctorId,
        date: ctx.pendingDate,
        symptoms: ctx.symptoms,
      })
      if (data?.error) {
        pushAi(`Booking didn’t complete: ${data.error}. Check date and try again.`)
        stepRef.current = "collect_date"
        return
      }
      const tok = data?.data?.tokenNumber ?? "—"
      const t0 = data?.data?.time ? formatSlotDisplay(String(data.data.time)) : ""
      pushAi(
        `**Booking confirmed.**${t0 ? ` Slot starts ~**${t0}**` : ""} · Token **#${tok}** · **${ctx.pendingDate}**\n\nWe’ll see you at the clinic. For changes, call us.`,
        [
          { label: "Book another", value: QUICK_START },
          { label: "My appointments", value: QUICK_STATUS },
        ]
      )
      stepRef.current = "greeting"
    } catch {
      pushAi("Booking failed. Please try again or call the clinic.")
      stepRef.current = "collect_date"
    } finally {
      setBusy(false)
    }
  }, [pushAi])

  const runFollowUp = useCallback(async () => {
    const ctx = ctxRef.current
    stepRef.current = "book_loading"
    setBusy(true)
    try {
      const { data } = await webhookClient.post("/webhook/follow-up", {
        phone: ctx.phone,
        doctorId: ctx.primaryDoctor?.id,
        date: ctx.pendingDate,
      })
      if (data?.error) {
        pushAi(`Follow-up didn’t book: ${data.error}.`)
        stepRef.current = "collect_date_follow"
        return
      }
      pushAi(
        `**Follow-up booked** for **${ctx.pendingDate}**. See you soon!`,
        [
          { label: "My appointments", value: QUICK_STATUS },
          { label: "Book a visit", value: QUICK_START },
        ]
      )
      stepRef.current = "greeting"
    } catch {
      pushAi("Couldn’t book follow-up. Try again or call the clinic.")
      stepRef.current = "collect_date_follow"
    } finally {
      setBusy(false)
    }
  }, [pushAi])

  const matchDoctorByName = useCallback((text: string) => {
    const ctx = ctxRef.current
    const q = text.trim().toLowerCase()
    return ctx.doctors.find(
      (d) =>
        d.name.toLowerCase().includes(q) || q.includes(d.name.toLowerCase().split(" ")[0] ?? "")
    )
  }, [])

  const submit = useCallback(
    async (rawInput: string) => {
      const raw = rawInput.trim()
      if (!raw) return

      const step = stepRef.current
      const ctx = ctxRef.current

      const docPick = parseDoctorPick(raw)
      if (docPick && step === "choose_doctor") {
        pushUser(
          ctx.doctors.find((d) => d.id === docPick)?.name ?? "Selected doctor"
        )
        ctx.selectedDoctorId = docPick
        pushAi(
          `**Which date** works? (e.g. **${todayISODate()}**, **tomorrow**, or **DD-MM-YYYY**)`
        )
        stepRef.current = "collect_date"
        return
      }

      if (raw === QUICK_START) {
        pushUser("Book a visit")
        stepRef.current = "need_phone"
        pushAi("Great — send your **10-digit mobile number** (Indian number, no country code).")
        return
      }

      if (raw === QUICK_STATUS) {
        pushUser("My appointments")
        if (ctx.phone.length === 10) {
          await runStatus()
        } else {
          stepRef.current = "status_need_phone"
          pushAi("Share the **10-digit mobile** we should look up.")
        }
        return
      }

      if (raw === INTENT_FOLLOW) {
        pushUser("Follow-up visit")
        if (!ctx.primaryDoctor?.id) {
          pushAi(
            "We don’t have a previous doctor on file. **What symptoms or reason** for this visit?"
          )
          stepRef.current = "collect_symptoms"
          return
        }
        pushAi(
          `Follow-up with **${ctx.primaryDoctor.name}**. **Which date?** (e.g. ${todayISODate()} or tomorrow)`
        )
        stepRef.current = "collect_date_follow"
        return
      }

      if (raw === INTENT_NEW) {
        pushUser("New consultation")
        pushAi("**What symptoms or reason** should we note? (e.g. fever, injury, check-up)")
        stepRef.current = "collect_symptoms"
        return
      }

      if (step === "greeting") {
        const phone = normalizePhone(raw)
        if (phone) {
          pushUser(raw)
          ctx.phone = phone
          await runIdentify()
          return
        }
        if (intentLooksLikeStatus(raw)) {
          pushUser(raw)
          stepRef.current = "status_need_phone"
          pushAi("Please send the **10-digit mobile** number to look up.")
          return
        }
        pushAi(
          "Tap **Book a visit** or type your **mobile number**. You can also ask for **My appointments**.",
          [
            { label: "Book a visit", value: QUICK_START },
            { label: "My appointments", value: QUICK_STATUS },
          ]
        )
        return
      }

      if (step === "need_phone" || step === "status_need_phone") {
        pushUser(raw)
        const phone = normalizePhone(raw)
        if (!phone) {
          pushAi("That doesn’t look like a valid **10-digit** number. Try again.")
          return
        }
        ctx.phone = phone
        if (step === "status_need_phone") {
          await runStatus()
        } else {
          await runIdentify()
        }
        return
      }

      if (step === "new_name") {
        pushUser(raw)
        if (raw.length < 2) {
          pushAi("Please share your **name** (at least 2 characters).")
          return
        }
        ctx.name = raw
        stepRef.current = "new_address"
        pushAi("Thanks. **What’s your address?** (area / city is fine)")
        return
      }

      if (step === "new_address") {
        pushUser(raw)
        if (raw.length < 3) {
          pushAi("Please add a bit more detail for **address** (e.g. sector, city).")
          return
        }
        ctx.address = raw
        await runCreatePatient()
        return
      }

      if (step === "choose_intent") {
        pushUser(raw)
        if (intentLooksLikeStatus(raw)) {
          await runStatus()
          return
        }
        if (intentLooksLikeFollowUp(raw)) {
          if (!ctx.primaryDoctor?.id) {
            pushAi(
              "We don’t have a previous doctor on file. **What symptoms or reason** for this visit?"
            )
            stepRef.current = "collect_symptoms"
            return
          }
          pushAi(
            `Follow-up with **${ctx.primaryDoctor.name}**. **Which date?** (e.g. ${todayISODate()} or tomorrow)`
          )
          stepRef.current = "collect_date_follow"
          return
        }
        if (intentLooksLikeNew(raw)) {
          pushAi("**What symptoms or reason** should we note? (e.g. fever, injury, check-up)")
          stepRef.current = "collect_symptoms"
          return
        }
        pushAi("Please use the buttons: **Follow-up**, **New consultation**, or **My appointments**.", [
          { label: "Follow-up visit", value: INTENT_FOLLOW },
          { label: "New consultation", value: INTENT_NEW },
          { label: "My appointments", value: QUICK_STATUS },
        ])
        return
      }

      if (step === "collect_symptoms") {
        pushUser(raw)
        ctx.symptoms = raw
        await runLoadDoctors()
        return
      }

      if (step === "choose_doctor") {
        pushUser(raw)
        const byBtn = parseDoctorPick(raw)
        if (byBtn) {
          ctx.selectedDoctorId = byBtn
          pushAi(
            `**Which date** works? (e.g. **${todayISODate()}**, **tomorrow**, or **DD-MM-YYYY**)`
          )
          stepRef.current = "collect_date"
          return
        }
        const hit = matchDoctorByName(raw)
        if (hit) {
          ctx.selectedDoctorId = hit.id
          pushAi(
            `**Which date** works? (e.g. **${todayISODate()}**, **tomorrow**, or **DD-MM-YYYY**)`
          )
          stepRef.current = "collect_date"
          return
        }
        pushAi("Pick a doctor from the **buttons** above, or type part of their name.")
        return
      }

      if (step === "collect_date") {
        pushUser(raw)
        const d = parseUserDate(raw)
        if (!d) {
          pushAi(
            `I need a **clear date** — try **${todayISODate()}**, **tomorrow**, or **DD-MM-YYYY**.`
          )
          return
        }
        ctx.pendingDate = d
        await runCreateAppointment()
        return
      }

      if (step === "collect_date_follow") {
        pushUser(raw)
        const d = parseUserDate(raw)
        if (!d) {
          pushAi(`Try a date like **${todayISODate()}** or **tomorrow**.`)
          return
        }
        ctx.pendingDate = d
        await runFollowUp()
        return
      }

      pushAi("I’m not sure what to do with that here. Try **Book a visit** or **My appointments**.", [
        { label: "Book a visit", value: QUICK_START },
        { label: "My appointments", value: QUICK_STATUS },
      ])
      stepRef.current = "greeting"
    },
    [
      matchDoctorByName,
      pushAi,
      pushUser,
      runCreateAppointment,
      runCreatePatient,
      runFollowUp,
      runIdentify,
      runLoadDoctors,
      runStatus,
    ]
  )

  const reset = useCallback(() => {
    ctxRef.current = {
      phone: "",
      name: "",
      address: "",
      primaryDoctor: null,
      doctors: [],
      selectedDoctorId: "",
      symptoms: "",
      pendingDate: "",
    }
    stepRef.current = "greeting"
    setMessages([
      { id: uid(), from: "ai", text: seedIntro },
      {
        id: uid(),
        from: "ai",
        text: "What would you like to do?",
        quickReplies: [
          { label: "Book a visit", value: QUICK_START },
          { label: "My appointments", value: QUICK_STATUS },
        ],
      },
    ])
  }, [])

  return { messages, busy, submit, reset }
}
