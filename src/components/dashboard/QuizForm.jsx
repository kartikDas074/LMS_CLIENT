"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, PageHeader } from "@/components/ui/DashboardUI";
import { getCourse } from "@/services/strapi/courses";
import { createQuiz, getQuiz, normalizeQuiz, updateQuiz } from "@/services/strapi/quizzes";
import { fetchCurrentUser, getStoredToken } from "@/lib/auth";

const blankQuestion = () => ({ question: "", options: ["", "", "", ""], correctAnswer: 0, marks: "1" });
const instructorName = (value) => value?.username || value?.email || "Not specified";

export default function QuizForm({ role, courseId, quizId }) {
  const router = useRouter();
  const editing = Boolean(quizId);
  const [course, setCourse] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", timelimit: "" });
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [state, setState] = useState("loading");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const quizResponse = editing ? await getQuiz(quizId) : null;
        const quiz = editing ? normalizeQuiz(quizResponse) : null;
        const selectedCourseId = courseId || quiz?.courseId?.documentId || quiz?.courseId?.id;
        const [courseResponse, currentUser] = await Promise.all([getCourse(selectedCourseId), fetchCurrentUser(getStoredToken()).catch(() => null)]);
        const loadedCourse = courseResponse?.data || courseResponse;
        if (!loadedCourse?.id && !loadedCourse?.documentId) throw new Error("Course not found.");
        if (role === "instructor" && String(loadedCourse.instructor?.id) !== String(currentUser?.id)) throw new Error("You are not authorized to manage quizzes for this course.");
        if (active) {
          setCourse(loadedCourse);
          if (quiz) { setForm({ title: quiz.title || "", description: quiz.description || "", timelimit: quiz.timelimit || "" }); setQuestions(quiz.questions.length ? quiz.questions : [blankQuestion()]); }
          setState("ready");
        }
      } catch (error) { console.error("[quizzes] Failed to load quiz/course", error); if (active) { setSubmitError(error.message || "Unable to load quiz."); setState("error"); } }
    }
    load();
    return () => { active = false; };
  }, [courseId, quizId, role, editing]);

  function updateForm(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); setErrors((current) => ({ ...current, [event.target.name]: "" })); }
  function updateQuestion(questionIndex, field, value) { setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, [field]: value } : item)); setErrors((current) => ({ ...current, [`question-${questionIndex}`]: "" })); }
  function updateOption(questionIndex, optionIndex, value) { setQuestions((current) => current.map((item, index) => index === questionIndex ? { ...item, options: item.options.map((option, currentIndex) => currentIndex === optionIndex ? value : option) } : item)); }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Quiz title is required.";
    if (!form.description.trim()) nextErrors.description = "Quiz description is required.";
    if (form.timelimit === "" || !Number.isFinite(Number(form.timelimit)) || Number(form.timelimit) <= 0) nextErrors.timelimit = "Time limit must be greater than 0.";
    if (!questions.length) nextErrors.questions = "Add at least one question.";
    questions.forEach((item, index) => {
      if (!item.question.trim() || item.options.some((option) => !option.trim()) || !Number.isFinite(Number(item.marks)) || Number(item.marks) <= 0) nextErrors[`question-${index}`] = "Question, all four options, and positive marks are required.";
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true); setSubmitError("");
    const payload = questions.map((item) => ({ question: item.question.trim(), options: item.options.map((option) => option.trim()), correctAnswer: Number(item.correctAnswer), marks: Number(item.marks) }));
    try {
      if (editing) await updateQuiz(quizId, { ...form, questions: payload });
      else await createQuiz({ ...form, courseId: course.documentId || course.id, questions: payload });
      router.push(`/dashboard/${role}/quizzes/${course.documentId || course.id}`);
    } catch (error) { console.error("[quizzes] Failed to save quiz", error); setSubmitError(error.message || "Unable to save quiz."); setIsSubmitting(false); }
  }

  const backHref = `/dashboard/${role}/courses`;
  if (state === "loading") return <Card className="mx-auto max-w-4xl animate-pulse p-8"><div className="h-6 w-1/3 rounded bg-slate-800" /><div className="mt-6 h-56 rounded-xl bg-slate-800/70" /></Card>;
  if (state === "error") return <Card className="mx-auto max-w-4xl p-8"><p role="alert" className="text-sm text-red-300">{submitError}</p><Link href={backHref} className="mt-5 inline-flex text-sm font-semibold text-orange-300">Back to courses</Link></Card>;

  return <div className="mx-auto max-w-4xl space-y-7"><PageHeader eyebrow="Assessment studio" title={editing ? "Edit Quiz" : "Add Quiz"} description="Build a structured knowledge check for the selected course." /><Card className="p-5 sm:p-7"><h2 className="text-sm font-semibold uppercase tracking-wider text-orange-300">Course Information</h2><dl className="mt-5 grid gap-4 sm:grid-cols-3"><div><dt className="text-xs text-slate-500">Course</dt><dd className="mt-1 text-sm font-semibold text-white">{course.title}</dd></div><div><dt className="text-xs text-slate-500">Instructor</dt><dd className="mt-1 text-sm text-slate-300">{instructorName(course.instructor)}</dd></div><div><dt className="text-xs text-slate-500">Level</dt><dd className="mt-1 text-sm text-slate-300">{course.level || "Not specified"}</dd></div></dl></Card><Card className="p-5 sm:p-7"><form onSubmit={submit} className="space-y-6" noValidate><Field label="Quiz Title" name="title" value={form.title} onChange={updateForm} error={errors.title} placeholder="React Fundamentals Quiz" required /><Field label="Description" name="description" value={form.description} onChange={updateForm} error={errors.description} placeholder="Test your understanding of React fundamentals." required textarea /><Field label="Time Limit (minutes)" name="timelimit" type="number" min="1" step="1" value={form.timelimit} onChange={updateForm} error={errors.timelimit} placeholder="10" required /><div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-base font-semibold text-white">Questions</h2><p className="mt-1 text-xs text-slate-500">Add as many questions as this assessment needs.</p></div><button type="button" onClick={() => setQuestions((current) => [...current, blankQuestion()])} className="rounded-xl border border-orange-500/30 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/10">+ Add Question</button></div>{errors.questions && <p className="text-xs text-red-300">{errors.questions}</p>}{questions.map((item, index) => <QuestionCard key={index} item={item} index={index} canRemove={questions.length > 1} error={errors[`question-${index}`]} onQuestionChange={updateQuestion} onOptionChange={updateOption} onRemove={() => setQuestions((current) => current.filter((_, currentIndex) => currentIndex !== index))} />)}</div>{submitError && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{submitError}</p>}<div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:justify-end"><Link href={backHref} className="inline-flex justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300">Cancel</Link><button type="submit" disabled={isSubmitting} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-50">{isSubmitting ? (editing ? "Updating Quiz..." : "Creating Quiz...") : (editing ? "Save Quiz" : "Create Quiz")}</button></div></form></Card></div>;
}

function QuestionCard({ item, index, canRemove, error, onQuestionChange, onOptionChange, onRemove }) {
  return <Card className="border-slate-700 bg-slate-950/40 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-white">Question {index + 1}</h3>{canRemove && <button type="button" onClick={onRemove} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10">Remove</button>}</div><div className="mt-4 space-y-4"><Field label="Question" value={item.question} onChange={(event) => onQuestionChange(index, "question", event.target.value)} placeholder="What is React?" required /><div className="grid gap-3 sm:grid-cols-2">{item.options.map((option, optionIndex) => <Field key={optionIndex} label={`Option ${String.fromCharCode(65 + optionIndex)}`} value={option} onChange={(event) => onOptionChange(index, optionIndex, event.target.value)} placeholder={`Answer option ${String.fromCharCode(65 + optionIndex)}`} required />)}</div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-300">Correct Answer<select value={item.correctAnswer} onChange={(event) => onQuestionChange(index, "correctAnswer", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3 text-sm font-normal text-slate-200 outline-none focus:border-orange-500/60">{item.options.map((option, optionIndex) => <option key={optionIndex} value={optionIndex}>Option {String.fromCharCode(65 + optionIndex)}{option ? ` - ${option}` : ""}</option>)}</select></label><Field label="Marks" type="number" min="1" step="1" value={item.marks} onChange={(event) => onQuestionChange(index, "marks", event.target.value)} placeholder="1" required /></div>{error && <p className="text-xs text-red-300">{error}</p>}</div></Card>;
}

function Field({ label, value, onChange, error, textarea, ...props }) { const Input = textarea ? "textarea" : "input"; return <div><label className="text-xs font-semibold text-slate-300">{label} {props.required && <span className="text-orange-400">*</span>}<Input value={value} onChange={onChange} className={`mt-2 w-full rounded-xl border bg-slate-950/70 px-3 py-3 text-sm font-normal text-slate-200 outline-none placeholder:text-slate-600 focus:border-orange-500/60 ${textarea ? "min-h-28 resize-y" : ""} ${error ? "border-red-400/60" : "border-slate-800"}`} {...props} /></label>{error && <p className="mt-2 text-xs text-red-300">{error}</p>}</div>; }
