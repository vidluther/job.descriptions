import supabase from "./supabaseClient";

export async function getCachedResponse(jobName, aiProvider, aiModel) {
  const lowerCaseJobName = jobName.toLowerCase().trim();

  const { data, error } = await supabase
    .from("job_descriptions")
    .select("response")
    .eq("job_name", lowerCaseJobName)
    .eq("ai_provider", aiProvider)
    .eq("ai_model", aiModel)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.response;
}

export async function saveResponse(jobName, response, aiProvider, aiModel) {
  const lowerCaseJobName = jobName.toLowerCase().trim();

  const { error } = await supabase.from("job_descriptions").upsert(
    {
      job_name: lowerCaseJobName,
      response: response.trim(),
      ai_provider: aiProvider,
      ai_model: aiModel,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "job_name,ai_provider,ai_model" },
  );

  if (error) {
    console.error("Error saving to cache:", error);
  }
}
