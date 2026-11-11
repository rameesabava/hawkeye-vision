"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const INTERESTS = [
  "CCTV cameras",
  "DVR / NVR / XVR",
  "Hard disks",
  "Biometric / access control",
  "Video door phones",
  "Service and support",
  "Other",
];

type Values = {
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
};
type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = {
  name: "",
  phone: "",
  email: "",
  interest: INTERESTS[0],
  message: "",
};

function validate(v: Values): Errors {
  const e: Errors = {};

  const name = v.name.trim();
  if (!name) e.name = "Enter your name.";
  else if (name.length < 2) e.name = "Name must be at least 2 characters.";
  else if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name))
    e.name = "Use letters only in your name.";

  // Indian mobile: optional +91 / 91 / 0 prefix, then 10 digits starting 6-9
  const digits = v.phone.replace(/[\s-]/g, "");
  if (!digits) e.phone = "Enter your phone number.";
  else if (!/^(\+?91|0)?[6-9]\d{9}$/.test(digits))
    e.phone = "Enter a valid 10-digit mobile number.";

  const email = v.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    e.email = "Enter a valid email address, like name@company.com.";

  const msg = v.message.trim();
  if (!msg) e.message = "Tell us what you need.";
  else if (msg.length < 10)
    e.message = "Add a little more detail (at least 10 characters).";
  else if (msg.length > 1000) e.message = "Keep the message under 1000 characters.";

  return e;
}

const base =
  "mt-2 w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2";
const ok = "border-blue-200 focus:border-[#081F4D] focus:ring-[#081F4D]/15";
const bad = "border-red-500 focus:border-red-600 focus:ring-red-200";

export default function ContactForm() {
      const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
const [serverError, setServerError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const reduce = useReducedMotion() ?? false;

  function change(k: keyof Values, val: string) {
    const next = { ...values, [k]: val };
    setValues(next);
    setSent(false);
    if (touched[k]) setErrors((p) => ({ ...p, [k]: validate(next)[k] }));
  }

  function blur(k: keyof Values) {
    setTouched((p) => ({ ...p, [k]: true }));
    setErrors((p) => ({ ...p, [k]: validate(values)[k] }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const found = validate(values);
  setErrors(found);

  setTouched({
    name: true,
    phone: true,
    email: true,
    message: true,
    interest: true,
  });

  const first = (["name", "phone", "email", "message"] as const)
    .find((k) => found[k]);

  if (first) {
    formRef.current
      ?.querySelector<HTMLElement>(`[name="${first}"]`)
      ?.focus();
    return;
  }

  try {
    setLoading(true);
    setSent(false);
    setServerError("");

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          interest: values.interest,
          message: values.message.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send enquiry.");
    }

    setSent(true);
    setValues(EMPTY);
    setTouched({});
    setErrors({});

  } catch (error) {
    console.error("Contact form error:", error);

    setServerError(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );

  } finally {
    setLoading(false);
  }
}

  const err = (k: keyof Values) =>
    errors[k] ? (
      <span id={`${k}-error`} role="alert" className="mt-1.5 block text-sm font-normal text-red-600">
        {errors[k]}
      </span>
    ) : null;

  const props = (k: keyof Values) => ({
    name: k,
    value: values[k],
    onChange: (
      ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => change(k, ev.target.value),
    onBlur: () => blur(k),
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
    className: `${base} ${errors[k] ? bad : ok}`,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">
          Name
          <input {...props("name")} autoComplete="name" placeholder="Your name" />
          {err("name")}
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Phone
          <input
            {...props("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile number"
          />
          {err("phone")}
        </label>
      </div>

      <label className="text-sm font-semibold text-slate-800">
        Email (optional)
        <input
          {...props("email")}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
        />
        {err("email")}
      </label>

      <label className="text-sm font-semibold text-slate-800">
        I’m looking for
        <select {...props("interest")}>
          {INTERESTS.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </select>
      </label>

      <label className="text-sm font-semibold text-slate-800">
        <span className="flex items-end justify-between">
          Message
          <span className="text-xs font-normal text-slate-500">
            {values.message.length}/1000
          </span>
        </span>
        <textarea
          {...props("message")}
          rows={5}
          maxLength={1000}
          placeholder="Brand, model and quantity"
          className={`${base} ${errors.message ? bad : ok} resize-y`}
        />
        {err("message")}
      </label>

      <button
  type="submit"
  disabled={loading}
  className="rounded-full bg-[#081F4D] px-8 py-4 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(8,31,77,0.25)] transition hover:bg-[#0A2660] disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Sending..." : "Submit enquiry"}
</button>
{serverError && (
  <p role="alert" className="text-sm text-red-600">
    {serverError}
  </p>
)}

      <AnimatePresence>
       {sent && (
  <motion.p
    role="status"
    initial={reduce ? false : { opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#081F4D]"
  >
    Thank you! Your enquiry has been sent successfully.
  </motion.p>
)}
      </AnimatePresence>
    </form>
  );
}
