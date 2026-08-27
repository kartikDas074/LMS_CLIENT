"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Icon from "@/components/dashboard/Icon";
import { Card, PageHeader } from "@/components/ui/DashboardUI";
import { createCourse, COURSE_LEVELS, getCourse, getCourseImageUrl, updateCourse } from "@/services/strapi/courses";

const initialForm = {
  title: "",
  shortDescription: "",
  description: "",
  level: "",
  duration: "",
  price: "",
  extraSupport: "",
};

const inputClass = "mt-1 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 text-sm font-normal text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10";

function Field({ label, required, error, children, className = "" }) {
  return (
    <label className={`block space-y-2 text-xs font-semibold text-slate-300 ${className}`}>
      <span>{label} {required && <span className="text-orange-400">*</span>}</span>
      {children}
      {error && <span className="block text-xs font-normal text-red-300">{error}</span>}
    </label>
  );
}

function TagInput({ label, placeholder, items, onAdd, onRemove, onUpdate, error }) {
  const [value, setValue] = useState("");

  function addItem() {
    const nextValue = value.trim();
    if (!nextValue || items.some((item) => item.toLowerCase() === nextValue.toLowerCase())) {
      setValue("");
      return;
    }
    onAdd(nextValue);
    setValue("");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      addItem();
    }
  }

  return (
    <Field label={label} required error={error} className="sm:col-span-2">
      <div className="mt-1 rounded-xl border border-slate-800 bg-slate-950/40 p-3 focus-within:border-orange-500/60">
        {items.length > 0 && (
          <div className="mb-3 space-y-2">
            {items.map((item, index) => (
              <div key={`${item}-${index}`} className="flex gap-2">
                <input value={item} onChange={(event) => onUpdate(index, event.target.value)} className={`${inputClass} mt-0 flex-1`} aria-label={`${label.slice(0, -1)} ${index + 1}`} />
                <button type="button" onClick={() => onRemove(index)} className="rounded-lg border border-slate-700 px-3 text-orange-400 hover:bg-orange-500/20 hover:text-white" aria-label={`Remove ${label.slice(0, -1)} ${index + 1}`}>
                  <Icon name="plus" size={13} className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={handleKeyDown} className={`${inputClass} mt-0 flex-1`} placeholder={placeholder} />
          <button type="button" onClick={addItem} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-xs font-semibold text-orange-300 transition hover:bg-orange-500/20"><Icon name="plus" size={14} />Add {label.slice(0, -1)}</button>
        </div>
      </div>
    </Field>
  );
}

export default function AddCourseForm({ role, courseId }) {
  const { user: currentUser } = useAuth();
  const canCreate = role === "admin" || role === "content-manager";
  const [form, setForm] = useState(initialForm);
  const [topics, setTopics] = useState([]);
  const [skills, setSkills] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCourse, setIsLoadingCourse] = useState(Boolean(courseId));
  const [existingThumbnailId, setExistingThumbnailId] = useState(null);
  const [existingInstructorId, setExistingInstructorId] = useState(null);

  useEffect(() => {
    if (!courseId) return;
    getCourse(courseId).then((response) => {
      const course = response?.data || response;
      setForm({ title: course.title || "", shortDescription: course.shortDescription || "", description: course.description || "", level: course.level || "", duration: course.duration ?? "", price: course.price ?? "", extraSupport: course.extraSupport || "" });
      setTopics(Array.isArray(course.topic) ? course.topic : []);
      setSkills(Array.isArray(course.skills) ? course.skills : []);
      setPreview(getCourseImageUrl(course.thumbnail));
      setExistingThumbnailId(Array.isArray(course.thumbnail) ? course.thumbnail[0]?.id : course.thumbnail?.id);
      setExistingInstructorId(course.instructor?.id);
    }).catch((error) => {
      console.error("[courses] Failed to load course for editing", error);
      setSubmitError("Unable to load this course. Please try again.");
    }).finally(() => setIsLoadingCourse(false));
  }, [courseId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
    setSuccess("");
  }

  function handleThumbnail(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
    setErrors((current) => ({ ...current, thumbnail: "" }));
    setSubmitError("");
  }

  function validate() {
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.shortDescription.trim()) nextErrors.shortDescription = "Short description is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!thumbnail && !courseId) nextErrors.thumbnail = "A course thumbnail is required.";
    if (!form.level) nextErrors.level = "Select a course level.";
    if (topics.filter((item) => item.trim()).length === 0) nextErrors.topic = "Add at least one topic.";
    if (skills.filter((item) => item.trim()).length === 0) nextErrors.skills = "Add at least one skill.";
    if (form.price === "" || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      nextErrors.price = "Enter a non-negative price.";
    }
    if (form.duration !== "" && (Number.isNaN(Number(form.duration)) || Number(form.duration) < 0 || !Number.isInteger(Number(form.duration)))) {
      nextErrors.duration = "Duration must be a non-negative whole number.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");
    if (!validate()) return;
    if (!canCreate && !(courseId && role === "instructor")) {
      setSuccess("Your course form is ready. The logged-in Instructor will become the course owner when creation is enabled.");
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanTopics = topics.map((item) => item.trim()).filter(Boolean);
      const cleanSkills = skills.map((item) => item.trim()).filter(Boolean);
      const cleanForm = {
        title: form.title.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        level: form.level,
        duration: form.duration,
        price: form.price,
        extraSupport: form.extraSupport.trim(),
        topic: cleanTopics,
        skills: cleanSkills,
      };
      if (courseId) {
        await updateCourse(courseId, cleanForm, existingThumbnailId, existingInstructorId);
        setSuccess("Course updated successfully.");
      } else {
        await createCourse({ ...form, topic: topics, skills }, thumbnail, { role, currentUser });
        setForm(initialForm);
        setTopics([]);
        setSkills([]);
        setThumbnail(null);
        setPreview("");
        setSuccess("Course created successfully.");
      }
    } catch (error) {
      setSubmitError(error.status === 400 ? (error.message || "Unable to update course. Please check the form and try again.") : (error.message || "Unable to create course. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingCourse) return <div className="animate-pulse space-y-7"><div className="h-24 rounded-2xl bg-slate-900" /><div className="h-[640px] rounded-2xl bg-slate-900" /></div>;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-7">
      <PageHeader
        eyebrow={role === "instructor" ? "My content" : "Course studio"}
        title={courseId ? "Edit Course" : "Add Course"}
        description={canCreate ? (courseId ? "Update course information and keep your course content up to date." : "Create a course and publish its first learning path.") : "Prepare your course details. The logged-in Instructor will become the course owner when creation is enabled."}
      />
      <Card className="max-w-4xl p-5 sm:p-7">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Title" required error={errors.title} className="sm:col-span-2"><input name="title" value={form.title} onChange={updateField} className={inputClass} placeholder="e.g. Next.js Mastery" /></Field>
            <Field label="Short Description" required error={errors.shortDescription} className="sm:col-span-2"><textarea name="shortDescription" value={form.shortDescription} onChange={updateField} rows="2" className={`${inputClass} resize-none`} placeholder="A concise description for course cards" /></Field>
            <Field label="Description" required error={errors.description} className="sm:col-span-2"><textarea name="description" value={form.description} onChange={updateField} rows="5" className={`${inputClass} resize-none`} placeholder="Describe what learners will build and learn" /></Field>
            <Field label="Level" required error={errors.level}><select name="level" value={form.level} onChange={updateField} className={inputClass}><option value="">Select level</option>{COURSE_LEVELS.map((level) => <option key={level}>{level}</option>)}</select></Field>
            <Field label="Duration (minutes)" error={errors.duration}><input name="duration" type="number" min="0" step="1" value={form.duration} onChange={updateField} className={inputClass} placeholder="Optional" /></Field>
            <Field label="Price" required error={errors.price}><input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} className={inputClass} placeholder="0.00" /></Field>
            <TagInput label="Topics" placeholder="Enter topic..." items={topics} onAdd={(topic) => { setTopics((current) => [...current, topic]); setErrors((current) => ({ ...current, topic: "" })); }} onUpdate={(index, value) => setTopics((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))} onRemove={(index) => setTopics((current) => current.filter((_, itemIndex) => itemIndex !== index))} error={errors.topic} />
            <TagInput label="Skills" placeholder="Enter skill..." items={skills} onAdd={(skill) => { setSkills((current) => [...current, skill]); setErrors((current) => ({ ...current, skills: "" })); }} onUpdate={(index, value) => setSkills((current) => current.map((item, itemIndex) => itemIndex === index ? value : item))} onRemove={(index) => setSkills((current) => current.filter((_, itemIndex) => itemIndex !== index))} error={errors.skills} />
            <Field label="Extra Support" error={errors.extraSupport} className="sm:col-span-2"><textarea name="extraSupport" value={form.extraSupport} onChange={updateField} rows="3" className={`${inputClass} resize-none`} placeholder="Optional support or mentoring details" /></Field>
          </div>

          <Field label="Thumbnail" required={!courseId} error={errors.thumbnail}>
            <div className="mt-1 grid gap-4 sm:grid-cols-[160px_1fr]">
              {preview ? <img src={preview} alt="Course thumbnail preview" className="aspect-video w-full rounded-xl border border-slate-800 object-cover sm:aspect-square" /> : <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/50 text-slate-600 sm:aspect-square"><Icon name="book" size={25} /></div>}
              <div className="flex flex-col justify-center gap-3">{!courseId && <><input id="course-thumbnail" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" onChange={handleThumbnail} className="sr-only" /><label htmlFor="course-thumbnail" className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:border-orange-500/50 hover:text-orange-300"><Icon name="plus" size={15} />{preview ? "Change thumbnail" : "Choose thumbnail"}</label></>}<p className="text-xs text-slate-500">{courseId ? "The existing course thumbnail is preserved." : "Images use the existing unsigned Cloudinary upload setup."}</p></div>
            </div>
          </Field>

          {submitError && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{submitError}</div>}
          {success && <div role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">{success}</div>}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between"><Link href={courseId ? `/courses/${courseId}` : `/dashboard/${role}/courses`} className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-orange-500/50 hover:text-orange-300">Cancel</Link><button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{isSubmitting ? (courseId ? "Updating..." : "Creating course...") : canCreate ? (courseId ? "Update Course" : "Create course") : "Validate course form"}<Icon name="arrow" size={15} /></button></div>
        </form>
      </Card>
    </div>
  );
}
