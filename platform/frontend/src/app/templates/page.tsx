"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import { templatesApi } from "@/lib/api";
import type { Template } from "@/types";

interface TemplateResult {
  output: string;
  sources: any[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<TemplateResult | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadTemplates() {
      try {
        const data = await templatesApi.list();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to load templates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, [token, router]);

  function selectTemplate(template: Template) {
    setSelectedTemplate(template);
    setResult(null);
    const initialVars: Record<string, string> = {};
    if (template.variables) {
      Object.keys(template.variables).forEach((key) => {
        initialVars[key] = "";
      });
    }
    setVariables(initialVars);
  }

  async function handleExecute(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTemplate || executing) return;

    // Validate required fields
    if (selectedTemplate.variables) {
      for (const [key, config] of Object.entries(selectedTemplate.variables)) {
        if ((config as any).required && !variables[key]?.trim()) {
          alert(`${(config as any).label || key} is required`);
          return;
        }
      }
    }

    setExecuting(true);
    setResult(null);
    try {
      const data = await templatesApi.execute(selectedTemplate.id, variables);
      setResult(data);
    } catch (err) {
      console.error("Template execution failed:", err);
    } finally {
      setExecuting(false);
    }
  }

  if (!token) return null;

  const categoryColors: Record<string, string> = {
    product_review: "bg-purple-50 text-purple-700",
    positioning: "bg-green-50 text-green-700",
    growth_analysis: "bg-orange-50 text-orange-700",
    strategy: "bg-blue-50 text-blue-700",
    research: "bg-pink-50 text-pink-700",
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Framework Templates
          </h1>
          <p className="text-gray-500 mb-8">
            Apply proven product frameworks from Lenny&apos;s Podcast guests to
            your specific challenges
          </p>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-5 bg-gray-200 rounded w-40 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Template Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => selectTemplate(template)}
                    className={`text-left bg-white rounded-xl border p-6 transition ${
                      selectedTemplate?.id === template.id
                        ? "border-brand-500 ring-2 ring-brand-100"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {template.name}
                      </h3>
                      {template.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            categoryColors[template.category] ||
                            "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {template.category.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* Template Execution Panel */}
              {selectedTemplate && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-1">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    {selectedTemplate.description}
                  </p>

                  <form onSubmit={handleExecute} className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {selectedTemplate.variables &&
                        Object.entries(selectedTemplate.variables).map(
                          ([key, config]) => {
                            const cfg = config as any;
                            return (
                              <div
                                key={key}
                                className={
                                  cfg.type === "text" ? "md:col-span-2" : ""
                                }
                              >
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                  {cfg.label || key}
                                  {cfg.required && (
                                    <span className="text-red-500 ml-0.5">
                                      *
                                    </span>
                                  )}
                                </label>
                                {cfg.type === "text" ? (
                                  <textarea
                                    value={variables[key] || ""}
                                    onChange={(e) =>
                                      setVariables({
                                        ...variables,
                                        [key]: e.target.value,
                                      })
                                    }
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                                  />
                                ) : cfg.type === "select" ? (
                                  <select
                                    value={variables[key] || ""}
                                    onChange={(e) =>
                                      setVariables({
                                        ...variables,
                                        [key]: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                  >
                                    <option value="">Select...</option>
                                    {cfg.options?.map((opt: string) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={variables[key] || ""}
                                    onChange={(e) =>
                                      setVariables({
                                        ...variables,
                                        [key]: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                  />
                                )}
                              </div>
                            );
                          }
                        )}
                    </div>

                    <button
                      type="submit"
                      disabled={executing}
                      className="px-6 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {executing ? "Generating..." : "Run Template"}
                    </button>
                  </form>

                  {executing && (
                    <div className="flex items-center gap-3 py-8 justify-center">
                      <div className="w-2 h-2 bg-brand-500 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span className="text-sm text-gray-500 ml-2">
                        Applying framework and searching transcripts...
                      </span>
                    </div>
                  )}

                  {result && (
                    <div className="border-t border-gray-100 pt-6">
                      <div className="prose prose-sm max-w-none text-gray-900">
                        <ReactMarkdown>{result.output}</ReactMarkdown>
                      </div>

                      {result.sources && result.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Sources Referenced
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {result.sources.map((src: any, i: number) => (
                              <div
                                key={i}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <p className="text-xs font-medium text-gray-700">
                                  {src.guest}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {src.episode_title}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedTemplate && templates.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">
                    Select a template above to get started
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
