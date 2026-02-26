# 🎥 Demo Script — Hospital Appointment Scheduler (2-Minute Walkthrough)

---

## Opening (0:00–0:20)
> "This is the Hospital Appointment Scheduler — a full-stack web app built with React on the frontend and Node.js + Express on the backend. The goal was to create a production-ready system that doesn't just book appointments, but intelligently routes patients to the right doctor using a load-balancing algorithm."

---

## Section 1 — Adding Doctors (0:20–0:45)
> "Let me start by registering a few doctors. I'll add Dr. A001 as a Cardiologist with a max of 3 patients per day, then Dr. A002 — also Cardiology — with a max of 5. And let me add Dr. N001 for Neurology.

> Notice the validation — if I submit without all fields, I get a clear error message. Duplicate IDs are also rejected immediately."

*[Demonstrate form submission, success alert, and table updating]*

---

## Section 2 — Doctor Registry (0:45–1:05)
> "The Doctor Registry shows all doctors sorted by their current workload percentage. Each row has a color-coded load bar — green for low load, amber for medium, red for full. You can see AVAILABLE or FULL status at a glance. The stats cards at the top summarize each specialization — total appointments booked, capacity, and how many doctors are still accepting patients."

---

## Section 3 — The Allocation Algorithm (1:05–1:35)
> "Here's the core engineering decision: the Booking Panel uses a Minimum-Load Allocation strategy. When I book for Cardiology, the system filters to Cardiology doctors, removes any that are fully booked, then sorts the rest by their current appointment count — least busy first.

> If two doctors are tied, we break the tie deterministically by doctorId, so behavior is consistent and predictable, not random.

> Watch — I'll book three appointments for Cardiology. The first goes to A001 since it has 0. Second also to A001 since it's still less than A002. Third goes to A002 now that A001 has caught up. This is exactly how a load balancer distributes connections — no single node gets hammered."

*[Book 3 appointments, watch the allocated badge move and load bars fill]*

---

## Section 4 — Edge Cases (1:35–1:50)
> "If I type a specialization with no doctors, I get a clear 'no doctors found' message. If all doctors for a specialization are full, the booking button actually disables itself automatically — no unnecessary API calls. The user sees a warning before even trying."

*[Fill up all Cardiology slots, show the disabled button]*

---

## Closing — Engineering Decisions (1:50–2:00)
> "Architecturally, the app is separated into controllers, services, routes, and models. The data model is structured to swap out the in-memory array for MongoDB with minimal changes — every model method has a comment showing its Mongoose equivalent. The allocation logic lives in a pure service function, making it independently testable and reusable. Thank you."

---

---

# 🧪 Git Commit Strategy

Suggested commit history following conventional commits format:

```
1. feat: scaffold project structure with server/client separation and folder hierarchy

2. feat(server): implement Doctor model with in-memory store and MongoDB-ready interface

3. feat(server): add appointment allocation service with minimum-load balancing algorithm

4. feat(server): wire up Express routes, controllers, and CORS configuration

5. feat(client): build AddDoctorForm and BookingPanel components with validation and error states

6. feat(client): add DoctorList table with load bars, status pills, and allocated doctor highlight

7. feat(client): add StatsPanel for per-specialization appointment summary

8. style: apply DM Sans typography and teal clinical design system

9. feat: add reset-daily endpoint and header reset button for demo workflow

10. docs: write comprehensive README with API reference, algorithm explanation, and deployment guide
```

### Branch Strategy (for team use)
```
main           ← production-ready code only
dev            ← integration branch
feat/doctor-model
feat/allocation-service
feat/booking-ui
feat/stats-panel
fix/load-bar-display
docs/readme
```
