"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, EmptyState, PageHeader } from "@/components/ui/DashboardUI";
import { getQuiz, normalizeQuiz } from "@/services/strapi/quizzes";
import { fetchCurrentUser, getStoredToken } from "@/lib/auth";

export default function QuizView({ quizId, role = "admin" }) {
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");
  const [state, setState] = useState("loading");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await getQuiz(quizId);
        const loadedQuiz = normalizeQuiz(response);

        // Ownership check for instructors
        if (role === "instructor") {
          const currentUser = await fetchCurrentUser(getStoredToken()).catch(() => null);
          const courseInstructorId = loadedQuiz.courseId?.instructor?.id;
          if (courseInstructorId && String(courseInstructorId) !== String(currentUser?.id)) {
            throw new Error("You are not authorized to view this quiz.");
          }
        }

        if (active) {
          setQuiz(loadedQuiz);
          setState("ready");
        }
      } catch (loadError) {
        console.error("[quizzes] Failed to load quiz", loadError);
        if (active) {
          setError(loadError.message || "Unable to load quiz.");
          setState("error");
        }
      }
    }
    load();
    return () => { active = false; };
  }, [quizId, role]);

  if (state === "loading") {
    return (
      <Card className="mx-auto max-w-4xl animate-pulse p-8">
        <div className="h-8 w-1/2 rounded bg-slate-800" />
        <div className="mt-6 h-48 rounded bg-slate-800/70" />
      </Card>
    );
  }

  if (state === "error" || !quiz) {
    return <EmptyState title="Quiz unavailable" description={error || "This quiz could not be loaded."} />;
  }

  const totalMarks = quiz.questions.reduce((total, item) => total + Number(item.marks || 0), 0);

  return (
    <div className="mx-auto max-w-4xl space-y-7">
      <PageHeader
        eyebrow="Assessment preview"
        title={quiz.title}
        description={quiz.description}
        action={
          <Link
            href={`/dashboard/${role}/quizzes/${quiz.courseId?.documentId || quiz.courseId?.id}/${quiz.documentId || quiz.id}/edit`}
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Edit Quiz
          </Link>
        }
      />

      <Card className="p-5 sm:p-7">
        <dl className="grid gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-slate-500">Course</dt>
            <dd className="mt-1 text-sm text-slate-200">{quiz.courseId?.title || "Selected course"}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Time limit</dt>
            <dd className="mt-1 text-sm text-slate-200">{quiz.timelimit} minutes</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Questions</dt>
            <dd className="mt-1 text-sm text-slate-200">{quiz.questions.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Total marks</dt>
            <dd className="mt-1 text-sm text-slate-200">{totalMarks}</dd>
          </div>
        </dl>
      </Card>

      <div className="space-y-4">
        {quiz.questions.map((item, index) => (
          <Card key={index} className="p-5 sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-orange-300">Question {index + 1}</h2>
              <span className="text-xs text-slate-500">{item.marks} mark{Number(item.marks) === 1 ? "" : "s"}</span>
            </div>
            <p className="mt-4 text-base font-semibold text-white">{item.question}</p>
            <div className="mt-4 grid gap-2">
              {item.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    optionIndex === item.correctAnswer
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border-slate-800 text-slate-300"
                  }`}
                >
                  {String.fromCharCode(65 + optionIndex)}. {option}
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-emerald-300">
              Correct answer: Option {String.fromCharCode(65 + item.correctAnswer)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
